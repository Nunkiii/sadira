({ name:"Websocket",
  ui_opts:{ root_classes:[ "container-fluid" ],
    root_node:"form",
    child_classes:[ "form-group input-group" ],
    fa_icon:"tty" },
  elements:{ url:{ name:"Server",
      type:"url",
      ui_opts:{ label_node:"div",
        root_classes:[ "input-group" ],
        name_classes:[ "input-group-addon" ],
        type:"edit",
        label:true },
      default_value:"ws://sadira.iasfbo.inaf.it" },
    status:{ ui_opts:{ item_classes:[ "input-group-addon" ],
        root_element:"url" },
      type:"status",
      value:"blue",
      value_labels:{ blue:"disconnected",
        green:"connected",
        red:"error" } },
    connect:{ ui_opts:{ fa_icon:"link",
        wrap:true,
        wrap_classes:[ "input-group-btn" ],
        item_classes:[ "btn btn-info" ],
        name_classes:[  ],
        root_element:"url" },
      type:"action",
      name:"connect" },
    messages:{ ui_opts:{ sliding:true,
        slided:false,
        root_classes:[  ],
        name_classes:[  ],
        item_classes:[  ],
        label:true,
        in_root:"append" },
      name:"Info",
      type:"text" } },
  key:"socket",
  widget_builder:function (){
  
    //console.log("sadira link constructor !");
    var socket=this;
    
    new_event(socket,"socket_close");
    new_event(socket,"socket_error");
    new_event(socket,"socket_connect");

    
    var url=socket.elements.url;

    url.default_value=get_ws_server_address();
    url.set_default_value();
    
    var connect=socket.elements.connect;
    var status=socket.elements.status;
    var messages=socket.elements.messages;    
    
    if(typeof socket.server_prefix!='undefined')
	server_prefix=socket.server_prefix;
    else
	server_prefix="";
    
    if(typeof socket.sadira_prefix!='undefined')
	sadira_prefix=socket.sadira_prefix;
    else
	sadira_prefix="sadira";
    
    if(typeof socket.widget_prefix!='undefined')
	widget_prefix=socket.widget_prefix;
    else
	widget_prefix=sadira_prefix+"/widgets";

    //console.log("Setting URL " + url.value);
    if(typeof url.value==='undefined'){
	var ws_host;
	if(document.location.protocol == "http:")
	    ws_host="ws://"+location.host;
	else //is 'https'
	    ws_host="wss://"+location.host;

	url.set_value(ws_host);
    }
    
    
    socket.listen("socket_connect", function(sock){
	if(typeof socket.dialogs==='undefined')
	    socket.dialogs= new dialog_manager(sock);
	
	var session_id=localStorage.session_id;
	var d={};
	if(typeof session_id != 'undefined') d.session_id=session_id;
	
	
	status.set_value("green");
	messages.append("Connected to " + url.value + "\n");
	connect.ui_opts.fa_icon="unlink";
	connect.set_title("Disconnect");
    });
	
    socket.listen("socket_error", function(e){
	status.set_value("red");
	messages.append("Socket error " + JSON.stringify(e) + "\n");
    });
    
    socket.listen("socket_close", function(){
	if(socket.dialogs!=='undefined') 
	    delete socket.dialogs;
	
	status.set_value("blue");
	messages.append("Disconnected" + "\n");
	connect.ui_opts.fa_icon="link";
	connect.set_title("Connect");
    });
    
    connect.listen("click",function(){

	console.log("CONNECT CLICK");
	
	if(!socket.online){
	    socket.connect();
	}
	else{
	    socket.disconnect();
	}

    });


    socket.disconnect=function(){
	if(!socket.online){
	    messages.append("Not connected !");
	    return;
	}
	messages.append("Disconnecting from " + url.value + "...\n");
	if(è(socket.dialogs))
	    socket.dialogs.delete_dialogs();
	else{
	    console.log("No dialog manager !");
	}
	socket.wsock.close();

    }
    
    socket.connect=function(ecb){
	
	if(socket.online){
	    messages.append("Already connected to " + url.value + "\n");
	    return è(ecb)? ecb(): undefined;
	}

	var ws_host=url.value;
	var wsock=null; //The (main) web(rtc)socket.
	var socket_mode="websocket"; 

	messages.append("Connecting to " + ws_host + " transport : "+socket_mode+"\n");
	//Making link to the WebSocket server and handling of the socket events
	
	/*
	//Checking web storage support 

	if(typeof(Storage)=="undefined"){ 
	return cb("Sorry, you need a browser with webstorage support");
	}
	*/

	switch (socket_mode){
	case "webrtc" :
	    
	    var datachannel_opts = {
		ordered: false, // do not guarantee order
		maxRetransmitTime: 3000, // in milliseconds
	    };
	    
	    wsock=newRTCPeerConnexion('http://localhost');
	    
	    /*
	      socket.on('news', function (data) {
	      console.log(data);
	      socket.emit('my other event', { my: 'data' });
	      });
	    */
	    break;
	default:
	    window.WebSocket = window.WebSocket || window.MozWebSocket;
	    
	    //Checking web socket support 
	    
	    if (!window.WebSocket) {
		var estr="Sorry, but your browser doesn't support WebSockets.<br>Please install a modern web browser!";
		socket.trigger("socket_error",estr); 
		if(è(ecb)) ecb(estr);
	    }
	    
	    wsock = new WebSocket(ws_host);
	    wsock.binaryType = "arraybuffer";
	    break;
	};

	socket.wsock=wsock;

	wsock.onclose = function (ev) {
	    //if(è(ecb)) ecb(JSON.stringify(ev));
	    socket.trigger("socket_close", this);
	    socket.online=false;
	};
	wsock.onopen = function () {
	    socket.trigger("socket_connect",this);
	    socket.online=true;
	};
	wsock.onerror = function (error) {
	    if(è(ecb)) ecb("wsock error : " + JSON.stringify(error));
	    socket.trigger("socket_error", error);
	};
	
	wsock.onmessage = function (msg) {
	    //console.log('received message type = ' + msg.srcElement.binaryType);
	    try{		
		var dgram=new datagram();
	    
		if(msg.data instanceof ArrayBuffer){ //Binary
		    dgram.deserialize(msg.data);
		}
		else
		    dgram.set_header(JSON.parse(msg.utf8Data)); //Text
		
		socket.dialogs.process_datagram(dgram);
	    }
	    catch(e){
		//socket.trigger("socket_connect",sad);
		console.log("Error processing datagram : " + dump_error(e));
	    } 
	    
	};
	
	if(è(ecb)) ecb();
    }


} })