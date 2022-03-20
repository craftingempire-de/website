/**
 * craftingempire-website | Copyright (c) 2022 LuciferMorningstarDev
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 *
 * @author LuciferMorningstarDev - https://github.com/LuciferMorningstarDev
 * @since 18.03.2022
 */
'use strict'; // https://www.w3schools.com/js/js_strict.asp

// append process.env object by some system variables ( ./.env )
require('dotenv').config();

// DISCORD OAUTH2
const DISCORD_OAUTH2_URL = process.env.DISCORD_OAUTH2_URL;
const DISCORD_OAUTH2_APPLICATION_ID = process.env.DISCORD_OAUTH2_APPLICATION_ID;
const DISCORD_OAUTH2_APPLICATION_SECRET = process.env.DISCORD_OAUTH2_APPLICATION_SECRET;
const DISCORD_OAUTH2_CALLBACK = process.env.DISCORD_OAUTH2_CALLBACK;
const DISCORD_OAUTH2_ENDPOINT = process.env.DISCORD_OAUTH2_ENDPOINT;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// add global fetch extension
import('node-fetch').then(({ default: fetch }) => {
    global.fetch = fetch;
});

// imports
const fs = require('node:fs');

const express = require('express');
const request = require('request');
const compression = require('compression');
const serveFavicon = require('serve-favicon');
const cookieParser = require('cookie-parser');

const fileUpload = require('express-fileupload');
const session = require('express-session');

const { Logger } = require('./modules/node-logger');
const discordFetcher = require('./modules/discord-fetch');

const auth = require('./middleware/auth');

const app = express();

// init mongodb handle
require('./modules/db').setupDatabaseHandler(app);

const applicationMode = process.env.MODE;
app.logger = new Logger('WebServer', applicationMode).setDebugging(applicationMode === 'development' ? 99 : 0);
const applicationPort = process.env.SERVER_PORT;
const applicationDevPort = process.env.DEV_SERVER_PORT;

const defaultPath = __dirname.endsWith('/') ? __dirname : __dirname + '/';
const sitePath = defaultPath + 'views/';
const staticPath = defaultPath + 'static/';

// compress all resources for faster loadig
app.use(compression());
// parse cookies and append them as object to Request.cookies
app.use(cookieParser());

// body parser the body appended as object to Request.body ( application/json and xxx-form-url-encoded )
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('json spaces', 4);
// append express by the ejs view engine
app.set('view engine', 'ejs');

// for security reason remove the powered by header
app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});

// CORS Policy things
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

const MongoDBStore = require('express-mongodb-session')(session);
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30, // 1 month
        },
        store: new MongoDBStore({
            uri: process.env.DATABASE_CONNECTION,
            collection: '_sessions',
            databaseName: process.env.DATABASE_NAME,
            connectionOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
            },
        }),
    })
);

app.use(auth.defaultMiddleware());

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        limits: { fileSize: 50 * 1024 * 1024 },
        limitHandler: (req, res) => {
            return res.status(413).json({ error: true, message: 'TOO BIG (50mb)' });
        },
    })
);

// serve global favicon
app.use(serveFavicon(staticPath + 'favicon.ico'));

app.use('/static', express.static('static'));

app.get('/discord', async (req, res) => {
    res.redirect('https://discord.gg/bUrpSBsBtb');
});

app.get('/github', async (req, res) => {
    res.redirect('https://github.com/craftingempire-de');
});

app.get('/twitter', async (req, res) => {
    res.redirect('https://twitter.com/crafting_empire');
});

app.get('/youtube', async (req, res) => {
    res.redirect('https://www.youtube.com/channel/UCFrJhIzCDYmR9AZkIlfeEAA');
});

// ================================================ DISCORD LOGIN ================================================

app.get('/oauth2/discord/callback', async (req, res) => {
    let code = req.query.code;
    if (!code) {
        return res.render('error', {
            applicationMode: applicationMode,
            pathname: req.url,
            error: {
                title: 'BAD REQUEST',
                description: 'Du kannst nicht eingeloggt werden.',
                stack: 'Es wurde versucht sich ohne den Discord Code einzuoggen.',
            },
        });
    }

    request
        .post(
            DISCORD_OAUTH2_ENDPOINT + '/oauth2/token',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
            async (error, response, body) => {
                if (error) {
                    app.logger.error(error);
                    error.title = error.name;
                    error.description = 'Es konnten keine validen Daten von Discord abgerufen werden.';
                    return res.render('error', {
                        applicationMode: applicationMode,
                        pathname: req.url,
                        error: error,
                    });
                }
                let obj = JSON.parse(body);
                if (obj.error) {
                    error.title = error.name;
                    error.description = 'Es konnten keine validen Daten von Discord abgerufen werden.';
                    return res.render('error', {
                        applicationMode: applicationMode,
                        pathname: req.url,
                        error: error,
                    });
                }
                let token = obj['access_token'];
                let refresh_token = obj['refresh_token'];
                let userData = await discordFetcher.fetchDiscordUserByToken(token);
                let allJoinedGuilds = await discordFetcher.fetchDiscordGuildByToken(token);
                let joinedGuilds = allJoinedGuilds.filter((g) => g.id == DISCORD_GUILD_ID);
                let joined = joinedGuilds.length > 0;

                if (!joined) {
                    return res.render('error', {
                        applicationMode: applicationMode,
                        pathname: req.url,
                        error: {
                            title: 'Login Error',
                            description: 'Du bist nicht auf unserem Discord Server',
                            stack: 'Es wurden keine Benutzerdaten für unseren Discord Server gefunden.',
                        },
                    });
                } else {
                    if (applicationMode === 'development') {
                        console.log('User Joined %o', joinedGuilds);
                    }
                }

                req.session.isLoggedIn = true;
                req.session.user = {
                    ...userData,
                    token: token,
                    refresh_token: refresh_token,
                };

                let addUserAsync = async (user) => {
                    let now = new Date();
                    let current = await app.db.queryAsync('registered_users', { id: user.id });
                    if (current && current.length > 0) {
                        let currentUser = current[0];
                        let update = {};
                        if (currentUser.email != userData.email) {
                            update.email = userData.email;
                            update.last_modified = now;
                        }

                        if (currentUser.username != userData.username) {
                            update.username = userData.username;
                            update.tag = user.username + '#' + user.discriminator;
                            update.last_modified = now;
                        }
                        if (currentUser.discriminator != userData.discriminator) {
                            update.discriminator = userData.discriminator;
                            update.tag = user.username + '#' + user.discriminator;
                            update.last_modified = now;
                        }

                        if (Object.keys(update).length > 0) {
                            await app.db.updateAsync(
                                'registered_users',
                                {
                                    id: user.id,
                                },
                                update
                            );
                        }

                        return;
                    } else {
                        await app.db.insertAsync('registered_users', {
                            id: user.id,
                            username: user.username,
                            discriminator: user.discriminator,
                            tag: user.username + '#' + user.discriminator,
                            email: user.email,
                            login_first: now,
                            last_modified: now,
                        });
                    }
                };

                addUserAsync(userData);

                return res.redirect(req.query.next || '/');
            }
        )
        .form({
            client_id: DISCORD_OAUTH2_APPLICATION_ID,
            client_secret: DISCORD_OAUTH2_APPLICATION_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: DISCORD_OAUTH2_CALLBACK,
            scope: 'identify email guilds',
        });
});

app.get('/oauth2/discord/login', async (req, res) => {
    return res.redirect(DISCORD_OAUTH2_URL);
});

app.get('/login', async (req, res) => {
    return res.redirect('/oauth2/discord/login');
});

app.get('/oauth2/discord/logout', async (req, res) => {
    req.session.isLoggedIn = false;
    req.session.destroy();
    return res.redirect(req.query.next || '/');
});

app.get('/logout', async (req, res) => {
    req.session.isLoggedIn = false;
    req.session.destroy();
    return res.redirect(req.query.next || '/');
});

// ================================================ DISCORD LOGIN ================================================

app.get('/', async (req, res) => {
    res.render('index', {
        applicationMode: applicationMode,
        pathname: req.url,
        isLoggedIn: req.session.isLoggedIn || false,
        user: req.session.user || null,
    });
});

app.get('/404', async (req, res) => {
    res.render('404', { applicationMode: applicationMode, pathname: req.url });
});

// all invalid requests sent as index
app.get('*', async (req, res) => {
    res.redirect('/404');
});

if (applicationMode == 'production') {
    // create server and listen to specified port
    app.listen(applicationPort || 8000, () => {
        app.logger.log('[ PRODUCTION ] » WEB Server is now running on Port: ' + applicationPort);
    });
}
if (applicationMode == 'development') {
    // create server and listen to specified port
    app.listen(applicationDevPort || 5000, () => {
        app.logger.log('[ DEVELOPMENT ] » WEB Server is now running on Port: ' + applicationDevPort);
    });
}
