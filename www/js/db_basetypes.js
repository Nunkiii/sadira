template_ui_builders.sadira=function(ui_opts, sad){

    console.log("sadira link constructor !");
    
    var widget_prefix="widgets";
    var server_prefix="";
    
    new_event(sad,"socket_close");
    new_event(sad,"socket_error");
    new_event(sad,"socket_connect");
    
    //console.log("Building " + sad.name + " type " + sad.type); for(var e in sad) console.log("se " + e);
    
    var url=sad.elements.url;

    var connect=sad.elements.connect;
    var status=sad.elements.status;
    var messages=sad.elements.messages;    
    
    
    if(typeof sad.server_prefix!='undefined')
	server_prefix=sad.server_prefix;
    else
	server_prefix="";
    
    if(typeof sad.sadira_prefix!='undefined')
	sadira_prefix=sad.sadira_prefix;
    else
	sadira_prefix="sadira";
    
    if(typeof sad.widget_prefix!='undefined')
	widget_prefix=sad.widget_prefix;
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
    
    
    sad.listen("socket_connect", function(sock){
	if(typeof sad.dialogs==='undefined')
	    sad.dialogs= new dialog_manager(sock);
	
	var session_id=localStorage.session_id;
	var d={};
	if(typeof session_id != 'undefined') d.session_id=session_id;
	
	
	status.set_value("green");
	messages.append("Connected to " + url.value + "\n");
	connect.set_title("Disconnect");
    });
	
    sad.listen("socket_error", function(e){
	status.set_value("red");
	messages.append("Socket error " + JSON.stringify(e) + "\n");
    });
    
    sad.listen("socket_close", function(){
	if(sad.dialogs!=='undefined') 
	    delete sad.dialogs;
	
	status.set_value("blue");
	messages.append("Disconnected" + "\n");
	connect.set_title("Connect");
    });
    
    connect.listen("click",function(){

	console.log("CONNECT CLICK");
	
	if(!sad.online)
	    sad.connect();
	else{
	    sad.disconnect();
	}
    });


    sad.disconnect=function(){
	if(!sad.online){
	    messages.append("Not connected !");
	    return;
	}
	messages.append("Disconnecting from " + url.value + "...\n");
	if(è(sad.dialogs))
	    sad.dialogs.delete_dialogs();
	else{
	    console.log("No dialog manager !");
	}
	sad.wsock.close();

    }
    
    sad.connect=function(){
	if(sad.online){
	    messages.append("Already connected to " + url.value + "\n");
	    return;
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
	
	    try {
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		
		//Checking web socket support 
		
		if (!window.WebSocket) {
		    throw { message : "Sorry, but your browser doesn't support WebSockets.<br>Please install a modern web browser" };
		}

		wsock = new WebSocket(ws_host);
		wsock.binaryType = "arraybuffer";
	    }
	    catch (e){
		sad.trigger("socket_error", e.message);
	    }
	    break;
	};

	if(!wsock){
	    messages.append("Cannot create socket!");
	    return;
	}
	
	sad.wsock=wsock;

	wsock.onclose = function () {
	    sad.trigger("socket_close", this);
	    sad.online=false;
	};
	wsock.onopen = function () {
	    sad.trigger("socket_connect",this);
	    sad.online=true;
	};
	wsock.onerror = function (error) {
	    sad.trigger("socket_error", error);
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
		
		sad.dialogs.process_datagram(dgram);
	    }
	    catch(e){
		//sad.trigger("socket_connect",sad);
		console.log("Error processing datagram : " + dump_error(e));
	    } 
	
	};

	
    }


}

template_ui_builders.main_window=function(ui_opts, prog){
    
    
    
}


template_ui_builders.progress=function(ui_opts, prog){

    var ui=prog.ui=ce("progress");

    if(typeof prog.value ==='undefined') prog.value=0.0;
    if(typeof prog.min ==='undefined') prog.min=0.0;
    if(typeof prog.max ==='undefined') prog.max=100.0;
    
    prog.setup_ui=function(){
	ui.min=prog.min;
	ui.max=prog.max;
	ui.value=prog.value;
    }

    prog.set_value=function(v){
	if(typeof v !=='undefined') prog.value=v;
	if(isFinite(prog.value))
	    ui.value=prog.value;
    }
    prog.setup_ui();
    return ui;
}

template_ui_builders.status=function(ui_opts, tpl_item){

    var ui=ce("span");ui.add_class("status");
    var flag=cc("span",ui);flag.add_class("flag");
    var txt=cc("span",ui); 

    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv; 
	else nv=tpl_item.value;
	
	if(tpl_item.value_labels[nv]!='undefined')
	    txt.innerHTML=tpl_item.value_labels[nv];
	else
	    txt.innerHTML="unknown";
	flag.style.backgroundColor=tpl_item.value;
    }
    tpl_item.set_value();
    return ui;
}

template_ui_builders.double=function(ui_opts, tpl_item){
    //console.log("double builder :  " + JSON.stringify(ui_opts));
    new_event(tpl_item,"change");
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(è(nv))
		tpl_item.value=nv; 
	    if(è(tpl_item.value))
		ui.innerHTML=Math.floor(tpl_item.value*1000)/1000;
	}
	ui.addEventListener("change",function(){
	    tpl_item.trigger("change", tpl_item.value);

	},false);

	tpl_item.set_value();

	break;
    case "edit": 
	var ui=tpl_item.ui=ce("input");
	if(ui_opts.input_type)
	    ui.type=ui_opts.input_type;
	else
	    ui.type="number";

	if(tpl_item.min) ui.min=tpl_item.min;
	if(tpl_item.max) ui.max=tpl_item.max;
	if(tpl_item.step) ui.step=tpl_item.step;

	tpl_item.get_value=function(){return tpl_item.value;}
	tpl_item.set_value=function(nv){if(typeof nv !='undefined')tpl_item.value=nv; ui.value=tpl_item.value}

	tpl_item.set_default_value=function(){
	    var v=tpl_item.default_value;
	    if(ù(v)) v=tpl_item.value; 
	    if(è(v)){
		console.log("Setting placeholder value");
		ui.setAttribute("placeholder",v);
	    }
	}
	
	tpl_item.set_default_value();

	ui.addEventListener("change",function(){
	    tpl_item.value=this.value*1.0; 
	    tpl_item.trigger("change", tpl_item.value);

	},false);
	break;
    default: 
	throw "Unknown UI type " + ui_opts.type + " for " + tpl_item.name;
    }
    return tpl_item.ui;
}

template_ui_builders.labelled_vector=function(ui_opts, tpl_item){

    var ui=tpl_item.ui=ce("div");

    new_event(tpl_item,"change");
    
    ui.className="labelled_vector";
    tpl_item.inputs=[];
    var cdepth=tpl_item.depth? tpl_item.depth+1:1;
    if(typeof tpl_item.value==='undefined') tpl_item.value=[];
    if(typeof tpl_item.value_labels==='undefined') tpl_item.value_labels=[];
    
    for(var v=0;v<tpl_item.value_labels.length;v++){
	if(typeof tpl_item.value[v] === 'undefined') tpl_item.value[v]=0;
	//var li=ce("li");
	var label=ce("label"); 
	tpl_item.inputs[v]={ 
	    id : v,
	    type : typeof tpl_item.vector_type == 'undefined' ? "double" : tpl_item.vector_type,
	    name : tpl_item.value_labels[v],
	    min : tpl_item.min, 
	    max : tpl_item.max, 
	    step : tpl_item.step, 
	    value : tpl_item.value[v],
	    ui_opts : { label : true, root_classes : ["form-group"] }
	    /*
	    parent : { 
		ui_childs : { 
		    add_child : function(e,nui){ui.appendChild(nui);},
		    replace_child : function(nui,oui){
			ui.replaceChild(nui, oui);
			console.log("LAB VECTOR container Replaced UI!");
		    }
		}
	    }
*/
	}; 
	//var vui=create_ui(ui_opts, tpl_item.inputs[v]);
	var vui=create_ui({ editable : ui_opts.editable, type: ui_opts.type}, tpl_item.inputs[v], cdepth);

	tpl_item.inputs[v].listen("change",function(v){
	    tpl_item.value[this.id]=this.value;
	    //console.log("change triggered!");
	    tpl_item.trigger("change",this.id);
	});

	tpl_item.ui_childs.add_child(tpl_item.inputs[v], vui);
    }
    
    tpl_item.set_value=function(nv){
	//console.log("TPLI set value " + JSON.stringify(nv));
	if(typeof nv !='undefined'){
	    this.value=nv;
	    tpl_item.trigger("change");
	}
	for(var v=0;v<this.inputs.length;v++){
	    //console.log("TPLI set value " + JSON.stringify(this.value[v]) + " on " + tpl_item.inputs[v].name );
	    tpl_item.inputs[v].set_value(this.value[v]);
	}
	
	
	//if(tpl_item.onchange) tpl_item.onchange();
	
	//ui.innerHTML=tpl_item.value? "yes":"no";
    }

    //console.log("Done building LABVEC : " + tpl_item.name);

    return tpl_item.ui;
}


template_ui_builders.signup=function(ui_opts, signup){

    var local=signup.elements.local; 
    var shib=signup.elements.shib; 

    var data=local.elements.data; 
    var email=data.elements.email;
    var pw=data.elements.password;
    var pwr=data.elements.password_repeat;
    var signup_act=local.elements.signup;

    var shib_signup=shib.elements.signup;
    

    shib_signup.listen("click", function(){

	
	console.log("Trying login shib");
	
	var rqinit=new request({ cmd : "/shiblogin", data_mode : "", method : "GET"});
	
	rqinit.execute(function(error, res){
	    if(error){
		console.log("Error rqinit " + error);
		return;
	    }
	    
	    console.log("signup Reply : " + JSON.stringify(res));
	    
	});

    });

    
    var config=
	{
	    allowPassphrases       : true,
	    maxLength              : 128,
	    minLength              : 8,
	    minPhraseLength        : 20,
	    minOptionalTestsToPass : 3,
	};
    
    if(è(signup.owasp_config)) for(var c in config_in) config[c]=signup.owasp_config[c];
    owaspPasswordStrengthTest.config(config); 

    var email_status = {
	type : "status",
	value : "blue",
	value_labels : { blue : "who knows", green : "valid", red : "invalid"}
    };
    var pw_status = {
	type : "status",
	value : "red",
	value_labels : { green : "good", red : "not acceptable"}
    };
    var pwr_status = {
	type : "status",
	value : "red",
	value_labels : { green : "match", red : "dont't match"}
    };

    
    signup_act.ui.setAttribute("disabled",true); //add_class("masked");
    
    create_ui({}, email_status);
    email.ui_childs.add_child(email_status,email_status.ui_root);
    //email.ui_root.appendChild(email_status.ui_root);
    //var td=cc("td",email.tr); td.appendChild(email_status.ui_root);
    
    create_ui({}, pw_status);
    pw.ui_childs.add_child(pw_status,pw_status.ui_root);
    //var td=cc("td",pw.tr); td.appendChild(pw_status.ui_root);

    create_ui({}, pwr_status);
    pwr.ui_childs.add_child(pwr_status,pwr_status.ui_root);
    //var td=cc("td",pwr.tr); td.appendChild(pwr_status.ui_root);
    
    var pw_fail_reasons=cc("ul",pw.ui_root);
    pw_fail_reasons.className="alert alert-danger";
    pw_fail_reasons.setAttribute("role","alert");
    
    function check_everything_good(){
	if (email_status.value=="green"
		&& pw_status.value=="green"
		&& pwr_status.value=="green"
	   ){
	    signup_act.ui.removeAttribute("disabled");
	}else
	    signup_act.ui.setAttribute("disabled",true);
    }

    
    pw.pui.addEventListener("input", function(){
	
	pwr.set_value("");
	pwr_status.set_value("red");
	var owasp_result = owaspPasswordStrengthTest.test(this.value);
	pw_fail_reasons.innerHTML="";
	if(owasp_result.strong){
	    pw_status.set_value("green");
	}else{
	    
	    pw_status.set_value("red");
	    for(var es=0;es<owasp_result.errors.length;es++){
		cc("li",pw_fail_reasons).innerHTML=owasp_result.errors[es];
	    }
	    
	    //console.log("Password too weak : " + JSON.stringify(owasp_result, null, 5));
	    
	}

	check_everything_good();
	
    });

    function validate_email(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
    } 

    email.ui.addEventListener("input", function(){
	if(validate_email(this.value)){
	    email_status.set_value("green");
	}
	else
	    email_status.set_value("red");
	check_everything_good();
	
    });

    pwr.pui.addEventListener("input", function(){
	if(this.value===pw.pui.value){
	    pwr_status.set_value("green");
	}
	else
	    pwr_status.set_value("red");
	check_everything_good();

    });


    signup_act.listen("click", function(){
	var post_data="email="+encodeURIComponent(email.ui.value)+"&hashpass="+encodeURIComponent(pw.pui.value);
	console.log("post data = "+ post_data);
	var rqinit=new request({ cmd : "/signup", data_mode : "", method : "POST", post_data : post_data});
	
	rqinit.execute(function(error, res){
	    if(error){
		console.log("Error rqinit " + error);
		return;
	    }

	    console.log("signup Reply : " + JSON.stringifuy(res));
	    
	});
    });
	    
    //return ui;
}

template_ui_builders.login=function(ui_opts, login){

    
    ///////////////////////////////////////////////////////////////
    //User Login/Logout stuff
    
    //var ui=template_ui_builders.password(ui_opts, login);
    
    //var ui=ce("div",ui);
    var input_caption=ce('label');
    var ui=login.ui=input_caption;

    input_caption.innerHTML="e-mail : ";
    var input_box=cc('input',input_caption);

//    input_caption.className='login_input_caption';
    input_box.className='form-control';
	
    input_box.focus();
    
    var user_name="", user_password="";
    
    input_box.onkeydown = function(e) {
	
	if (e.keyCode === 13) { //return key pressed
	    
	    if(user_name==""){
		user_name=input_box.value;
		//user_name=hex_md5(input_box.value);
		input_box.value="";
		input_caption.firstChild.textContent="Password : ";
		input_box.type="password";
	    }else{
		//console.log("Setting user password...");
		user_password=input_box.value;//hex_md5(input_box.value);
		input_box.value="";
		input_caption.firstChild.textContent="Registering...";
		input_box.style.display='none';

		var post_data="email="+encodeURIComponent(user_name)+"&hashpass="+encodeURIComponent(user_password);
		//var post_data=encodeURIComponent("email="+user_name+"&hashpass="+user_password);
		var rqinit=new request({ cmd : "/login", query_mode : "bson", method : "POST", post_data : post_data});

		rqinit.execute(function(error, res){
		    if(error){
			console.log("Error login " + error);
			return;
		    }

		    console.log("login Reply : " + JSON.stringifuy(res));
		    
		    // var server_key=res.key;
		    // var client_key = new Uint8Array(32);

		    // window.crypto.getRandomValues(buf);
		    
		    // var hash=CryptoJS.HmacSHA256("Message", "Secret Passphrase");
		    // var hash=CryptoJS.SHA1(user_name+user_password);
		    // console.log("["+user_name+"]["+user_password+"]");
		    // var qr=new request({ cmd : "/login", query_mode : "bson", args : { hash : hash.toString()}    });
		    
		    // qr.execute(function(error, res){
		    // 	console.log("Received  " + JSON.stringify(res));
		    // });
		    
		    
		});
		
		//query_login("what=login&u="+user_name+"&p="+user_password,result_cb);
	    }
	}
    };

    return ui;
}


template_ui_builders.sky_coords=function(ui_opts, skyc){
    var ui=template_ui_builders.labelled_vector(ui_opts,skyc);
    
    return ui;
}

template_ui_builders.local_file=function(ui_opts, tpl_item){
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    var div=tpl_item.ui=ce("div");
    

    switch (ui_opts.type){
    case "short":
	var ui=cc("span",div);
	ui.className="local_file";
	ui.innerHTML=tpl_item.value;
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.innerHTML=tpl_item.value;
	}

	break;
    case "edit":
	var sp=cc("span", div); sp.className="btn btn-default btn-file";sp.innerHTML="Browse...";
	var ui=tpl_item.ui_input=cc("input",sp); 
	//ui.className="local_file";
	ui.type="file";

	sp.addEventListener("change",function(evt){
	    tpl_item.value=this.value;
	    if(tpl_item.onchange){
		tpl_item.onchange(evt);
	    }
	}, false);

	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    //ui.value=tpl_item.value;
	}
	
	break;
    default: 
	throw "Unknown UI type ";
    }

    //tpl_item.ui=ui;
    
    return tpl_item.ui;
}

function format_byte_number(v){
    var u=["","k","M","G","T"];
    var id=0,idmax=4;
    var val=v, unit='byte';
    while(val>=1024 && id<idmax){
	val=val/1024.0;
	id++;
    };
    val=Math.floor(val*100)/100.0;
    if(val>1) unit+="s";
    return  val+ " " +u[id]+unit;
};


template_ui_builders.bytesize=function(ui_opts, tpl_item){
    template_ui_builders.double(ui_opts, tpl_item);
    var ui=tpl_item.ui;
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    switch (ui_opts.type){
    case "short":
	tpl_item.set_value=function(nv){
	    if(typeof nv!='undefined')tpl_item.value=nv;
	    //ui.innerHTML=nv;
	    //console.log("Bytesize setting val : " + tpl_item.value + " nv = " + nv);
	    ui.innerHTML=format_byte_number(tpl_item.value);
	}
	break;
    case "edit": 
	break;
    default: 
	throw "Unknown UI type ";
    }

    tpl_item.set_value();
    return ui;
}

template_ui_builders.bool=function(ui_opts, tpl_item){

    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    
    new_event(tpl_item,"change");
    switch (ui_opts.type){
	
	
    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.innerHTML=tpl_item.value? "yes":"no";
	}
	break;
    case "edit": 
	var lab=ce("label"); lab.innerHTML=tpl_item.name;
	if(è(tpl_item.ui_name))
	    tpl_item.ui_root.removeChild(tpl_item.ui_name);

	var ui=tpl_item.ui=cc("input", lab, true);
	ui.type="checkbox";

	tpl_item.ui_root.add_class("checkbox");
	tpl_item.ui_root.appendChild(lab);
	
	
	tpl_item.set_value=function(nv){
	    
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
	    ui.checked=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return ui.checked;
	}
	ui.addEventListener("change",function(){
	    tpl_item.value=this.checked; 
	    tpl_item.trigger("change", tpl_item.value);
	});
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    tpl_item.set_value();

    //return tpl_item.ui;
}


template_ui_builders.string=function(ui_opts, tpl_item){

    if(ù(ui_opts.type)) ui_opts.type="short";

    new_event(tpl_item,"change");

    switch (ui_opts.type){
	
    case "short":

	var ui=tpl_item.ui=ce("span");
	ui.className="value";

	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    if(è(tpl_item.value))
		ui.innerHTML=tpl_item.value;
	    else
		ui.innerHTML="?";
	}

	tpl_item.set_value();
	break;

    case "edit": 

	//var uui=tpl_item.ui=ce("div");
	var ui=tpl_item.ui=ce("input");
	ui.type="text";
	ui.className="form-control";
	var default_value=tpl_item.value;
	
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.value=tpl_item.value;
	}

	ui.addEventListener("change",function(){
	    //console.log("str changed " + this.value);
	    tpl_item.value=this.value; 
	    tpl_item.trigger("change", tpl_item.value);
	    
	    //tpl_item.switch_edit_mode();
	});

	
	// ui.onchange=function(){
	//     tpl_item.value=this.value; 
	//     if(tpl_item.onchange)
	// 	tpl_item.onchange();
	// }

	tpl_item.set_default_value=function(){
	    var v=tpl_item.default_value;
	    //if(ù(v)) v=tpl_item.value; 
	    if(è(v)){
		//console.log("Setting placeholder value");
		ui.setAttribute("placeholder",v);
	    }else
		tpl_item.set_value();
	}

	tpl_item.set_default_value();
	
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return tpl_item.ui;
}


template_ui_builders.text=function(ui_opts, tpl_item){

    var div=tpl_item.ui=ce("div");
    var ui=cc("pre",div);
    ui.add_class("text");

    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;
	if(typeof tpl_item.value !== 'undefined')
	    ui.innerHTML=tpl_item.value;
    }
    
    tpl_item.append=function(txt){
	if(typeof tpl_item.value === 'undefined')
	    tpl_item.set_value(txt);
	else{
	    //console.log("append text to " + tpl_item.value);
	    tpl_item.value+=txt;
	    tpl_item.set_value();
	}
	tpl_item.ui.scrollTop = tpl_item.ui.scrollHeight;
    }
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "edit": 
	ui.setAttribute("contentEditable",true);
	ui.onchange=function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}
	break;
    default: break;
    }

    tpl_item.set_value();
    return tpl_item.ui;
}


template_ui_builders.password=function(ui_opts, tpl_item){
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){

    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
	    if(typeof tpl_item.value !== 'undefined')
		ui.innerHTML=tpl_item.value;
	}
	break;

    case "edit": 

	var ui=tpl_item.ui=ce("span");
	var pui=tpl_item.pui=cc("input",ui);
	var lab=cc("label",ui);
	var labeye=cc("span",lab);labeye.innerHTML="<span class='glyphicon glyphicon glyphicon-eye-close'></span>";//"⎃";
	var show=cc("input",lab); show.type="checkbox";
	pui.type="password";
	pui.className="form-control";
	show.onclick=function(){
	    pui.type= show.checked ? "text" : "password";
	    var eye=show.checked ? "open" : "close";
	    labeye.innerHTML="<span class='glyphicon glyphicon glyphicon-eye-"+eye+"'></span>";//"⎃";
	    console.log("pt = " + pui.type);

	}
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    pui.value=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return pui.value;
	}

	if(tpl_item.onchange){
	    pui.onchange=function(){
		tpl_item.value=this.value; 
		tpl_item.onchange();
	    }
	}
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return tpl_item.ui;
}


template_ui_builders.date=function(ui_opts, tpl_item){

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){

    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.innerHTML=tpl_item.value;
	}
	break;
    case "edit": 
	var ui=tpl_item.ui=ce("input");
	ui.type="date";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.value=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return ui.value;
	}

	ui.onchange=function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return tpl_item.ui;
}


template_ui_builders.url=function(ui_opts, url){
    
    
    var ui;

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    switch (ui_opts.type){

	
    case "short":
	ui=url.ui=ce("span");
	//ui.className="value";
	url.set_value=function(nv){
	    if(typeof nv !='undefined')
		url.value=nv;
	    if(typeof url.value !=='undefined')
		ui.innerHTML=url.value;
	}

	url.set_value();
	break;
    case "edit": 

	if(url.download){

	    var download_type = è(url.download_type) ? url.download_type : "text";
	    
	    var edit_tpl={ 
		elements : {
		    url : { type : "string", name : "URL", default_value : "http://", ui_opts: {type : "edit"}},
		    //nbytes : { type : "mem", name : "Received " },
		    download : { type : "action", name : "Download"}
		}
	    };
	    
	    
	    create_ui({},edit_tpl);
	    
	    var url_str=edit_tpl.elements.url;

	    url_str.ui.type="url";
	    
	    ui=url.ui=edit_tpl.ui_root;
	    
	    url.set_value=function(nv){
		url_str.set_value(nv);
	    }
	    url.set_default_value=function(){
		url_str.set_default_value();
	    }

	    new_event(url,"download_ready");
	    new_event(url,"download_error");

	    var download=edit_tpl.elements.download;
	    var dmon=new proc_monitor();
	    edit_tpl.ui_root.appendChild(dmon.ui);
	    
	    download.listen("click", function(){
		dmon.wait("Starting download...");
		

		function download_complete(error, data){
		    if(error!=null){
			dmon.error(error);
			url.trigger("download_error", error);
		    }else{
			dmon.done("complete L=" + data.length);
			url.trigger("download_ready", data);
		    }
		};

		var q=edit_tpl.elements.url.value;
		var opts={ 
		    progress : function(evt) { //evt.total ? -> add Content-Length header server-side!!
			dmon.message(format_byte_number(evt.loaded) + " received");
		    } 
		};
		
		switch(download_type){
		case "text":
		    xhr_query(q, download_complete,opts);
		    break;
		case "json":
		    json_query(q, download_complete,opts);
		    break;
		case "bson":
		    bson_query(q, download_complete,opts);
		    break;
		case "binary":
		    opts.type="arraybuffer";
		    xhr_query(q, download_complete, opts);
		    break;
		default:
		    break;

		};
	    });
	    
	    
	    
	}else{
	    ui=url.ui=ce("input");
	    ui.type="url";
	    url.set_default_value=function(){
		var v=url.default_value;
		if(ù(v)) v=url.value; 
		if(è(v)){
		    //console.log("Setting placeholder value");
		    ui.setAttribute("placeholder",v);
		}
		
	    }

	    url.set_value=function(nv){
		if(typeof nv !='undefined')
		    url.value=nv;
		if(typeof url.value !=='undefined')
		    ui.value=url.value;
	    }
	    url.get_value=function(){
		return ui.value;
	    }
	    
	    ui.onchange=function(){
		url.value=this.value; 
		if(url.onchange)
		    url.onchange();
	    }
	}
	url.set_default_value();
	
	break;
    default: 
	throw "Unknown UI type ";
    }

    
    return url.ui;
}

template_ui_builders.image_url=function(ui_opts, tpl_item){
    var ui=tpl_item.ui=ce("div");
    
    function load_image(){
	if(typeof tpl_item.value!='undefined')
	    img.src=tpl_item.value;
    }

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	//var utext=cc("div",ui);
	//utext.add_class("value");
	
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	  //  utext.innerHTML=tpl_item.value;
	    load_image();
	}
	break;
    case "edit": 
	var utext=tpl_item.ui=ce("input");
	utext.type="url";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    utext.value=tpl_item.value;
	    load_image();
	}
	tpl_item.get_value=function(){
	    return utext.value;
	}

	utext.onchange=function(){
	    tpl_item.value=this.value; 
	    load_image();
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}
	break;
    default: 
	throw "Unknown UI type ";
    }
    var img=cc("img",ui);
    load_image();

    return tpl_item.ui;
}


template_ui_builders.html=function(ui_opts, tpl_item){

    var ui=tpl_item.ui=ce("div");
    
    ui.className="html_content";
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')tpl_item.value=nv;
	ui.innerHTML=tpl_item.value;
    }
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    switch (ui_opts.type){
	
    case "short":
	break;
    case "edit": 
	ui.add_class("editable");
	if(tpl_item.onchange){
	    ui.onchange=function(){
		tpl_item.value=this.value; 
		tpl_item.onchange();
	    }
	}
	break;
    default: 
	throw "Unknown UI type ";
    }

    if(tpl_item.url){
	download_url(tpl_item.url,function(error, html_content){
	    tpl_item.set_value(html_content);
	});
    }
    
    return tpl_item.ui;
}


template_ui_builders.combo=function(ui_opts, combo){

    var ui=combo.ui=ce("select"); 
    combo.set_options=function(options){
	console.log("Setting options " + JSON.stringify(options));
	options.forEach(function(ov){
	    var o=cc("option",ui); o.value=ov; o.innerHTML=ov;
	});
    }
    new_event(combo,"change");
    ui.addEventListener("change",function(){
	combo.trigger("change",ui.selectedIndex);
    });
    
    if(typeof combo.options != 'undefined') 
	combo.set_options(combo.options);

    return ui;
}



template_ui_builders.action=function(ui_opts, action){
    
    var ui=action.ui=ce("button"); ui.type="button";
    ui.innerHTML=action.name;
    
    ui.className="btn btn-default";
    
    action.disable_element=function(dis){
	if(dis)
	    ui.setAttribute("disabled",true);
	else
	    ui.removeAttribute("disabled");
    }

    new_event(action,"click");

    if(è(action.onclick)) action.listen("click", action.onclick);
    
    ui.addEventListener("click",function(e){
	action.trigger("click", action);	    
    },false);

    action.listen("name_changed", function(title){
	ui.value=title;
    });
    /*    
	  var pmon=new proc_monitor;
	  action.ui_root.appendChild(pmon);
    */  
    if(è(action.elements)){
	
	action.ui_root.removeChild(action.ui_childs.div);
	if(è(action.ui_intro)) action.ui_root.removeChild(action.ui_intro);
	
	var slide_button=cc("span", action.ui_title_name);
	slide_button.style.zIndex=action.ui_root.style.zIndex+1;
	
	slide_button.className="slide_button h open";
	//slide_button.innerHTML= slided ? "❌" : "▶"; 
	//slide_button.innerHTML= "▶"; 
	var slided=false;
	var cnt=action.ui_name;

	action.ui_title_name.addEventListener("click",function(){
	    //slide_button.addEventListener("click",function(){
	    if(slided){
		//if(è(action.elements))
		if(è(action.ui_intro))cnt.removeChild(action.ui_intro);
		cnt.removeChild(action.ui_childs.div);
		cnt.removeChild(ui);
		slide_button.className="slide_button h open";
		//slide_button.innerHTML= "▶"; 
		
	    }else{
		//if(è(action.elements.ui))
		if(è(action.ui_intro))cnt.appendChild(action.ui_intro);
		cnt.appendChild(action.ui_childs.div);
		cnt.appendChild(ui);
		//slide_button.innerHTML= "❌";
		slide_button.className="slide_button h close";
	    }
	    slided=!slided;
	});
	
	
	//action_ui=true;
	//action_tpl=action.elements.ui;
	//    action_ui=create_ui({}, action_tpl );
	
    }else{
	//ui=action.ui=ce("input"); ui.type="button";
	
	if(action.ui_name!='undefined'){
	    action.ui_root.removeChild(action.ui_name);
	}
	
	return ui;
    }	
}

template_ui_builders.vector=function(ui_opts, tpl_item){

    //var ui=tpl_item.ui=ce("div"); ui.className="plot_container";
    
    //  var ui=tpl_item.ui=ce("ul");
    //  ui.className="vector";
    if(typeof tpl_item.value=='undefined'){
	tpl_item.value = [];
    }
    if(typeof tpl_item.step=='undefined'){
	tpl_item.step = 1;
    }
    if(typeof tpl_item.start=='undefined'){
	tpl_item.start = 0;
    }

    console.log("Building vector ");

    new_event(tpl_item,"range_change");
    new_event(tpl_item,"selection_change");
    
    var svg;
    var brush, select_brush;

    var selection=tpl_item.elements.selection;
    var range=tpl_item.elements.range;
    
    //range.set_value([tpl_item.min, tpl_item.max]);
    


    tpl_item.elements.zoom.listen("click",function(){
	var s=selection.value, r=range.value; 

	var sc=false;
	if(s[0]< r[0]){ s[0]=r[0];sc=true;}
	if(s[1]> r[1]){s[1]=r[1];sc=true;}

	tpl_item.trigger("range_change", r);
	if(sc)
	    tpl_item.trigger("selection_change", s);

    });


    tpl_item.elements.unzoom.listen("click",function(){
	if(è(tpl_item.min))
	    range.set_value([tpl_item.min, tpl_item.max]);
	else
	    range.set_value([tpl_item.start, 
			     tpl_item.start + tpl_item.value.length*tpl_item.step ]);

	console.log("unzoom to " + JSON.stringify(range.value) + " start = " + tpl_item.start);
	
	tpl_item.trigger("range_change", range.value);

    });
    
    tpl_item.listen("slided", function(){
	//tpl_item.elements.unzoom.trigger("click");
    });
    
    function get_x(id){
	return tpl_item.start + id*tpl_item.step;
    }
    
    tpl_item.set_selection=function(new_sel){
	selection.set_value(new_sel);
	if(è(select_brush))select_brush.extent(new_sel);
	
	var sv=selection.value;
	var selw=sv[1]-sv[0];
	
	var r=[sv[0]-selw, sv[1]+selw];	
	if(r[0]< get_x(0)) r[0]=get_x(0);
	if(r[1]> get_x(tpl_item.value.length-1)) r[0]=get_x(tpl_item.value.length-1)

	tpl_item.set_range(r);
	tpl_item.trigger("range_change", range.value);
	//tpl_item.elements.zoom.trigger("click");
	tpl_item.redraw();
    }
    
    tpl_item.set_range=function(new_range){
	range.set_value(new_range);
	if(è(brush))brush.extent(new_range);
    };


    function range_changed() {
	//svg.select(".brush").call(brush);
	
	range.value[0]=brush.extent()[0];
	range.value[1]=brush.extent()[1];
	range.set_value();
	//tpl_item.trigger("range_change", range.value);
	//	    fv.cmap.display();
    }

    
    function selection_changed() {
	//svg.select(".select_brush").call(select_brush);
	
	selection.value[0]=select_brush.extent()[0];
	selection.value[1]=select_brush.extent()[1];
	selection.set_value();
	tpl_item.trigger("selection_change", selection.value);
	//	    fv.cmap.display();
    }

    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };

    
    var ui=tpl_item.ui=ce("div");
    var bn=d3.select(ui);
    var brg=tpl_item.brg=null,select_brg=tpl_item.select_brg=null;
    var vw=600, vh=300;
    svg = bn.append('svg')
	.attr("viewBox", "0 0 "+vw+" "+vh)
	//.attr("preserveAspectRatio", "none");
	.attr("preserveAspectRatio", "xMinYMin meet");
    //base_node.appendChild(svg.ownerSVGElement);

    tpl_item.svg=svg.node(); //[0][0].ownerSVGElement;

    
    tpl_item.set_value=function(v){
	if(typeof v!='undefined'){
	    tpl_item.value=v;
	    if(range.value[0]==0 && range.value[1]==0){
		this.set_range([0,v.length-1]);
	    }
	}
	this.redraw();
    }
    
    tpl_item.redraw=function(){
	if(range.value[0]==null || range.value[1]==null) return;
	
	var margin = tpl_item.ui_opts.margin= {top: 12, right: 8, bottom: 25, left: 100}; //ui_opts.margin;
	//var width = tpl_item.parent.ui_root.clientWidth //ui_opts.width 
	var width=vw - margin.left - margin.right;
	var height = vh- margin.top - margin.bottom;

	var x = d3.scale.linear().range([0, width]).domain(range.value);
	var y = d3.scale.sqrt().range([height, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);    
	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

	brush = d3.svg.brush().x(x).on("brushend", range_changed);
	select_brush = d3.svg.brush().x(x).on("brush", selection_changed);

	console.log("Drawing vector N= " + this.value.length + "w,h=" + width + ", " + height + " rng="+JSON.stringify(range.value));
	

	var area = d3.svg.area().interpolate("step-before")
	    .x(function(d,i) { return x(tpl_item.start + i*tpl_item.step); })
	    .y0(height)
	    .y1(function(d) { return y(d); });
	
	svg.select("g").remove();
	var context = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var data=this.value;
	if(data.length==0){
	    console.log("No vector data !");
	    return;
	}
	
	x.domain(range.value);//
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	y.domain(d3.extent(data, function(d) { return d; }));
	
	
	
	var xsvg = context.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	
	xmarg=margin.left; //this.getBBox().x;
	ymarg=margin.top; //this.getBBox().x;
	
	xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    //xw=this.getBBox().width;
	});	       
	
	
	var ysvg=context.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("N");
	
	// ysvg.each(function(){
	// 		 console.log("YAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 	     });	       
	
	var pathsvg=context.append("path")
	    .datum(data)
	    .attr("class", "line")
	//.attr("d", line);
	    .attr("d", area);
	
	var height2=height/2.0;
	
	brg=context.append("g").attr("class", "brush").call(brush);
	brg.selectAll("rect").attr("y", height2).attr("height", height2 + 7);	
	brg.selectAll(".resize").append("path").attr("d", resizePath).attr("transform", "translate(0," + height2 + ")");
	
	brush.extent(range.value);

	
	
	select_brg=tpl_item.select_brg=context.append("g").attr("class", "select_brush").call(select_brush);
	select_brg.selectAll("rect").attr("y", -6).attr("height", height2);	
	select_brg.selectAll(".resize").append("path").attr("d", resizePath);

	select_brush.extent(selection.value);

	function resizePath(d) {
	    var e = +(d == "e"),
	    x = e ? 1 : -1,
	    y = height2 / 3;
	    
	    //brushed();
	    //x+=xmarg;
	    
	    return "M" + (.5 * x) + "," + y
		+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
		+ "V" + (2 * y - 6)
		+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
		+ "Z"
		+ "M" + (2.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8)
		+ "M" + (4.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8);
	}
	svg.select(".brush").call(brush);
	svg.select(".select_brush").call(select_brush);
	
    }

    if(è(tpl_item.value))
    	tpl_item.set_range([tpl_item.value[0],tpl_item.value[tpl_item.value.length-1]]);
    
    tpl_item.redraw();
    return tpl_item.ui;
}


template_ui_builders.color=function(ui_opts, tpl_item){
    
    var ui=tpl_item.ui=ce("div"); ui.className="color_container";
    var cui=ce("input"); cui.type="color";
    ui.appendChild(cui);

    new_event(tpl_item,"change");
    
    cui.addEventListener("change", function() {

        ui.style.backgroundColor = this.value;
	tpl_item.value=this.value;
	tpl_item.trigger("change", this.value);
    },false);

    ui.style.backgroundColor = cui.value;    
    
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;
	cui.value=tpl_item.value;
	ui.style.backgroundColor = nv;
	
	/*
	if ("createEvent" in document) {
	    var evt = document.createEvent("HTMLEvents");
	    evt.initEvent("change", false, true);
	    cui.dispatchEvent(evt);
	}
	else
	    cui.fireEvent("onchange");
	*/

	//cui.trigger(new Event('change'));
    }

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	break;
    case "edit": 
	/*
	cui.addEventListener("change",function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	*/
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return tpl_item.ui;
}

template_ui_builders.angle=function(ui_opts, tpl_item){
    return template_ui_builders.double(ui_opts, tpl_item);
}
