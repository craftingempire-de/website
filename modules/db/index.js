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
 * @since 19.03.2022
 */

'use strict'; // https://www.w3schools.com/js/js_strict.asp

const MongoClient = require('./mongo-client');
var client = new MongoClient(process.env.DATABASE_CONNECTION);

module.exports.setupDatabaseHandler = (app) => {
    app.db = {
        client: client,
    };

    app.db.queryAsync = async (collection, searchQuery) => app.db.client.queryAsync(process.env.DATABASE_NAME, collection, searchQuery);
    app.db.insertAsync = async (collection, data) => app.db.client.insertObjectAsync(process.env.DATABASE_NAME, collection, data);
    app.db.updateAsync = async (collection, searchQuery, data) => app.db.client.updateObjectAsync(process.env.DATABASE_NAME, collection, searchQuery, data);
    app.db.deleteAsync = async (collection, searchQuery) => app.db.client.deleteObjectAsync(process.env.DATABASE_NAME, collection, searchQuery);
    app.db.rawQueryAsync = async (database, collection, searchQuery) => app.db.client.queryAsync(database, collection, searchQuery);
    app.db.rawInsertAsync = async (database, collection, data) => app.db.client.insertObjectAsync(database, collection, data);
    app.db.rawUpdateAsync = async (database, collection, searchQuery, data) => app.db.client.updateObjectAsync(database, collection, searchQuery, data);
    app.db.rawDeleteAsync = async (database, collection, searchQuery) => app.db.client.deleteObjectAsync(database, collection, searchQuery);
};
