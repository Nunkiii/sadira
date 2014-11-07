// Sadira astro-web framework - Pierre Sprimont <sprimont@iasfbo.inaf.it> (2013) - INAF/IASF Bologna, Italy.


(function(){
    
    console.log("Create tmaster...");
    window.tmaster=new local_templates();
    window.tmaster.add_templates(base_templates);
    window.sadira = {};
    new_event(window.sadira,"ready");
    
    window.addEventListener("load",function(){
	console.log("sadira ready....");
	window.sadira.trigger("ready");
    });
})();


// var sadira = function(parameters, on_error, on_connect) {

//     var sad=this;
    
//     //Making link to the WebSocket server and handling of the socket events
    
//     this.initiate_connexion = function(on_error, on_connect){
	
// 	//Checking web storage support 
	
// 	if(typeof(Storage)==="undefined"){ 
// 	    console.log("No webstorage support. ");
// 	}
	

// 	if(typeof parameters.server==='undefined'){
// 	    if(document.location.protocol === "http:")
// 		ws_host="ws://"+location.host;
// 	    else //is 'https'
// 		ws_host="wss://"+location.host;
// 	}else
// 	    ws_host=parameters.server;
	
	
//     	if(typeof parameters.server_prefix!='undefined')
// 	    server_prefix=parameters.server_prefix;
// 	else
// 	    server_prefix="";


//     	if(typeof parameters.sadira_prefix!='undefined')
// 	    sadira_prefix=parameters.sadira_prefix;
// 	else
// 	    sadira_prefix="sadira";
	
//     	if(typeof parameters.widget_prefix!='undefined')
// 	    widget_prefix=parameters.widget_prefix;
// 	else
// 	    widget_prefix=sadira_prefix+"/widgets";
    
// 	//console.log("ws host is " +ws_host + ' protocol is ' +  document.location.protocol );    
// 	//set_connexion_status("unknown","Connecting to <pre>" + JSON.stringify(location,null,3) + "</pre>" );
	
// 	//set_connexion_status("unknown","Connecting to " + ws_host + " ..." );

// 	var wsock=null; //The (main) web(rtc)socket.

// 	if(!parameters.mode) 
// 	    parameters.mode="websocket"; 
	
// 	if(parameters.mode=="webrtc"){
	    
// 	    var datachannel_opts = {
// 		ordered: false, // do not guarantee order
// 		maxRetransmitTime: 3000, // in milliseconds
// 	    };

// 	    wsock=newRTCPeerConnexion(location.host);

// 	    /*
// 	    socket.on('news', function (data) {
// 		console.log(data);
// 		socket.emit('my other event', { my: 'data' });
// 	    });
// 	    */

// 	}else{
	    
// 	    window.WebSocket = window.WebSocket || window.MozWebSocket;
	    
// 	    //Checking web socket support 
	    
// 	    if (!window.WebSocket) {
// 		var emsg="Sorry, but your browser doesn't support WebSockets. Please install a modern web browser";
// 		//set_connexion_status("error", emsg);
// 		return on_error(emsg);
// 	    }

// 	    wsock = new WebSocket(ws_host);
// 	    wsock.binaryType = "arraybuffer";
// 	}
	
	
// 	wsock.onclose = function () {
// 	    //this.set_status();
// 	    if(sad.dialogs!='undefined') delete sad.dialogs;
// 	};
	
// 	wsock.onopen = function () {
// 	    //this.set_status();
// 	    sad.dialogs= new dialog_manager(wsock);

// 	    //root_widget = new widget.base();
// 	    //Looking in web storage if we already have an assigned session id
	    
// 	    var session_id=localStorage.session_id;
// 	    var d={};

// 	    if(typeof session_id != 'undefined') d.session_id=session_id;
	    
// 	    on_connect(sad);
// 	    //        input.removeAttr('disabled');
// 	    //        status.text('Choose name:');
// 	};
	
// 	wsock.onerror = function (error) {
// 	    //this.set_status(error);
// 	    on_error(error);
// 	    //set_connexion_status("error", "Error: <pre>"+JSON.stringify(error,null,3)+"</pre>");
// 	};
	
// 	wsock.onmessage = function (msg) {
	    
// 	    //console.log('received message type = ' + msg.srcElement.binaryType);
	    
// 	    try{		
// 		var dgram=new datagram();
		
// 		if(msg.data instanceof ArrayBuffer){ //Binary
// 		    dgram.deserialize(msg.data);
// 		}
// 		else //{
// 		    dgram.set_header(JSON.parse(msg.utf8Data));
// 		//console.log('received bin message size=' + message.binaryData.length + ' bytes.');
// 		// }else{
// 		//     throw "Unhandled socket message type " + msg.srcElement.binaryType;
// 		// }
		
// 		sad.dialogs.process_datagram(dgram);
// 	    }
// 	    catch(e){
// 		console.log("Error processing datagram : " + dump_error(e));
// 	    } 
	    
// 	};
	
//     }
    
//     if( typeof on_connect != 'undefined') 
// 	this.initiate_connexion(on_error, on_connect);
    
// };


// function load_main_widget_site(){
    
//     //console.log("Sadira starting from index.html");
    
//     //Eastablishing link with the sadira websocket server
    
//     window.sadira=new sadira({}, function(error){}, function(connected){
	
// 	//Getting instructions about what widget to load
	
// 	var d= sadira.dialogs.create_dialog({ handler : "sadira.session.get_gui"});
	
// 	var buf = new ArrayBuffer(1000*4);
// 	var floatview = new Float32Array(buf);
// 	var s=0;
// 	for(var j=0;j<1000;j++){
// 	    var n=Math.random();
// 	    floatview[j]=n;
// 	    s+=n;
// 	}

// 	console.log("TESTSUM="+s);
// 	d.listen('page_widget', function(dgram){
	    						
// 	    page_widget = eval("new "+dgram.header.widget_name);
// 	    sadira.root_widget.add_child(page_widget);
// 	    page_widget.set_title();
// 	    page_widget.set_html(function(){
// 		page_widget.init(function(err, w){
		    
// 		    //console.log("received " + msg.data.widget_name + " test = " + page_widget.test);
		    
// 		    document.getElementsByTagName('body')[0].appendChild(page_widget.widget_div);
// 		});
// 	    });

// 	});


// 	d.srz_request=function(dgram, result_cb){
	    
// 	    var sz=dgram.header.sz;
// 	    var b=new ArrayBuffer(sz);
// 	    var sr=new srz_mem(b);
	    
// 	    sr.on_done=function(){
// 		console.log("OK, received nbytes=" +sr.size());
// 		var fv = new Float32Array(sr.data);
		
// 		var s=0;
// 		for(var i=0;i<1000;i++)
// 		    s+=fv[i];
// 		console.log("TESTSUM RESENT="+s);
// 	    }
	    
// 	    result_cb(null, sr);
// 	};


	
// 	d.connect(function(error, init_dgram){
// 	    console.log("Init data error= " + error + " init data = " + JSON.stringify(init_dgram));

// 	    if(error); else{
// 		var sr=new srz_mem(buf);
		
// 		sr.on_error=function(error){
// 		    console.log("SR error  " + error);
// 		}
// 		sr.on_done=function(){
// 		    console.log("Write finished!");
// 		};
// 		sr.on_accept=function(){
// 		    console.log("SRZ accepted !");
// 		};

// 		d.srz_initiate(sr, function(error){
		    
// 		});
// 	    }


// 	}); 
	
//     });
    
// }
