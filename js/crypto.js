// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.
// Do what you want with this file.

var crypto = require('crypto');
 
var SaltLength = 9;
 
GLOBAL.createHash=function(password) {
    var salt = generateSalt(SaltLength);
    var hash = md5(password + salt);
    return salt + hash;
}
 
GLOBAL.validateHash=function (hash, password) {
    var salt = hash.substr(0, SaltLength);
    var validHash = salt + md5(password + salt);
    return hash === validHash;
}
 
function generateSalt(len) {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
    setLen = set.length,
    salt = '';
    for (var i = 0; i < len; i++) {
	var p = Math.floor(Math.random() * setLen);
	salt += set[p];
    }
    return salt;
}
 
function md5(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

/* 

module.exports = {
    'hash': createHash,
    'validate': validateHash
};

*/
