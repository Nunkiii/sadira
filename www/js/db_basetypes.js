template_ui_builders.dbtypes=function(ui_opts, dbt){

    for(var dt in template_ui_builders){
	var t=template_ui_builders[dt];
	var tple={ name : dt, ui_opts : { name_node : "h4"} };
	create_ui({},tple);
	dbt.ui_childs.add_child(tple,tple.ui_root);
    }
	
    
}

template_ui_builders.dbtemplates=function(ui_opts, dbt){
    var templ={name : "Tmaster :" ,elements: {}, ui_opts : { child_classes : ["container-fluid"]} };
    var ntpl=0;
    for(var tn in tmaster.templates){

	var t=tmaster.templates[tn];
	
	var tstring="<pre><code>"+JSON.stringify(t,null,10)+"</code></pre>";

	
	var te=templ.elements[tn]={
	    
	    name : t.name+" <span class='label label-default label-xs'>"+tn+"</span>",
	    ui_opts : { root_classes : ["panel panel-default"], name_node : "h3"},
	    elements : {
		code : {
		    name :"JSON template",
		    type : "html",
		    value : tstring,
		    ui_opts : { editable : true,sliding:true,slided:false, label : true, root_classes : ["inline"],
				highlight_source: true
			      }
	    },
	    tryi : {
		name : "Build here",
		type : "action",
		ui_opts: {item_classes : ["btn btn-info btn-xs"], root_classes : []},
		tn : tn
	    },
	    try : {
		name : "Try in new page...",
		type : "action",
		link : "/widget/"+tn,
		
		ui_opts: {item_classes : ["btn btn-info btn-xs"], root_classes : ["inline"]}
	    }
	} };
	
	if(è(t.tpl_builder)){
	    //console.log("Scanning " + tn + " builder " + t.tpl_builder);
	    var builder=template_ui_builders[t.tpl_builder];
	    if(ù(builder)){
		te.elements.builder={
		    name : "Invalid builder",
		    ui_opts : { label: true, name_classes : ["label label-danger"]}
		};	
	    }else{
		var fstring="<pre><code>"+builder.toString()+"</pre></code>";
		te.elements.builder_code={
		    name : "Builder JS code",
		    type : "html",
		    value : fstring,
		    ui_opts : {sliding : true, slided : false, label : true,	highlight_source: true}
		};
	    }
	}
	if(t.subtitle) te.subtitle=t.subtitle;
	if(t.intro) te.intro=t.intro;
	ntpl++;
    }

    templ.subtitle = ntpl + " templates in use : "
    create_ui({},templ);
    for(var t in templ.elements) {
	var tryi=templ.elements[t].elements.tryi;
	tryi.listen("click", function(){
	    var tt=tmaster.build_template(this.tn);
	    create_ui({},tt);
	    this.ui_root.appendChild(tt.ui_root);
	});
	var tico=get_ico(tmaster.templates[t]);
	if(ù(tico))
	    if(è(tmaster.templates[t].ui_opts)){
		if(è(tmaster.templates[t].ui_opts.fa_icon)){
		    tico=ce("span");
		    tico.className='fa fa-'+tmaster.templates[t].ui_opts.fa_icon;
		}
	    }
	
	if(è(tico)) templ.elements[t].ui_title_name.prependChild(tico);
	
    }
    
    dbt.ui_childs.add_child(templ,templ.ui_root);
}

template_ui_builders.sadira=function(ui_opts, sad){
  
    console.log("sadira link constructor !");
    
    var widget_prefix="widgets";
    var server_prefix="";
    
    new_event(sad,"socket_close");
    new_event(sad,"socket_error");
    new_event(sad,"socket_connect");
    
    //console.log("Building " + sad.name + " type " + sad.type); for(var e in sad) console.log("se " + e);
    //sad.value=get_server_address();
    
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

    //var ui=prog.ui=ce("div");
    //ui.className="progress";

    var pui=prog.ui=ce("div");
    pui.className="progress-bar";
    var ui=pui;
    if(typeof prog.value ==='undefined') prog.value=0.0;
    if(typeof prog.min ==='undefined') prog.min=0.0;
    if(typeof prog.max ==='undefined') prog.max=100.0;
    
    prog.setup_ui=function(){
	pui.setAttribute("role","progressbar");
	pui.setAttribute("aria-valuemin",prog.min);
	pui.setAttribute("aria-valuemax",prog.max);
    }

    prog.set_value=function(v){
	if(typeof v !=='undefined')
	    prog.value=v;
	if(isFinite(prog.value)){
	    pui.style.width=prog.value+"%";
	    pui.setAttribute("aria-valuenow",prog.value);
	    pui.innerHTML=prog.value+"%";
	}
    }
    prog.setup_ui();
    prog.set_value();
    
    return ui;
}

template_ui_builders.status=function(ui_opts, tpl_item){

    var ui=tpl_item.ui=ce("span");ui.add_class("status");
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
        ui.className="text-muted";
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
	ui.add_class("form-control input-sm");
	
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
    
    //ui.className="labelled_vector";
    tpl_item.inputs=[];
    
    //tpl_item.inputs[v].ui_root.remove_class("container-fluid");
    //tpl_item.ui_root.add_class("container");
    
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
	    ui_opts : { label : true, root_classes : ["inline"] }
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
	tpl_item.ui.appendChild(vui);
	
	tpl_item.inputs[v].parent={ui_childs : { replace_child : function(tpl_root){
	    console.log("Huuum");//tpl_item.ui.replaceChild(tpl_root, );
	}}};
	
	//tpl_item.inputs[v].ui_root.remove_class("container-fluid");
	//tpl_item.inputs[v].ui_root.add_class("col-md-6");

	
	tpl_item.inputs[v].listen("change",function(v){
	    tpl_item.value[this.id]=this.value;
	    //console.log("change triggered!");
	    tpl_item.trigger("change",this.id);
	});

	
	//tpl_item.ui_childs.add_child(tpl_item.inputs[v], vui);
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

    //var signup_act=local.elements.signup;
    var signup_status=local.elements.action_panel.elements.status;
    var signup_act=local.elements.action_panel.elements.signup;

    signup_status.ui_root.style.display="none";
    
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

    var config={
	allowPassphrases       : true,
	maxLength              : 128,
	minLength              : 8,
	minPhraseLength        : 20,
	minOptionalTestsToPass : 3,
    };
    
    if(è(signup.owasp_config)) for(var c in config_in) config[c]=signup.owasp_config[c];
    owaspPasswordStrengthTest.config(config); 

    /*
    var email_status = {
	type : "status",
	value : "blue",
	value_labels : { blue : "who knows", green : "valid", red : "invalid"},
	ui_opts : {item_classes : ["col-sm-2","control-label"]}
    };
    var pw_status = {
	type : "status",
	value : "red",
	value_labels : { green : "good", red : "not acceptable"},
	ui_opts : {item_classes : ["col-sm-2"]}
    };
    var pwr_status = {
	type : "status",
	value : "red",
	value_labels : { green : "match", red : "dont't match"},
	ui_opts : {item_classes : ["col-sm-2"]}
    };
    create_ui({}, email_status, signup.depth+1);
    create_ui({}, pw_status,signup.depth+1);
    create_ui({}, pwr_status,signup.depth+1);
    
    email.ui_root.appendChild(email_status.ui);
    pw.ui_root.appendChild(pw_status.ui);
    pwr.ui_root.appendChild(pwr_status.ui);

    */
    
    signup_act.ui.setAttribute("disabled",true); //add_class("masked");
    
    var fail_row=cc("div",pw.ui_root); fail_row.className="row";
    var pw_fail_reasons=cc("ul",fail_row);
    pw_fail_reasons.className="alert alert-danger list-unstyled col-sm-4 col-sm-offset-4";
    pw_fail_reasons.setAttribute("role","alert");
    pw_fail_reasons.style.display="none";
//    pw_fail_reasons.style.float="right";
    
    function check_everything_good(){
	if (email.status
		&& pw.status
		&& pwr.status
	   ){
	    signup_act.ui.removeAttribute("disabled");
	}else
	    signup_act.ui.setAttribute("disabled",true);
    }

    pw.status=false;	
    pwr.status=false;
    email.status=false;
    
    function set_status(o,st){
	o.status=st;
	if(st){
	    o.ui_root.add_class("has-success");
	    o.ui_root.remove_class("has-error");
	}else{
	    o.ui_root.add_class("has-error");
	    o.ui_root.remove_class("has-success");
	}
    }
    pw.pui.addEventListener("input", function(){
	
	pwr.set_value("");
	//pwr_status.set_value("red");
	var owasp_result = owaspPasswordStrengthTest.test(this.value);
	pw_fail_reasons.innerHTML="";
	if(owasp_result.strong){
	    set_status(pw,true);
	    pw_fail_reasons.style.display="none";
	}else{
	    set_status(pw,false);
	    pw_fail_reasons.style.display="";
	    for(var es=0;es<owasp_result.errors.length;es++){
		cc("li",pw_fail_reasons).innerHTML='<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> '+" "+
		    owasp_result.errors[es];
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
	    set_status(email,true);
	}
	else
	    set_status(email,false);

	check_everything_good();
	
    });

    pwr.pui.addEventListener("input", function(){
	if(this.value===pw.pui.value){
	    set_status(pwr,true);
	}
	else
	    set_status(pwr,false);

	check_everything_good();

    });

    function display_error_status(title, text){
	signup_status.ui_root.style.display="";
	signup_status.ui.className="alert alert-danger";
	signup_status.ui.innerHTML="<strong>"+title+"</strong><p>"+text+"</p>";
    }
    
    function display_info_status(title, text){
	signup_status.ui_root.style.display="";
	signup_status.set_title("Success !"); 
	signup_status.ui.className="alert alert-info alert-lg";
	signup_status.ui.innerHTML="<strong>"+title+"</strong><p>"+text+"</p>";
	
	data.ui_root.style.display="none";
	signup_act.ui_root.style.display="none";
    }

    signup_act.listen("click", function(){
	var post_data="email="+encodeURIComponent(email.ui.value)+"&hashpass="+encodeURIComponent(pw.pui.value);
	console.log("post data = "+ post_data);
	var rqinit=new request({ cmd : "/signup", data_mode : "json", method : "POST", post_data : post_data});
	
	rqinit.execute(function(error, res){

	    if(error)return display_error_status("HTTP request error :", error);

	    console.log("signup Reply : " + JSON.stringify(res));

	    if(è(res.error)){
		return display_error_status("Signup error : ", res.error);
	    }

	    return display_info_status("Welcome ! ", " <p>Your account was successfully created on this server.</p><p> You can now login with your credentials.</p>");
	    
	});
    });
	    
    //return ui;
}
/*
    <script>
    window.fbAsyncInit = function() {
	FB.init({
	    appId      : '1528834000739310',
	    xfbml      : true,
	    version    : 'v2.2'
	});
    };

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
</script>
*/

template_ui_builders.login=function(ui_opts, login){

    
    ///////////////////////////////////////////////////////////////
    //User Login/Logout stuff
    
    var user_tpl=login.elements.user;
    var pw_tpl=login.elements.password;
    var login_tpl=login.elements.login;
    var status_tpl=login.elements.status;

    var fb_login=login.elements.fb_login;
    
    user_tpl.ui.focus();
    pw_tpl.pui.add_class("input-sm");
    var user_name="", user_password="";
    var mode;

    if(ù(login.user_id))login.user_id="";
    console.log("LOGIN : " + login.user_id);
    
    
    function check(){
	login_tpl.disable(user_name==""||user_password=="");
    }

    function login_mode(){
	mode="login";
	login.set_title("Login");
	login_tpl.set_title("Log In");
	login_tpl.disable(true);
	status_tpl.ui_root.style.display="none";
	user_tpl.ui_root.style.display="";
	pw_tpl.ui_root.style.display="";
	check();
    }
    
    function register_mode(){
	mode="register";
	login_tpl.ui_root.style.display="none";
	status_tpl.ui_root.style.display="";
	user_tpl.ui_root.style.display="none";
	pw_tpl.ui_root.style.display="none";

    }
    
    function error_mode(err){
	mode="error";
	status_tpl.ui.className="label label-danger";
	status_tpl.set_value(err);
	login_tpl.ui_root.style.display="";
	login_tpl.set_title("Retry");
	login_tpl.disable(false);
    }

    function success_mode(info){
	mode="success";
	//status_tpl.ui.className="text-success";
	//status_tpl.set_value("Logged in as " + (è(info)?info:""));
	status_tpl.ui_root.style.display="none";
	user_tpl.ui_root.style.display="none";
	pw_tpl.ui_root.style.display="none";

	login.set_title("Logged in as " + login.user_id);

	
	login_tpl.set_title("Logout");
	login_tpl.ui.remove_class("btn-primary");
	login_tpl.ui.add_class("btn-warning");
	login_tpl.ui_root.style.display="";
	login_tpl.disable(false);
    }
    
    user_tpl.ui.addEventListener("input", function(v){
	user_name=this.value;
	check();
    });
    
    pw_tpl.pui.addEventListener("input", function(v){
	user_password=this.value;
	check();
    });
    
    login_tpl.listen("click",function(){
	switch(mode){
	case "login" :
	    console.log("Login " + user_name + " pw " + user_password);
	    register_mode();
	    var post_data="email="+encodeURIComponent(user_name)+"&hashpass="+encodeURIComponent(user_password);
	    //var post_data=encodeURIComponent("email="+user_name+"&hashpass="+user_password);
	    var rqinit=new request({ cmd : "/login", query_mode : "bson", method : "POST", post_data : post_data});
	    
	    rqinit.execute(function(error, res){
		
		if(error){
		    console.log("Error login " + error);
		    return;
		}
		
		if(è(res.error))
		    return error_mode(res.error);
		console.log("Received this " + JSON.stringify(res));
		login.user_id=res.user_id;
		success_mode();
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
	    break;
	case "error":
	    login_mode();
	case "success":
	    var rq=new request({ cmd : "/logout"});
	    rq.execute(function(error, res){
		if(error){
		    console.log("Error logout : " + error);
		    return;
		}
		
		if(è(res.error))
		    return error_mode(res.error);
		
		login_mode();
	    });
	    break;
	default:
	    break;
	    //query_login("what=login&u="+user_name+"&p="+user_password,result_cb);
	};
    });

    if(login.user_id===""){
	login_mode();
    }
    else{
	success_mode(login.user_id);
    }
    /*
    window.FB.getLoginStatus(function(response) {
	if (response.status === 'connected') {
	    // the user is logged in and has authenticated your
	    // app, and response.authResponse supplies
	    // the user's ID, a valid access token, a signed
	    // request, and the time the access token 
	    // and signed request each expire
	    console.log("Facebook user connected " + JSON.stringify(response));
	    var uid = response.authResponse.userID;
	    var accessToken = response.authResponse.accessToken;
	} else if (response.status === 'not_authorized') {
	    console.log("Facebook user connected and not authorized ! " + JSON.stringify(response));
	    // the user is logged in to Facebook, 
	    // but has not authenticated your app
	} else {
	    console.log("Facebook user NOT connected " + JSON.stringify(response));
	    // the user isn't logged in to Facebook.
	}
    });

    fb_login.listen("click", function(){

	window.FB.login(function(response) {
	    if (response.authResponse) {
		console.log('Welcome!  Fetching your information.... ');
		FB.api('/me', function(response) {
		    console.log('Good to see you, ' + response.name + '.');
		});
	    } else {
		console.log('User cancelled login or did not fully authorize.');
	    }
	});

    });
    
    window.FB.Event.subscribe('auth.authResponseChange', function(response) {
	
	if (response.status === 'connected') {
	    console.log("Authchange : Facebook user connected " + JSON.stringify(response));	    
	} 
	else {
	    console.log("Authchange : User disconnected fron FB!");
	    
	}
	
    });
*/
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
	    ui.innerHTML=tpl_item.value? "On":"Off";
	}
	break;
    case "edit": 
	//var lab=ce("label"); lab.innerHTML=tpl_item.name;
	//if(è(tpl_item.ui_name))
	//    tpl_item.ui_root.removeChild(tpl_item.ui_name);

	var ui=tpl_item.ui=ce("input");
	ui.type="checkbox";

	//tpl_item.ui_root.add_class("checkbox");
	//tpl_item.ui_root.appendChild(lab);
	
	
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

    return tpl_item.ui;
}


template_ui_builders.string=function(ui_opts, tpl_item){

    if(ù(ui_opts.type)) ui_opts.type="short";

    new_event(tpl_item,"change");

    switch (ui_opts.type){
	
    case "short":
	
	var ui=tpl_item.ui=ce(è(ui_opts.text_node)?ui_opts.text_node :"span");
	//ui.className="value";
	
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
    new_event(tpl_item,"change");
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

	var ui=tpl_item.ui=ce("div"); ui.className="input-group";
	var pui=tpl_item.pui=cc("input",ui);pui.className="form-control";
	var lab=cc("span",ui); lab.className="btn btn-info input-group-addon";
	lab.innerHTML="<span class='glyphicon glyphicon glyphicon-eye-close'></span>";//"⎃";
	//var show=cc("input",lab); show.type="checkbox";
	pui.type="password";
	//pui.className="form-control";
	pui.show=false;
	lab.onclick=function(){
	    pui.show=!pui.show;
	    pui.type= pui.show ? "text" : "password";
	    var eye=pui.show ? "open" : "close";
	    lab.innerHTML="<span class='glyphicon glyphicon glyphicon-eye-"+eye+"'></span>";//"⎃";
	    //console.log("pt = " + pui.type);

	}
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    pui.value=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return pui.value;
	}
	pui.addEventListener("change", function(){
	    tpl_item.value=this.value; 
	    tpl_item.trigger("change");
	});
	
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
	if(è(ui_opts.highlight_source))
	    if(ui_opts.highlight_source) hljs.highlightBlock(ui);
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

    tpl_item.set_value();
    
    return tpl_item.ui;
}

template_ui_builders.code=function(ui_opts, tpl_item){
    template_ui_builders.html(ui_opts, tpl_item);
    
}

template_ui_builders.combo=function(ui_opts, combo){

    var ui=combo.ui=ce("select"); ui.className="form-control";

    combo.set_options=function(options){
	combo.options=options;
	console.log("Setting options " + JSON.stringify(options));
	options.forEach(function(ov){
	    var o=cc("option",ui);
	    if(typeof ov == "string"){
		o.value=ov; o.innerHTML=ov;
	    }else{
		o.value=ov.value; o.innerHTML=ov.label;
	    }
	});
    }
    new_event(combo,"change");
    
    ui.addEventListener("change",function(){
	combo.value=combo.options[ui.selectedIndex];
	combo.trigger("change",ui.selectedIndex);
    });
    
    if(typeof combo.options != 'undefined'){
	combo.set_options(combo.options);
	combo.value=combo.options[0];
    }
    
    return ui;
}



template_ui_builders.action=function(ui_opts, action){
    
    var ui;

    if(è(action.link)){
	ui = ce("a");
	ui.href=action.link;

    }else{
	ui = ce("button");
	new_event(action,"click");
	ui.type="button";

	ui.addEventListener("click",function(e){
	    action.trigger("click", action);	    
	},false);
    }

    
    action.ui=ui;
    
    ui.innerHTML="";
    if(è(ui_opts.fa_icon)){
	console.log("Setting fa icon !! ");
	ui.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
    }
    ui.innerHTML+=action.name;

    if(ù(ui_opts.item_classes))
	ui.className="btn btn-default btn-sm";
    else
	if(è(ui_opts.wrap_classes)){
	    add_classes(ui_opts.item_classes, ui);
	    delete ui_opts.item_classes;
	}
    
    // if(è(ui_opts.btn_type))
    // 	ui.className+=" btn-"+ui_opts.btn_type;
    
    action.disable_element=function(dis){
	if(dis)
	    ui.setAttribute("disabled",true);
	else
	    ui.removeAttribute("disabled");
    }

    if(è(action.onclick)) action.listen("click", action.onclick);
    


    action.listen("name_changed", function(title){
	ui.textContent=title;
    });
    /*    
	  var pmon=new proc_monitor;
	  action.ui_root.appendChild(pmon);
    */  
    if(è(action.elements)){
	
	action.ui_root.removeChild(action.ui_childs.div);
	//if(è(action.ui_intro)) action.ui_root.removeChild(action.ui_intro);
	
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
	
	if(è(action.ui_title_name)){
	    if(action.ui_name!='undefined')
		;//action.ui_name.removeChild(action.ui_title_name);
	}
	if(è(action.ui_name))
	    action.ui_root.removeChild(action.ui_name);
    }	


    return ui;

}

template_ui_builders.vector=function(ui_opts, tpl_item){
    
    var selection=tpl_item.elements.selection;
    var range=tpl_item.elements.range;
    var lines=tpl_item.elements.lines;
    
    new_event(tpl_item,"range_change");
    new_event(tpl_item,"selection_change");

    var ui=tpl_item.ui=ce("div");
    var plots = tpl_item.plots=[];

    var brush, select_brush;
    
    
    var bn=d3.select(ui);//tpl_item.ui_childs.div);
    var vw=400, vh=200;
    var pr;
    
    var svg = bn.append('svg')
	.attr("viewBox", "0 0 "+vw+" "+vh)
    //.attr("preserveAspectRatio", "none");
	.attr("preserveAspectRatio", "xMinYMin meet");
    //base_node.appendChild(svg.ownerSVGElement);

    tpl_item.svg=svg.node(); //[0][0].ownerSVGElement;
    
    var margin = tpl_item.ui_opts.margin= {top: 12, right: 8, bottom: 25, left: 50}; //ui_opts.margin;
    //var width = tpl_item.parent.ui_root.clientWidth //ui_opts.width 
    var width=vw - margin.left - margin.right;
    var height = vh- margin.top - margin.bottom;
    var height2=height/2.0;

    var xr=[1e30,-1e30];
    var yr=[1e30,-1e30];

    console.log("Drawing vector w,h=" + width + ", " + height );
    
    var xscale = d3.scale.linear().range([0, width]);
    var yscale = d3.scale.linear().range([height, 0]);
    
    var xAxis = d3.svg.axis().scale(xscale).orient("bottom").ticks(5);    
    var yAxis = d3.svg.axis().scale(yscale).orient("left").ticks(5);
    
    brush = d3.svg.brush().x(xscale).on("brushend", range_changed);
    select_brush = d3.svg.brush().x(xscale).on("brush", selection_changed);

    tpl_item.set_value=function(v){
	if(typeof v!='undefined'){
	    tpl_item.value=v;
	    
	    if(plots.length==0){
		var start =tpl_item.start || 0;
		var step=tpl_item.step || 1;
		tpl_item.add_plot_linear(tpl_item.value, start, step);
		return;
	    }
	    
	    plots[0].data=tpl_item.value;
	    this.redraw();
	    // if(ù(pr))
	    // 	pr=context.append("path");
	    
	    // pr.datum(v)
	    // 	.attr("class", "line_black")
	    // 	.attr("d", tpl_item.line);
	    
	    //range.set_value([0,v.length-1]);
	    
	    //if(range.value[0]==null || range.value[1]==null){
		//this.set_range([0,v.length-1]);
	    //}

	    
	}
	
    }
    
    var zoom=tpl_item.elements.btns.elements.zoom;
    var unzoom=tpl_item.elements.btns.elements.unzoom;
    
    
    zoom.listen("click",function(){
	return;
	var s=selection.value, r=range.value; 

	var sc=false;

	if(s[0]< r[0]){ s[0]=r[0];sc=true;}
	if(s[1]> r[1]){s[1]=r[1];sc=true;}

	tpl_item.set_range(brush.extent());


	if(sc){
	    tpl_item.trigger("selection_change", s);
	}

    });


    unzoom.listen("click",function(){
	//brush.extent(range.value);
	//select_brush.extent(selection.value);
	

	//tpl_item.set_range(xr);

	// if(è(tpl_item.min))
	//     range.set_value([tpl_item.min, tpl_item.max]);
	// else
	//     range.set_value([tpl_item.start, 
	// 		     tpl_item.start + tpl_item.value.length*tpl_item.step ]);
	
	// console.log("unzoom to " + JSON.stringify(range.value) + " start = " + tpl_item.start);
	//tpl_item.trigger("range_change", range.value);
    });
    
    //tpl_item.listen("slided", function(){
	//tpl_item.elements.unzoom.trigger("click");
    //});
    
    
    tpl_item.set_selection=function(new_sel){
	selection.set_value(new_sel);
	if(è(select_brush))
	    select_brush.extent(new_sel);
	
	var sv=selection.value;
	var selw=sv[1]-sv[0];
	
	var r=[sv[0]-selw, sv[1]+selw];	

	if(plots.length>0){
	    function get_x(x){return plots[0].x(x);};
	    var d=plots[0].data.length;
	    if(r[0]< get_x(0))
		r[0]=get_x(0);
	    if(r[1]> get_x(d-1))
		r[0]=get_x(d-1)
	}

	tpl_item.trigger("selection_change", selection.value);
    }
    
    tpl_item.set_range=function(new_range){

	if(è(new_range))
	    range.set_value(new_range);
	
	if(è(brush))brush.extent(range.value);
	//tpl_item.trigger("range_change", range.value);
    };

    
    function range_changed() {
	range.set_value(brush.extent());

	/*
	range.value[0]=brush.extent()[0];
	range.value[1]=brush.extent()[1];
*/
    }

    
    function selection_changed() {
	//svg.select(".select_brush").call(select_brush);
	
	selection.set_value(select_brush.extent());
	tpl_item.trigger("selection_change", selection.value);
	//	    fv.cmap.display();
    }

    
    range.listen("change",function(){
	//console.log("Range changed!");
	//x.domain(range.value);
    });


    var config_range=tpl_item.config_range=function(){

	xr=[1e30,-1e30];
	yr=[1e30,-1e30];

	//console.log("NPL " +plots.length);
	
	for (var p=0;p<plots.length;p++){
	    var pl=plots[p];


	    if(pl.le.value){
		//for(var x in pl) console.log("PL " + x);
		var pll= pl.data.length;
		//console.log("PLL start " +pl.args[0] + ", step " + pl.args[1] );
		
		for(var j=0; j < pll ; j++){
		    var iy=pl.data[j];
		    var ix=pl.x(j);
		    if(iy<yr[0])yr[0]=iy;
		    if(iy>yr[1])yr[1]=iy;
		    
		    if(ix<xr[0])xr[0]=ix;
		    if(ix>xr[1])xr[1]=ix;
		}
	    }
	}
	
	//console.log("Config ranges : ["+xr[0]+","+xr[1]+" ]Y ["+yr[0]+","+yr[1]+"]");

	//xr=[0,24];
	if(xr[0]===1e30){
	    tpl_item.set_range([0,1]);
	    xscale.domain([0,1]);
	}else{
	    tpl_item.set_range(xr);
	    xscale.domain(xr);
	}
	if(yr[0]===1e30)
	    yscale.domain([0,1]);
	else
	    yscale.domain(yr);

	tpl_item.redraw();
	if(è(brush))brush.extent(range.value);
	if(è(select_brush))select_brush.extent(selection.value);
	
	return;
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	//if(è(tpl_item.y_range)){
	//     y.domain(tpl_item.y_range);
	// }else
	//     y.domain(yr); //d3.extent(data, function(d) { return d; }));
    }
    
    
	//xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    //xw=this.getBBox().width;
	//});	       
	

    
    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };

    
    tpl_item.redraw=function(){
	//console.log("redraw " + plots.length);
	if(range.value[0]==null || range.value[1]==null){
	    //this.set_range([0,this.value.length-1]);
	    //console.log("Vector : No range set !");
	    return;
	}

	var context;
	var brg=tpl_item.brg=null,select_brg=tpl_item.select_brg=null;

	svg.select("g").remove();
	context=tpl_item.context = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	var xsvg = context.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	var ysvg=context.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("N");

	xAxis.scale(xscale);
	yAxis.scale(yscale);

	xsvg.call(xAxis);
	ysvg.call(yAxis);

	
	// ysvg.each(function(){
	// 		 console.log("YAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 	     });	       
    
	
	
	// var pathsvg=context.append("path")
	//     .datum(data)
	//     .attr("class", "line_red")
	//     .attr("d", line);
	// //	    .attr("d", area);
	
	
    
	brg=context.append("g").attr("class", "brush").call(brush);
	brg.selectAll("rect").attr("y", height2).attr("height", height2 + 7);	
	brg.selectAll(".resize").append("path").attr("d", resizePath).attr("transform", "translate(0," + height2 + ")");
	
	select_brg=tpl_item.select_brg=context.append("g").attr("class", "select_brush").call(select_brush);
	select_brg.selectAll("rect").attr("y", -6).attr("height", height2);	
	select_brg.selectAll(".resize").append("path").attr("d", resizePath);
	
	svg.select(".brush").call(brush);
	svg.select(".select_brush").call(select_brush);
	
	for(var i=0;i<plots.length;i++) plots[i].redraw(context);
	
    }
    
    function xfunc_linear(id, start, step){
	return start + id*step;
    }
    
    var plot=function(data, xfunc, args){

	var p=this;

	p.data= data;
	p.xfunc=xfunc;
	//p.args=args;
	//args.unshift(0);
	p.args=[0];
	for(var i=0;i<args.length;i++) p.args.push(args[i]);
	p.x=function(id){
	    p.args[0]=id;
	    return p.xfunc.apply(p, p.args);
	}
	
	p.line=tpl_item.line=d3.svg.line()
	    .x(function(d,i) { return xscale(p.x(i)); })
	    .y(function(d) { return yscale(d); });
	//.interpolate("linear");

	p.set_opts=function(opts){
	    p.stroke=opts.stroke || "black";
	    p.stroke_width=opts.stroke_width || "1px";
	    p.fill=opts.fill || "none";
	    p.label=opts.label || ("Line " + (plots.length+1));

	    if(ù(p.le)){
		p.le={ type : "bool", value : true, name : p.label, ui_opts : {type: "edit", label : true, root_classes : ["inline"]} };
		create_ui({},p.le);
		lines.ui_childs.add_child(p.le,p.le.ui_root);
	    }
	}
	
	p.set_opts({});
	
	p.redraw=function(context){
	    //console.log("plot draw..." + p.label);
	    p.le.set_title(p.label);
	    
	    if(p.le.value && p.data.length!==0){
		p.path=context.append("path");
		p.path.attr("stroke", p.stroke);
		p.path.attr("stroke-width", p.stroke_width);
		p.path.attr("fill", p.fill);
		
		p.path.datum(p.data)
		//.attr("class", "line_black")
		    .attr("d", p.line);

		context.append("text")
		    .attr("transform", "translate(" + (3) + "," + yscale(p.data[0]) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .style("fill", p.stroke)
		    .text(p.label);
	    }
	}
    };
    
    tpl_item.add_plot=function(data, xfunc){
	var args=[];

	if(arguments.length>2){
	    for(var a=0;a<arguments.length;a++)
		args.push(arguments[a+2]);
	}

	var p=new plot(data, xfunc, args);

	console.log("Added plot DL=" + p.data.length + " NP="+plots.length);

	plots.push(p);
	config_range();
	return p;
    }
    
    
    tpl_item.add_plot_linear=function(data, start, step){
	return this.add_plot(data, xfunc_linear, start, step);
	
    }


    
    // if(typeof tpl_item.value=='undefined'){
    // 	tpl_item.value = [];
    // }
    
    
    
    
    // var area = d3.svg.area().interpolate("step-before")
    //     .x(function(d,i) { return x(tpl_item.start + i*tpl_item.step); })
    //     .y0(height)
    //     .y1(function(d) { return y(d); });
    
    
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

    
    // if( ù(tpl_item.y_range) && è(tpl_item.value))
    // 	tpl_item.set_range([tpl_item.value[0],tpl_item.value[tpl_item.value.length-1]]);
    

    if(è(tpl_item.value)){
	console.log("Add plot.....");

 	var start =tpl_item.start || 0;
	var step=tpl_item.step || 1;
	tpl_item.add_plot_linear(tpl_item.value, start, step);
    }


    
    
    return tpl_item.ui;
}


template_ui_builders.color=function(ui_opts, tpl_item){
    
    var ui=tpl_item.ui=ce("div"); ui.className="color_container";
    var cui=ce("input"); cui.type="color";
    ui.appendChild(cui);

    new_event(tpl_item,"change");
    
    cui.addEventListener("input", function() {
	
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
