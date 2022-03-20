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
 * @since 20.03.2022
 */
'use strict'; // https://www.w3schools.com/js/js_strict.asp

const discordFetcher = require('../modules/discord-fetch');
var { randomBytes } = require('crypto');

module.exports.required = (req, res, next) => {
    if (!req.session.isLoggedIn) return res.redirect('/login');
    next();
};

const updates = {};

var refreshUser = (req, res, next, token, refresh_token, user) => {
    // refresh user data each 30 min

    if (!updates[user.id] || Date.now() - updates[user.id] >= 1000 * 60 * 30) {
        discordFetcher.fetchDiscordUserByToken(token).then((userData) => {
            if (userData.error) {
                discordFetcher.refreshUserToken(refresh_token).then((newData) => {
                    if (newData.error) {
                        req.session.isLoggedIn = false;
                        req.session.destroy();
                        return next();
                    }
                    return refreshUser(req, res, next, newData.token, newData.refresh_token, req.session.user);
                });
            } else {
                req.session.user = {
                    ...userData,
                    token: token,
                    refresh_token: refresh_token,
                };
                return next();
            }
        });
    } else return next();
};

module.exports.defaultMiddleware = () => (req, res, next) => {
    if (!req.session.csrf) {
        req.session.csrf = randomBytes(100).toString('base64');
    }
    if (req.query.next) {
        req.session.next = req.query.next;
    }

    if (req.session.user) {
        let token = req.session.user.token;
        let refresh_token = req.session.user.token;
        return refreshUser(req, res, next, token, refresh_token, req.session.user);
    } else next();
};
