//var crypto=require('./crypto');
var crypto = require('crypto');

function get_console_password(prompt, callback) {

    if (callback === undefined) {
	callback = prompt;
	prompt = undefined;
    }
    if (prompt === undefined) {
	prompt = 'Password: ';
    }
    if (prompt) {
	process.stdout.write(prompt);
    }

    var stdin = process.stdin;
    //stdin.resume();
    stdin.setRawMode(true);
    //stdin.resume();
    stdin.setEncoding('utf8');

    var password = '';

    var  handle_char=function(ch){
	ch = ch + "";

	switch (ch) {
	case "\n":
	case "\r":
	case "\u0004":
	    process.stdout.write('\n');
	    stdin.setRawMode(false);
	    //stdin.pause();
	    stdin.removeListener('data',handle_char);
	    callback(false, password);
	    break;
	case "\u0003":
	    // Ctrl-C
	    stdin.setRawMode(false);
	    stdin.removeListener('data',handle_char);
	    callback(true);
	    break;
	default:
	    process.stdout.write('*');
	    password += ch;
	    break;
	}

    }

    stdin.on('data', handle_char);

}

function get_strong_console_password(user, cb, config_in){

    var owasp = require('owasp-password-strength-test');

    var config=
	{
	    allowPassphrases       : true,
	    maxLength              : 128,
	    minLength              : 8,
	    minPhraseLength        : 20,
	    minOptionalTestsToPass : 2,
	};
    if(è(config_in)) for(var c in config_in) config[c]=config_in[c];
    owasp.config(config); 

    var strong_password;
    
    var stage0=function(){
	get_console_password("Enter password for user \""+user+"\" :", function(error, data){
	    if(error) return cb(error);
	    console.log("Checking password ["+data+"]");

	    if(data.length==0) {
		cb("God password setup aborted by impatient user");
		return;
	    }
	    
	    var owasp_result = owasp.test(data);
	    
	    if(owasp_result.strong){
		strong_password=data;
		stage1();
	    }else{
		console.log("Password too weak : " + JSON.stringify(owasp_result, null, 5));
		stage0();
	    }
	});
    }
    var stage1=function(){
	get_console_password("Enter password again", function(error, data){
	    if(data !== strong_password){
		console.log("Passwords don't match! Doing it again from start...");
		stage0();
	    }else{
		cb(null, strong_password);
	    }
	});
    }
    
    stage0();
}



exports.init=function(pkg,app){

    //var dbn=app.mongo.config.mongo_db;

    function on_error(e){
	app.log("Bootstrap fatal error : " + e);
	process.exit(1);
    }

    /*
    
    function upsert_docs(collection, key, docs, cb){
	var d=0;

	function insert_next_doc(){
	    if(d==docs.length) return cb(null);
	    var doc=docs[d];
	    var setkeys={};
	    for(var k in doc) if(k!=key) setkeys[k]=doc[k];
	    var q={}; q[key]=doc[key]; var soi={}; soi[key]=doc[key];
	    console.log("Updating q "+JSON.stringify(q)+" soi " + JSON.stringify(soi)+ " setkeys " + JSON.stringify(setkeys));

	    collection.update(q, { $set : setkeys, $setOnInsert : soi } , { upsert : true, w : 1}, function(error, res){


		if(error){
		    console.log("Error insert key " + error);
		    return cb(error);
		}
		d++; insert_next_doc();
	    });
	    
	}
	insert_next_doc();
    }
    
    
    function init_mongo(default_groups, default_users, on_error){
	
	app.mongo.open_db(dbn, function(error, db){
	    if(error) return on_error(error);
	    
	    console.log("Mongo DB opened : " + dbn);
	    
	    db.collection("groups", {}, function(error, collection){
		if(error) {return on_error(error);}

		collection.drop();
		collection.ensureIndex({ name : 1}, { unique : true}, function(error){
		    if(error) return on_error(error);
		    
		    upsert_docs(collection,"name",default_groups, function(error){
			if(error) return on_error(error);
			console.log("default groups inserted");
			
			db.collection("users", {}, function(error, collection){
			    if(error) {return on_error(error);}
			    collection.drop();
			    collection.ensureIndex({ login_name : 1}, { unique : true}, function(error){
				if(error) return on_error(error);
				upsert_docs(collection, "login_name", default_users, function(error, n, status){
				    if(error) return on_error(error);
				    console.log("default users inserted");
				    on_error(null);
				});
			    });
			    
			});
			
			
		    });
		    
		});
		
		
	    });
	    
	    
	});
	
    }
*/

    //{ name : 'admin', description : "God-like users" }
    
    var base_collections = [
	{
	    type : "db_collection",
	    db : {
		grants : [['g','users','r'],['g','admin','w']],
		collection : "collections"
	    },
	    elements : {
		name : { value : "collections"},
		template : { value : "db_collection"},
	    }
	},

	{
	    type : "db_collection",
	    db : {
		grants : [['g','admin','w'],['g','admin','r']],
		collection : "collections"
	    },
	    elements : {
		name : { value : "Users"},
		template : { value : "user"},
	    }
	},
	{
	    type : "db_collection",
	    db : {
		grants : [['g','admin','w'],['g','admin','r']],
		collection : "collections"
	    },
	    elements : {
		name : { value : "Groups"},
		template : { value : "user_group"},
	    }
	    
	},
	{
	    type : "db_collection",
	    db : {
		grants : [['g','everybody','r'],['g','admin','w']],
		collection : "collections"
	    },
	    elements : {
		name : { value : "Apis"},
		template : { value : "api_provider"},
	    }
	}
    ];
    
    
    function check_collections(cb){
	
	app.mongo.db.collection("collections").drop();
	//return;
	base_collections.forEach(function(c){
	    var col=create_object(c, function (e){
		app.mongo.write_doc(c, function(err, doc){
		    if(err) app.log("Error " + err);
		});
		
	    });
	});
    };

    
    function check_group(gname, cb){
	app.mongo.find1({type : 'Groups', path : 'name', value : gname}, function(err, admin_group){
	    if(err){
		return cb("error looking for admin group " + err);
	    }

	    if(admin_group){
		admin_group=create_object_from_data(admin_group);
		//console.log("We found the "+gname+": " + JSON.stringify(admin_group) );
		return cb(null, admin_group);
	    }
	    else{
		
      		var admin_group=app.tmaster.create_object("user_group");
		admin_group.db.collection="Groups";
		admin_group.set("name",gname)
		//.set("description",gdesc)
		    .save(function(err){
			if(err)
			    return cb("error saving admin group " + err);
			//console.log("Ok, admin group saved!");
			return cb(null,admin_group);
		    });
		
	    }
	    
	});
    }

    function check_admin_user(admin_name, pw, admin_group, cb){
	
	app.mongo.find_user(admin_name, function(err, admin_user){
	    
	    if(err){
		return cb("error looking for admin user " + err);
	    }
	    
	    if(admin_user){
		console.log("Admin user already exists....");
		admin_user=create_object_from_data(admin_user);
	    }else{
		console.log("creating admin user.....");
		admin_user=create_object("user");
	    }
	    var admin_local_access=admin_user.get('credentials.local');
	    
	    if(admin_local_access===undefined){
		admin_local_access=create_object("local_access");
		admin_user.get('credentials').add('local',admin_local_access);
	    }

	    
	    
	    admin_local_access.set('username',admin_name)
		.set_password(pw);

	    admin_user.db.collection="Users";
	    
	    app.log("saving admin user.....");
	    return cb(null,admin_user);
	});
    }
			   
    
    setTimeout(function(){
	app.log("Sadira bootstrapping");

	
	// hash_user_password("123456", function(error, hash_data){
	//     app.log("Hash data : " + JSON.stringify(hash_data));
	    
	// });
	var admin_name="god";
	//get_strong_console_password(admin_name,function(error, pw){
	    
	    //if(error) return on_error(error);
	var pw="123";

	var h=crypto.createHash('sha256');
	h.update(pw,'utf-8');
	pw=h.digest('base64');

	console.log("Admin hashed pw ["+pw+"] !!!!");
	
	//app.mongo.db.collection("user").drop();
	//app.mongo.db.collection("user_group").drop();



	
	check_collections(function(e){

	    //console.log("Bootstrap done");

	});

	module.exports.reset_apis(function(e){
	});
	
	check_group('admin',function(err, admin_group){
	    if(err) throw("Bootstrap error : " + err);
	    admin_group.set('description',"Wizards and magicians only.");
	    admin_group.save();

	    check_group('everybody',function(err, every_group){
		if(err) throw("Bootstrap error : " + err);
		every_group.set('description',"All the remaining trolls.");
		every_group.save();
		//console.log("Everybody group : " + JSON.stringify(users));

		
		check_group('users',function(err, users){
		    
		    if(err) throw("Bootstrap error : " + err);
		    
		    
		    
		    users.set('description',"Registered gnomes, goblins and farfadets.");
		    users.save();
		    console.log("Users group : " + JSON.stringify(users));
		    
		    check_admin_user(admin_name, pw, admin_group, function(err, admin_user){
			if(err) throw("Bootstrap error : " + err);
		    
			app.log("adding admin user to admin group...");
			admin_user.get('groups').add_link(admin_group);
			admin_user.get('groups').add_link(users);
			admin_user.get('groups').add_link(every_group);
			admin_user.save();
			
			//console.log("Admin group : " + JSON.stringify(admin_group));
			//console.log("Admin user : " + JSON.stringify(admin_user));
		    //admin_user.handle_request("toto", function(){});
		    });

		});
		
		
		
	    });

	});
	
	
	
	
	//}
	    
	    // },{
	    // 	minLength              : 5,
	    // 	minOptionalTestsToPass : 0
	    // });
	
	
    }, 0);
    
    return;
}
