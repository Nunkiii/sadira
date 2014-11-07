#!/usr/bin/env node

// Sadira astro-web framework - Written by Pierre Sprimont <nunki@unseen.is> (2013-2014) @ INAF/IASF/CNR/... Bologna, Italy.

var fs = require("fs");

var http = require('http');
var https = require('https');
var http_proxy = require('http-proxy');
var passport = require('passport');
var path = require("path");
var url = require("url");

var bson = require("./www/js/community/bson");
var DLG = require("./www/js/dialog");
var DGM = require("./www/js/datagram");
var BSON=bson().BSON;


/*
  Headers to add when allowing cross-origin requests.
*/

GLOBAL.cors_headers = {
    'Access-Control-Allow-Origin' : '*',
    'Access-Control-Allow-Credentials' : true,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

/*
  Replying a cross-origin-friendly json text string and closing connection.
*/

GLOBAL.reply_json=function(res,data){
    var headers=cors_headers;
    headers.content_type='application/json';
    res.writeHead(200, headers);
    res.write(JSON.stringify(data));
    res.end();
}

/*
  Retrieve the JSON parsed object from a request's query string argument given by key
*/

GLOBAL.get_json_parameters=function(req, key){
    if(ù(key))key="req";
    var url_parts = url.parse(req.url,true);	
    return JSON.parse(url_parts.query[key]);
}

/*
  Retrieve the BSON parsed object from a request's query string argument given by key
*/

GLOBAL.get_bson_parameters=function(req, key){
    if(ù(key))key="req";
    var url_parts = url.parse(req.url,true);	
    var b=new Buffer(url_parts.query[key], 'base64');

    console.log("Read buffer ok L=" + b.length);
    return BSON.deserialize(b);
}


/*
  Signal interception routines (dev)
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
 * Main framework class. A single instance of this class is created at startup. 
 * @class _sadira
 */

var _sadira = function(){

    var sad=this;

    //sad.log("sadira process start");
    var argv = require('minimist')(process.argv.slice(2));
    //console.dir(argv);
    
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
	ncpu : require('os').cpus().length, //using number of cpu present in system by default
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
	    sad.log( "Fatal error reading config file : " + e);
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
	    console.log( "FATAL ERROR : Config file JSON parsing error : " + dump_error(e));
	    process.exit(1);
	}
    }

    if(typeof process.argv[2] != 'undefined'){}	
    
    //Configuring cluster (multi process spawn with port sharing) and inter-process communications

    sad.cluster = require('cluster');
    sad.cluster_messages=[]; //Array of active interprocess messages
    

    if(sad.cluster.isMaster){
	//sad.log("Master is online "); //: options are " + JSON.stringify(sad.options, null, 4));
    }
} 

_sadira.prototype.log = function (m){
    var sad=this;
    console.log((sad.cluster.isMaster ? "Master : " :  ("Worker " +  this.cluster.worker.id + " : ")) + m);
    
}

_sadira.prototype.start = function (){

    var sad=this;

    try{
	//Starting cluster

	if (sad.cluster.isMaster) { //This is the main thread
	    
	    sad.log("starting worker's processes ...");
	    
	    //sad.create_events();
	    // We create the session master 
	    //sad.session_master=new session.master(sad);

	    sad.nworkers=0;
	    
	    var f=0;
	    
	    if(sad.options.http_port) f+=1;
	    if(sad.options.https_port) f+=1;

	    // Forking workers.

	    var ncpu=sad.options.ncpu;
	    sad.log("Starting  on " + ncpu + " core(s) (f "+f+")...");
	    
	    for (var i = 0; i < ncpu; i++) {

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
			sad.log('MASTER: ERROR unknown message : ' + JSON.stringify(m));
		    //console.log('MASTER: message : ' + JSON.stringify(m));
		    //this.send({ roba : "Ciao bello worker " + worker.id, worker_id : "I am The Master"} );

		});
		
	    }
	    
	    sad.cluster.on('exit', function(worker, code, signal) {
		sad.log('worker ' + worker.id + ' pid ' + worker.process.pid + ' died.');
		sad.nworkers--;
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
	    
	    sad.cluster.on('online', function(worker) {
		//sad.log("Yay, the worker "+worker.id +" responded after it was forked");
		
	    });

	} else { //This is a worker thread
	    
	    //We create a slave session manager for this thread.
	    //sad.session_slave=new session.slave(sad);

	    
	    sad.log("working process id " + sad.cluster.worker.id + " starting ...");
	    
	    process.on('message', function(m){ //Handling messages sent to workers

		if(typeof m.id != 'undefined'){
		    for (var wm in sad.cluster_messages){
			//sad.log(sad.cluster_messages[wm].id + " ==? " + m.id );
			if(sad.cluster_messages[wm].id==m.id){
			    var ans=sad.cluster_messages[wm].answer;
			    sad.cluster_messages.remove(wm);
			    sad.log("Waiting message queue length is " + sad.cluster_messages.length);
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
		    sad.log('error: unknown message : ' + JSON.stringify(m));
		
		
		sad.log('Worker ' + sad.cluster.worker.id + ' received a new message ! : ' + JSON.stringify(m));
		
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

	    
	    /*
	    sad.send_process_message("session_master", "Hello Master ! All good ?", function (reply){
		sad.log("worker "+sad.cluster.worker.id+" : Got reply from master : " + JSON.stringify(reply));
	    });
	    */
	    //process.send({ worker_id: sad.worker_id, roba : ' Dear Master ?! '  });	    
	    
	}


    	//Loading handlers.
	sad.initialize_handlers("handlers");
	sad.initialize_handlers("dialogs");

    }
    catch (e){
	sad.log("Fatal error while initializing sadira : " +e);
	process.exit(1);
    }

}


/**
 * This function redirects url management to handlers defined in (get,post)_handlers.js
 * Command-type is either "get" or "post". Request and response are the original objects coming from the http_server requests. 
 * @method execute_request
 * @param {} request The http request object
 * @param {} response output stream
 * @return 
 */

_sadira.prototype.execute_request = function (request, response, result_cb ){

    var sad=this;

    var command_type=request.method;
    var url_parts = url.parse(request.url,true);	

    var path_base=eval(command_type.toLowerCase()+"_handlers");

    //console.log("Path base is " + path_base);

    var path_build=path_base;

    try{	    
	var path_parts = url_parts.pathname.split("/");

	for(var p=1;p<path_parts.length;p++){
	    //path_build+= ".";
	    if(path_parts[p]!==""){
		path_build=path_build[path_parts[p]];
		//console.log("build " + path_parts[p] + " ok");
	    }
	}
	var main_proc;

	try{
	    main_proc= eval(path_build.process);
	    if(ù(main_proc)) 
		throw("Undefined!!!");
	}
	catch (e){
	    //console.log("Unhandled path -> proxy (" + path_build + ")" + e);
	    return result_cb(null, false);
	}

	//First calling the intermediate process funcs 

	path_build=path_base;
	
	for(var p=1;p<path_parts.length-1;p++){
	    if(path_parts[p]!==""){
		path_build=path_build[path_parts[p]];
		//console.log("build " + path_parts[p] + " ok");
		try{
		    var proc_path= eval(path_build+".process");
		    if (è(proc_path)) 
			proc_path(request, response, function (error){
			    if(error!==null){
				return result_cb(error, true);
				
			    }
			    
			});
		}
		catch (e){
		    //sad.log("Error path " + e + " -> ignore !");
		}
	    }
	}
	
	//sad.log("Exec main proc !");
	main_proc(request, response, function(error){
	    if(error!==null){
		return result_cb(error, true);
		
	    }
	    //sad.log("Exec main proc done !");
	    result_cb(null,true); //We handle it.
	});
	
    }
    
    catch (e){ //Error interpreting path
	//sad.log("Exception catched while trying to execute a handler for " + path_build + " : " + e );
	result_cb(null,false); //We don't handle this.
    }
    
    return true;
}


/**
 * Sends a 404 error HTML page to the browser
 * @method error_404
 * @param {} response
 * @return CallExpression
 */


_sadira.prototype.error_404=function(response, uri, cb){
    console.log("sending 404 for " + uri);
    fs.readFile("node-nilde/sadira/404.html", "binary", function(err, file) {

	response.writeHead(404, {"Content-Type": "text/html"});
	
	if(err) {        
	    response.write("<html><title>404</title><h1>404 Not found!</h1>The \"true\" 404.html file was not found, however, this is a true 404 Error : the following file is not accessible :<br/><br/><center> " + uri+"</center></html>");
	    cb();
	    return;
	}
	
	//response.write("Unavailable resource ["+uri+"] !\n");
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


//Processing HTTP requests

_sadira.prototype.handle_request=function(request, response){
    
    var sad=this;

    //var url_parts = url.parse(request.url,true);	
    //console.log('Processing request for ' + uri);
    //if(url_parts.search!="") //URL received with ? arguments

    sadira.execute_request(request, response, function (error, processed){


	if(error!=null){

	    sadira.log("Processed ["+request.url+"]: error = " + error + " handled ? " + processed);
	    
	    //sadira.log("exec error " + error);
	    return;
	}

	if(processed===true){
	   // sadira.log("internally handled !");
	    return;
	}
	
	//The request was not handled by custom url handlers.
	//If enabled, proxying the query to another web service
	
	try{
	    
	    //console.log("Trying proxy... " + request.connection.encrypted );
	    
	    if(request.connection.encrypted){ //https connexion
		if(sadira.options.https_proxy){
		    //console.log("Proxy https " + request.url);
		    sadira.https_proxy.web(request, response);
		    return;
		}
	    }else{
		if(sadira.options.http_proxy){
		    //console.log("Proxy http " + request.url);
		    sadira.http_proxy.web(request, response);
		    return;
		}
	    }
	}

	catch (e){
	    sad.log('Proxy error : ' + e);
	    response.writeHead(500, {"Content-Type": "text/plain"});
	    response.write("Proxy error : " + err + "\n");
	    response.end();
	    return;
	}


	if(! sadira.options.file_server ){
	    response.writeHead(500, {"Content-Type": "text/plain"});
	    response.write("Don't know what to do with url...");
	    response.end();
	    return;
	}

	//Builtin web file server.
	//From here the server is behaving as a simple file server.
	//Here we should detect if the user is not trying to get something like ../../etc/passwd  
	//It seems that url.parse did the check for us (?) : uri is trimmed of the ../../ 
	
	//console.log("Builtin service : " + sadira.html_rootdir + "  uri " + uri);
	var uri = unescape(url.parse(request.url).pathname);
	var filename = path.join(sadira.options.html_rootdir, uri); 

	//Content-types used by the built-in http file server.
	//The second boolean  member is used to specify if a cache http header is appended for this file type.
	
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
	
	
	path.exists(filename, function(exists) {
	    
	    if(!exists) {
		sad.log('404 not found for uri ' + filename);
		
		sadira.error_404(response, uri, function() {
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
	
    });
    return true;
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
    
    if(sad.options.http_port){ 

	sad.log("setting up HTTP server on port " + sad.options.http_port + " ...");

	if(sad.options.http_proxy){

	    var proxy_config={
		target :  ù(sad.options.http_proxy_url) ? "http://localhost:8000" : "http://" + sad.options.http_proxy_url 
	    };
	
	    sad.log("\t-> proxy to " + proxy_config.target);
	    sad.http_proxy=http_proxy.createServer(proxy_config);
	    sad.http_proxy.on('error', handle_proxy_error);
	    
	}

	try{

	    var port = parseInt(sad.options.http_port, 10);


	    sad.http_server = http.createServer(sad.handle_request);
	    sad.http_server.on("error", function (e) {
		sad.log("HTTP server error " + JSON.stringify(e));
		cb(e);
	    });
	    
	    sad.http_server.on("listening", function () {
		sad.log("HTTP server listening on " + port);
		if(!sad.options.https_port)  return cb(null,"OK");
	    });

	    sad.http_server.on("connection", function (sock) {
	    });

	    sad.http_server.on("close", function (sock) {
		cb("http socket closed");
	    });

	    sad.http_server.listen(port);

	}
	catch (e){
	    sad.log("Fatal error on starting http : " + e);
	    return cb(e);
	}
    }
    
    if(sad.options.https_port){
	
	sad.log("setting up HTTPS server on port " + sad.options.https_port + " ...");

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
	    var proxy_config={
		target :  ù(sad.options.https_proxy_url) ? "https://localhost:4430" : "https://" + sad.options.https_proxy_url,
		https : true,
		ssl : ssl_data,
		secure : false
	    };

	    sad.log("\t-> proxy to " + proxy_config.target);	
	    sad.https_proxy=http_proxy.createServer(proxy_config);

	    sad.https_proxy.on('error', handle_proxy_error);
	}
	
        //Certificates for the https server
	try{
	    
	    sad.ssl_data = ssl_data;
	    
	    var port = parseInt(sad.options.https_port, 10);
	    var https_options = ssl_data;
	    
	    //https_options.secureProtocol="SSLv3_method";
	    https_options.rejectUnauthorized=false;

	    sad.https_server = https.createServer(https_options, sad.handle_request);
	    sad.https_server.listen(port);
	    
	    sad.https_server.on("listening", function () {
		sad.log("HTTPS server listening on " + port);
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
    
    ws_server.on('request', function(request) {
	
	console.log("WS: Connexion request from " + request.origin);
	
	var cnx = request.accept(null, request.origin); 

	cnx.dialogs=new DLG.dialog_manager(cnx); //Each connexion has its own dialog manager, handling all dialogs on this websocket connexion.
	cnx.request=request;
	
	// Incoming message from web client
	
	DLG.new_event(cnx, "closed");

	cnx.on('message', function(message) {
	    
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


	if(sad.cluster.isMaster){
	    var initf=wpack.init_master;
	    
	    if(è(initf))
		initf(pkg[w]);
	    else{
		//sad.log("No pkg init function!");
	    }
	    
	}else{
	    var initf=wpack.init;
	    
	    if(è(initf))
		initf(pkg[w]);
	    else{
		//sad.log("No pkg init function!");
	    }
	}
	//sad.log("Init "+packname+" : ["+pkg_file+"] DONE");
    }
}


//Main sadira instance

try{

    GLOBAL.get_handlers = {};
    GLOBAL.post_handlers = {};
    GLOBAL.dialog_handlers = {};

    GLOBAL.sadira = new _sadira();
    sadira.start();
}

catch (e){
    console.log('Very bad error at startup, cannot start sadira : ' + dump_error(e) );
    process.exit(1);
}
