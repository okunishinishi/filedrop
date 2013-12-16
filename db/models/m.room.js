/**
 * User: okunishitaka
 * Date: 9/21/13
 * Time: 6:57 PM
 */

var tek = require('tek'),
    auth = tek.auth,
    tekWeb = require('tek-web'),
    DB = tekWeb['DB'],
    defineModel = DB['defineModel'];

var Room = module.exports = defineModel({
    retention:3
});

Room.newSalt = function () {
    return auth.newSalt();
};
Room.derive = function (password, salt, callback) {
    return auth.derive(password, salt, callback);
};
