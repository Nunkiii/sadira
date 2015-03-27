#!/usr/bin/env node

// Sadira astro-web framework - Written by Pierre Sprimont <nunki@unseen.is> (2013-2014) @ INAF/IASF/CNR/... Bologna, Italy.

var fs = require("fs");
var path = require("path");
var url = require("url");
var bson = require("./www/js/community/bson");
var DLG = require("./www/js/dialog");
var DGM = require("./www/js/datagram");
var utils = require("./www/js/utils");
var BSON=bson().BSON;
var express=require("express");

// var passport = require('passport');
// var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');


var tpl=require('./js/tpl');


/*
  Headers to add when allowing cross-origin requests.
*/

var cors_headers = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Credentials' : true,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

/*
  Write data sliced in chunks of 1kb. 
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

function perm(){
    this.r = { g : [], u : [] };
    this.w = { g : [], u : [] };
}

perm.prototype.grant=function(gr){
    for(var m in Object.keys(this)){
	if(gr[m]!==undefined){
	    var ks=this[m];
	    for(var t in Object.keys(ks)){
		var a=gr[m][t];
		if(a!==undefined){
		    for(var tid=0;tid<a.length;tid++){
			console.log("Granting mode " + m + " for " + t + " id: " + a[tid] );
			ks[t].push(a[tid]);
		    }
		}
		
	    }
	}
    }
}

/**
 * API class. 
 * @class api
 */


function api(){
    
    var opts = this.opts={
	http : {
	    type : 'get'
	},
	ws : {
	    
	}
    };
    
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
	    sad.log("Fatal error : Config file JSON parsing error : " + dump_error(e));
	    process.exit(1);
	}
    }

    if(sad.options.ncpu==0)sad.options.ncpu=system_ncpu;
    
    try{
	
	var tpl_mgr=this.tpl_mgr=require('./www/js/tpl_mgr');
	var base_templates=require('./www/js/base_templates');
	var system_templates=require('./js/tpl');

	tpl_mgr.local_templates.prototype.object_builder=function(obj){
	    console.log("Object builder !");

	    obj.serialize=function(a,b){
		if(b===undefined)
		    sad.mongo.update_doc(this,a);
		else
		    sad.mongo.update_doc(this,a,b);
	    };
	    obj.dbcreate=function(a,b){
		if(is_function(a))
		    sad.mongo.write_doc(obj, a);
		else{
		    if(!is_function(b)) throw ("Excpecting cb after options in obj.create, or cb as only arg !");
		    sad.mongo.write_doc(obj, b,a);
		}
	    };
	    obj.db={ perm : new perm()};
	    
	    //obj.db.perm.grant();
	    
	}

	
	var tmaster=this.tmaster= new tpl_mgr.local_templates();
	GLOBAL.create_object=tmaster.create_object;
	
	tmaster.add_templates(base_templates);
	tmaster.add_templates(system_templates);

	this.cluster.isMaster ?  this.start_master() : this.start_worker();

	//Loading handlers.

	sad.initialize_handlers("handlers");
	sad.initialize_handlers("dialogs");

	if(!this.cluster.isMaster && è(argv['bootstrap'])) {
	    if(this.cluster.worker.id==1){
		var bs=require("./js/bootstrap.js");
		bs.init({},this);
	    }else{
		this.log("Not worker 1 not bootstrap !!");
	    }
	}
	
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
    var redis_session_store = require("connect-redis")(session);
    
    this.app.use(session({
	secret: 'vivalabirravivalabirravivalabirra',
	store : new redis_session_store(options)
    }));
    
}

/* Start master process */

_sadira.prototype.start_master = function (){

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
	    
	}
	
    });
}

/* Start worker process */

_sadira.prototype.start_worker = function (){
    
    var sad=this;
    
//    sad.log("Worker " + this.cluster.worker.id + " starting ...");

    var app=this.app=express();
    app.sadira=this;

//    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies
    app.use(bodyParser()); // get information from html forms

    app.set('view engine', 'ejs');
    app.set("views", "ejs/");
    
    sad.start_session_handling();
    
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


_sadira.prototype.initialize_handlers=function(packname){

    var sad=this;
    //var cwd=process.cwd();
    var pkg=sad.options[packname];
    if(!pkg) return;

    for(w=0;w<pkg.length;w++){
	var pkg_file = pkg[w].file;
	//sad.log("Init "+packname+" : ["+pkg_file+"]");
	//var wpack=require(cwd+"/"+pkg_file);
	var wpack=require(pkg_file);

	var initf = sad.cluster.isMaster ? wpack.init_master : wpack.init;
	//console.log("Initf is [" + initf + "]");
	if(initf!==undefined)
	    initf(pkg[w],sad);
	else{
	    //sad.log("No pkg init function!");
	}
	//sad.log("Init "+packname+" : ["+pkg_file+"] DONE");
    }

    if(sad.cluster.isMaster) return;
    

    sad.set_user_data=function(req, data){
	for(var p in sad.common_header_data)
	    data[p]=sad.common_header_data[p];
	
	data.user_id="";
	
	if (req.user) {
	    if(req.user.local.email){
		data.user_id=req.user.local.email;
	    }
	    else{
		if(req.user.facebook.name){
		    data.user_id=req.user.facebook.name;
		}
		else{
		    if(req.user.google.name)
			data.user_id=req.user.google.name;
		}
	    }
	    
	    //return next("No user");//res.redirect('/signin')
	}

	//console.log("Set user data to " + JSON.stringify(data));
    }
    
    sad.app.get('/', function(req, res, next) {
	
	var index_info={};
	sad.set_user_data(req, index_info);
	//sad.log("rendering index " + JSON.stringify(index_info));
	res.render('index.ejs', index_info); // load the index.ejs file
    });
    
    sad.app.get('/widget/:tpl_name', function(req, res) {
	var ejs_data={ tpl_name : req.params.tpl_name};
	sad.set_user_data(req,ejs_data);
	res.render('widget.ejs', ejs_data ); // load the index.ejs file
    });


    /*
    sad.app.all('*', function(request, res){
	for(var h in cors_headers) res.setHeader(h,cors_headers[h]);
    });
*/
    
    sad.app.get('*', function(request, res){
	
	//The request was not handled by custom url handlers.
	//If enabled, proxying the query to another web service
	
	try{
	    //sad.log("proxy request https? " + request.connection.encrypted );
	    
	    if(request.connection.encrypted){ //https connexion
		if(sad.options.https_proxy){
		    //console.log("Proxy https " + request.url);
		    sad.https_proxy.web(request, res);
		    return;
		}else return res.status('Not found', 404);
	    }else{
		if(sad.options.http_proxy){
		    //console.log("Proxy http " + request.url);
		    sad.http_proxy.web(request, res);
		    return;
		}else return res.status('Not found', 404);
	    }
	}

	catch (e){
	    sad.log('Proxy error : ' + dump_error(e));
	    return res.status('Sadira: Proxy error : ' + e, 500);
	}
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
