var mongoose = require('mongoose');
var schema=mongoose.Schema;

var crypto=require('crypto');
var crypto_uts=require("../js/crypto");

var t_group = new schema({
    name: { type: String, required: true, unique: true },
    description : { type: String, default : "Group description here" },
});


var t_permission = new schema({
    r : { g : [{type : schema.Types.ObjectId, ref : 'groups'}], u : [{type : schema.Types.ObjectId, ref : 'users'}] },
    w : { g : [{type : schema.Types.ObjectId, ref : 'groups'}], u : [{type : schema.Types.ObjectId, ref : 'users'}] },
});

var t_user = new schema({
    local : {
	email: {
	    type: String,
	    unique: true,
//	    required: true
	},
	hashpass: {
	    type: String,
//	    required: true
	},
	salt: {
	    type: String,
	},
	username: {
	    type: String,
	    default : ""
	},
	groups : [{type : schema.Types.ObjectId, ref : 'groups' }]
    },
    facebook         : {
	id           : String,
	token        : String,
	email        : String,
	name         : String
    },
    twitter          : {
	id           : String,
	token        : String,
	displayName  : String,
	username     : String
    },
    google           : {
	id           : String,
	token        : String,
	email        : String,
	name         : String
    },
    shibb : {

    }
});

t_user.post('init', function(user) {
    console.log("post init user " + user.local.email);
    if(user.local.username===""){
	console.log("Creating default username...");
	user.local.username=crypto.randomBytes(32).toString('base64');//Math.random().toString(36).substring(2)
    }
});

t_user.pre('save', function(callback) {
    console.log("pre save user !!");
    var user = this;
    
    if (!user.isModified('local.hashpass')){
	console.log("NOT hashing password....!");
	return callback();
    }

    crypto_uts.hash_password(user.local.hashpass, function(err, hash_data){
	if (err){
	    console.log("Error hashing password " + err);
	    return callback(err);
	}
	console.log("OK passwd hashed " + JSON.stringify(hash_data));
	user.local.hashpass = hash_data.hash;
	user.local.salt = hash_data.salt;
	callback();
	console.log("OK callback called...");
    });
});


t_user.methods.check_password = function(clearpass, cb) {
    var user = this;
    crypto_uts.check_password(user.local.hashpass, user.local.salt, clearpass, cb);

    // function(err, match){
    // 	if(err) return cb(err);

    // 	console.log("Check passowrd " + user.local.hashpass + " clear try " + clearpass + " match " + match);
    // 	cb(null, match);
    // 	console.log("cbok");
    // });
};
    
module.exports.users = mongoose.model('users', t_user);
module.exports.groups = mongoose.model('groups', t_group);
module.exports.permissions = mongoose.model('permissions', t_permission);
