#!/usr/bin/env node

// This is Qk/Sadira.
// Written by Pierre Sprimont <sprimont@iasfbo.inaf.it> (2013-2015) @ INAF/CNR, Bologna, Italy.

var fs = require("fs");
var path = require("path");
var url = require("url");
var bson = require("./www/js/community/bson");
var async = require("./www/js/community/async");
var DLG = require("./www/js/dialog");
var DGM = require("./www/js/datagram");
var utils = require("./www/js/utils");
var BSON=bson().BSON;

var mongodb=require("mongodb");
var mongo_pack=require("./js/mongo");

var ObjectID = mongodb.ObjectID;

var express=require("express");
var exsession = require('express-session');
var methodov = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var logger = require('connect-logger');

var tpl=require('./js/tpl');

/*
  Headers to add to allow cross-origin requests.
*/

var cors_headers = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Credentials' : true,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

/*
  Async write data sliced in chunks of 1kb. 
  data can be a buffer or a string.
*/

GLOBAL.write_chunked_data=function(res, data, result_cb){
    
    var l=typeof data === "string" ? Buffer.byteLength(data) : data.length;//, [encoding])  
    var chunk_size=1024;
    var bs=0;


    function write_next_chunk(){
	if(bs==l){res.end(); if(è(result_cb)) result_cb(null); return;}
	var btw=bs+chunk_size<l? chunk_size: l-bs;
	var chunk=data.slice(bs,bs+btw); bs+=btw;
	//console.log("write chunk... " + bs + "/" + l);
	if(res.write(chunk)) write_next_chunk();
    }
    
    res.on("drain",function(){
	console.log("write buffer drain....");
	write_next_chunk();
    });

    write_next_chunk();

}

/*
  Replyes a cross-origin-friendly json text string and closes connection.
*/

GLOBAL.reply_json=function(res,data,result_cb){
    //var headers=cors_headers;
    var jstring=JSON.stringify(data);
    //var l=jstring.length;
    var l=Buffer.byteLength(jstring);//, [encoding])  

    res.setHeader("Content-Type",'application/json');
    res.setHeader("Content-Length",l);

    for(var h in cors_headers) res.setHeader(h,cors_headers[h]);
    //res.writeHead(200, headers);

    write_chunked_data(res,jstring,result_cb);
    //console.log("Sending JSON length = " + l);

}

/*

*/

GLOBAL.get_parameters=function(req){
    var url_parts = url.parse(req.url,true);
    return url_parts.query;
}    

/*
  Retrieve the JSON parsed object from a request's query string argument given by key
*/

GLOBAL.get_json_parameters=function(req, key){
    if(ù(key))key="req";
    try{
	var url_parts = url.parse(req.url,true);	
	return JSON.parse(url_parts.query[key]);
    }
    catch (e){
	return {};
    }
}

/*
  Retrieve the BSON parsed object from a request's query string argument given by key
*/

GLOBAL.get_bson_parameters=function(req, key){
    if(ù(key))key="req";
    try{
	var url_parts = url.parse(req.url,true);	
	var b=new Buffer(url_parts.query[key], 'base64');
	return BSON.deserialize(b);
    }
    catch (e){
	return {};
    }
}

/*
  Signal interception routines
*/

process.on('SIGTERM', function(){
    console.log('SIGTERM received, terminating !');
    process.exit(1);
});

/*
  describes an error
*/

GLOBAL.dump_error =function (err) {
    var rs="";
    if (typeof err === 'object') {
	if (err.message) {
	    rs='\nMessage: ' + err.message;
	}
	if (err.stack) {
	    rs+='\nStacktrace:';
	    rs+='====================';
	    rs+=err.stack;
	}
    } else {
	console.log("message: " + err);
	rs= err;
    }
    return rs;
}


/**
 * Description 
 * @method toArrayBuffer
 * @param {} buffer
 * @return ab


function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}
 */

function dispatcher(name) {
    new_event(this, name);
}



/**
 * Permission class. 
 * @class perm
 */

GLOBAL.perm=function(pi){
    var p=this;
    if(pi!==undefined){
	['r','w','x'].forEach(function(m){
	    if(pi[m]!==undefined) p[m]=pi[m];
	});
    }
}

perm.prototype.toString=function(){
    var s=''; var p=this;
    ['r','w','x'].forEach(function(m){
	var ks=p[m];
	if(ks!==undefined){
	    s+= "[Mode " + m + " : ";
	    for(var t in ks){
		var kt=ks[t];
		s+=" for " + t + "[";
		for(var tid=0;tid<kt.length;tid++){
		    s+="id:"+ kt[tid]+",";
		}
		s+="], ";
	    }
	    s+="], ";
	}
    });
    return s;
}

perm.prototype.check=function(user, mode){

    var ks=this[mode];
    
    if(ks===undefined){
	console.log("No such mode " + mode + " default policy is Forbid.");
	return false;
    }
    console.log("PERM checking mode  " + mode + " perm = " + JSON.stringify(ks));
    if(user===undefined || user===null){
	return false;
    }
    
    //console.log( this + " checking user " + JSON.stringify(user));

    
    if(ks.u!==undefined){
	var uid=user.id();
	for(var i=0;i<ks.u.length;i++){
	    //console.log("Check obj user " + ks.u[i] + " with user " + uid);
	    if(ks.u[i]==uid) return true;
	}
    }

    if(ks.g!==undefined){
	var ugrp=user.els.groups.els;
	if(ugrp!==undefined) 
	    for(var g in ugrp){
		for(var i=0;i<ks.g.length;i++){
		    console.log("Check obj group [" + ks.g[i] + "] with user gr [" + g+"]");
		    if(ks.g[i]==g){
			//console.log("YYYYYYYYEEEESS");
			return true;
		    }else{
			//console.log("NOOOOOOOOO");
		    }
		}
	    }
    }
    return false;
}

perm.prototype.grant=function(gr){
    var p=this;
    ['r','w','x'].forEach(function(m){
	//console.log("checking ["+m+"] grant " + JSON.stringify(gr));
	if(gr[m]!==undefined){
	    var ks=p[m];
	    if(ks===undefined)
		ks=p[m]={}; // g : [], u : [] };
	    ['g','u'].forEach(function(t){
		var a=gr[m][t];
		if(a!==undefined){
		    if(ks[t]===undefined) ks[t]=[];
		    for(var tid=0;tid<a.length;tid++){
			//console.log("Granting mode " + m + " for " + t + " id: " + a[tid] );
			ks[t].push(a[tid]);
		    }
		}
		
	    });
	}
    });
}


/**
 * Main framework class. A single instance of this class is created at startup. 
 * @class _sadira
 */

var _sadira = function(){
  
    var sad=this;

    this.dialog_handlers = {};
    this.common_header_data={};

    //Configuring cluster (multi process spawn with port sharing) and inter-process communications

    sad.cluster = require('cluster');
    sad.cluster_messages=[]; //Array of active interprocess messages

    //sad.log("sadira process start");
    var argv = require('minimist')(process.argv.slice(2));
    //console.dir(argv);

    var system_ncpu=require('os').cpus().length;
    
    //Defaults options. Overwritten later by user-given command-line/config-file 
    sad.options={
	http_port: 9999, 
//	https_port: 8888, 
	raw_port: 7777,
	websocket : true,
	webrtc : true,
	dialogs : [],
	get_handlers : [],
	post_handlers : [],
	ncpu : system_ncpu, //using number of cpu present in system by default
	//    ncpu : 1; //Using a single thread by default.
	html_rootdir : process.cwd()+'/www', //This is the root directory for all the served files.
	file_server : true
    }; 

    //Reading the config file if given in --cf

    var option_string=null;
    
    if(typeof argv['cf'] != 'undefined' ) {
	try{
	    var cfpath=argv['cf'];
	    //sad.log("Parsing json config file ["+ cfpath+ "]");
	    option_string=fs.readFileSync(cfpath);
	}
	catch(e){
	    console.log( "Fatal error reading config file : " + e);
	    process.exit(1);
	}
	
    }else if(typeof argv['opts'] != 'undefined' ) { //Reading directly option string from command line --opts 
	option_string=argv['opts'];
    }
    
    if(option_string){ //Applying the JSON option_string if we found one
	try{
	    //sad.log("Parsing ["+option_string+"]");
	    var jcmdline =JSON.parse(option_string);
	    for(var p in jcmdline) 
		sad.options[p] = jcmdline[p]; //Overwriting with user given options.
	}
	catch(e){
	    sad.log("Fatal error : Config file JSON parsing error : " + e);
	    process.exit(1);
	}
    }

    if(sad.options.ncpu==0)sad.options.ncpu=system_ncpu;
    
    try{
	
	var tpl_mgr=this.tpl_mgr=require('./www/js/tpl_mgr');
	var base_templates=require('./www/js/base_templates');
	var system_templates=require('./js/tpl');

	function create_group_cache(cb){
	    sad.mongo.find( { type: 'group'}, function(err, groups){
		for(var i=0;i<groups.length;i++)
		    console.log("Group : " + JSON.stringify(groups[i]));
		
	    });
	}
	
	tpl_mgr.local_templates.prototype.object_builder=function(obj, cb){
	    //console.log("Object builder !");

	    if( obj.db===undefined) obj.db={};


	    obj.save=function(a,b){return sad.mongo.write_doc(this,a,b);};
	    //obj.dbcreate=function(a,b){return sad.mongo.write_doc(this,a,b);};
	    //obj.db={
	    //perm : new perm()
	    //};

	    obj.id=function(){
		return obj.db.id;
	    };
	    obj.perm=function(){
		return obj.db.p;
	    };

	    obj.grant=function(rules, cb){
		var nr=rules.length;
		function res_cb(e){
		    if(e) return cb(e);
		    nr--;
		    if(nr===0) cb(null);
		}
		
		rules.forEach(function(r){
		    r[0]==='u' ?
			obj.grant_user(r[1],r[2],res_cb) :
			obj.grant_group(r[1],r[2],res_cb);
		});
	    }
	    
	    obj.grant_user=function(uname, gr, cb){
		if(gr===undefined) gr='r';
		sad.mongo.find_user(uname, function(err, user){
		    if(err) return cb!==undefined? cb(err): console.log("grant error " + err);
		    if(obj.db.p===undefined) obj.db.p=new perm();
		    var g={}; g[gr]={u : [user._id] };
		    obj.db.p.grant(g);
		    if(cb!==undefined)cb(null);
		});
	    };

	    obj.grant_group=function(gname, gr, cb){
		
		if(gr===undefined) gr='r';
		sad.mongo.group_id(gname, function(err, group_id){
		    console.log("trying to grant group " + gname + " id " + group_id);
		    if(err)
			return cb!==undefined? cb(err): console.log("grant error " + err);
		    if(obj.db.p===undefined) obj.db.p=new perm();
		    var g={}; g[gr]={g : [group_id] };
		    obj.db.p.grant(g);
		    if(cb!==undefined)cb(null);
		});
		
	    };
	    
	    obj.collection=function(cname){
		if(cname!==undefined){
		    obj.db.collection=cname;
		}
		return obj.db.collection===undefined? obj.type : obj.db.collection; 
	    };

	    
	    if(obj.db.grants!==undefined){
		console.log("Applying grants "+JSON.stringify(obj.db.grants)+" to ["+obj.name+"] !! ");
		obj.grant(obj.db.grants, function(e){
		    if(e){
			sad.log("!!grant error " + e);
			return cb(e);
		    }
		    console.log("Apllyed grants ok to " + obj.name);
		    delete obj.db.grants;
		    cb(null);
		});
	    }else
		cb(null);
	    
	    

	    // obj.handle_request=function(req_name, req_cb){
	    // 	if(obj.apis===undefined) obj.apis={};
	    // 	obj.apis[req_name]=req_cb;
	    // };
	    
	    
	    //obj.db.perm.grant();
	}

	
	//tpl_mgr.template_object.prototype.check_permission=function(perm, cb){}

	
	tpl_mgr.template_object.prototype.handle_request=function(opts, cb){
	    if(this.apis===undefined) this.apis={};
	    this.apis[opts.name]={ opts : opts, f: cb };
	};
	
	
	var tmaster=this.tmaster= new tpl_mgr.local_templates(this);
	GLOBAL.create_object=function(){ return tmaster.create_object.apply(tmaster,arguments); }
	GLOBAL.create_object_from_data=function(){ return tmaster.create_object_from_data.apply(tmaster,arguments); }
	
	tmaster.add_templates(base_templates);
	tmaster.add_templates(system_templates);
	
	
	tmaster.templates.user_group.object_builder =function(group){
	    group.listen('server_data',function(data){
	    });

	    group.handle_request({ name : 'add_user', perm : new perm( { x : { g : "admin" }} ) }, function( rq_data, rq_cb){
		var gp=g.db.perm();
		var gu=u.db.perm();
		
	    });
	};

	//Loading handlers.
	
	function started(start_error){

	    if(start_error) throw "Error starting : " + start_error;
	    
	    //start_func(function(e){
	    sad.initialize_plugins(function(error){
		
		if(error){
		    throw error;
		}
		
		if(sad.cluster.isMaster) return;

		if(è(argv['bootstrap'])) {
		    sad.bootstrap=true;
		    if(sad.cluster.worker.id==1){
			var bs=require("./js/bootstrap.js");
			bs.init({},sad);
		    }else{
			sad.log("Not worker 1 not bootstrap !!");
		    }
		    
		}
		
		sad.load_apis();
		sad.load_routes();
    

		//create_group_cache();
		
		
	    });
	}
	

	sad.cluster.isMaster ? this.start_master(started) : this.start_worker(started);
	
	//	});
	
    }
    catch (e){
	sad.log("Fatal error while initializing sadira : " +dump_error(e));
	process.exit(1);
    }
    
} 



_sadira.prototype.log = function (m){
    var sad=this;
    console.log((sad.cluster.isMaster ? "Master : " :  ("Worker " +  this.cluster.worker.id + " : ")) + m);
    
}

/* Registers a new dialog handler */

_sadira.prototype.dialog = function (path, api_cb){
    var api_root=this.dialog_handlers;
    var path_parts = path.split(".");
    for(var p=0;p<path_parts.length;p++){
	//console.log("Handling dialog path : " + path + " looking " + path_parts[p]);
	var api_child = api_root[path_parts[p]];
	if(ù(api_child)){
	    api_child=api_root[path_parts[p]]={};
	}
	api_root=api_child;
    }
    api_root.__api=api_cb;
}

var ip_service=function(service_name, sad){
    this.peers = {};
    this.service=service_name;
    
    new_event(this,"message");
    new_event(this,"connect");
    new_event(this,"disconnect");

    this.client_connect=function(data){
	//var client_socket = new ip_socket(this.service, sad);
	var p=this.peers[data.wid+"_"+data.id];

	if(è(p)) {sad.log("Client already registered ! " + data.id ); return};
	
	p=this.peers[data.wid+"_"+data.id]={ wid: data.wid, id: data.id };

	new_event(p,"message");

	p.send=function(data){
	    sad.cluster.workers[this.wid].send({ id : this.id, cmd : "route", data : data  });
	}
	
	console.log("Service ["+this.service+"] : client connected " + JSON.stringify(p));
	this.trigger("connect", p);
    };

    this.client_disconnect=function(data){
	var hash=data.wid+"_"+data.id;
	var p=this.peers[hash];
	
	if(ù(p)) {sad.log("Cannot de-register ! : no such client " + data.id ); return};
	//var client_socket = new ip_socket(this.service, sad);

	this.trigger("disconnect", p);
	delete this.peers[hash];
	
    };

    this.receive=function(m){
	var hash=m.wid+"_"+m.id;
	var p=this.peers[hash];
	if(ù(p)) {sad.log("Cannot receive message ! : no such client " + data.id ); return};
	p.trigger("message",m.data);
    };
    
    this.route=function(m){
	var hash=m.wid+"_"+m.id;
	var p=this.peers[hash];
	if(ù(p)) {sad.log("Cannot route message ! : no such client " + data.id ); return};
	p.send(m.data);
    };
}

var ip_socket=function(service_name, sad){
    
    this.service = service_name;
    this.id=Math.random().toString(36).substring(2);

    //this.name="SOCKET_"+this.id;
    
    new_event(this,"message");
    new_event(this,"connected");
    new_event(this,"disconnected");
    
    // if(sad.cluster.isMaster){
    // 	this.send=function(command, data, result_cb){
    // 	    sad.cluster.workers[this.wid].send({ id : this.id, cmd : command, data : data  });	    	
    // 	};
    // }else{
    this.wid = sad.cluster.worker.id;
    this.send=function(command, data, result_cb){
	process.send({ service: service_name, id : this.id, wid: this.wid, cmd : command, data : data  });	    	
    };
    
};

_sadira.prototype.connect_interprocess_service = function (service_name, result_cb){

    console.log("Connecting to IPS service [" + service_name +"]");
    if(ù(this.ipss)) this.ipss={};

    var ips=new ip_socket(service_name, this);
    this.ipss[ips.id]=ips;

    result_cb(null,ips);
    ips.send("register", {}, function(error){});
    
}

_sadira.prototype.register_interprocess_service = function (service_name, result_cb){
    
    if(ù(this.ipss)) this.ipss={};

    if(è(this.ipss[service_name]))
	return result_cb("Service ["+service_name+"] already set up!");
    
    var ips=new ip_service(service_name, this);
    this.ipss[service_name]=ips;
    result_cb(null,ips);
}


_sadira.prototype.start_session_handling = function (){

    var options = {};

    if(è(this.options.redis)){
	for( var o in this.options.redis) options[o]=this.options.redis[o];
    }

    this.log("Redis session : connect : options " + JSON.stringify(options));

    var session=require('express-session');
    var redis_session_store = require("connect-redis")(session, { host: "localhost"});
    
    this.app.use(session({
	key : "sadira.sid",
	secret: 'vivalabirravivalabirravivalabirra',
	store : new redis_session_store(options),
	saveUninitialized: true,
	resave: true
    }));
    
    
}

/* Start master process */

_sadira.prototype.start_master = function (cb){

    //Starting cluster
    var sad=this;

    sad.nworkers=0;
    
    var f=0;
    
    if(sad.options.http_port) f+=1;
    if(sad.options.https_port) f+=1;
    
    // Forking workers.
    
    var ncpu=sad.options.ncpu;
    
    sad.log("Spawning worker processes on " + ncpu + " core(s) (f "+f+")...");
    
    for (var i = 0; i < ncpu; i++) {

	//var args = [ /* ... */ ];
	//var options = { stdio: ['pipe','pipe','pipe','pipe','pipe'] };  // first three are stdin/out/err
	//

	//var cproc = require('child_process').spawn(cmd, args, options);
	var worker=sad.cluster.fork();//options);

	
	sad.cluster.on('online', function(worker) {
	    //sad.log("Yay, the worker "+worker.id +" responded after it was forked");

	    // for(var p in worker.process){
	    // 	console.log("wp " + p + " T " + typeof worker.process[p]);
	    // }

	    // for(var i=0;i<worker.process.stdio.length;i++){
	    // 	console.log("STDIO["+i+"] is " + worker.process.stdio[i]);
	    // }
	    
	    // var pipe = worker.process.stdin;
	    // pipe.write(Buffer('hello this is master printing on you!'));
	    
	});
	
	worker.on('message', function(m){ //Handling incoming messages from workers
	    
	    if(ù(sad.ipss)) { sad.log("Unhandled message, no IPS!"); return; }

	    var cmd = m.cmd;
	    if(ù(cmd)) { sad.log("No message command!"); return; }
	    var id = m.id;
	    if(ù(id)) { sad.log("No message id!"); return;}
	    var service = m.service;
	    if(ù(service)) { sad.log("No service name given!"); return; }
	    
	    var ips=sad.ipss[service];
	    if(ù(ips)) { sad.log("No such service ["+service+"]!"); return; }
	    
	    //var data=m.data;
	    //if(ù(data)) { sad.log("No message data!"); return; }

	    sad.log("IPS["+ips.service+"] : Received worker message! " + JSON.stringify(m)); 
	    
	    switch(cmd){
	    case "register":
		console.log("Registering new client to service ["+service+"]");
		ips.client_connect(m);
		break;
	    case "deregister":
		console.log("De-registering client from service ["+service+"]");
		ips.client_disconnect(m);
		break;
	    case "route":
		console.log("Routing REC worker message to IPS ["+service+"]");
		ips.receive(m);
		break;
	    default:
		sad.log("Unknown message command ["+cmd+"]"); return; 
		break;
	    };
	    
	});
	
    }
    
    sad.cluster.on('exit', function(worker, code, signal) {
	sad.log('worker ' + worker.id + ' pid ' + worker.process.pid + ' died.');
	sad.nworkers--;
	sad.log("Triggering collective suicide");
	process.exit(1);
    });
    
    sad.cluster.on('listening', function(worker, address) {
	
	//sad.log("A worker is now connected to " + address.address + ":" + address.port);
	
	worker.online=true;
	sad.nworkers++;
	
	if(sad.nworkers == f*sad.options.ncpu){
	    
	    if(sad.use_https==true)
		sad.log("Sadira(SSL): "+ sad.options.ncpu +" thread(s) listenning @ https://"+address.address+":" + sad.https_tcp_port );
	    
	    if(sad.use_http==true)
		sad.log("Sadira(CLR): "+ sad.options.ncpu +" thread(s) listenning @ http://"+address.address+":" + sad.http_tcp_port );
	    
	    sad.log("Let's rock and roll! (CTRL + C to shutdown)");
	    cb(null);
	}
	
    });
}


_sadira.prototype.load_routes = function (){
    var sad=this;
    //app.use(exsession({ secret: 'keyboard cat' }));
    sad.app.all('/dlg/:tpl/:req', function(req, res) {
	var t=sad.tmaster.templates[req.params.tpl];
	if(t===undefined)
	    return res.json({ error : "Unknown template " + req.params.tpl });
	if(t.apis === undefined)
	    return res.json({ error : "Template " + req.params.tpl + " has no api defined."});
	
	var api=t.apis[req.params.req];
	if(api === undefined)
	    return res.json({ error : "Template " + req.params.tpl + " has no api named " + req.params.req});

	return api(req,res);
    });
    
    sad.app.get('/widget/:tpl_name*', function(req, res) {
	var p=get_parameters(req);
	var header=(p.header!==undefined)? p.header:false;
	var ejs_data={ tpl_name : req.params.tpl_name, header : header};
	console.log("render widget : " + req.params.tpl_name  );
	//sad.set_user_data(req,ejs_data);
	res.render('widget.ejs', ejs_data ); // load the index.ejs file
    });

    console.log("Handling main route....");
    
    sad.app.get('/',  function(req, res, next) {
	
	res.redirect('/widget/sadira_home');
	
	//var index_info={};
	//sad.set_user_data(req, index_info);
	//sad.log("rendering index " + JSON.stringify(index_info));
	//res.render('index.ejs', index_info); // load the index.ejs file
    });

    /*
    sad.app.get('/testperm', function(req, res) {
	
	res.json(req.user);
    });
  
      sad.app.all('*', function(request, res){
      for(var h in cors_headers) res.setHeader(h,cors_headers[h]);
      });
  

    sad.app.get('/tt',  function(req, res, next) {
	sad.passport.authenticate('session', function(err,user,info) {
	})(req,res,next);
	console.log("TT user is " + req.user);
    });

    */
    
    sad.app.all('*', function(request, res){
	
	//The request was not handled by custom url handlers.
	//If enabled, proxying the query to another web service
	
	try{
	    //sad.log("proxy request https? " + request.connection.encrypted );
	    if(request.connection.encrypted){ //https connexion
		if(sad.options.https_proxy){
		    //console.log("Proxy https " + request.url);
		    sad.https_proxy.web(request, res);
		    return;
		}else {
		    return res.render('error.ejs', " Local file service unhandled : " + request.url);
		    //return res.status('Not found', 404);
		}
	    }else{
		if(sad.options.http_proxy){
		    //console.log("Proxy http " + request.url);
		    sad.http_proxy.web(request, res);
		    return;
		    
		}else return res.render('error.ejs', " Local file service unhandled : " + request.url);
	    }
	}
	
	catch (e){
	    sad.log('Proxy error : ' + dump_error(e));
	    return res.render('error.ejs', " 500 : Proxy error for URL : " + request.url + " e : " + dump_error(e));
	    //return res.status('Sadira: Proxy error : ' + e, 500);
	}
    });


}


_sadira.prototype.load_mongodb = function (cb){
    var sad=this;
    console.log("Initializing mongodb...");
    if(sad.options.mongo===undefined){
	throw "Cannot start mongodb : You need to provide a mongo section in the sadira configuration file !"
    }
    sad.mongo=new mongo_pack.server(sad.options.mongo,sad);
    
    sad.mongo.connect(function(error){
	if(error)
	    return cb(error);
	sad.log("MongoDB connected !");

 	// if(sad.cluster.worker.id===1){
	//     var cm=create_object("colormap");
	//     cm.register_collection();
	// }

	cb(null);
    });
}


_sadira.prototype.load_apis = function (cb){
    var sad=this;
    sad.apis={};

    console.log("Loading apis...");

    /*
    sad.mongo.db.collection('colormap').find({},{},function(err, cursor){
	if(err)
	    return console.log("colormap erro = " + err);
	cursor.count(function(err, n){
	    console.log("N colormaps = " + n);
	    cursor.each(function(err, cm){
		//console.log(JSON.stringify(cm));
	    });
	});
    });
    
    sad.mongo.find({ user : sad.mongo.admin, collection : "colormap"}, function(err, api_data){
	sad.log("Loading " + api_data.length + " CMS ");
    });
    */
    sad.mongo.find({ user : sad.mongo.admin, collection : "Apis"}, function(err, api_data){

	if(err){
	    if (cb === undefined) return console.log("Unhandled error " + err);
	    else
		return cb(err);
	}

	sad.log("Loading " + api_data.length + " APIS ");
	for(var i=0;i<api_data.length;i++){
	    var aprov=create_object_from_data(api_data[i]);
	    console.log("Loading api provider : [" + aprov.name + "]");
	    if(sad.apis[aprov.name]!==undefined){
		
	    }
	    sad.apis[aprov.name]=aprov;
	    //aprov.register_route(sad);
	}


	
    });

    sad.app.all('/api/:provider/:api', function(req, res, next) {
	var provider=sad.apis[req.params.provider];
	if(provider===undefined) return res.json({error : "unknown api provider " + req.params.provider});
	var api=provider.get(req.params.api);
	if(api===undefined) return res.json({error : "provider ["+req.params.provider+"] unknown api " + req.params.api});
	return api.api_handler(req,res,next);
    });


    sad.app.get('/api/reset', function(req, res, next) {
	if(req.user===undefined) return res.json({error : "No user connected"});
	console.log("API reset : User is " + JSON.stringify(req.user._id, null, 4));
	
	sad.in_group(req.user, 'admin', function(error, allowed){
	    if(error)
	    {
		console.log("Error checking perm : " + error);
		return res.json({error : "Error checking perm : " + error});
	    }
	    console.log("checking perm e=" + error + " allowed = " + allowed);
	    if(allowed!==true)
		return res.json({error : "No admin priviledges"});
	    else
		sad.reset_apis(function(error){
		    if(error)
			return res.json({error : "Reset apis error : " + error});
		    else
			return res.json({info : "OK"});
		});
	});
    });
}

_sadira.prototype.check_group_perm=function(user, mode, name, cb){
    this.mongo.group_id(name, function(err, gid){
	
	if(err!==null)
	    return cb(err);
	
	var p=new perm( { mode : { g : gid }} );

	if(p.check(user,mode)){
	    console.log("Check OK for group "+gid +"  ");
	    cb(null,true);
	}else cb(null,false);
	
    });
}

_sadira.prototype.in_group=function(user, name, cb){
    this.mongo.group_id(name, function(err, gid){
	
	if(err!==null)
	    return cb(err);
	
	for (var g in user.els.groups.els){
	    console.log("Check group id " + g + " id = " + gid);
	    if(g==gid) return cb(null,true);
	}

	cb(null,false);
	
    });
}

_sadira.prototype.reset_apis=function(cb){
    var app=this;
    var apis=[
	{
	    name : "db",
	    perm : [['g','users','x'],['g','everybody','r']]
	},
	{
	    name : "session",
	    perm : [['g','users','x'],['g','everybody','r']]
	}
    ];

    var napis=apis.length;
    app.mongo.db.collection("Apis").drop();

    apis.forEach(function(api){
	var c=create_object(api.name);
	c.collection("Apis");
	c.grant(api.perm, function(e){
	    if(e)return cb(e);
	    app.mongo.write_doc(c, function(err, doc){
		if(err)return cb(err);
		console.log("Ok, db api recorded : " + JSON.stringify(doc));
		napis--;
		if(napis==0)
		    cb(null, 'Apis registered !');
	    });
	});
    });
	
}



/* Start worker process */

_sadira.prototype.start_worker = function (cb){
    
    var sad=this;

    var app=sad.app=express();

    app.disable('x-powered-by');
    
    sad.load_mongodb(function(error){
	if(error) return cb(error);
	
	//console.log("Mongodb STARTED !");
	sad.apis={};
	//app.use(logger());
	app.sadira=sad;
	//app.set('view engine', 'ejs'); // set up ejs for templating
	// required for passport
	
	app.set('view engine', 'ejs');
	app.set("views", "ejs/");


	sad.throw_client_error=function(m, res){
	    res.render('error.ejs', m ); 
	};

	
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended : true}));
	app.use(bodyParser.json());
	
	app.use(methodov());
	
	sad.start_session_handling();
	
	var passport = require('passport');
	
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	
	sad.passport=passport;
	
        sad.app.use(function(req, res, next) {
	    req.sad=sad;
	    res.header("x-powered-by", "Sadira");
	    //console.log("Cookies : " + JSON.stringify(req.cookies));
	    //console.log("Session : " + JSON.stringify(req.session) + " ID : " + req.cookies['sadira.sid']);
	    
	    //console.log("PPort : " + JSON.stringify(req._passport));
	    //console.log("User auth ?? : " + req.isAuthenticated());
	    //if(req.user!==undefined){
	    //	console.log("We have a user " + JSON.stringify(req.user));
		
	    //}else{
	    //	console.log("noooooo nobody");
	    //  }
	    next();
	});	
	
	
	process.on('message', function(m){ //Handling incoming messages from master process.
	    
	    var cmd = m.cmd;
	    if(ù(cmd)) { sad.log("No message command!"); return; }
	    var id = m.id;
	    if(ù(id)) { sad.log("No message id!"); return; }
	    
	    //var service = m.service;
	    //if(ù(service)) { sad.log("No service name given!"); return; }
	    var ips=sad.ipss[id];
	    if(ù(ips)) { sad.log("No such client socket id ["+id+"]!"); return; }
	    
	    
	    var data=m.data;
	
	    switch(cmd){
	    case "register":
		//if(ù(data)) { sad.log("No message data!"); return; }
		console.log("Client attached to IPS service ["+ips.service+"]");
		ips.trigger("connected", data);
		break;
	    case "deregister":
		ips.trigger("disconnected", data);
		delete sad.ipss[id];
		break;
	    case "route":
		ips.trigger("message", data);
		break;
	    default:
		sad.log("Unknown message command ["+cmd+"]"); return; 
		break;
	    };
	    
	    // sad.log('Worker ' + sad.cluster.worker.id + ' received a new message ! : ' + JSON.stringify(m));
	});
	//sad.log("Worker "+ sad.cluster.worker.id + " created" );
	
	sad.create_http_server(function(error, ok){
	    if(error!=null){
		sad.log("Fatal : HTTP create " + error  );
		process.exit(1);
	    }
	    //if(error!=null) 
	    //   throw error; 
	    
	    sad.create_websocket_server();
	    sad.create_webrtc_server();		
	    
	    cb(null);
	    
	});
	
	
    });
    
}

//Creates the http servers 

_sadira.prototype.create_http_server = function(cb){
    
    var sad=this;

    function handle_proxy_error(e,req,res){
	var ctype= req.connection.encrypted ? "HTTPS" : "HTTP";
	sad.log(ctype+' proxy error : ' + dump_error(e) );
	res.writeHead(500, {"Content-Type": "text/plain"});
	res.end("Sadira " + ctype + " proxy error : " + e + "\n");
    }

    if(è(sad.options.http_port)){ 
	
	var http_port = parseInt(sad.options.http_port, 10);
	
	
	
	if(sad.options.http_proxy){
	    var http_proxy = require('http-proxy');
	    var proxy_config={
		target :  ù(sad.options.http_proxy_url) ? "http://localhost:8000" : "http://" + sad.options.http_proxy_url 
	    };
	    sad.log("starting HTTP server on port " + http_port + " -> proxy to " + proxy_config.target);
	    sad.http_proxy=http_proxy.createServer(proxy_config);
	    sad.http_proxy.on('error', handle_proxy_error);
	}else 
	    sad.log("starting HTTP server on port " + http_port + " NO proxy.");
	
	try{
	    var http = require('http');
	    
	    //sad.http_server = http.createServer(sad.handle_request);
	    sad.http_server = http.createServer(sad.app);
	    sad.http_server.sadira=sad;

	    sad.http_server.on("error", function (e) {
		sad.log("HTTP server error " + JSON.stringify(e));
		cb(e);
	    });
	    
	    sad.http_server.on("listening", function () {
		sad.log("HTTP server listening on " + http_port);
		if(!sad.options.https_port)  return cb(null,"OK");
	    });

	    sad.http_server.on("connection", function (sock) {
	    });

	    sad.http_server.on("close", function (sock) {
		cb("http socket closed");
	    });
	    //console.log("http listen on " + http_port);
	    sad.http_server.listen(http_port);

	}
	catch (e){
	    sad.log("Fatal error on starting http : " + e);
	    return cb(e);
	}
    }
    
    if(sad.options.https_port){


	var https_port = parseInt(sad.options.https_port, 10);

	
	
	if(!è(sad.options.ssl)) throw ("No SSL config found !");
	if(!è(sad.options.ssl.key_file)) throw ("No SSL key file given !");
	if(!è(sad.options.ssl.cert_file)) throw ("No SSL certificate file given !");
	
	var ssl_data = {
	    key: fs.readFileSync(sad.options.ssl.key_file),
	    cert: fs.readFileSync(sad.options.ssl.cert_file)
	};


	if(è(sad.options.ssl.ca_file)) ssl_data.ca=fs.readFileSync(sad.options.ssl.ca_file);

	//sad.log("PROXY SSL config : " + JSON.stringify(ssl_data));

	if(sad.options.https_proxy){

	    var http_proxy = require('http-proxy');

	    var proxy_config={
		target :  ù(sad.options.https_proxy_url) ? "https://localhost:4430" : "https://" + sad.options.https_proxy_url,
		https : true,
		ssl : ssl_data,
		secure : false
	    };

	    sad.log("setting up HTTPS server on port " + https_port + " -> proxy to " + proxy_config.target);	
	    sad.https_proxy=http_proxy.createServer(proxy_config);
	    sad.https_proxy.on('error', handle_proxy_error);
	}else
	    sad.log("setting up HTTPS server on port " + https_port + " NO proxy");
	
        //Certificates for the https server

	try{

	    var https = require('https');
	    
	    sad.ssl_data = ssl_data;
	    
	    var https_options = ssl_data;
	    
	    //https_options.secureProtocol="SSLv3_method";
	    https_options.rejectUnauthorized=false;

	    //sad.https_server = https.createServer(https_options, sad.handle_request);
	    sad.https_server = https.createServer(https_options, sad.app);
	    sad.https_server.sadira=sad;

	    sad.https_server.on("listening", function () {
		sad.log("HTTPS server listening on " + https_port);
		return cb(null,"OK");
	    });

	    sad.https_server.on("error", function (e) {
		sad.log("HTTPS server error " + JSON.stringify(e));
		cb(e);
	    });
	    
	    sad.https_server.on("connection", function (sock) {
	    });

	    sad.https_server.on("close", function (sock) {
		cb("HTTPS: socket closed");
	    });

	    sad.https_server.listen(https_port);
	    

	}
	catch (e){
	    sad.log("Couldn't start https server : " + e);
	    return cb(e);
	}
    }

    
    //cb("No way to open a network connection !");
}

/**
 * Creation of the WebRTC server.
 */

_sadira.prototype.create_webrtc_server=function() {
    
    var sad=this;
    
    if(!sad.options.webrtc) return;
    
    sad.log("Create webRTC server... on " + sad.options.http_port);
    
    if(!sad.options.webrtc_port) sad.options.webrtc_port=7777 ;    
    
    var io = require('socket.io').listen(sad.options.webrtc_port);
    
    
    io.sockets.on('connection', function (cnx) {
	//socket.emit('news', { hello: 'world' });
	
	cnx.dialogs=new DLG.dialog_manager(cnx); //Each connexion has its own dialog manager, handling all dialogs on this websocket connexion.
	
	cnx.on('message', function (data) {
      
	    try{
		
		//sad.log("Incoming message, creating datagram");
		
		var dgram=new DGM.datagram();
		
		if (message.type === 'utf8') { //Ascii
		    dgram.set_header(JSON.parse(message.utf8Data));
		}
		else if (message.type === 'binary') { //Binary
		    //sad.log('received bin message size=' + message.binaryData.length + ' bytes.');
		    dgram.deserialize(message.binaryData);
		    
		}else{
		    throw "Unhandled socket message type " + message.type;
		}
		//sad.log("process datagram " + JSON.stringify(dgram.header));
		
		cnx.dialogs.process_datagram(dgram);
		//sad.log("process datagram done");
	    }
	    
	    catch (e){
		sad.log("Datagram read error : "+ dump_error(e));
		return;
	    }
	    
	    //var msg_content=m.header.data;
	    //sad.log("MESG:" + JSON.stringify(msg_content));
	    
	    
	});
	
	// socket disconnected
	
	cnx.on('close', function(closeReason, description) {
	    console.log("websocket closed : "+closeReason+" ("+description+") ");
	    cnx=null;
	    return;
	});
	
    });
}  


/**
 * Creation of the WebSocket server.
 */


_sadira.prototype.handle_websocket_requests=function(ws_server){
        // This callback function is called every time someone
    // tries to connect to the WebSocket server
    var sad=this;

    ws_server.on('request', function(request) {
	
	console.log("websocket: Connexion request from " + request.origin);

	//Configuration of the new incoming connexion:
	var cnx = request.accept(null, request.origin); 
	cnx.dialogs=new DLG.dialog_manager(cnx, sad); //Each connexion has its own dialog manager, handling all dialogs on this websocket connexion.
	cnx.request=request;
	new_event(cnx, "closed");
	
	cnx.on('message', function(message) {// Incoming message from web client
	    try{
		//console.log("Incoming message, creating datagram");
		
		var dgram=new DGM.datagram();
		
		if (message.type === 'utf8') { //Ascii
		    dgram.set_header(JSON.parse(message.utf8Data));
		}
		else if (message.type === 'binary') { //Binary
		    //console.log('received bin message size=' + message.binaryData.length + ' bytes.');
		    dgram.deserialize(message.binaryData);
		    
		}else{
		    throw "Unhandled socket message type " + message.type;
		}
		//console.log("process datagram " + JSON.stringify(dgram.header));

		cnx.dialogs.process_datagram(dgram);
		//console.log("process datagram done");
	    }
	    
	    catch (e){
		console.log("Datagram read error : "+ dump_error(e));
		return;
	    }
	    //var msg_content=m.header.data;
	    //console.log("MESG:" + JSON.stringify(msg_content));
	});
	
	// socket disconnected
	
	cnx.on('close', function(closeReason, description) {
	    cnx.trigger("closed", closeReason);
	    console.log("websocket closed : "+closeReason+" ("+description+") ");
	    cnx=null;
	    return;
	});
	
    });

}

_sadira.prototype.create_websocket_server=function() {
    
    var sad=this;
    if(!sad.options.websocket) return;

    var webSocketServer = require('websocket').server;
    
    if(sad.http_server){
	//console.log("Create websocket http server");
	this.ws_server= new webSocketServer({
	    // WebSocket server is tied to a HTTP server. WebSocket request is just
	    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
	    httpServer: sad.http_server
	});
	//console.log("Create websocket http server OK");
	sad.handle_websocket_requests(this.ws_server);
    }
    
    if(sad.https_server){
	//console.log("Create websocket https server");
	this.wss_server= new webSocketServer({
    	    httpServer: sad.https_server
	});
	sad.handle_websocket_requests(this.wss_server);
    }

}

function clone(obj) {
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = clone(obj[key]);
        }
    }
    return temp;
}


_sadira.prototype.initialize_plugins=function(cb){

    var sad=this;
    //var cwd=process.cwd();
    var plugs=sad.options.plugins;
    
    if(plugs===undefined) {
	return;
    }
    
    var pload_func=function(pn) {
	return function(cb){
	    var p=plugs[pn];
	    if( p.file === undefined) return cb("No javascript file defined in plugin " + pn);
	    //sad.log("Init "+packname+" : ["+pkg_file+"]");
	    //var wpack=require(cwd+"/"+pkg_file);
	    var pack=require(p.file);
	    var initf = sad.cluster.isMaster ? pack.init_master : pack.init;
	    
	    sad.log("Loading plugin [" + pn + "] : " + p.file);
	    if(initf!==undefined)
		initf(p,sad,cb);
	    else{
		//console.log("No pkg init function for plugin ["+pn+"]!");
		cb(null);
	    }
	}
    }
    
    var ploads=[];

    for(var pn in plugs){
	//f.pname=pn;
	if(plugs[pn].enabled!==false)
	    ploads.push(pload_func(pn));
	//sad.log("Init "+packname+" : ["+pkg_file+"] DONE");
    }
    
    async.series(ploads, function(err, res){
	
	if(err){
	    
	    return cb("Fatal error while loading plugins : " + err);
	}
	console.log("Plugins loaded !!!");
	cb(null);
    });
	
    
}


//Main sadira instance. Should be in another file...

try{
    GLOBAL.sadira = new _sadira();
}

catch (e){
    console.log('FATAL error at startup, cannot start sadira : ' + dump_error(e) );
    process.exit(1);
}
