// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.
// Do what you want with this file.


var mongo = require('mongodb');

//var Db = mongo.Db,
var MongoClient = mongo.MongoClient,
Server = mongo.Server,
ReplSetServers = mongo.ReplSetServers,
ObjectID = mongo.ObjectID,
Binary = mongo.Binary,
GridStore = mongo.GridStore,
Grid = mongo.Grid,
Code = mongo.Code;

var BSON = mongo.BSON;

var assert = require('assert');

function server(pkg,app) {
    this.sad=app;
    var config_in=pkg.opts;
    var def_port=27017;
    var config=this.config={
	mongo_host : "localhost",
	mongo_port : def_port,
	mongo_db : "sadira",
	replica_set_name : "sadira_repset",
	replica_set_enable : false,
	replica_set :[
	    {
		ip : "192.168.166.230",
		port : def_port,
		options : { safe:true, auto_reconnect: true }
	    },
	    {
		ip : "192.168.166.231",
		port : def_port,
		options : { safe:true, auto_reconnect: true }
	    },
	    {
		ip : "192.168.166.232",
		port : def_port,
		options : { safe:true, auto_reconnect: true }
	    }
	]
    };

    if(è(config_in)){
	for (var c in config_in) config[c]=config_in[c];
    }

    if(è(config.replica_set)){
    	for(var rsi in config.replica_set){
    	    if(ù(config.replica_set[rsi].port))
    		config.replica_set[rsi].port=def_port;
    	}
    }
    
}

server.prototype.disconnect = function(cb) {
    if(ù(this.srv)) cb("Mongo server NOT connected!");

    this.srv=undefined;
}

server.prototype.connect = function(cb, options_in) {
    var mongo=this;
    
    if(è(mongo.client)) cb("Mongo server already connected!");
    var cfg=this.config;
    
    try{

	var url = 'mongodb://';
	
	if(cfg.replica_set_enable){
	    var v=false;
	    for(var rssi in cfg.replica_set){
		if(v)url+=',';
		var rss=cfg.replica_set[rssi];
		rset.push(new Server(rss.ip,rss.port,rss.options));
		url+=rss.ip+':'+rss.port;
		v=true;
	    }
	    url+='/'+cfg.mongo_db+'?replicaSet='+cfg.replical_set_name;
	    
	}else{
	    
	    url+=cfg.mongo_host+':'+cfg.mongo_port+'/'+cfg.mongo_db;
	}
	
	var options={
	    raw: true, native_parser : true
	};
	if(è(options_in))for (var oi in options_in) options[oi]=options_in[oi];
	
	console.log("Connecting to mongo : " + url + " options " + JSON.stringify(options));
	
	MongoClient.connect(url, options, function(err, db) {
	    if(err){
		var em="Mongo error while opening DB [" + dbname + "] : " + err;
		console.log(em);
		mongo.db=undefined;
		return cb(em);
	    }
	    mongo.db=db;
	    cb(null,db);
	});
    }
    catch (e){
	cb("Mongo exception : " + e);
    }
}

function create_query(opts){
    var op='';
    if(è(opts.path)){
	var splitpath=opts.path.split('.');
	
	for(var pe=0;pe<splitpath.length;pe++){
	    op+='els.'+splitpath[pe]+'.';
	}
    }
    op+='value';

    var q={}; q[op]=opts.value;
    return q;
}

server.prototype.write_doc=function(doc, a,b){
    var options_in, cb;
    if(is_function(a)){
	cb=a;
    }else{
	options_in=a;
	cb=b;
    }
    if(cb===undefined){
	throw("write_doc : you need to provide a callback function !");
    }
    
    var options={w: 'majority', wtimeout: 10000, serializeFunctions: true, forceServerObjectId: true};
    
    if(è(options_in))for (var oi in options_in) options[oi]=options_in[oi];


    var data=get_template_data(doc);
    //console.log("read data " + JSON.stringify(data));
    if(doc.id()!==undefined){
	var q={ _id : doc.id() };
	this.db.collection(doc.type).findOneAndUpdate(q,data, options, cb);
    }
    else
	this.db.collection(doc.type).insertOne(data, options, cb);

    
    return doc;
}

/*
server.prototype.update_doc=function(doc,a,b){

    var opts=null,cb=null;

    if(is_function(a)){
	cb=a;
	if(b!==undefined) opts=b; 
    }else{
	opts=a;
	if(b!==undefined) cb=b; 
    }
    if(!cb){
	throw "No cb given to update_doc!";
    }
    var q;

    if(opts){
	q=create_query(opts);
    }else{
	if(doc.db!==undefined)
	    if(doc.db.id!==undefined){
		q={ _id : doc.db.id };
	    }
    }

    if(q===undefined){
	return cb("Cannot create query !, check update_doc call");
    }
    
    var options={w: 'majority', wtimeout: 10000, forceServerObjectId: true};
    if(è(opts.opts))for (var oi in opts.opts) options[oi]=opts.opts[oi];
    var data=get_template_data(doc);

    console.log("read data " + JSON.stringify(data));

    this.db.collection(doc.type).findOneAndUpdate(q,data, options, cb);
}
*/

server.prototype.find=function(opts, cb){

    var q=create_query(opts);
    //console.log(type+ " : finding " + op + " = " + value);
    this.db.collection(opts.type).find(q, {}, cb);
	// var objects=[];
	// for(var i=0;i<data.length;i++){
	//     objects[i]=create_object(opts.type);
	//     //console.log("Find returned " + obj + " name " + obj.name);
	//     set_template_data(objects[i], data[i]);
	// }
	
	
    
}


server.prototype.find1=function(opts, cb){

    var q=create_query(opts);
    //console.log(type+ " : finding " + op + " = " + value);
    this.db.collection(opts.type).findOne(q, {}, function (err, data){

	if(err) return cb(err);
	if(!data) return cb(null);

	cb(null,data);
	
    });
    //function(error, res){});
    
    
}


server.prototype.find_user=function(identifier, cb){
    var mongo=this;
    mongo.find1({type: "user", path:'credentials.local.email', value : identifier},function(err, user) {
	if(err) return cb(err);
	if(user===undefined){
	    
	    mongo.find1({type: "user", path:'credentials.local.username', value : identifier},function(err, user) {
		if(err) return cb(err);
		if(user===undefined){
		    return cb(null);
		}
		return cb(null,user);
		
	    });
	    
	}else
	    return cb(null,user);
	
    });
}



module.exports.server=server;


// exports.server.prototype.close = function() {

//     mongoose.disconnect();
    
//     if(è(this.srv)){
// 	this.srv.close();
// 	delete this.srv;
//     }
// }

// exports.server.prototype.request=function(db, collection, query, cb, options_in){

//     if(ù(this.srv)) return cb("Mongo server NOT connected!");
//     if(ù(this.db_link[db])){
// 	this.open_db(db, function(error, db){
// 	    if(error) return cb(error); 
// 	    var options={raw:true};
// 	    if(è(options_in))for (var oi in options_in) options[oi]=options_in[oi];
// 	});
	
// 	console.log("Retrieving mongo docs for db "+ db+ " collection " + collection +  " Query " + JSON.stringify(query) + " Options " + JSON.stringify(options) +"...") ;

//     }
    
//     try{
// 	if(typeof database == 'undefined') throw "Database " + database + " is not opened.";

// 	database.collection(collection_, { raw: true },  function(error, collection){
// 	    if(error){
// 		throw("Unable to get the collection ["+ collection_ +"] : " + error);
// 	    }
// 	    else{
// 		collection.find(query,options, function(error, cursor){
// 		    if(error){
// 			throw("Query [" + JSON.stringify(query) + "] failed within collection ["+ collection_ +"] : " + error);
			
// 		    }else{
			
// 			//console.log("XXXYYY");
// 			//var images=[];
// 			cursor.count(function(err, n_docs){
			    
// 			    console.log(n_docs + " documents found." );
			    
// 			    if(n_docs==0)
// 				return reply(null,null);
			    
// 			    var ntogo=n_docs;
// 			    var bb=[];
			    
// 			    cursor.each(function(err, img){
// 				if(err) 
// 				    throw("Error !!! : " + err);
// 				else{
// 				    if(img!=null){
// 					bb.push({ type : 'binary/BSON', data : img });
// 					//images.push(img);
// 					ntogo--;
// 				    }
				    
// 				    if(ntogo==0 && img!=null){
// 					console.log('Sending ' + bb.length + " binary blocks" );
// 					//var bso= BSON.serialize( { docs: images } , true ,true,false );
// 					//var bson_block={ type: 'binary/BSON', data : BSON.serialize(images) };
// 					//reply('docs', { binary_blocks: [ { type : 'binary/BSON', data : bso } ] });
// 					reply(null,bb);//'docs', { binary_blocks: bb });
		    
// 				    }
// 				}
				
// 			    });
			    
// 			});
			
			
// 		    }
// 		});
		
// 	    }
// 	});
//     }
//     catch (e){
// 	console.log('Error is ' + e);
// 	reply(e);
//     }
    
// }


// mongoi.prototype.get_collection =function (collection_id, reply_cb){
//   var dbs=this.sadira;
//   var oid = new mongo.ObjectID(collection_id);
  
//   dbs.collection("collections", function(error, cocol){
    
//     if(error!=null){
//       return reply_cb("Unable to get users collection : " + error);
//     }
    
//     cocol.findOne({ _id : oid },{dbname : 1, head_template: 1}, function(error, collection_info){
//       reply_cb(error, collection_info);
//     });
//   });
  
// }


// mongoi.prototype.write_doc =function (collection_id, values, binary_blocks, reply_cb){
  
//   //console.log("Writing doc : received data : " + JSON.stringify(message.data, null, 4));

//   //var dbname=message.data.db;
//   //var collection_name=message.data.collection;

//   var dbs=this.sadira;

//   var oid = new mongo.ObjectID(collection_id);
  
//   dbs.collection("collections", function(error, cocol){
    
//     if(error!=null){
//       return reply_cb("Unable to get users collection : " + error);
//     }
    
//     cocol.findOne({ _id : oid },{dbname : 1, head_template: 1}, function(error, collection_template){
//       if(error!=null)
//       return reply_cb("Error looking for user " + data.user + " : " + error);
      
//       else if(user ==null){
// 	result_cb({error : "User " + user_info.username + " doesn't exist"});
//       }
//       else{
// 	cnx.session.delog_user();
// 	result_cb({logged_out : user_info.username});
	
//       }
//     });
//   });
  


//   var values=message.data.values;
//   var template_name=message.data.template_name;
//   var doc_id=message.data.doc_id;

//   //	var binary_blocks=message.data.binary_blocks;
  
//   var nbb=0;

//   if(typeof binary_blocks != 'undefined')
//   nbb=binary_blocks.length;

//   var dbo;

  
//   //db.open_user_collection(collection_name, function (error, collection, template){} );

//   db.get_template(template_name, dbname, function(err, template){

//     if(err){
//       error(err);
//       return;
//     }
    
//     try{
//       if(typeof dbname == 'undefined' || typeof collection_name == 'undefined' || typeof template_name == 'undefined' )
//       throw "Request doesn't provide dbname ("+ dbname +") or collection ("+collection+") or template name ("+template_name+")";
      
//       reply.info("Trying to open db["+dbname+"]");	    
      
//       dbo=db[dbname];
      
//       if(typeof dbo == 'undefined' )
//       throw "Cannot find a database with that name : " + dbname;
      
//       reply.info("["+dbname+"] is found !");


//       var new_doc_data={};

//       for ( e in template.elements ){
	
// 	if(typeof values[e] != 'undefined'){
// 	  var v=values[e];
	  
// 	  reply.info("Template item " + e + " found with new value " + JSON.stringify(v) );
	  
// 	  if(typeof v.binary_id != 'undefined'){
// 	    info("Value for " + e + " is binary, generating new gridfs entry....");
	    

// 	  }
// 	  else
// 	  new_doc_data[e]=values[e];
	  
// 	}else{
// 	  console.log("Template item " + e + " NOT found in incoming doc data ");
// 	}
	
//       }
      
      
//       dbo.collection(collection_name, function(error, collection){
	
// 	if(error!=null){
// 	  throw "Unable to get users collection [" + collection +"]:"+ error;
// 	}
	
// 	reply.info("Inserting " + JSON.stringify(new_doc_data) + " in the collection... : " + nbb + " binary blocks doc ID is "+ doc_id);


// 	if(typeof doc_id != 'undefined' ){
	  
// 	  var oid = new mongo.ObjectID(doc_id);
// 	  console.log("Created oid " + oid + " from " + doc_id);
	  
// 	  collection.findAndModify({_id: oid}, [],
// 				   new_doc_data, {new:true, upsert:true, w:1}, function(er, doc) {
// 	    if(er){
// 	      error("Cannot find the document with ID " + doc_id + " : " + er);
// 	    }else
// 	    if(doc!=null){
// 	      info("OK, we have updated the doc " + JSON.stringify(doc));
// 	    }else
// 	    error("NULL doc returned for doc_id " + doc_id);
// 	  });
	  
	  
// 	  //collection.findOne({_id: oid}, function(er, doc){});
	  
// 	}else{
	  
// 	  console.log("Creating a new document...");
// 	  collection.insert(
// 	    new_doc_data
// 	    , function(error, o){
// 	      if(error!=null){
// 		throw "Unable to insert new document in "+dbname+"["+collection_name+"] : " + error ;
// 	      }else{
// 		reply.info("Document was written to DB");
// 	      }
// 	    });
	  
// 	}
	
// 	for(bb=0;bb<nbb;bb++){
// 	  console.log("BB "+bb + " : bytes=" + binary_blocks[bb].size);
// 	}
	
// 	if(bb>0){
// 	  reply.info("Opening grid for binary data saving...");
// 	  var grid = new mongo_grid(dbo, 'fs');
	  
// 	}
	
// 	/*
// 	*/
	
// 	reply.info("ca  va?");
	
//       });
      
//     }
//     catch (e){
//       var em="Error writing docs to database :" + e;
//       console.log(em);
//       reply.error( em);
//     }
    
//   });
  
// },





// mongoi.prototype.drop_collection=function(dbname, coll, result_cb){

//   var dbo=this[dbname];
//   if(typeof dbo == 'undefined' )
//   return result_cb("Database ["+dbname+"] not found !");
  
//   dbo.collection(coll, function(error, collection){
//     if(error!=null)
//     return result_cb("Database ["+dbname+"] : " + error);
//     collection.drop(function (err, stats){
//       if(err!=null)
//       return result_cb("Database ["+dbname+"], while drop() : " + err);
      
//       result_cb(null,  stats);
//     });
//   });
// }


// mongoi.prototype.user_login = function(user_info, cnx, result_cb){

//   var dbs=this.sadira;
  
//   dbs.collection("users", function(error, users_collection){
    
//     if(error!=null){
//       result_cb({error : "Unable to get users collection : " + error});
//     }
    
//     users_collection.findOne({username : user_info.username},{username: 1, hashed_pw : 1}, function(error, user){
      
//       if(error!=null)
//       result_cb({error :"Error looking for user " + data.user + " : " + error});
//       else if(user ==null){
// 	result_cb({error : "User " + user_info.username + " doesn't exist"});
//       }
//       else{
// 	if(typeof user.hashed_pw=='undefined' || typeof user_info.password =='undefined')
// 	;
	
// 	if(validateHash(user.hashed_pw, user_info.password)){
	  
// 	  result_cb({logged_in : user_info.username});
	  
// 	  cnx.session.user=user;
	  
// 	  users_collection.update({username : user_info.username},{$set : { last_login: new Date().getTime()}}, function(error, user){
// 	    if(error!=null)
// 	    result_cb({error : "Error updating user data " + error + "."} );
// 	  });
	  
// 	}else
// 	result_cb({error : "Invalid password for " + user_info.username + "."} );
	
//       }
//     });
//   });
// }

// mongoi.prototype.user_logout = function(user_info, cnx, result_cb){
  
//   var dbs=this.sadira;
  
//   dbs.collection("users", function(error, users_collection){
    
//     if(error!=null){
//       result_cb({error : "Unable to get users collection : " + error});
//     }
    
//     users_collection.findOne({username : user_info.username},{username: 1, hashed_pw : 1}, function(error, user){
//       if(error!=null)
//       result_cb({error :"Error looking for user " + data.user + " : " + error});
//       else if(user ==null){
// 	result_cb({error : "User " + user_info.username + " doesn't exist"});
//       }
//       else{
// 	cnx.session.delog_user();
// 	result_cb({logged_out : user_info.username});
	
//       }
//     });
//   });
// }

// mongoi.prototype.delete_pre_user = function(user_info, result_cb){
//   var dbs=this.sadira;

  
//   dbs.collection("pre_users", function(error, users_collection){
    
//     if(error!=null){
//       result_cb({error : "Unable to get users collection : " + error});
//     }

//     users_collection.remove({username : user_info.username}, {w:1}, function(err, numberOfRemovedDocs) {
      
//       if(err!=null){
// 	result_cb({error : "Unable to insert user in db : " + err});
//       }else{
// 	result_cb({message : numberOfRemovedDocs +  " removed."});
//       }
//     });
    
//   });
// }

// mongoi.prototype.create_user = function(user_info, result_cb){
//   var dbs=this.sadira;
//   var moi=this;

//   dbs.collection("users", function(error, users_collection){
    
//     if(error!=null){
//       result_cb({error : "Unable to get users collection : " + error});
//     }
    
    
//     users_collection.findOne({username : user_info.username},{username: 1}, function(error, user){
      
//       if(error!=null)
//       result_cb({error :"Error looking for user " + data.user});
//       else if(user !=null){
// 	result_cb({error : "User " + user_info.username + " already exists!"});
//       }
//       else{

// 	users_collection.insert({

// 	  username : user_info.username, 
// 	  hashed_pw: user_info.password , 
// 	  email: user_info.email,
// 	  account_creation_time: new Date().getTime()}, function(error, o){
	  
// 	  if(error!=null){
// 	    result_cb({error : "Unable to insert user in db : " + error});
// 	  }else{
// 	    moi.delete_pre_user(user_info, function(status){
// 	      result_cb({message : "You can now <a href='/'>login</a>"});
// 	    });
	    
// 	  }
// 	});
//       }
//     });
//   });
  
// }


// mongoi.prototype.register_pre_user = function(username, email, password, origin, result_cb){

//   var dbs=this.sadira;
//   var options={"slaveok" : 1};

//   dbs.collection("users", function(error, users_collection){
    
//     if(error!=null){
//       throw "Unable to get users collection : " + error;
//     }
    
    
//     users_collection.findOne({username : username},{username: 1}, function(error, user){
//       if(error!=null){
// 	result_cb({error: "Error looking for user " + username + " mongo error : " + error });
// 	console.log("Error looking for user " + username + " mongo error : " + error);
//       }
//       else if(user !=null){
// 	console.log("Found user " + JSON.stringify(user));
// 	result_cb({error :"User "+ username+" already exist."});
	
//       }
//       else{
// 	console.log("User not found ");
	

// 	dbs.collection("pre_users", function(error, pre_users_collection){
	  
// 	  if(error!=null){
// 	    throw "Unable to get pre_users collection : " + error;
// 	  }
	  
// 	  pre_users_collection.findOne({username : username},{username: 1}, function(error, user){
// 	    if(error!=null)
// 	    console.log("Error looking for user " + data.user);
// 	    else if(user !=null){
// 	      console.log("Found user " + JSON.stringify(user));
// 	      result_cb({error : "Another user candidate is already trying to register with the "+ username+" nickname."});
	      
// 	    }
// 	    else{
// 	      console.log("Pre-User not found, recording him and sending email ");
	      
// 	      var prekey=Math.random().toString(36).substring(2);
	      
// 	      pre_users_collection.insert({username : username, registration_key : prekey, password : createHash(password), email : email}, function(error, o){
		
// 		if(error!=null)
// 		result_cb({error : "Error while inserting pre-user in db : " + error});
// 		else{
		  
		  
// 		  var nodemailer = require("nodemailer");
		  
// 		  // create reusable transport method (opens pool of SMTP connections)
// 		  var smtpTransport = nodemailer.createTransport("SMTP",{
// 		    host : "smtp.iasfbo.inaf.it",
// 		    port: 25
		    
// 		    // auth: {
// 		    // 	user: "sprimont@iasfbo.inaf.it",
// 		    // 	pass: "GLORIA2011"
// 		    // }
// 		  });
		  
// 		  // setup e-mail data with unicode symbols
// 		  var mailOptions = {
// 		    from: '"GLORIA -INAF Team-" <sprimont@iasfbo.inaf.it>', // sender address
// 		    to: email, // list of receivers
// 		    subject: "Confirm your subscription on INAF's Gloria DB interface", // Subject line
// 		    text: "Hi "+username+",\n\nIt appears you want to become a user of INAF's GLORIA database, if it is the case, follow the link below to continue the registration process\n\n"+origin+"/users/register_pre?user="+username+"&prekey="+prekey
// 		    //, // plaintext body
// 		    //html: "<b>Hello world ✔</b>" // html body
// 		  }
		  
// 		  // send mail with defined transport object
// 		  smtpTransport.sendMail(mailOptions, function(error, response){
// 		    if(error){
// 		      result_cb({error : "Error while sending e-mail : " + error});
// 		    }else{
// 		      console.log("Message sent: " + response.message);
// 		      result_cb({message : "Follow the instructions in the confirmation e-mail that has just been sent to you."});
		      
// 		    }
		    
		    
		    
// 		    // if you don't want to use this transport object anymore, uncomment following line
// 		    smtpTransport.close(); // shut down the connection pool, no more messages
// 		  });
		  
		  
// 		}
		
// 	      });
	      
	      
	      
	      
// 	    }
// 	  });
	  
// 	});
//       }
//     });
    
//   });
  
// }


// mongoi.prototype.find_user = function(username){
//   var db=this.sadira;

//   db.users.findOne({username: username}, function(error, doc){
//     if(error)
//     console.log("Error looking for user " + username);
//     else
//     console.log("Found user " + username);
//   });

// }


// mongoi.prototype.init_db = function( cb ) {
//   var db=this.sadira;

//   try{
    
//     console.log("Dropping users...");
//     //db.dropCollection("users");

//     db.dropCollection("pre_users",function (err, items){
//       if(err!=null) console.log("Error dropping pre_users :" + JSON.stringify(err));
      
//       db.dropCollection("users",function (err, items){
// 	if(err!=null) console.log("Error dropping users :" + JSON.stringify(err));
// 	//console.log(JSON.stringify(items,null,4));
// 	console.log("Dropping observatories...");
	
// 	db.dropCollection("observatories",function (err, items){
	  
// 	  if(err) console.log(err);
	  
// 	  console.log("Dropping experiments...");
	  
// 	  db.dropCollection("experiments",function (err, items){
	    
// 	    if(err) console.log(err);
	    
// 	    console.log("Creating users...");
// 	    db.createCollection("users",function (err, items){
// 	      console.log("Creating observatories...");
// 	      db.createCollection("observatories",function (err, items){
// 		console.log("Creating experiments...");
// 		db.createCollection("experiments",function (err, items){
// 		  cb("OK");
// 		});
// 	      });
// 	    });
	    
// 	  });
// 	});
	
//       });
//     });
    
//   }
//   catch (e){
//     console.log(e);
//     cb(e);
//   }
// }

// mongoi.prototype.load_user_templates = function(json_file){
  
//   var fs = require('fs');
//   var me=this;

//   fs.readFile(json_file, 'utf8', function(err, data) {
//     if (err) throw err;

//     //var tpl_data = JSON.parse(data);
//     var tpl_data = eval (data);

//     me.sadira.collection("templates", function(error, templates){
      
//       if(error!=null){
// 	result_cb({error : "Unable to get collection : " + error});
//       }
      

//       for(var t=0;t<tpl_data.length;t++){
// 	//console.log("TPL " + t + " : "  + JSON.stringify(tpl_data[t], null, 4));
	
// 	templates.insert( { tpl_name : tpl_data[t].dbid, json_tpl : tpl_data[t] }, 
			  
// 			  function(error, o){
	  
// 	  if(error!=null){
// 	    console.log( "Unable to insert doc in db : " + error);
// 	  }else{
// 	    console.log("Ok object inserted " + JSON.stringify(o));
// 	  }
// 	});
	
//       }
      
      
      
      
//     });
//   });
  
  
// }

// mongoi.prototype.load_user_collections = function(json_file){
  
//   var fs = require('fs');
//   var me=this;

//   fs.readFile(json_file, 'utf8', function(err, data) {
//     if (err) throw err;

//     //var tpl_data = JSON.parse(data);
//     var tpl_data = eval (data);

//     me.sadira.collection("collections", function(error, templates){
      
//       if(error!=null){
// 	result_cb({error : "Unable to get collection : " + error});
//       }
      

//       for(var t=0;t<tpl_data.length;t++){
// 	//console.log("TPL " + t + " : "  + JSON.stringify(tpl_data[t], null, 4));
	
// 	templates.insert( tpl_data[t], 
			  
// 			  function(error, o){
	  
// 	  if(error!=null){
// 	    console.log( "Unable to insert doc in db : " + error);
// 	  }else{
// 	    console.log("Ok object inserted " + JSON.stringify(o));
// 	  }
// 	});
	
//       }
      
      
      
      
//     });
//   });
  
  
// }

// /*
// mongoi.prototype.open_user_collection = function(collection_dbname, result_cb){

// this.sadira.user_collections.findOne( { collection_dbname : collection_dbname}, function (err, doc){
// if(err) return result_cb(err);

// console.log("Found user collection " + collection_dbname + " : " + JSON.stringify(doc));

// });

// }
// */

// mongoi.prototype.get_template = function(tpl_name, tpl_scope, result_cb){

//   if(tpl_scope=='system'){ //system template
//     var tpl=system_templates[tpl_name];
//     if(typeof tpl == 'undefined')
//     result_cb("System template "+tpl_name + " not found");
//     else
//     result_cb(null,tpl);
//     return;
//   }
//   //user template

//   this.sadira_user.templates.findOne({name: tpl_name}, function(error, doc){
//     if(error){
//       var er = "Error looking for template " + tpl_name + " : " + error; 
//       console.log(er);
//       result_cb(er);
//       return;
//     }
//     else{
//       console.log("Found template " + tpl_name + " : " + JSON.stringify(doc));
//       reply(null,doc);
//     }
//   });
// }

// mongoi.prototype.init_dbb = function( cb ) {
  
//   //    cb({ msg : "Error", stop : false });
//   var db=this.sadira;

//   db.collectionNames( function(err, items){
    
//     items.msg="Collection names :";
//     items.stop=false;

//     cb(JSON.stringify(items));
    
//     db.createCollection("sys", function (err, items){

//       if(items){

// 	items.msg="Create collection :"
// 	items.stop=true;
// 	//console.log(items);
// 	var cache=[];
// 	cb(JSON.stringify(items, 
			  
// 			  function(key, value) {
// 	  if (typeof value === 'object' && value !== null) {
// 	    if (cache.indexOf(value) !== -1) {
// 	      // Circular reference found, discard key
// 	      return;
// 	    }
// 	    // Store value in our collection
// 	    cache.push(value);
// 	  }
// 	  return value;
// 	}
// 			  , 5
			  
// 			  ));
// 	cache = null; // Enable garbage collection
//       }else{
// 	cb({ msg : "Error", stop : true });
//       }
//     });


//   } );
//   return;
  
  
// }

// GLOBAL.db = new mongoi();
