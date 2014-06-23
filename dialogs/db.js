var SRZ=require('../html/js/serializer.js');
var MONGO=require('../mongoi');
var MONGO=require('../system_templates');

var mongo=require('mongodb');
var mongo_grid=mongo.Grid;

function db_request (opts, handler, status_cb){
    
    //console.log('get_docs from : '+ JSON.stringify(message.widget_addr));
    if(typeof opts.options == 'undefined') opts.options={};
    opts.options.raw=true;
    
    console.log("Retrieving mongo docs fo "+ JSON.stringify(opts));
    
    var dblink=db[opts.db];
    
    if(typeof dblink =='undefined')return status_cb("Database not loaded ["+opts.db+"]");
    
    dblink.collection(opts.col, { raw: true },  function(error, collection){
	
	if(error) return status_cb("Unable to get the collection ["+ opts.col +"] : " + error);
	
	collection.find(opts.query,opts.options, function(error, cursor){
	    
	    if(error) return status_cb("Query [" + JSON.stringify(opts.query) + "] failed within collection ["+ opts.col +"] : " + error);
	    
	    handler(cursor);
	    
	});
    });
    
}

function db_query_dialog(dlg, opts){

    var cursor;
    
    dlg.listen('ready',function(dgram){
	cursor.each(function(err, doc_data){
	    
	    if(err){  
		dlg.close("Error cursor on data : " + err); 
		
	    }else
		if(doc_data != null){
		    var srep=new SRZ.srz_mem(doc_data);
		    
		    srep.on_done=function(){
			console.log("Sent document OK");
		    };
		    
		    dlg.srz_initiate(srep, function(error){
			
		    });
		}else{
		    console.log("Finished processing docs !");
		    
		}
	    
	});
	
    });
    
    db_request(opts, 
	       function(curs){
		   cursor=curs;
		   cursor.count(function(err, n_docs){
		       dlg.send_datagram({type: 'ndocs', ndocs: n_docs},null,function(error){
			   if(error)
			       dlg.close(error);
		       });
		   });
		   
	       }, function(error){
		   if(error){
		       console.log("Error dbreq " + error);
		       dlg.close(error);
		   }
	       });
    
}

dialog_handlers.db = {
    get_collections : function (dlg, status_cb){

	status_cb();
	db_query_dialog(dlg, { db : "sadira", col : "collections",
			       query : {}, 
			       options : { fields : { dbname : true, collection_name : true, collection_dbname : true, head_template : true, "_id" : false }}
			     }
		       );
    },
    get_system_templates : function (dlg,status_cb){
	status_cb();
	dlg.send_datagram({type: 'system_templates', data : system_templates, close : true},null,function(error){});
    },

    get_docs : function(dlg, status_cb){
	console.log("Get docs...");
	status_cb();
	db_query_dialog(dlg, dlg.header);
    },
    get_template : function (dlg, status_cb){

	status_cb();
	console.log("get tpl header "+JSON.stringify(dlg.header));
	db_query_dialog(dlg, { db : "sadira", col : "templates",
			       query : { tpl_name : dlg.header.tpl_name }, 
			       options : { fields : { "_id" : false } }
			     }
		       );
    },
    server_info : function (dlg, status_cb){

    	var dbname=dlg.header.db_name;
	var dbo=db[dbname];
	
	if(typeof dbo == 'undefined' )
	    return status_cb("Database ["+dbname+"] not found !");
	
	//dlg.send_info("Getting admin db ...");
	
	var admin = dbo.admin();
	
	if(typeof admin == 'undefined') 
	    return status_cb("Cannot get admin on that DB");

	admin.serverInfo(function(err, info) {
	    if(err!=null){
		return satus_cb(err);
	    }
	    status_cb(null,info);
	});
	
    },
    get_databases : function (dlg, status_cb){
	//dlg.send_info("Getting admin db");

	var adminDb = db.sadira.admin();

	adminDb.listDatabases(function(err, dbs) {
	    if(err!=null){
		return status_cb(err);
	    }

	    status_cb(null,{data: dbs.databases});
	});
	
	
    },
    get_collection_names: function (dlg,status_cb){
	var dbname=dlg.header.db_name;
	var dbo=db[dbname];
	
	if(typeof dbo == 'undefined' )
	    return status_cb("Database ["+dbname+"] not found !");
	
	//reply.info("db["+dbname+"] opened OK");	    

	dbo.collectionNames(function(err, items) {
	    if(err)
		status_cb("Database ["+dbname+"] collection_names : " + err);
	    else status_cb(null,{data : items});
	});
    },
    get_collection_stats: function (dlg,status_cb){
	var dbname=dlg.header.db_name;
	var coll=dlg.header.collection;
	var dbo=db[dbname];
	//reply.info("Getting stats for db " + dbname + " collection " + coll);
	if(typeof dbo == 'undefined' )
	    return status_cb("Database ["+dbname+"] not found !");
	dbo.collection(coll, function(error, collection){
	    if(error!=null)
		return status_cb("Database ["+dbname+"] : " + error);
	    collection.stats(function (err, stats){
		if(err!=null)
		    return status_cb("Database ["+dbname+"], while stats() : " + err);
		//reply.info("Ok, got the stats...");
		status_cb(null,{data: stats});
	    });
	});
    },
    drop_collection: function (dlg,status_cb){
	var dbname=dlg.header.dbname;
	var coll=dlg.header.collection;
	
	//reply.info("Trying to drop database " + dbname + " -> collection " + coll);
	
	db.drop_collection(dbname,coll,function(error, stats){
	    if(error!=null) return status_cb(error);
	    //reply.info("Ok, collection dropped");
	    status_cb(null, stats);
	});
	
    },
    create_database : function (message, reply, cnx){
	var dbn=message.data.values.db_name;
	//reply.info("Received data " + JSON.stringify(message.data));
	reply.info("Opening DB " + dbn);

	db.open(dbn, function (error, dbi ){
	    if(error) return reply.error(error);
	    reply("create_database", dbi);
	});
	
	//reply("system_templates", { binary_blocks : [ { type : 'object', data : tpl_data} ] } );
    },

    create_collection : function (message, reply, cnx){
	var values=message.data.values;
	var db_name=message.data.db_name;
	var collection_name=message.data.values.collection_name;

	reply.info("Got data : <pre> " + JSON.stringify(message.data, null, 4) + "</pre>");
	
	if(typeof db_name == 'undefined' || typeof collection_name == 'undefined')
	    return reply.error("Required info not received from you!");
	
	reply.info("Trying to open db["+db_name+"]");	    
	
	var dbo=db[db_name];
	
	if(typeof dbo == 'undefined' )
	    reply.error("Cannot find a database with that name : " + db_name);
	
	reply.info("["+db_name+"] is found !");
	dbo.createCollection(collection_name,function (err, items){
	    if(err!=null){
		return reply.error("Error while creating collection " + collection_name + " : " + err);
	    }else
		reply.info("Collection created OK : " + jstringify(items));
	});
	
	
    },

    
};
