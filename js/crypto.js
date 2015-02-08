// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.
// Do what you want with this file.

var crypto = require('crypto');

module.exports.check_password=function(hash, salt, clear_password, cb){

    console.log("check passwd ["+clear_password+"]["+salt+"]");
    var h=crypto.createHash('sha256');
    
    h.update(salt,'base64');
    h.update(clear_password,'utf-8');
    
    
    var true_hash=h.digest('base64');
    var match=(true_hash==hash) ? true:false;
	
    console.log("Compare DB=["+true_hash+"] AND ["+hash+"] match = " + match);
    
    cb(null,match);
    console.log("cb called!");
}

module.exports.hash_password=function(clear_password, cb){
    
    //var hashes = crypto.getHashes();
    //console.log(JSON.stringify(hashes)); // ['sha', 'sha1', 'sha1WithRSAEncryption', ...]
    
    try{
	var h=crypto.createHash('sha256');
	var salt=crypto.randomBytes(32);//.toString('base64');

	h.update(salt);
	h.update(clear_password,'utf-8');

	var hash_data={
	    hash: h.digest('base64'),
	    salt : salt.toString('base64')
	}
    
	cb(null,hash_data);
    }
    catch(e){
	cb("crypto error " + e);
    }
}

/*

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
*/

/* 

module.exports = {
    'hash': createHash,
    'validate': validateHash
};

*/
