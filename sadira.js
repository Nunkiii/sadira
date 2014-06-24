#!/usr/bin/env node

// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.
// Do what you want with this file.

var fs = require("fs");
var http = require('http');
var bson = require("./www/js/community/bson");
var DLG = require("./www/js/dialog");
var DGM = require("./www/js/datagram");
var url = require("url");
var path = require("path");
var BSON=bson().BSON;

// var session=require('./session')
// var events=require('./events');


//var aurora=require('./aurora');

//The various content types we handle and their associated mime types. 
//The second boolean array member is used to specify a cache http header is appended for this file type.

var content_types = {
    '.html': [ "text/html;charset=utf-8", false],
    '.css':  [ "text/css", false],
    '.js':   ["text/javascript;charset=utf-8", false],
    '.jpg':   ["image/jpeg", true],
    '.JPG':   ["image/jpeg", true],
    '.jpeg':  [ "image/jpeg", true],
    '.ico' : ["image/x-icon", true],
    '.png':   ["image/png", true],
    '.svg':   ["image/svg+xml", true],
    '.woff' : ['application/font-woff', true],
    '.eot'  : ['application/vnd.ms-fontobject', true],
    '.ttf'  : ['application/x-font-ttf', true]
};


process.on('SIGTERM', function(){
    console.log('SIGTERM received, terminating !');
    process.exit(1);
});


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
 */

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

/**
 * Main framework class. A single instance of this class is created at startup. 
 * @class _sadira
 */

var _sadira = function(){

    var sad=this;

    var argv = require('minimist')(process.argv.slice(2));
    console.dir(argv);
    
    sad.options={
	http_port: 9999, 
	https_port: 8888, 
	raw_port: 7777,
	websocket_service : true,
	webrtc_service : true,
	dialogs : [],
	get_handlers : [],
	post_handlers : []
    }; //Defaults options.
    

    var option_string=null;
    
    if(typeof argv['cf'] != 'undefined' ) {
	try{
	    var cfpath=argv['cf'];
	    console.log("Parsing json config file ["+ cfpath+ "]");
	    option_string=fs.readFileSync(cfpath);
	}
	catch(e){
	    console.log( "Command line parsing error : " + e);
	    process.exit(1);
	}
	
    }else if(typeof argv['opts'] != 'undefined' ) {
	option_string=argv['opts'];
    }
    
    if(option_string){
	try{
	    console.log("Parsing ["+option_string+"]");
	    var jcmdline =JSON.parse(option_string);
	    for(var p in jcmdline) 
		sad.options[p] = jcmdline[p]; //Overwriting with user given options.
	}
	catch(e){
	    console.log( "Command line parsing error : " + e);
	    process.exit(1);
	}
	
    }

    if(typeof process.argv[2] != 'undefined'){}	
    
    sad.cluster = require('cluster');
    sad.cluster_messages=[]; //Array of active interprocess messages
    
//    sad.ncpu = require('os').cpus().length;
    sad.ncpu = 1; //Using a single thread for now.


    


    if(sad.cluster.isMaster) console.log("Options are " + JSON.stringify(sad.options, null, 4));
    //Creating event master
    //this.event_master=new events.event_manager();	
} 


_sadira.prototype.start = function (){
    var sad=this;

    try{
	//Starting cluster
	console.log("Starting cluster");

	if (sad.cluster.isMaster) { //This is the main thread
	    
	    //sad.create_events();
	    // We create the session master 
	    //sad.session_master=new session.master(sad);

	    sad.nworkers=0;
	    
	    var f=0;
	    
	    if(sad.options.http_port) f+=1;
	    if(sad.options.https_port) f+=1;

	    // Fork workers.
	    console.log("Starting cluster on " + sad.ncpu + " core(s) (f "+f+")...");
	    
	    for (var i = 0; i < sad.ncpu; i++) {

		var worker=sad.cluster.fork();
		//worker.worker_id=i;

		worker.on('message', function(m){ //Handling incoming messages from workers
		    var sob;
		    if(m.object!="")sob=sad[m.object];
		    else sob=sad;
		    
		    
		    if(typeof sob != 'undefined'){
			sad[m.object].message(m, function (reply_data) {
			    var rm={
				id : m.id,
				data : reply_data
			    }
			    sad.cluster.workers[m.worker_id].send(rm);
			});
			
		    }
		    else
			console.log('MASTER: ERROR unknown message : ' + JSON.stringify(m));
		    //console.log('MASTER: message : ' + JSON.stringify(m));
		    //this.send({ roba : "Ciao bello worker " + worker.id, worker_id : "I am The Master"} );

		});
		
	    }
	    
	    sad.cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.id + ' pid ' + worker.process.pid + ' died.');
		sad.nworkers--;
	    });
	    
	    sad.cluster.on('listening', function(worker, address) {

		//console.log("A worker is now connected to " + address.address + ":" + address.port);

		worker.online=true;
		sad.nworkers++;
		
		if(sad.nworkers == f*sad.ncpu){

		    if(sad.use_https==true)
			console.log("Sadira(SSL): "+ sad.ncpu +" thread(s) listenning @ https://"+address.address+":" + sad.https_tcp_port );
		    
		    if(sad.use_http==true)
			console.log("Sadira(CLR): "+ sad.ncpu +" thread(s) listenning @ http://"+address.address+":" + sad.http_tcp_port );

		    console.log("Let's rock and roll! (CTRL + C to shutdown)");
		    
		}
		
	    });
	    
	    sad.cluster.on('online', function(worker) {
		//console.log("Yay, the worker "+worker.id +" responded after it was forked");
		
	    });

	} else { //This is a worker thread
	    
	    //We create a slave session manager for this thread.
	    
	    //sad.session_slave=new session.slave(sad);
	    
	    process.on('message', function(m){ //Handling messages sent to workers

		if(typeof m.id != 'undefined'){
		    for (var wm in sad.cluster_messages){
			//console.log(sad.cluster_messages[wm].id + " ==? " + m.id );
			if(sad.cluster_messages[wm].id==m.id){
			    var ans=sad.cluster_messages[wm].answer;
			    sad.cluster_messages.remove(wm);
			    console.log("Waiting message queue length is " + sad.cluster_messages.length);
			    return ans(m.data);
			}
		    }
		}

		var sob;
		if(m.object!="")sob=sad[m.object];
		else sob=sad;


		if(typeof sob != 'undefined'){
		    sob.message(m.data, function (reply_data) {
			var rm={
			    id : m.id,
			    data : reply_data
			}
			process.send(rm);
		    });
		    
		}
		else
		    console.log('WORKER: ERROR unknown message : ' + JSON.stringify(m));
		
		
		console.log('Worker ' + sad.cluster.worker.id + ' received message : ' + JSON.stringify(m));
		
	    });
	    //console.log("Worker "+ sad.cluster.worker.id + " created" );
	    
	    sad.create_http_server();
	    
	    /*
	    sad.send_process_message("session_master", "Hello Master ! All good ?", function (reply){
		console.log("worker "+sad.cluster.worker.id+" : Got reply from master : " + JSON.stringify(reply));
	    });
	    */
	    //process.send({ worker_id: sad.worker_id, roba : ' Dear Master ?! '  });	    
	    
	}
    }
    catch (e){
	console.log("Fatal error while creating http servers : " + dump_error(e));
	process.exit(1);
    }

}


/**
 * This function redirects url management to handlers defined in (get,post)_handlers.js
 * Command-type is either "get" or "post". Request and response are the original objects coming from the http_server requests. 
 * @method execute_command
 * @param {String} command_type Type of command, either "GET" or "POST"
 * @param {} request The http request object
 * @param {} response
 * @return 
 */

_sadira.prototype.execute_command = function (command_type, request, response ){

    var url_parts = url.parse(request.url,true);	
    var path_build=command_type+"_handlers.";

    // var objects={};
    
    try{	    
	var path_parts = url_parts.pathname.split("/");
	
	for(var p=1;p<path_parts.length;p++){
	    //console.log(" pel "+p+" : " +path_parts[p]);
	    path_build+=path_parts[p];
	    
	    if (typeof eval(path_build) == "undefined") {
		throw "undefined object";
	    } else {
		
		if (typeof eval(path_build+".process") != "undefined") {
		    eval(path_build+".process")( url_parts.query, request, response);
		}
		    
		path_build += ".";
		
	    }
	    
	}
    }
    
    catch (e){
	console.log("Cannot get handler for " + path_build + " : " + e );
	sadira.error_404(response, "Invalid path", function(){
	    response.end();
	});
	
	//response.write("Cannot get handler for " + path_build + " : " + e +"\n");
	
    }
    
    return;
}


/**
 * Processing of all the HTTP POST requests
 * @method process_post_request
 * @param {} request
 * @param {} res
 * @param {} headers
 * @return CallExpression
 */

_sadira.prototype.process_post_request=function (request, res, headers){
    return this.execute_command("post", request, res );
}


/**
 * Sends a 404 error HTML page to the browser
 * @method error_404
 * @param {} response
 * @return CallExpression
 */


_sadira.prototype.error_404=function(response, uri, cb){
    console.log("sending 404 for " + uri);
    fs.readFile("www/404.html", "binary", function(err, file) {
	
	if(err) {        
	    response.writeHead(500, {"Content-Type": "text/plain"});
	    response.write("File not found. And there is also a bug in sadira : " + err);
	    return;
	}
	
	//response.write("Unavailable resource ["+uri+"] !\n");
	
	response.writeHead(404, {"Content-Type": "text/html"});
	response.write("<html><h1>unknown file " + uri + "</h1>");
	response.write(file, "binary");
	response.write("</html>");
	cb();
    });
}

_sadira.prototype.send_process_message=function(object_name, message_data, answer){
    
    var m={	
	object : object_name,
	data : message_data,
	id : Math.random().toString(36).substring(2)
    };
    
    if(!this.cluster.isMaster)
	m.worker_id = this.cluster.worker.id;
    
    console.log("sending message id " + m.id);

    this.cluster_messages.push({ id: m.id, answer: answer});
    
    if(this.cluster.isMaster){
	if(typeof message_data.worker_id != 'undefined')
	    this.cluster.workers[worker_id].send(m);
	else{ //Broadcast to all workers.
	    for(var w in this.cluster.workers)
		this.cluster.workers[w].send(m);
	}
    }
    else
	process.send(m);
}

//Entry point for inter-process messages to be handled by the sadira object itself

_sadira.prototype.message=function(md, reply){

}

/*
//Creates the global events (Those who are sent to all sessions)

_sadira.prototype.create_events=function(){
    this.event_master.create_event("messages");
}
*/

//Sends a message event to all connected widgets.

_sadira.prototype.broadcast_message=function(message_text){
    this.send_process_message("event_master", { cmd : "send_event", event : "messages", time: (new Date()).getTime(), message: message_text });
}


//Checks if the session cookie is set. 
//If not, creates a new user-session and sets the session cookie.

_sadira.prototype.check_user_session= function(headers, sid){

    if(this.cluster.isWorker){
	//console.log('Checking session with master...');
    }

    // for(var i=0;i<request.cookies.length;i++){
    // 	if(request.cookies[i].name=='sadira_session'){
    // 	    sid=request.cookies[i].value;
    // 	}
    // }
    //console.log(ncook + " cookies : ", JSON.stringify(cookies));

    var s=null;

    if(sid==null){
	
	console.log('New connexion : setting up a new cookie !');
	s = this.create_user_session();
	if(headers)
	    headers['Set-Cookie']= 'sadira_session='+ s.session_id;
	
    }else{
	
	s = this.get_user_session(sid);
	
	if(s==null){
	    s = this.create_user_session(sid);
	    console.log('Cannot find the user session ' + sid + ' ? setting up a new one : ' + s.session_id);
	    if(headers)
		headers['Set-Cookie']= 'sadira_session='+ s.session_id;
	}
    }
    
    return s;
    
    //return headers;
}

//Processing of all the HTTP GET requests

_sadira.prototype.process_get_request=function(request, response, headers){
    
    var sad=this;
    var uri = unescape(url.parse(request.url).pathname);
    var url_parts = url.parse(request.url,true);	

    //console.log('Processing request for ' + uri);
    
    if(url_parts.search!="") //URL received with ? arguments, transferring the request to the get_handlers
	return this.execute_command("get", request, response );

    //From here the server is behaving as a simple file server.
    
    var html_rootdir=process.cwd()+'/html'; //This is the root directory for all the served files.

    //Here we should detect if the user is not trying to get something like ../../etc/passwd  
    //It seems that url.parse did the check for us (?) : uri is trimmed of the ../../ 

    var filename = path.join(html_rootdir, uri); 
    
    path.exists(filename, function(exists) {
	
	if(!exists) {
	    console.log('404 not found for uri ' + filename);

	    sad.error_404(response, uri, function() {
		response.end();
	    });
	    
	    //response.writeHead(404, {"Content-Type": "text/plain"});
	    //response.write("Unavailable resource ["+uri+"] !\n");
	    
	    return;
	}
	
	if (fs.statSync(filename).isDirectory()) filename += '/index.html';

	fs.readFile(filename, "binary", function(err, file) {

	    if(err) { 
		console.log('Error ! ' + err);
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(err + "\n");
		response.end();
		return;
	    }

	    var content_type = content_types[path.extname(filename)];
	    
	    if (content_type) {
		headers["Content-Type"] = content_type[0];

		if(content_type[1] == true){
		    headers["Cache-Control"]="public,max-age=31536000";
		}
		
	    }else
		console.log("Unknown extension" + path.extname(filename));

	    //console.log('Serving ' + filename +' : headers : ' + JSON.stringify(headers) );
	    response.writeHead(200, headers);
	    response.write(file, "binary");
	    response.end();
	});
    });    
    
    
}

//Main HTTP request handling function

_sadira.prototype.handle_request= function(request, response){
    var headers ={};

    /*
    var sad=this;
    var sid=null;
    
    request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
     	var parts = cookie.split('=');
     	//cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
	
	if(parts[ 0 ].trim() == "sadira_session")
	    sid = ( parts[ 1 ] || '' ).trim();
	
     	//ncook++;
    });

    //attach the user session to the request so that handlers know who is requesting !

    request.session=sadira.check_user_session(headers, sid); 
    request.session.session_last_activity=(new Date()).getTime();    
    */
    
    if(request.method=='POST') {
	sadira.process_post_request(request, response, headers);
    }else
	if(request.method=='GET') {
	    sadira.process_get_request(request, response, headers);
	}
    else{
	console.log("Unhandled request");
    }    
}

//Creates the http servers 

_sadira.prototype.create_http_server = function(){
    
    var sad=this;
    
    if(sad.options.https_port){
	
        //Certificates for the https server
	
	sad.ssl_data = {
	    key: fs.readFileSync('./ssl/keys/key.pem'),
	    cert: fs.readFileSync('./ssl/keys/cert.pem')
	};

	this.https_server = require("https").createServer(sad.ssl_data, sad.handle_request).listen(parseInt(sad.options.https_port, 10));
	sad.create_websocket_server('https');
    }
    if(sad.options.http_port){
	this.http_server = require("http").createServer(sad.handle_request).listen(parseInt(sad.options.http_port, 10));
	this.create_websocket_server('http');
    }
    
}

/**
 * Creation of the WebSocket server.
 */



_sadira.prototype.create_websocket_server=function(http_protocol) {

    var sad=this;
    var webSocketServer = require('websocket').server;
    
    console.log("Create websocket server");
    
    if(http_protocol=='http')
	this.ws_server= new webSocketServer({
	    // WebSocket server is tied to a HTTP server. WebSocket request is just
	    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
	    httpServer: sad.http_server
	});
    else
	this.ws_server= new webSocketServer({
    	    httpServer: sad.https_server
	});

    console.log("CWS created OK");
    // This callback function is called every time someone
    // tries to connect to the WebSocket server
    
    this.ws_server.on('request', function(request) {
	
	// accept cnx - you should check 'request.origin' to make sure that
	// client is connecting from your website
	// (http://en.wikipedia.org/wiki/Same_origin_policy)

	var cnx = request.accept(null, request.origin); 

	cnx.dialogs=new DLG.dialog_manager(cnx); //Each connexion has its own dialog manager, handling all dialogs on this websocket connexion.

	var user_session=null;

	//console.log("Request : " + jstringify(request));
	/*
	function get_session_from_cookie(cookies){
	    for(var i=0;i<cookies.length;i++){
		if(cookies[i].name=='sadira_session'){
		    return cookies[i].value;
		}
	    }
	    return null;
	}

	var sid=get_session_from_cookie(request.cookies);
	
	if(sid==null){
	    
	}


	user_session=sad.session_slave.check_user_session(null, sid);

	if(sid==null || user_session==null){
	    console.log("No sadira cookie/session, closing the websocket!");
	    send_alert_message(cnx,"You must accept our session cookie for this web-interface to function, sorry");
	    cnx.close();
	    return;
	}
	*/
	cnx.request=request;
	
	//user_session.add_socket(cnx);
	
	// Incoming message from web client

	

	cnx.on('message', function(message) {
	    
	    try{
		
		//console.log("Incoming message, creating datagram");

		var dgram=new DGM.datagram();
		
		if (message.type === 'utf8') { 
		    console.log("UTFFF [" + message.utf8Data+"]");
		    dgram.set_header(JSON.parse(message.utf8Data));
		    console.log("UTFFF");
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
		
		console.log("DGRAM EXCEPTION : "+ dump_error(e));
		return;
	    }
	    
	    //var msg_content=m.header.data;
	    //console.log("MESG:" + JSON.stringify(msg_content));
	    
	    
	});
	
	// socket disconnected
	
	cnx.on('close', function(closeReason, description) {
	    return;

	    if(user_session!=null){
		user_session.remove_socket(cnx, closeReason, description);
	    }
	    else
		console.log('Bug while closing socket cnx : session is null ! ');
	});
	
    });
}

_sadira.prototype.initialize_dialogs=function(){
    var sad=this;

    for(w=0;w<sad.options.dialogs.length;w++){
	var dialog_file = sad.options.dialogs[w];
	console.log("Init dialog ["+dialog_file+"]");
	var wpack=require(dialog_file);
	var initf=wpack.init_dialog;
	
	if(typeof initf != 'undefined')
	    initf();
    }
}



//Main global sadira instance


try{
    GLOBAL.sadira = new _sadira();
    GLOBAL.get_handlers = {};
    GLOBAL.post_handlers = {};
    GLOBAL.dialog_handlers = {};

    sadira.initialize_dialogs();
/*    
    var geths = require('./get_handlers.js');
    var posts = require('./post_handlers.js');

    var widgets=require('./widgets.js');
    var dialogs=require('./dialogs.js');
    
    widgets.initialize_widgets();
    dialogs.initialize_dialogs();
*/

    sadira.start();
}

catch (e){
    console.log('Very bad error at startup, cannot start sadira : ' + dump_error(e) );
}
