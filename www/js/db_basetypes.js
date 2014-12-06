template_ui_builders.sadira=function(ui_opts, sad){
    
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
    
    
    var ws_host;
    ws_host=url.value;
    
    sad.listen("socket_connect", function(){
	sad.online=true;
	status.set_value("green");
	messages.append("Sadira server connected");
    });
	
    sad.listen("socket_error", function(e){
	sad.online=false;
	status.set_value("red");
	messages.append("Socket error " + JSON.stringify(e));
    });
    sad.listen("socket_close", function(){
	sad.online=false;
	status.set_value("blue");
	messages.append("Sadira server disconnected");
    });
    
    connect.listen("click",function(){
	sad.connect();
    });
    
    
    sad.connect=function(){

	if(sad.online) return;
	//Making link to the WebSocket server and handling of the socket events

	/*
	//Checking web storage support 

	if(typeof(Storage)=="undefined"){ 
	    return cb("Sorry, you need a browser with webstorage support");
	}
*/
	
	var wsock=null; //The (main) web(rtc)socket.
	var socket_mode="websocket"; 
	
	if(socket_mode=="webrtc"){
	    
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
	    
	}else{
	
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
	}
	
	sad.wsock=wsock;

	wsock.onclose = function () {
	    //this.set_status();
	    if(sad.dialogs!=='undefined') 
		delete sad.dialogs;
	};
	
	wsock.onopen = function () {
	    if(typeof sad.dialogs==='undefined')
		sad.dialogs= new dialog_manager(wsock);
	    
	    var session_id=localStorage.session_id;
	    var d={};
	    if(typeof session_id != 'undefined') d.session_id=session_id;
	    sad.trigger("socket_connect",sad);
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
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	break;
    default: 
	throw "Unknown UI type " + ui_opts.type + " for " + tpl_item.name;
    }
    return tpl_item.ui;
}

template_ui_builders.labelled_vector=function(ui_opts, tpl_item){

    var ui=tpl_item.ui=ce("div");
    
    ui.className="labelled_vector";
    tpl_item.inputs=[];

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
	    parent : { 
		ui_childs : { 
		    add_child : function(e,nui){ui.appendChild(nui);},
		    replace_child : function(nui,oui){
			ui.replaceChild(nui, oui);
			console.log("LAB VECTOR container Replaced UI!");
		    }
		}
	    },
	    onchange : function(v){
		tpl_item.value[this.id]=this.value;
		if(tpl_item.onchange) tpl_item.onchange(this.id);
	    }
	    
	}; 
	
	
	//var vui=create_ui(ui_opts, tpl_item.inputs[v]);
	var vui=create_ui({ editable : ui_opts.editable, type: ui_opts.type}, tpl_item.inputs[v]);
	ui.appendChild(vui);
    }
    
    tpl_item.set_value=function(nv){
	//console.log("TPLI set value " + JSON.stringify(nv));
	if(typeof nv !='undefined'){
	    this.value=nv;
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


template_ui_builders.login=function(ui_opts, login){
    var ui=template_ui_builders.password(ui_opts, login);

    var login_ui=ce("div",ui);
    login_ui.innerHTML="LOGIN HERE HEEEHOOOO!!";

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
	var ui=cc("input",div);
	ui.className="local_file";
	ui.type="file";

	ui.addEventListener("change",function(evt){
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

    tpl_item.ui=ui;

    return tpl_item.ui;
}

function format_byte_number(v){
    var u=["","k","M","G","T"];
    var id=0,idmax=4;
    var val=v, unit='bytes';
    while(val>1024 && id<idmax){
	val=val/1024.0;
	id++;
    };
    return Math.floor(val*100)/100.0 + " " +u[id]+unit;
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
	var ui=tpl_item.ui=ce("input");
	ui.type="checkbox";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.checked=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return ui.checked;
	}
	break;
    default: 
	throw "Unknown UI type ";
    }

    new_event(tpl_item,"change");

    ui.onchange=function(){
	tpl_item.value=this.checked; 
	tpl_item.trigger("change", tpl_item.value);
	if(tpl_item.onchange)
	    tpl_item.onchange();
    }
    
    tpl_item.set_value();

    return tpl_item.ui;
}


template_ui_builders.string=function(ui_opts, tpl_item){

    if(ù(ui_opts.type)) ui_opts.type="short";

    switch (ui_opts.type){
	
    case "short":

	var ui=tpl_item.ui=ce("span");
	ui.className="value";

	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    if(è(tpl_item.value))
		ui.innerHTML=tpl_item.value;
	}

	tpl_item.set_value();
	break;

    case "edit": 

	var ui=tpl_item.ui=ce("input");
	ui.type="text";

	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    ui.value=tpl_item.value;
	}

	ui.onchange=function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}

	tpl_item.set_default_value=function(){
	    var v=tpl_item.default_value;
	    if(ù(v)) v=tpl_item.value; 
	    if(è(v)){
		console.log("Setting placeholder value");
		ui.setAttribute("placeholder",v);
	    }
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
	    console.log("append text to " + tpl_item.value);
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
	var pui=cc("input",ui); cc("span",ui).innerHTML="show";
	var show=cc("input",ui); show.type="checkbox";
	pui.type="password";
	
	show.onclick=function(){
	    pui.type= show.checked ? "text" : "password";
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


template_ui_builders.url=function(ui_opts, tpl_item){
    
    
    var ui;

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    switch (ui_opts.type){

	
    case "short":
	ui=tpl_item.ui=ce("span");
	//ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
	    if(typeof tpl_item.value !=='undefined')
		ui.innerHTML=tpl_item.value;
	}

	tpl_item.set_value();
	break;
    case "edit": 

	if(tpl_item.download){

	    var download_type = è(tpl_item.download_type) ? tpl_item.download_type : "text";
	    
	    var edit_tpl={ 
		elements : {
		    url : { type : "string", name : "URL", default_value : "http://", ui_opts: {type : "edit"}},
		    //nbytes : { type : "mem", name : "Received " },
		    download : { type : "action", name : "Download"}
		}
	    };
	    
	    
	    create_ui({},edit_tpl);
	    
	    var url=edit_tpl.elements.url;

	    url.ui.type="url";
	    
	    ui=tpl_item.ui=edit_tpl.ui_root;
	    
	    tpl_item.set_value=function(nv){
		edit_tpl.elements.url.set_value(nv);
	    }
	    
	    new_event(tpl_item,"download_ready");
	    new_event(tpl_item,"download_error");

	    var download=edit_tpl.elements.download;

	    download.listen("click", function(){
		download.wait("Starting download...");
		

		function download_complete(error, data){
		    if(error!=null){
			download.error(error);
			tpl_item.trigger("download_error", error);
		    }else{
			download.done("complete L=" + data.length);
			tpl_item.trigger("download_ready", data);
		    }
		};

		var q=edit_tpl.elements.url.value;
		var opts={ 
		    progress : function(evt) { //evt.total ? -> add Content-Length header server-side!!
			download.message(format_byte_number(evt.loaded) + " received");
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
	    
	    tpl_item.set_default_value=function(){
		url.set_default_value();
	    }
	    
	    
	}else{
	    ui=tpl_item.ui=ce("input");
	    ui.type="url";
	    tpl_item.set_default_value=function(){
		var v=tpl_item.default_value;
		if(ù(v)) v=tpl_item.value; 
		if(è(v)){
		    console.log("Setting placeholder value");
		    ui.setAttribute("placeholder",v);
		}
		
	    }

	    tpl_item.set_value=function(nv){
		if(typeof nv !='undefined')
		    tpl_item.value=nv;
		if(typeof tpl_item.value !=='undefined')
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
	}
	tpl_item.set_default_value();
	
	break;
    default: 
	throw "Unknown UI type ";
    }


    
    return tpl_item.ui;
    
}

template_ui_builders.image_url=function(ui_opts, tpl_item){
    var ui=tpl_item.ui=ce("div");
    
    function load_image(){
	if(typeof tpl_item.value!='undefined') img.src=tpl_item.value;
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
    
    var ui=ce("input"); ui.type="button";
    ui.value=action.name;


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

    var wait_icon;
    var message;

    action.message=function(msg){
	if(ù(message)){
	    message=cc("span",action.ui_root);
	    message.add_class("action_message");
	}
	message.innerHTML=msg;
	
    };

    action.error=function(message){
	if(è(wait_icon)) action.ui_root.removeChild(wait_icon);
	ui.removeAttribute("disabled");
	wait_icon=cc("img",action.ui_root,true);
	wait_icon.add_class("info_icon");
	wait_icon.src="sadira/icons/Error_icon.svg";
	if(è(message)) 
	    action.message(message);
    }



    action.done=function(message){
	ui.removeAttribute("disabled");
	if(è(wait_icon)) action.ui_root.removeChild(wait_icon);
	wait_icon=cc("img",action.ui_root,true);	
	wait_icon.add_class("info_icon");
	wait_icon.src="sadira/icons/Approve_icon.svg";
	if(è(message)) 
	    action.message(message);
    }
    
    action.wait=function(message){
	
	console.log("Waiting .... ");
	if(è(wait_icon)) action.ui_root.removeChild(wait_icon);
	wait_icon=cc("span",action.ui_root);
	wait_icon.add_class("wait_icon");
	ui.setAttribute("disabled",true);
	xhr_query("sadira/icons/loading-spinning-bubbles.svg", function(error, svgtext){
	    if(error===null)
		wait_icon.innerHTML=svgtext ;
	    
	})
	
	if(è(message)) 
	    action.message(message);

    };

    if(è(action.elements)){
	
	action.ui_root.removeChild(action.ui_childs.div);
	
	var slide_button=cc("span", action.ui_name);
	slide_button.style.zIndex=action.ui_root.style.zIndex+1;
	
	slide_button.className="slide_button_h";
	//slide_button.innerHTML= slided ? "❌" : "▶"; 
	slide_button.innerHTML= "▶"; 
	var slided=false;
	var cnt=action.ui_name;
	slide_button.addEventListener("click",function(){
	    if(slided){
		//if(è(action.elements))
		cnt.removeChild(action.ui_childs.div);
		cnt.removeChild(ui);
		slide_button.innerHTML= "▶"; 
		
	    }else{
		//if(è(action.elements.ui))
		cnt.appendChild(action.ui_childs.div);
		cnt.appendChild(ui);
		slide_button.innerHTML= "❌"; 
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

    var svg;
    var brush;
    var selection=tpl_item.elements.selection;
    
    selection.value=[tpl_item.start, 
		     tpl_item.start + tpl_item.value.length*tpl_item.step ];


    tpl_item.elements.zoom.listen("click",function(){
	if(typeof tpl_item.on_range_change!='undefined') 
	    tpl_item.on_range_change(selection.value);
	tpl_item.redraw();
    });


    tpl_item.elements.unzoom.listen("click",function(){
	selection.set_value([tpl_item.min, tpl_item.max]);
	// cuts.set_value([tpl_item.start, 
	// 		   tpl_item.start + tpl_item.value.length*tpl_item.step ]);
	console.log("unzoom to " + JSON.stringify(selection.value) + " start = " + tpl_item.start);

	if(typeof tpl_item.on_range_change!='undefined') 
	    tpl_item.on_range_change(selection.value);

	tpl_item.redraw();
    });
    
    tpl_item.listen("slided", function(){
	tpl_item.elements.unzoom.trigger("click");
    });
    

    tpl_item.set_range=function(new_range){
	selection.set_value(new_range);
	if(è(brush))brush.extent(new_range);
    };

    
    function brushed() {
	
	selection.value[0]=brush.extent()[0];
	selection.value[1]=brush.extent()[1];
	
	selection.set_value();

	svg.select(".brush").call(brush);
	
	if(brg!=null){
	    //cmap.domnode.style.width=(brg[1].getBBox().width+0.0)+'px';
	    //cmap.domnode.style.marginLeft=(brg[1].getBBox().x+xmarg)+'px';
	    var bid=0;
	    
	    brg.selectAll("rect").each(function(){
		// brg.each(function(){
		//console.log("BRUSH "+bid+": x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
		if(bid==1){
		    //cmap.domnode.style.width=(this.getBBox().width+0.0)+'px';
		   // cmap.domnode.style.marginLeft=(this.getBBox().x+xmarg)+'px';
		    
		}
		bid++;
		
	    });	       	
	    
	}else
	    console.log("brg is NULL !");
	
	if(tpl_item.selection_change)
	    tpl_item.selection_change(selection.value);

	//	    fv.cmap.display();
    }

    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };

    
    var ui=tpl_item.ui=ce("div");

    var bn=d3.select(ui);
//    d3.select("svg").remove();

    var brg=null;
//    var xmarg, xw, ymarg;
    
    // if(typeof svg!='undefined')
    // 	if(ui.hasChild(svg))
    // 	    ui.removeChild(svg);
    
    svg = bn.append('svg');
	//base_node.appendChild(svg.ownerSVGElement);
	
    tpl_item.set_value=function(v){
	if(typeof v!='undefined')tpl_item.value=v;
	this.redraw();
    }
    var height;
    
    tpl_item.redraw=function(){

	var margin = ui_opts.margin;
	//var width = tpl_item.parent.ui_root.clientWidth //ui_opts.width 
	  //  - margin.left - margin.right - 30;
	
	height = ui_opts.height- margin.top - margin.bottom;
	
	var s=window.getComputedStyle(tpl_item.ui_root,null);
	
	var width=get_inner_dim(s,false)-margin.left-margin.right;
	//if(ù(height))
	//height=get_inner_dim(s,true)-margin.top-margin.bottom;

	console.log("UI w,h  = " + width + "," + height);
	if(width<10 || height < 10){
	    console.log("No room to draw histogram!");
	    return;
	}
	//width=200; height=200;
	
	// var width = ui.clientWidth - margin.left - margin.right;
	// var height = ui.clientHeight- margin.top - margin.bottom;
	
	var x = d3.scale.linear().range([0, width]).domain(selection.value);
	var y = d3.scale.sqrt().range([height, 0]);
	
	var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);    
	var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
	brush = d3.svg.brush().x(x).on("brushend", brushed);
	
	var area = d3.svg.area().interpolate("step-before")
	    .x(function(d,i) { return x(tpl_item.start + i*tpl_item.step); })
	    .y0(height)
	    .y1(function(d) { return y(d); });
	
	//var margin={left: "1em", right: "1em", top: "1em", bottom: "1em"};
	svg.select("g").remove();
	svg.attr("width", width + margin.left + margin.right);
	svg.attr("height", height + margin.top + margin.bottom);

	var context = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");	

	var histo=this.value;
	if(histo.length==0){
	    console.log("No vector data !");
	    return;
	}
	
	x.domain(selection.value);//
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	y.domain(d3.extent(histo, function(d) { return d; }));
	
	
	
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
	    .text("Number of pixels");
	
	// ysvg.each(function(){
	// 		 console.log("YAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 	     });	       
	
	var pathsvg=context.append("path")
	    .datum(histo)
	    .attr("class", "line")
	//.attr("d", line);
	    .attr("d", area);
	
	// pathsvg.each(function(){
	// 		    console.log("PATH: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 		});
	
	
	/*
	  fv.cmap.domnode.style.marginLeft=(xmarg-2.0)+'px';
	  fv.cmap.domnode.style.width=(xw+0.0)+'px';
	  fv.cmap.domnode.style.height=(50+0.0)+'px';
	  fv.cmap.domnode.style.marginTop='-10px';
	*/	       
	
	// cmap.display();
	
	var height2=height;
	
	brg=context.append("g")
	    .attr("class", "brush")
	    .call(brush);
	
	brg.selectAll("rect")
	    .attr("y", -6)
	    .attr("height", height2 + 7);
	
	brg.selectAll(".resize").append("path").attr("d", resizePath);
	
	//			   
	//base_node.appendChild(fv.cmap.domnode);
	//		   brush.extent([data[0].pixvalue*1.0,data[data.length-1].pixvalue*1.0]);
	brush.extent(selection.value);//[fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	
	function resizePath(d) {
	    var e = +(d == "e"),
	    x = e ? 1 : -1,
	    y = height / 3;
	    
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
	
	
	
	//brush.extent([2000,4000]);
	//svg.select(".brush").call(brush);		   
	brushed();
	//
	//ready_function();
 	//brush(context);
	
	//$('#bottom_space')[0].innerHTML='<br/><br/>The End!<br/>';
	
	//   brush.extent([0.2, 0.8]);
	//  svg.select(".brush").call(brush);		   
	
	// var gBrush = g.append("g").attr("class", "brush").call(brush);
	// gBrush.selectAll("rect").attr("height", height);
	// gBrush.selectAll(".resize").append("path").attr("d", resizePath);
	
    }
    return tpl_item.ui;
}


template_ui_builders.color=function(ui_opts, tpl_item){

    
    var ui=tpl_item.ui=ce("div"); ui.className="color_container";
    var cui=ce("input"); cui.type="color";
    ui.appendChild(cui);
    
    cui.addEventListener("change", function() {

        ui.style.backgroundColor = cui.value;
	tpl_item.value=cui.value;

	if(tpl_item.onchange){
	    tpl_item.onchange();
	}

	
    },false);

    ui.style.backgroundColor = cui.value;    
    
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;
	cui.value=tpl_item.value;
	
	if ("createEvent" in document) {
	    var evt = document.createEvent("HTMLEvents");
	    evt.initEvent("change", false, true);
	    cui.dispatchEvent(evt);
	}
	else
	    cui.fireEvent("onchange");

	//cui.trigger(new Event('change'));
    }

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	break;
    case "edit": 
	cui.addEventListener("change",function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    return tpl_item.ui;
}

template_ui_builders.angle=function(ui_opts, tpl_item){
    return template_ui_builders.double(ui_opts, tpl_item);
}

