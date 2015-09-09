function config_common_input(tpl_item){

    tpl_item.listen("disabled", function(disabled){
	if(disabled)
	    tpl_item.ui.setAttribute("disabled", true);
	else
	    tpl_item.ui.removeAttribute("disabled");
    });
    
    new_event(tpl_item,"change");



    switch (tpl_item.ui_opts.type){
    case "short":
	tpl_item.ui.add_class("control-label");
	break;
    case "edit": 
	tpl_item.set_placeholder_value=function(){
	    if(è(tpl_item.holder_value)){
		//console.log("Setting placeholder value");
		tpl_item.ui.setAttribute("placeholder",tpl_item.holder_value);
	    }
	}

	
	tpl_item.ui.addEventListener("change",function(){
	    tpl_item.set_value(this.value); 
	    
	    
	},false);

	tpl_item.ui_root.add_class('form-inline');
	
	break;
    default: break;
    };


    if(tpl_item.ui_opts.type === 'edit'){
	
//    if(tpl_item.get_value===undefined)
	tpl_item.get_value=function(){return tpl_item.value;}

//    if(tpl_item.set_value===undefined)
	tpl_item.set_value=function(nv){
  //console.log("input set value to " + nv);
	    if(è(nv)){
		var ch=(nv!=tpl_item.value);
		tpl_item.value=nv;
		if(ch)
		    tpl_item.trigger("change", tpl_item.value);
	    }
	    
	    if(è(tpl_item.value)){
		tpl_item.ui.value=tpl_item.value;
	    }
	    else
		if(è(tpl_item.set_placeholder_value))
		    tpl_item.set_placeholder_value();
	}
    
    }
    
    //if(tpl_item.set_default_value===undefined)
    tpl_item.set_default_value=function(){
	if(tpl_item.set_value!==undefined)
	    tpl_item.set_value(tpl_item.default_value);
    }
    
    //if(è(tpl_item.ui_name)) tpl_item.ui_name.add_class("control-label");
    
    if(è(tpl_item.value))
	tpl_item.set_value();
    else
	tpl_item.set_default_value();
    
}

template_ui_builders.array=function(ui_opts, arr){
    var ui;
    arr.set_value=function(obj){
	if(obj!==undefined){
	    if(obj.constructor===Array){
		arr.value=obj;
	    }else
		arr.value=JSON.parse(obj);
	}
	if(arr.value!==undefined){
	    if(ui_opts.type=='edit')
		ui.value=JSON.stringify(arr.value, null, 4);
	    else
		ui.innerHTML=JSON.stringify(arr.value, null, 4);
	}
    }

    if(ui_opts.type=='edit'){
	ui=ce('input'); ui.type='text'; ui.className="";
	
    }else{
	ui=ce('pre');
    }

    arr.set_value();

    return ui;
}


template_ui_builders.ui_demo=function(ui_opts, demo){
    
    var template=demo.get("template");
    var builder=demo.get("builder");
    var build=demo.get("build");
    var status=demo.get("status");
    var build_status=demo.get("build_status");
    var view=demo.get("view");

    var tpl_select=demo.get("tlist");
    var tpl_set=demo.get("tpl_set");

    view.set_title("No widget to show");
    
    tpl_set.listen("click", function(){
	var tpl_name=tpl_select.value;
	this.parent.debug("Applying template  " + tpl_name);
	if(è(template_ui_builders[tpl_name]))
	    builder.set_value(template_ui_builders[tpl_name].toString());
	else
	    builder.set_value("function(ui_opts, tpl){}");
	if(è(tmaster.templates[tpl_name]))
	    template.set_value(JSON.stringify(tmaster.templates[tpl_name],null,5));
	else
	    template.set_value("{}");
    });

    function clear_widget(w){
	view.set_title("No widget to show");
	if(è(w))
	    view.update_child(w, "userw");
    }
    
    build.listen("click",function(){

	var user_template, user_builder;
	var builder_code,template_code;

	builder_code="user_builder = " + builder.value;
	template_code="user_template="+template.value;

	try{
	    
	    eval(template_code);
	    try{
		eval(builder_code);
		try{
		    status.set_alert({ type : "success", content : "JS code compiled"});
		    template_ui_builders.hello=user_builder;
		    tmaster.set_template("hello", user_template);
		    clear_widget(create_widget("hello"));
		    build_status.set_alert({ type : "success", content : "Widget created"});
		}
		catch(e){
		    build_status.set_alert({type: "error", content : "Error widget creation : <pre>" + dump_error(e) + "</pre>"});
		}
		
	    }
	    catch(e){
		//console.log("E : " + dump_error(e));
		status.set_alert({type : "error", content : "Error compiling JS for builder : <pre>" + dump_error(e)+"</pre>"});
	    }
	}
	catch(e){
	    status.set_alert({type: "error", content : "Error compiling JS for template : <pre>" + dump_error(e)+"</pre>"});
	}
	//build.parent.debug("Eval [" + builder_code + "] tpl [" + template_code+"]");

	
	
    });
     
    
}


template_ui_builders.dbtypes=function(ui_opts, dbt){

    for(var dt in template_ui_builders){
	var t=template_ui_builders[dt];
	var fstring="<pre><code>"+t.toString()+"</pre></code>";
	var tple={
	    name : dt,
	    ui_opts : {
		name_node : "h4",
		root_classes : ["container-fluid panel panel-default"],
		child_classes : ["inline"]},
	    elements : {
		code : {
		    name :"JS builder",
		    type : "html",
		    value : fstring,
		    ui_opts : {
			editable : true,
			sliding:true,
			slided:false,
			label : true,
			root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
	};
	create_ui({},tple);
	dbt.ui_childs.add_child(tple,tple.ui_root);
    }
	
    
}

template_ui_builders.dbtemplates=function(ui_opts, dbt){
    var templ={name : "Tmaster :" ,elements: {}, ui_opts : { child_classes : ["container-fluid"]} };
    var ntpl=0;
    var build_progress=dbt.elements.build_progress;
    
    setTimeout(function(){
	var nt=0,ti=0;
	for(var tn in tmaster.templates) nt++;
	for(var tn in tmaster.templates){
	    ti++;
	    build_progress.set_value(ti*100.0/nt);
	    var t=tmaster.templates[tn];

	    var builder;
	    if(è(t.widget_builder)){
		//console.log("Scanning " + tn + " builder " + t.tpl_builder);
		builder=t.widget_tpl_builder;
	    }else
		builder=template_ui_builders[tn];	


	    var fsubt = t.name === undefined  ? "":t.name;
	    var te=templ.elements[tn]={
		name :" <span class='label label-default '>"+tn+"</span>",  
		subtitle : fsubt,
		ui_opts : { root_classes : ["container-fluid"],
			    child_view_type : 'tabbed',
			    fa_icon : 'code-fork'
			    //name_node : "h3",
			    //label :true
			  },
		toolbar : { ui_opts : { toolbar_classes : ""} },
		elements : {

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

	    
	    //var tstring="Helllooo"
	    if(t!={}){
		var tstring="<pre><code>"
		    + JSON.stringify(t,null,2)
		//		t.prototype.toSource()
		
		    +"</code></pre>";
		te.elements.code = {
		    name :"Template",
		    type : "text",
		    value : tstring,
		    ui_opts : {
			editable : false,sliding:false,slided:true, label : false, root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
		

		
	    if(è(builder)){
		fstring="<pre><code>"+builder.toString()+"</pre></code>";
		te.elements.bcode = {
		    name :"Constructor",
		    type : "text",
		    value : fstring,
		    ui_opts : {
			editable : false,sliding:false,slided:true, label : false, root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
	    
	    
	    
	    ntpl++;
	}
	
	templ.subtitle = ntpl + " templates in use : "

	create_widget(templ, dbt);
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
	build_progress.hide();

    }, 500);
}

template_ui_builders.socket=function(ui_opts, sad){
  
    //console.log("sadira link constructor !");
    
    
    new_event(sad,"socket_close");
    new_event(sad,"socket_error");
    new_event(sad,"socket_connect");

    
    var url=sad.elements.url;

    url.default_value=get_ws_server_address();
    url.set_default_value();
    
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
	connect.ui_opts.fa_icon="unlink";
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
	connect.ui_opts.fa_icon="link";
	connect.set_title("Connect");
    });
    
    connect.listen("click",function(){

	console.log("CONNECT CLICK");
	
	if(!sad.online){
	    sad.connect();
	}
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
    
    sad.connect=function(ecb){
	
	if(sad.online){
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
		sad.trigger("socket_error",estr); 
		if(è(ecb)) ecb(estr);
	    }
	    
	    wsock = new WebSocket(ws_host);
	    wsock.binaryType = "arraybuffer";
	    break;
	};

	sad.wsock=wsock;

	wsock.onclose = function (ev) {
	    //if(è(ecb)) ecb(JSON.stringify(ev));
	    sad.trigger("socket_close", this);
	    sad.online=false;
	};
	wsock.onopen = function () {
	    sad.trigger("socket_connect",this);
	    sad.online=true;
	};
	wsock.onerror = function (error) {
	    if(è(ecb)) ecb("wsock error : " + JSON.stringify(error));
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

	if(è(ecb)) ecb();
    }


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
    if(typeof prog.max ==='undefined') prog.value=0.0;
    
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
    //console.log(tpl_item.name + " : double builder :  " + JSON.stringify(ui_opts));

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    var ui;
    
    switch (ui_opts.type){
    case "short":
	ui=tpl_item.ui=ce("span");
        ui.className="text-muted";
	tpl_item.set_value=function(nv){
	    //console.log(tpl_item.name + " DOUBLE SHORT set value " + nv);
	    if(è(nv))
		tpl_item.value=nv; 
	    if(è(tpl_item.value))
		tpl_item.ui.innerHTML=Math.floor(tpl_item.value*1000)/1000;
	}
	ui.addEventListener("change",function(){
	    tpl_item.trigger("change", tpl_item.value);

	},false);
	break;

    case "edit": 

	ui=tpl_item.ui=ce("input");

	if(ui_opts.input_type)
	    ui.type=ui_opts.input_type;
	else
	    ui.type="number";

	ui.add_class("form-control");
	
	if(tpl_item.min!==undefined) ui.min=tpl_item.min;
	if(tpl_item.max!==undefined) ui.max=tpl_item.max;
	if(tpl_item.step!==undefined) ui.step=tpl_item.step;

	tpl_item.set_value=function(nv){

	    if(è(nv))
		tpl_item.value=nv; 
	    if(è(tpl_item.value))
		tpl_item.ui.value=tpl_item.value; //Math.floor(tpl_item.value*1000)/1000;
	}

	
	break;
    default: 
	throw "Unknown UI type " + ui_opts.type + " for " + tpl_item.name;
    }

    config_common_input(tpl_item);
    return ui;
}

template_ui_builders.labelled_vector=function(ui_opts, lvec){

    console.log(lvec.name + ' lvec builder ! val = ' + JSON.stringify(this.value));
    new_event(lvec,"change");
    
    //ui.className="labelled_vector";
    lvec.inputs=[];
    
    //lvec.inputs[v].ui_root.remove_class("container-fluid");
    
    var cdepth=lvec.depth? lvec.depth+1:1;
    if(lvec.value===undefined) lvec.value=[];
    if(lvec.value_labels===undefined) lvec.value_labels=[];

    lvec.clear_childs();
    var sub_type=lvec.vector_type ===undefined ? "double" : lvec.vector_type;

    for(var v=0;v<lvec.value_labels.length;v++){
	if(lvec.value[v] === undefined) lvec.value[v]=0;
	//var li=ce("li");
	var label=ce("label");
	//console.log("LV set " + v + " : "+ lvec.value[v] );

	var item_tpl={ 
	    id : v,
	    type : sub_type,
	    name : lvec.value_labels[v],
	    min : lvec.min, 
	    max : lvec.max, 
	    step : lvec.step, 
	    value : lvec.value[v],
	    ui_opts : {
		label : true,
		root_classes : ["inline btn btn-xs btn-default vertical_margin horizontal_margin"],
		editable : ui_opts.editable,
		type: ui_opts.type
	    }
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
	//var vui=create_ui(ui_opts, lvec.inputs[v]);
	
	lvec.inputs[v]=create_widget(item_tpl, lvec);
	//lvec.ui.appendChild(vui);
	//console.log("Adding input " + v + " : v="+lvec.inputs[v].value );
	lvec.add_child(lvec.inputs[v], lvec.value_labels[v]);

	
	
	// lvec.inputs[v].parent={ui_childs : { replace_child : function(tpl_root){
	//     console.log("Huuum");//lvec.ui.replaceChild(tpl_root, );
	// }}};
	
	//lvec.inputs[v].ui_root.remove_class("container-fluid");
	//lvec.inputs[v].ui_root.add_class("col-md-6");

	
	lvec.inputs[v].listen("change",function(v){
	    lvec.value[this.id]=this.value;
	    //console.log("change triggered!");
	    lvec.trigger("change",this.id);
	});
    }

    //lvec.ui_childs.div.add_class("inline");

    lvec.set_value=function(nv){
	

	if(typeof nv !='undefined'){

	    //console.log(lvec.name + " : TPLI set value " + JSON.stringify(nv));
	    this.value=nv;
	    var l=this.value.length;
	    var ll=this.value_labels.length;
	    
	    if(nv.length>ll){
		var lprefix=lvec.label_prefix!==undefined ? lvec.label_prefix : lvec.name; 
		for(var i=ll; i<nv.length;i++)
		    this.value_labels[i]=lprefix+'<sub>'+i+'</sub>';
		this.rebuild(); //lvec.trigger("change");
	    }else if(nv.length<ll){
		this.value_labels=this.value_labels.slice(0,nv.length);
		this.rebuild(); //lvec.trigger("change");
	    }else
		for(var v=0;v<this.inputs.length;v++){
		    //console.log("TPLI set value " + JSON.stringify(this.value[v]) + " on " + lvec.inputs[v].name );
		    lvec.inputs[v].set_value(this.value[v]);
		}	    
	}
	/*
	  
	*/
	
	//if(lvec.onchange) lvec.onchange();
	
	//ui.innerHTML=lvec.value? "yes":"no";
    }

    //console.log("Done building LABVEC : " + lvec.name);

    //return lvec.ui;
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
	var hp=sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(pw.pui.value));
	console.log("HASH PW is = ["+ hp + "]");
	
	var post_data="email="+encodeURIComponent(email.ui.value)+"&hashpass="+encodeURIComponent(hp);
	
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
    
    var user_tpl=login.get('user');
    var pw_tpl=login.get('password');
    var login_tpl=login.get('login');
    //var status_tpl=login.elements.status;
    
    //var fb_login=login.elements.fb_login;
    
    user_tpl.ui.focus();
    //pw_tpl.pui.add_class("input-sm");
    var user_name="", user_password="";
    var mode;


    login_tpl.parnode=login_tpl.item_ui.parentNode;
    
    if(ù(login.user_id))login.user_id="";
    //console.log("LOGIN : " + login.user_id);
    
    function check(){
	login_tpl.disable(user_name==""||user_password=="");
    }

    function login_mode(){
	mode="login";
	user_tpl.ui_root.remove_class("has-error");
	login_tpl.set_title("Log in");
	//login_tpl.set_title("Log In !");

	//status_tpl.ui.style.display="none";
	login.intro_div.className="text-muted";
	login.intro_div.innerHTML = "<p>Enter your username and password to log into Sadira</p>";
	show_input(true);
	
	login_tpl.parnode.appendChild(login_tpl.item_ui);
	
	check();
    }
    
    function register_mode(){
	mode="register";
	//login_tpl.ui_root.style.display="none";
	//status_tpl.ui.style.display="";
	//user_tpl.ui_root.style.display="none";
	//pw_tpl.ui_root.style.display="none";

    }

    function show_input(show){
	if(show){
	    user_tpl.ui_name.style.display="";
	    user_tpl.item_ui.style.display="";
	    pw_tpl.ui_name.style.display="";
	    pw_tpl.pui.style.display="";
	    pw_tpl.lui.style.display="";
	    
	    return;
	}
	//user_tpl.ui_root.style.border="2px solid green";


	user_tpl.ui_name.style.display="none";
	user_tpl.item_ui.style.display="none";
	pw_tpl.ui_name.style.display="none";
	pw_tpl.pui.style.display="none";
	pw_tpl.lui.style.display="none";


    }
    
    function error_mode(err){
	//console.log("Error mode!!!");
	mode="error";
	
	show_input(false);
	//status_tpl.ui_root.style.display="";
	user_tpl.ui_root.remove_class("has-success");
	user_tpl.ui_root.add_class("has-error");
	//status_tpl.ui.add_class("label-danger");
	//status_tpl.set_value(err);
	login_tpl.ui_root.style.display="";
	login.intro_div.className="alert alert-danger";
	login.intro_div.innerHTML = "<p><strong>Login error :</strong> " + err + "</p>";

	login.intro_div.appendChild(login_tpl.item_ui);
	login_tpl.set_title( "Retry !");
	login_tpl.disable(false);
    }

    function success_mode(info){
	
	mode="success";
	//status_tpl.ui.className="text-success";
	//status_tpl.set_value("Logged in as " + (è(info)?info:""));
	//user_tpl.ui_root.add_class("has-success");
	//status_tpl.ui_root.style.display="none";
	show_input(false);
	
	//login.set_title("Logged in as " + login.user_id);
	login.intro_div.innerHTML = "<p>You are logged in as <strong>" + window.sadira.user.id + " </strong></p>";
	
	login.intro_div.appendChild(login_tpl.item_ui);
	login_tpl.set_title("Logout");

	//login_tpl.hide(true);
	
	// login_tpl.ui.remove_class("btn-primary");
	// login_tpl.ui.add_class("btn-warning");
	// login_tpl.ui_root.style.display="";
	// login_tpl.disable(false);

    }
    
    user_tpl.ui.addEventListener("input", function(v){
	user_name=this.value;
	check();
    });
    
    pw_tpl.pui.addEventListener("input", function(v){
	user_password=this.value;
	check();
    });

    //var hh=new sjcl.hash.sha256();
    //hh.update("123");
    //var hhh=hh.finalize();
    //var hp=ab2b64(hh);
    //var hp = sjcl.codec.base64.fromBits(hhh);  
    //console.log("HH ["+hh+"] HP["+hp+"]");
    
    login_tpl.listen("click",function(){
	switch(mode){
	    
	case "login" :
	    
	    register_mode();
	    var hp=sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(user_password));
	    
	    user_password="*";
	    console.log("Login " + user_name + " hpw " + hp + " ...");
	    
	    var post_data = "email="+encodeURIComponent(user_name)+"&hashpass="+encodeURIComponent(hp);
	    //var post_data=encodeURIComponent("email="+user_name+"&hashpass="+user_password);
	    var rqinit    = new request({ cmd : "/login", query_mode : "bson", method : "POST", post_data : post_data});
	    
	    rqinit.execute(function(error, res){

		if(error){
		    console.log("Error login " + error);
		    return error_mode(error);
		}
		
		console.log("Received this " + JSON.stringify(res));
		
		if(è(res.error))
		    return error_mode(res.error);
		
		login.user_id=res.user.login_name;
		
		window.sadira.user = { id : login.user_id};
		window.sadira.trigger('user_login', window.sadira.user);

		
		//success_mode();
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
		else{
		    window.sadira.user={};
		    window.sadira.trigger('user_logout');
		}
		
		//login_mode();
	    });
	    break;
	default:
	    break;
	    //query_login("what=login&u="+user_name+"&p="+user_password,result_cb);
	};
    });

    window.sadira.listen('user_login', function(user){success_mode();});
    window.sadira.listen('user_logout', function(user){ login_mode();} );
    
    window.sadira.user ?  success_mode(): login_mode();
    
    // if(login.user_id===""){
    // 	login_mode();
    // }else{
    // 	success_mode(login.user_id);
    // }
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
	new_event(tpl_item, 'changed');


	var sp=cc("span", div); sp.className="btn btn-default btn-file";sp.innerHTML="Browse...";
	var ui=tpl_item.ui_input=cc("input",sp); 
	//ui.className="local_file";
	ui.type="file";

	tpl_item.ui.addEventListener("change",function(evt){
	    tpl_item.set_value(evt.target.files[0]);
	    tpl_item.size=evt.target.files[0].size;
	    sp.innerHTML=tpl_item.value.name;
	    tpl_item.trigger('change', evt);
	});

	// sp.addEventListener("change",function(evt){
	//     tpl_item.value=this.value;
	    
	// },false);

	    // if(tpl_item.onchange){
	    // 	tpl_item.onchange(evt);
	    // }
				    //}, false);

	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
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

    ui_opts.type=è(ui_opts.type) ? ui_opts.type : "short";
    ui_opts.name_after=true;
    
    new_event(tpl_item,"change");

    switch (ui_opts.type){
    case "short":
	var ui=tpl_item.ui=ce("span");
	//ui.className="value";
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

	    if(nv !== undefined){
		tpl_item.value=nv;
		tpl_item.trigger("change", tpl_item.value);
	    }
	    else
		if(tpl_item.value===undefined)
		    if(tpl_item.default_value!==undefined)
			tpl_item.value=tpl_item.default_value;
	    if(tpl_item.value===undefined)tpl_item.value=false;
	    ui.checked=tpl_item.value;
	}

	ui.addEventListener("change",function(){
	    tpl_item.set_value(this.checked); 
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
    var ui;

    switch (ui_opts.type){

    case "short":
	
	ui=tpl_item.ui=ce(è(ui_opts.text_node)?ui_opts.text_node :"span");
	//ui.className="value";
	//ui=document.createElement("div");
	//tpl_item.ui.innerHTML="CATSO!!!!!";
	//break;
	tpl_item.set_value=function(nv){

	    if(tpl_item.item_ui !== undefined)
		ui=tpl_item.item_ui;
	    
	    if(nv !==undefined)
		tpl_item.value=nv;

	    //console.log(tpl_item.name + " : STRING Set name to " +tpl_item.value);
	    //ui.innerHTML="MERDE!!!!!";
	    
	    if(tpl_item.value !== undefined){
		tpl_item.ui.innerHTML=tpl_item.value;
		//console.log("INH = " + tpl_item.ui.innerHTML);
		//tpl_item.set_title(tpl_item.value);
		//tpl_item.item_ui.innerHTML=tpl_item.value;
	    }
	    //else
	//	ui.innerHTML="Not defined !";
	}
	
	tpl_item.set_alert=function(m){
	    if(tpl_item.item_ui !== undefined) ui=tpl_item.item_ui;
	    
	    var t=m.type==="error"?"danger":m.type;
	    ui.className="";
	    
	    if(è(ui_opts.item_classes))
		add_classes(ui_opts.item_classes, ui);
	    ui.add_class("alert-"+t);
	    
	    tpl_item.set_value(//tpl_item.value +
		"<strong>"+m.type+" :</strong>"+m.content+"<br/>");
	    //tpl_item.set_value(m.type+" :"+m.content);
	}

	break;

    case "edit":
	
	//var uui=ui=ce("div");
	
	ui=ce("input");
	ui.type="text";
	ui.className="form-control";
	
	ui.addEventListener("input",function(){
	    console.log("INPUT Event ont text");
	    tpl_item.set_value(this.value); 
	    
	},false);

	ui.addEventListener("keydown",function(e){
	    
	    if(e.keyCode == 13){
		console.log("Helloooo !");
		e.preventDefault();
		tpl_item.set_value(this.value);
		if(ui_opts.editable !== undefined){
		    console.log("Helloooo EDIT !");
		    tpl_item.ui_opts.type="short";
		    tpl_item.rebuild();
		}
		return false;
	    }
	});

	
	
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    tpl_item.ui=ui;
    config_common_input(tpl_item);
    
    return tpl_item.ui;
}


template_ui_builders.text=function(ui_opts, tpl_item){

    var div=tpl_item.ui=ce("div");
    var ui=tpl_item.preui=cc("pre",div);
    //ui.innerHTML="Hello!!!!!!!!!!!!!!"
    ui.add_class("text");

    tpl_item.set_value=function(nv){
	
	if(typeof nv !='undefined')
	    this.value=nv;
	
	//console.log("HTML text to " + this.value + " ui is " + ui);
	
	if(typeof this.value !== 'undefined')
	    tpl_item.preui.innerHTML=this.value;
    }
    
    tpl_item.append=function(txt){
	if(typeof this.value === 'undefined')
	    this.set_value(txt);
	else{
	    
	    this.value+=txt;
	    this.set_value();
	}
	this.ui.scrollTop = this.ui.scrollHeight;
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
    //console.log(tpl_item.name + " building ....");

    var ui;
    switch (ui_opts.type){

    case "short":

	ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
	    if(typeof tpl_item.value !== 'undefined')
		ui.innerHTML=tpl_item.value;
	}
	break;

    case "edit":
	var cnt;
	if(ui_opts.wrap){
	    ui=ce("div");
	    ui.className="input-group";
	    cnt=ui;
	 }else{
	     cnt=tpl_item.ui_root;
	 }
	
	var pui=tpl_item.pui=cc("input",cnt);
	var lab=tpl_item.lui=cc("span",cnt); lab.className="btn btn-info input-group-addon";
	lab.innerHTML="<span class='glyphicon glyphicon glyphicon-eye-close'></span>";//"⎃";
	//var show=cc("input",lab); show.type="checkbox";
	pui.className="form-control";
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
	    if(typeof nv !='undefined'){
		tpl_item.value=nv;
		pui.value=tpl_item.value;
	    }
	    else
		if(è(tpl_item.holder_value)){
		    //console.log("Setting placeholder value");
		    pui.setAttribute("placeholder",tpl_item.holder_value);
		}
	    
	    
	}
	tpl_item.get_value=function(){
	    return pui.value;
	}
	pui.addEventListener("change", function(){
	    tpl_item.value=this.value; 
	    tpl_item.trigger("change");
	});
	
	tpl_item.set_value();
	
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return ui;
}


template_ui_builders.date=function(ui_opts, date){

    date.ui= ui_opts.type==='edit' ? ce("input") : ce("span");
    date.ui.type="date";

    date.set_value=function(nv){
	if(nv !==undefined)
	    date.value=nv;
	
//	console.log("SETTING DATE " + date.value);
	//date.ui.innerHTML="Hello World!!!";
	if(date.value!==undefined){
	    if(ui_opts.type!=='edit')
		date.ui.innerHTML=date.value.toLocaleString();
	    else
		date.ui.value=date.value;
	}
    }
    
    config_common_input(date);
    

    return date.ui;
}


template_ui_builders.url=function(ui_opts, url){
    
    //console.log("building URL " + url.name + " : " + url.value);
    var ui;

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    switch (ui_opts.type){

    case "short":
	ui=url.ui=ce("a");
	//ui.className="value";
	url.set_value=function(nv){
	    if(typeof nv !='undefined')
		url.value=nv;
	    if(typeof url.value !=='undefined'){
		ui.href=url.value;
		ui.innerHTML="<span class='fa fa-external-link'> </span>" + url.value;
	    }
	}
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
	    ui.className="form-control";
	}
	
	break;
    default: 
	throw "Unknown UI type ";
    }

    config_common_input(url);

    
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

template_ui_builders.marked=function(ui_opts, tpl_item){
    //var marked = require('marked');
    console.log(marked('I am using __markdown__.'));

    tpl_item.set_value("<h1>Hello World!</h1>");
}

template_ui_builders.html=function(ui_opts, tpl_item){

    var ui=tpl_item.ui=ce("div");
    
    //ui.className="html_content";
    
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;

	
	if(tpl_item.item_ui !== undefined) ui=tpl_item.item_ui; else return;

	ui.innerHTML=tpl_item.value;
	if(è(ui_opts.highlight_source))
	    if(ui_opts.highlight_source) hljs.highlightBlock(ui);
    }
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    if(ui_opts.type==="edit"){
	ui.setAttribute("contentEditable", true);
	//tpl_item.set_value("<pre><code>"+tpl_item.value+"</code></pre>");
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

    var ui=tpl_item.ui=ce("pre");
    //ui.className="html_content";
    
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;
	//ui.innerHTML="<code>"+tpl_item.value+"</code>";
	//if(ui.innerHTML!=tpl_item.value)
	ui.innerHTML=tpl_item.value;

    }
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    if(ui_opts.type==="edit"){
	new_event(tpl_item,"change");

	ui.setAttribute("contentEditable", true);
	ui.setAttribute("spellCheck",false);
	ui.addEventListener("input", function(){
	    //tpl_item.debug("Changed !!! [" + ui.innerHTML + "]");
	    tpl_item.value=ui.innerHTML;
	    if(è(ui_opts.highlight_source))
		;//if(ui_opts.highlight_source) hljs.highlightBlock(ui);
	    
	    //tpl_item.trigger("change");
	})
    }
    
    if(tpl_item.url){
	download_url(tpl_item.url,function(error, html_content){
	    tpl_item.set_value(html_content);
	});
    }

    tpl_item.set_value();
    
    return tpl_item.ui;

}

template_ui_builders.combo=function(ui_opts, combo){
    
    var ui;
    var style=ui_opts.style||"select",ul;
    ui_opts.type='edit';
    
    
    //new_event(combo,"change");
    
    //    if(ui_opts.type==="edit"){
    //console.log("Style " + style);
    
    
    if(style==="menu"){
	ui=combo.ui=ce("div"); ui.className="dropdown";
	var a=cc("a",ui);
	a.className="btn btn-default";
	a.id="dLabel";
	//a.setAttribute("type","button");
	a.setAttribute("data-toggle","dropdown");
	a.setAttribute("aria-haspopup",true);
	a.setAttribute("expanded",false);
	a.innerHTML="Dropdown trigger<span class='caret'></span>";
	var ul=cc("ul",ui);
	ul.className="dropdown-menu";
	a.setAttribute("role","button");
	a.setAttribute("aria-labelledby","dLabel");
    }
    else{
	ui=combo.ui=ce("select"); ui.className="form-control";
	
	//ui.addEventListener('change', function(c){
	//combo.set_value(this.value);
	//combo.trigger('change', combo.value);
	//},false);
	
    }
    
    combo.set_options=function(options){
	
	if(options!==undefined)combo.options=options;
	//console.log(this.name + " Setting options " + JSON.stringify(options));
	if(combo.options===undefined) return;
	//combo.parent.debug(combo.name + " style "+style+" : Setting options :" + JSON.stringify(combo.options));
	//combo.ui.innerHTML="SETTING UP";
	combo.options.forEach(function(ov){
	    var o;
	    if(style==="menu"){
		var l=cc("li",ul); o=cc("a",l);
		if(typeof ov === "string"){
		    o.innerHTML=ov; o.id=ov;
		}else{
		    o.id=ov.value; o.innerHTML=ov.label;
		}
	    }else{
		var o=ov.option_ui=cc("option",ui);
		
		if(typeof ov === "string"){
		    o.value=ov; o.innerHTML=ov;
		}else{
		    o.value=ov.value; o.innerHTML=ov.label;
		}
		
	    }
	});
	
	if(combo.options.length>0){
	    combo.set_value(combo.options[0].label);
	    if(combo.options[0].option_ui!==undefined)
		combo.options[0].option_ui.setAttribute("selected",true);
	}
	
    }
    

	
    // }else{
    // 	ui=combo.ui=ce("span");
    // 	ui.className="";
    // }

    
    // combo.set_holder_value=function(v){
    // 	combo.set_value(v);
    // }
    
    // combo.set_value=function(v){
    // 	if(è(v))combo.value=v;
    // 	combo.ui.value=v;
    // 	/*
    // 	else{
    // 	    if(è(combo.options))
    // 		if(combo.options.length>0)
    // 		    combo.value=combo.options[0];
    // 		    }*/
	
    // 	ui.innerHTML=combo.value;
    // }


    config_common_input(combo);
    
    combo.set_default_value=function(){
	if(è(combo.default_value)) return combo.set_value(combo.default_value);

	if(è(combo.options))
	    if(combo.options.length>0)
		return combo.set_value(combo.options[0].value);

	if(è(combo.holder_value)) combo.set_holder_value(combo.holder_value);
    }	

    combo.set_options();
    //combo.set_default_value();
    return ui;
}

template_ui_builders.template_list=function(ui_opts, combo){
    combo.options=[];
    for(var tn in tmaster.templates){
	var t=tmaster.templates[tn];
	var label="";

	/*
	var ico=get_ico_string(t);
	if(è(ico))
	    label+=ico;
	else
	    if(è(t.ui_opts) && è(t.ui_opts.fa_icon))
		label+='<span class="fa fa-'+t.ui_opts.fa_icon+'"> </span>';
	*/
	label+="<span>"+ (è(t.name) ? ("["+tn+"]"+t.name ): tn)+"</span>";
	combo.options.push({value: tn,label : label});
    }    
    return template_ui_builders.combo(ui_opts, combo);
}


template_ui_builders.action=function(ui_opts, action){
    
    var ui;
    var bnode=è(ui_opts.button_node) ? ui_opts.button_node : "button";
    
    if(è(action.link)){
	
	ui = ce("a");
	ui.href=action.link;

    }else{
	
	ui = ce(bnode);

	new_event(action,"click");

	if(bnode === 'input' || bnode === 'button')
	    ui.type="button";
	
	ui.addEventListener("click",function(e){
	    action.trigger("click", action);	    
	},false);
    }

    
    action.ui=ui;
    

    if(ù(ui_opts.item_classes))
	ui.className="btn btn-default btn-sm";
    else
	if(è(ui_opts.wrap_classes)){
	    add_classes(ui_opts.item_classes, ui);
	    delete ui_opts.item_classes;
	}

    ui.innerHTML="";
    if(è(ui_opts.fa_icon)){
	//console.log("Setting fa icon !! ");
	if(bnode!=="span")
	    ui.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
	else
	    ui.add_class("fa fa-"+ui_opts.fa_icon);
    }
    ui.innerHTML+=action.name;
    
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
	ui.innerHTML="";
	if(è(ui_opts.fa_icon)){
	    //console.log("Setting fa icon !! ");
	    ui.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
	}
	ui.innerHTML+=action.name;
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
	    if(action.ui_name!==undefined)
		;//action.ui_name.removeChild(action.ui_title_name);
	}
	
	if(action.ui_name !== undefined){
	    if(action.ui_name.parentNode===action.ui_root)
		action.ui_root.removeChild(action.ui_name);
	}
    }	


    return ui;

}

template_ui_builders.vector=function(ui_opts, vec){

//    console.log("Building vec : " + vec.name + " parent " + vec.parent.name + " value length =  " + vec.value.length);
    
    
    var lines=vec.get("lines");
    var ui=vec.ui=ce("div");
    

    var brush, select_brush;

//    vec.value=[];    
    vec.plots=[];

    
    var bn=d3.select(ui);//vec.ui_childs.div);
    var vw=vec.vw=400, vh=vec.vh=180;
    var pr;
    
    var svg = vec.svg=bn.append('svg')
	.attr("viewBox", "0 0 "+vw+" "+vh)
	.attr("preserveAspectRatio", "none");
//	.attr("preserveAspectRatio", "xMinYMin meet");
    //base_node.appendChild(svg.ownerSVGElement);

    vec.svg_node=svg.node(); //[0][0].ownerSVGElement;
    
    var margin = vec.ui_opts.margin= {top: 12, right: 8, bottom: 25, left: 50}; //ui_opts.margin;
    //var width = vec.parent.ui_root.clientWidth //ui_opts.width 
    var width=vec.width=vw - margin.left - margin.right;
    var height =vec.height= vh- margin.top - margin.bottom;
    var height2=height/2.0;

    var xr=vec.xr=[1e30,-1e30];
    var yr=vec.yr=[1e30,-1e30];

    //console.log("Drawing vector w,h=" + width + ", " + height );
    
    var xscale = vec.xscale=d3.scale.linear().range([0, width]);
    var yscale = vec.yscale=d3.scale.linear().range([height, 0]);
    
    var xAxis = d3.svg.axis().scale(xscale).orient("bottom").ticks(5);    
    var yAxis = d3.svg.axis().scale(yscale).orient("left").ticks(5);


    var range=vec.get("range");

    if(ui_opts.enable_range===false)
	range.hide(true);
    else{
	brush = d3.svg.brush().x(xscale).on("brushend", range_changed);
	new_event(vec,"range_change");
    }
    
    var selection=vec.get("selection");
    if(ui_opts.enable_selection===false)
	selection.hide(true);
    else{
	new_event(vec,"selection_change");
	select_brush = d3.svg.brush().x(xscale).on("brush", selection_changed);
    }


    var d3zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
        .on("zoom",function(){
	    //console.log("Zooom " + JSON.stringify(d3.event));
	    range.set_value([d3.event.translate[0], d3.event.translate[1], d3.event.scale]);
	    vec.redraw();

	})
	// .on("zoom", function(){
	//     console.log("ZOOOOOOM !!!");
	// })
    ;
    
    var zoom_rect=vec.svg.append("rect")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")	
    //.attr("transform", "translate(0," + height + ")")
	.attr("class", "pane")
	.attr("width", width)
	.attr("height", height)
	.call(d3zoom);

    

    // var zzoom = d3.behavior.zoom()
    //     //.x(x)
    //     .xExtent([-2000,2000])
    //     //.y(y)
    //     .yExtent([-1500,1500])
    //     .scaleExtent([0.1, 10]);
    
    
    new_event(vec,'redraw');

    vec.xlabel="X";
    vec.ylabel="Y";
    
    vec.serialize=function(){
	var v=[];
	vec.value.forEach(function(p){
	    v.push({ data : p.data, args: p.args, opts: p.opts}  );
	});
	return v;
    }

    vec.deserialize=function(v){
	vec.value=vec.plots=[];
	lines.elements={};
	if(lines.ui_childs!==undefined && lines.ui_childs.div!==undefined)
	    lines.ui_childs.div.innerHTML="";
	
	v.forEach(function(p){
	    //var args=p.args;
	    //args.unshift(
	    //console.log(vec.name + " : deserialize new plot .... nplots="+vec.value.length );
	    var pp=vec.add_plot_linear(p.data,0,1);
	    if(è(p.opts))
		pp.set_opts(p.opts);

	    //vec.ui_root.innerHTML+="<h2>SPEC</h2>"+JSON.stringify(pp.data, null, 3) + " <h4>opts</h4>" + JSON.stringify(p.opts, null, 3);
	});

	vec.redraw();
	vec.config_range();
    }
    
    vec.set_value=function(v){
	if(v!==undefined){

	    console.log("Vector set val " + v.length + " ==? " + ( v===vec.value) + " TYPE  " + typeof(v[0]) + " cons  ");
	    //vec.value=v;
	    var plots = vec.value;
	    //console.log("Vector set value to " + JSON.stringify(value));
	    if(v.length===undefined){
		console.log("Data is not a vector!");
		return;
	    }

	    if(v.length===0){
		console.log("Data is null size vector!");
		return;
	    }

	    if(typeof v[0] =='number'){
		console.log("Setting raw data points from value..." + v.length);
		var dta=v.slice();
		console.log("Setting raw data points from value..." + v.length + " dta " + dta.length);
		vec.value=[];
		console.log("Setting raw data points from value..." + v.length + " dta " + dta.length);
		v=dta;
		console.log("Setting raw data points from value..." + v.length);
		
	    }
	    
	    if(vec.value.length==0){
		var start =vec.start || 0;
		var step=vec.step || 1;
		vec.add_plot_linear(v, start, step);
		//return;
	    }

	    this.config_range();
	    // if(ù(pr))
	    // 	pr=context.append("path");
	    
	    // pr.datum(v)
	    // 	.attr("class", "line_black")
	    // 	.attr("d", vec.line);
	    
	    //range.set_value([0,v.length-1]);
	    
	    //if(range.value[0]==null || range.value[1]==null){
		//this.set_range([0,v.length-1]);
	    //}

	    
	}
	
    }
    
    // var zoom=vec.get('zoom');
    // var unzoom=vec.get('unzoom');
    
    
    // zoom.listen("click",function(){
    // 	//return;
    // 	var s=selection.value, r=range.value; 

    // 	// var sc=false;

    // 	// if(s[0]< r[0]){ s[0]=r[0];sc=true;}
    // 	// if(s[1]> r[1]){s[1]=r[1];sc=true;}

    // 	//vec.set_range(brush.extent());
    // 	console.log("Set range to " + r[0] + ", " + r[1]);

    // 	xscale.domain(r);
    // 	vec.redraw();
    // 	if(è(brush))brush.extent(r);

    // 	//vec.set_range(r);
	

    // 	// if(sc){
    // 	//     vec.trigger("selection_change", s);
    // 	// }

    // });


    // unzoom.listen("click",function(){
    // 	//brush.extent(range.value);
    // 	//select_brush.extent(selection.value);
	

    // 	//vec.set_range(xr);

    // 	// if(è(vec.min))
    // 	//     range.set_value([vec.min, vec.max]);
    // 	// else
    // 	//     range.set_value([vec.start, 
    // 	// 		     vec.start + vec.value.length*vec.step ]);
	
    // 	// console.log("unzoom to " + JSON.stringify(range.value) + " start = " + vec.start);
    // 	//vec.trigger("range_change", range.value);
    // });
    
    // //vec.listen("slided", function(){
    // 	//vec.elements.unzoom.trigger("click");
    // //});
    
    
    vec.set_selection=function(new_sel){
	selection.set_value(new_sel);
	if(è(select_brush))
	    select_brush.extent(new_sel);
	
	var sv=selection.value;
	var selw=sv[1]-sv[0];
	
	var r=[sv[0]-selw, sv[1]+selw];	
	var plots=vec.value;
	
	if(plots!==undefined && plots.length>0){
	    function get_x(x){return plots[0].x(x);};
	    var d=plots[0].data.length;
	    if(r[0]< get_x(0))
		r[0]=get_x(0);
	    if(r[1]> get_x(d-1))
		r[0]=get_x(d-1)
	}

	vec.trigger("selection_change", selection.value);
    }
    
    // vec.set_range=function(new_range){

    // 	if(è(new_range))
    // 	    range.set_value(new_range);
	
	
    // 	//vec.trigger("range_change", range.value);
    // };

    
//     function range_changed() {
// 	range.set_value(brush.extent());

// 	/*
// 	range.value[0]=brush.extent()[0];
// 	range.value[1]=brush.extent()[1];
// */
//     }

    
    function selection_changed() {
	//svg.select(".select_brush").call(select_brush);
	
	selection.set_value(select_brush.extent());
	vec.trigger("selection_change", selection.value);
	//	    fv.cmap.display();
    }

    
    // range.listen("change",function(){
    // 	//console.log("Range changed!");
    // 	//x.domain(range.value);
    // });


    vec.config_range=function(xconf, yconf){
	if(xconf===undefined) xconf=true;
	if(yconf===undefined) yconf=true;
	
	var plots = vec.value;

	if(plots===undefined) return;
	
	xr=vec.xr=[1e30,-1e30];
	yr=vec.yr=[1e30,-1e30];

	
	
	for (var p=0;p<plots.length;p++){
	    var pl=plots[p];
	    
	    //console.log("Config Range : plot "+p+" ND " +plots[p].data.length);
	    
	    if(pl.le.val('enable')){
		//for(var x in pl) console.log("PL " + x);
		var pll= pl.data.length;
		//console.log("PLL start " +pl.args[0] + ", step " + pl.args[1] );
		
		for(var j=0; j < pll ; j++){
		    var iy,ix;
		    if(pl.x!==undefined){
			iy=pl.data[j];
			ix=pl.x(j);
		    }else{
			ix=pl.data[j][0];
			iy=pl.data[j][1];
		    }

		    if(iy<yr[0])yr[0]=iy;
		    if(iy>yr[1])yr[1]=iy;
		    
		    if(ix<xr[0])xr[0]=ix;
		    if(ix>xr[1])xr[1]=ix;
		}
	    }
	}
	
	

	//xr=[0,24];
	
	if(xconf){

	    if((xr[1]-xr[0]) == 0 || xr[0]==1e30 || xr[1]==-1e30){
		xr[0]=0;xr[1]=1.0;
	    }
	    
	    //vec.set_range(xr);
	    xscale.domain(xr);
	    
	    //console.log("Config zoom " + JSON.stringify(xscale.domain()));
	    d3zoom.x(xscale);
	    //for(var p in d3zoom) console.log(" P = " + p + " type " + typeof d3zoom[p]);
	    d3zoom.xExtent(xr);
	    
	    
	    selection.set_value(xr);
	    
	    if(è(brush))brush.extent(range.value);
	    if(è(select_brush)){
		select_brush.x(d3zoom.x());
		//select_brush.y(d3zoom.y());
		select_brush.extent(selection.value);
	    }
	    
	}

	if(yconf){
	    if((yr[1]-yr[0])==0 || yr[0]==1e30 || yr[1]==-1e30){
		yr[0]=0;yr[1]=1.0;
	    }
	    yscale.domain(yr);
	}
	
	vec.redraw();

	//console.log("Config ranges : ["+xr[0]+","+xr[1]+" ]Y ["+yr[0]+","+yr[1]+"]");
	
	
	return;
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	//if(è(vec.y_range)){
	//     y.domain(vec.y_range);
	// }else
	//     y.domain(yr); //d3.extent(data, function(d) { return d; }));
    }
    
    
	//xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    //xw=this.getBBox().width;
	//});	       
	

    
    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };


    if(ui_opts.show_cursor){
	console.log("Create cursor UI....");
	
	var cursor=create_widget({ name : "Cursor ",
				   type : "labelled_vector", value : [0,0],
				   value_labels : ["C<sub>X</sub>","C<sub>Y</sub>"],
				   ui_opts : {
				       label : true, root_classes : ["container-fluid"],
				       child_classes : ["inline"]
				   }
				 });

	vec.get('btns').add_child(cursor);
	
	new_event(vec, 'mousemove');
	vec.svg.on('mousemove', function () {
	    var mp = d3.mouse(this);
	    mp[0]-=margin.left;
	    mp[1]-=margin.top;
	    
	    var tw=vec.svg.node().clientWidth-margin.left-margin.right;
	    //console.log("PIX " + mp[0]);
	    //var ar= vec.svg.node().clientWidth/vec.vw;
	    mp[0]=mp[0]/vec.width;
	    //console.log("Frac " + mp[0]);
	    mp[0]=vec.xr[0]+mp[0]*(vec.xr[1]-vec.xr[0]);
	    //mp[1]=yscale(mp[1]);
	    vec.trigger('mousemove', mp);
	    cursor.set_value(mp);
	    //console.log("MouseMove " + JSON.stringify(mp));
	});
    }
    
    
    vec.redraw=function(){
	
	if(range.value[0]==null || range.value[1]==null){
	    //this.set_range([0,this.value.length-1]);
	    console.log("Vector : No range set !");
	    return;
	}

	// if(d3.event!==null){
	//     var t = d3.event.translate,
	// 	s = d3.event.scale;

	//     console.log("Checking zoom ! " + t[0] + ", " + t[1] + " scale " + s);

	//     t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
	//     t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));

	//     console.log("Set T : " + t[0] + ", " + t[1] + " scale " + s);
	//     d3zoom.translate(t);
	// }
	
	var brg=vec.brg=null,select_brg=vec.select_brg=null;

	vec.svg.select("g").remove();
	
	var context= vec.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	//console.log("VECTOR REDRAW ! Nplots=" + vec.value.length + " zoom " + xscale.domain());
	vec.xr= xscale.domain();
	
	var xsvg = context.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .append("text")
	    .attr("transform", "translate(" + (width / 2) + " ," + (margin.bottom) + ")")
	//.attr("transform", "rotate(-90)")
	//.attr("y", 6)
	//.attr("dy", ".71em")
	    .style("text-anchor", "middle")
	    .text(vec.xlabel);
	
	
	var ysvg=context.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "translate(0,"+height/2+") rotate(-90)")
	    .attr("y", -2*margin.left/3)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text(vec.ylabel);
	
	xAxis.scale(xscale);
	yAxis.scale(yscale);

	xsvg.call(xAxis);
	ysvg.call(yAxis);

	

	//d3zoom.on("zoom", vec.redraw);
	
	if(ui_opts.enable_range!==false){
	    
	    brg=context.append("g").attr("class", "brush").call(brush);
	    brg.selectAll("rect").attr("y", height2).attr("height", height2 + 7);	
	    brg.selectAll(".resize").append("path").attr("d", resizePath).attr("transform", "translate(0," + height2 + ")");
	    svg.select(".brush").call(brush);
	}

	if(ui_opts.enable_selection!==false){

	    //select_brush.x(d3zoom.x());
	    //select_brush.y(d3zoom.y());
	    select_brush.extent(selection.value);
	    
	    select_brg=vec.select_brg=context.append("g").attr("class", "select_brush").call(select_brush);
	    select_brg.selectAll("rect").attr("y", -6).attr("height", height2);	
	    select_brg.selectAll(".resize").append("path").attr("d", resizePath);
	    svg.select(".select_brush").call(select_brush);
	}

	
	if(vec.value!==undefined)
	    for(var i=0;i<vec.value.length;i++)
		vec.value[i].redraw(context);
	
	//console.log("redraw trigger  " + context);
	vec.trigger("redraw", context);
    }
    
    function xfunc_linear(id, start, step){
	return start + id*step;
    }

    //var plot_tpl = ;
    
    function create_line_label(p, label, color){
	var le_tpl={
	    
	    ui_opts : {
		    //render_name : false,
		label : true,
		root_classes : ["inline"],
		child_classes : ["btn btn-default horizontal_margin inline"]
	    },
	    elements : {
		enable : {
		    name :  label,
		    type : "bool", value : true,
		    ui_opts : {
			type: "edit", label : true, root_classes : ["inline"],
		    }
		    
		},
		line_color : {
		    type : "color",
		    ui_opts : {
			root_classes : ["inline"],
			type : 'edit',
			value : color
		    }
		},
	    }
	};

	var le=create_widget(le_tpl, lines);
	
	lines.add_child(le,label);
	le.elements.enable.listen("change", function () { vec.config_range();} );
	le.elements.line_color.listen("change", function (c) { p.stroke=this.value; vec.config_range(false,false);} );
	
	le.elements.enable.trigger("change");
	p.le=le;
	return le;
    }
    
    
    var plot=function(data, xfunc, args){

	var p=this;

	p.data= data.slice();
	if(xfunc===undefined)
	    xfunc=xfunc_linear;

	p.xfunc=xfunc;
	//p.args=args;
	//args.unshift(0);
	p.args=[0];
	for(var i=0;i<args.length;i++) p.args.push(args[i]);
	p.x=function(id){
	    p.args[0]=id;
	    return p.xfunc.apply(p, p.args);
	}
	
	p.line=vec.line=d3.svg.line()
	    .x(function(d,i) { return xscale(p.x(i)); })
	    .y(function(d,i) {
		var s=p.x(i);
		// if(s<xscale.domain()[0])
		//     return 10000.0;
		//else
		    return yscale(d);
	    })
	;
	//.interpolate("linear");
	var plots = vec.value;
	p.set_opts=function(opts){
	    
	    p.opts=opts;
	    p.stroke=opts.stroke || "black";
	    
	    p.stroke_width=opts.stroke_width || "1px";
	    p.fill=opts.fill || "none";
	    
	    var pl = plots===undefined ? 0 : plots.length;
	    var defname="Line"+ (pl+1);

	    p.label=opts.label || defname;

	    if(p.le===undefined){
		p.le=create_line_label(p, p.label, p.stroke)
	    }else{
		//p.le.set('line_color',p.stroke);
		//p.le.set_name(p.label);
	    }
	}
	
	p.set_opts({});
	
	p.redraw=function(context){
	    if(p.data.length>0)
		if(p.data[0]===NaN)
		    return;
	    
	    var buf=[];
	    p.le.elements.enable.set_title(p.label);
	    p.le.elements.line_color.set_value(p.stroke);
	    
	    if(p.le.elements.enable.value && p.data.length!==0){
		p.path=context.append("path");
		p.path.attr("stroke", p.stroke);
		p.path.attr("stroke-width", p.stroke_width);
		p.path.attr("fill", p.fill);

		//p//.attr("d", lineFunction(lineData))
		//p.path
		//.attr("class", "line_black")
		p.path.attr("d",
		       p.line(p.data)
		      );
		
		// p.path.filter( function (x) {
		    
		    
		//     buf=[];
		//     p.data.forEach(function(d,i){
		// 	//var s=vec.xscale(d);
		// 	var s=i*1.0;//vec.xscale(i);
			
		// 	if(s>=xscale.domain()[0] && s<=xscale.domain()[1]){
			    
		// 	    buf.push(d);
		// 	}else
		// 	    console.log("Filter point " + i + " x="+ s+ " dom : " + JSON.stringify(xscale.domain()));
			
		//     });

		//     p.path.attr("d",
		// 		p.line(buf)
		// 	       );
		    
		    
		// });

		



		// vec.svg.selectAll("path").filter(function(d, i) {
		//     console.log("path filter " + d);
		//     return false;
		// })
		//     .remove(); 
		
		//console.log("plot redraw..." + p.label + "DL = " +p.data.length  + " D0 = " + p.data[0]);

		/*
		context.append("text")
		    .attr("transform", "translate(" + (5) + "," + (yscale(p.data[0])-10) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .attr("font-size", "10px")
		    .style("fill", p.stroke)
		    .text(p.label);
		*/
		
	    }
	}
    };
    
    
    var points_plot=function(data, label, opts){

	var p=this;

	p.data= data;
	
	p.line=vec.line=d3.svg.line()
	    .x(function(d,i) { return xscale(d[0]); })
	    .y(function(d,i) { return yscale(d[1]); });
	//.interpolate("linear");
	var plots = vec.value;

	//var defname="line"+ (plots.length+1);
	
	p.stroke_width=opts.stroke_width || "1px";
	p.fill=opts.fill || "none";
	
	p.label=opts.label || ("Line " + (plots.length+1));


	var ple=create_line_label(p,p.label, '#000');
	console.log("P.le="+ple.elements.enable.value);
	p.stroke=p.le.elements.line_color.value; //opts.stroke || "black";



	// create_ui({},p.le);
	// lines.add_child(p.le,defname);
	// p.le.listen("change", function () { vec.config_range();} );
	
	
	//p.set_opts({});
	p.redraw=function(context){
	    
	    ple.elements.enable.set_title(p.label);
	    
	    if(ple.elements.enable.value && p.data.length!==0){
		
		//var g=context.append('g');
		
		// draw dots
		context.selectAll(".dot")
		    .data(data)
		    .enter().append("circle")
		    .attr("class", "dot")
		    .attr("r", 2)
		    .attr("cx", function(d){return xscale(d[0])})
		    .attr("cy", function(d){return yscale(d[1])})
		    .style("fill", function(d) { return p.stroke;});
		// .on("mouseover", function(d) {
		    // 	tooltip.transition()
		    // 	    .duration(200)
		    // 	    .style("opacity", .9);
		    // 	tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
		    // 		     + ", " + yValue(d) + ")")
		    // 	    .style("left", (d3.event.pageX + 5) + "px")
		    // 	    .style("top", (d3.event.pageY - 28) + "px");
		    // })
		    // .on("mouseout", function(d) {
		    // 	tooltip.transition()
		    // 	    .duration(500)
		    // 	    .style("opacity", 0);
		    // });
		
		// context.selectAll('circles')
		//     .data(p.data)
		//     .enter()
		//     .append('circle')
		//     .attr("cx", function(d) {
		// 	return d[0];
		//     })
		//     .attr("cy", function(d) {
		// 	return d[1];
		//     })
		//     .attr("r", 5)
		//     .attr('fill','red');

		// context.selectAll("texts")
		//     .data(p.data)
		//     .enter()
		//     .append("text")
		//     .text(function(d) {
		// 	return d[0] + "," + d[1];
		//     })
		//     .attr("font-family", "sans-serif")
		//     .attr("font-size", "11px")
		//     .attr("fill", "red");
		
		// p.path=context.append("path");
		// p.path.attr("stroke", p.stroke);
		// p.path.attr("stroke-width", p.stroke_width);
		// p.path.attr("fill", p.fill);
		
		// p.path.datum(p.data)
		// //.attr("class", "line_black")
		//     .attr("d", p.line);
		
		console.log("plot redraw..." + label + "DL = " +p.data.length  + " D0 = " + p.data[0][0]);
		
		context.append("text")
		    .attr("transform", "translate(" + (5) + "," + (yscale(p.data[0][1])-10) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .attr("font-size", "10px")
		    .style("fill", p.stroke)
		    .text(label);
	    }
	}
    };


    var function_plot=function(func, opts){

	var p=this;

	p.range=(opts.range===undefined) ? vec.xr : opts.range;
	p.sampling=(opts.sampling!==undefined) ? opts.sampling : 1.0;
	
	p.line=vec.line=d3.svg.line()
	    .x(function(d,i) { return xscale(d[0]); })
	    .y(function(d,i) { return yscale(d[1]); });
	
	p.label=(opts.label===undefined) ? "line"+ (vec.value.length+1) : opts.label;
	
	p.stroke=opts.stroke || "black";
	p.stroke_width=opts.stroke_width || "1px";
	p.fill=opts.fill || "none";

	p.le=create_line_label(p,p.label, p.stroke);
	
	// p.le={ type : "bool", value : true, name : p.label, ui_opts : {type: "edit", label : true, root_classes : ["inline"]} };
	// create_ui({},p.le);
	// lines.add_child(p.le,p.label);
	// p.le.listen("change", function () { vec.config_range();} );

	function sample_data(){
	    p.data=[];
	    for(var x=p.range[0];x<=p.range[1];x+=p.sampling){
		p.data.push([x,func(x)]);
	    }
	    //console.log("FUNC " + JSON.stringify(p.data));
	}
	
	//p.set_opts({});
	p.redraw=function(context_in){

	    if(!p.le.elements.enable.value) return;

	    if(context_in!==undefined){
		p.context=context_in.append("g");
	    }

	    var context=p.context;


	    context.select("path").remove();
	    context.select("text").remove();
	    
	    //p.le.set_title(p.label);
	    sample_data();

	    p.path=context.append("path");
	    p.path.attr("stroke", p.stroke);
	    p.path.attr("stroke-width", p.stroke_width);
	    p.path.attr("fill", p.fill);
	    
	    p.path.datum(p.data)
	    //.attr("class", "line_black")
		.attr("d", p.line);
	    
	    if(p.le.value && p.data.length!==0){
		
		context.append("text")
		    .attr("transform", "translate(" + (5) + "," + (yscale(p.data[0][1])-10) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .attr("font-size", "10px")
		    .style("fill", p.stroke)
		    .text(p.label);
	    }
	}

	sample_data();
	
    };

    

    
    vec.add_plot=function(data, xfunc){
	//console.log("Adding plot DL=" + data.length + " ... ");
	var args=[];
	
	if(arguments.length>2){
	    for(var a=0;a<arguments.length;a++)
		args.push(arguments[a+2]);
	}

	
	var p=new plot(data, xfunc, args);
	if(this.value===undefined) this.value=[];
	    
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    vec.add_plot_points=function(data, label, opts){

	var p=new points_plot(data, label, opts);
	if(this.value===undefined) this.value=[];
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    vec.add_plot_func=function(func, opts){

	var p=new function_plot(func, opts);
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    
    
    vec.add_plot_linear=function(data, start, step){
	return this.add_plot(data, xfunc_linear, start, step);
    }


    
    // if(typeof vec.value=='undefined'){
    // 	vec.value = [];
    // }
    
    
    
    
    // var area = d3.svg.area().interpolate("step-before")
    //     .x(function(d,i) { return x(vec.start + i*vec.step); })
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

    
    // if( ù(vec.y_range) && è(vec.value))
    // 	vec.set_range([vec.value[0],vec.value[vec.value.length-1]]);
    

    vec.set_value(vec.value);

    // 	var start =vec.start || 0;
    // 	var step=vec.step || 1;
    // 	vec.add_plot_linear(vec.value, start, step);
    // }


    
    
    return vec.ui;
}


template_ui_builders.color=function(ui_opts, tpl_item){
    console.log(tpl_item.name + " color builder " + tpl_item.value);
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

    tpl_item.set_value();
    return tpl_item.ui;
}

template_ui_builders.angle=function(ui_opts, tpl_item){
    return template_ui_builders.double(ui_opts, tpl_item);
}
