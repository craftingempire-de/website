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

const request = require('request');

module.exports.fetchDiscordUserByToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        var response = await fetch(process.env.DISCORD_OAUTH2_ENDPOINT + '/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).catch(reject);
        resolve(await response.json().catch(reject));
    });
};

module.exports.fetchDiscordGuildByToken = async (token) => {
    return new Promise(async (resolve, reject) => {
        var response = await fetch(process.env.DISCORD_OAUTH2_ENDPOINT + '/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).catch(reject);
        resolve(await response.json());
    });
};

module.exports.refreshUserToken = async (refresh_token) => {
    return new Promise(async (resolve, reject) => {
        request
            .post(
                DISCORD_OAUTH2_ENDPOINT + '/oauth2/token',
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
                (error, response, body) => {
                    if (error) {
                        return reject(error);
                    }
                    let obj = JSON.parse(body);
                    app.logger.log(obj);
                    if (obj.error) {
                        return reject(obj);
                    }
                    let token = obj['access_token'];
                    let refresh_token = obj['refresh_token'];
                    return resolve({
                        token: token,
                        refresh_token: refresh_token,
                    });
                }
            )
            .form({
                client_id: DISCORD_OAUTH2_APPLICATION_ID,
                client_secret: DISCORD_OAUTH2_APPLICATION_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                redirect_uri: DISCORD_OAUTH2_CALLBACK,
                scope: 'identify email guilds',
            });
    });
};
