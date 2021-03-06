// Qk web toolkit - (C) Pierre Sprimont <sprimont@email.ru> 

var sadira_root_template = {
    
    name : "Qk",
    ui_opts : {
	
	
    },
    usi : {
	elements : {
	    toolbar : {
		//name : "Main TB",
		type : "toolbar",

		ui_opts : {
		    char_icon : "<font color='springgreen'>ヅ</font>", //"❄",
		    //icon_size : "2em",
		    //fa_icon : 'globe',
		    root_classes : ['navbar-dark bg-inverse navbar-fixed-top'],
		    
		},

		elements : {
		    right:{
			type : 'toolbar_section',
			
			ui_opts : {
			    //fa_icon : 'globe',
			    root_classes : ['nav navbar-nav pull-right']
			    
			},
			elements : {
			    net : {
				type : "dropdown",
				name : "Sign in",
				ui_opts : {
				    fa_icon : 'globe',
				    type:"toolbar",
				    align : "right"
				},
				widget_builder : function(ok, fail){
				    //alert("Net menu build !");
				    ok();
				},
				usi : {
				    elements : {
					login : {
					    name : "Login",
					    type : "widget_launcher",
					    usi : {
						launch : {
						    type : 'login',
						    widget_builder : function(ok, fail){
							alert("Login build !");
							ok();
						    }
						}
					    }
					},
					logout : {
					    type : "widget_launcher",
					    usi : {
						launch : {
						    type : 'logout'
						}
					    }
					},
					signup : {
					    type : "widget_launcher",
					    usi : {
						launch : {
						    type : 'signup'
						}
					    }
					}

					
				    }
				},
				//items : [{ label : "Login", fa_icon : "user"}]
			    }
			    //login : {name : "Log in",type : 'login' },
			    //logout : {name : "Log out",type : 'logout' },
			    //newacc : { name : "Create new account", type : "signup" },
			    //home : { name : "User homepage", type : "user_home" },
			    //storage : { name : "Storage", type : "storage" }
			}
		    },
		    //widget_builder : function() { this.ui_root.add_class('navbar-right'); }
		}
	    },
	    footer : {
		type : 'string',
		ui_opts : {
		    root_node : "footer",
		    render_name : false,
		    item_classes : "text-muted",
		    text_node : 'p'
		},
		value : '<small><span class="fa fa-linux text-success"></span> (c) 2013-2016 -- <a href="mailto:sprimont@email.ru"> Pierre-G. Sprimont</a>,<a href="mailto:davide.ricci82@gmail.com"> Davide Ricci</a></small>'
//,<a href="mailto:nicastro@iasfbo.inaf.it"> Luciano Nicastro</a> @<a href="http://www.iasfbo.inaf.it" target="_blank">INAF/IASF</a>, Bologna, Italy.
	    }
	}
    },
    widget_builder : function(ok, fail){
	var root_widget=this;

	var toolbar=this.get("toolbar");
	this.wait("Init...");

	var net=this.get('net');
	var login=net.get('login');
	var logout=net.get('logout');
	var signup=net.get('signup');
	
	new_event(this,"ready");
	new_event(this,"user_login");
	new_event(this,"user_logout");	

	//root_widget.usi.visible=cc("div",this.ui_root);
	//root_widget.usi.visible.innerHTML="<h1>Initializing</h1>";
	//this.set_subtitle("Helllllllooooooooooooooo");
	
	root_widget.ui_root.style.marginTop="55px";
	root_widget.ui_root.style.marginBottom="50px";
	
	root_widget.setup_storage=function(){
	    var storage_tpl={ type : 'storage', ui_opts : {close : true}};
	    create_widget(storage_tpl).then(function (obj){
		root_widget.storage=obj
	    }).catch(function(e){
		root_widget.error_page(e, {name : "Creating storage..."});
	    });
	    
	};
	
	root_widget.change_root_widget=function(widget, url){
	    body_node.replaceChild(widget.ui_root,sadira.root_widget.ui_root);
	    if(url!==undefined)
		window.history.pushState({},"",url);
	}
	
	
	root_widget.error_page=function(msg, opts){
	    create_widget('error_page').then(function(w){
		w.set_value(msg );

		if(opts!==undefined)
		    w.set_title(opts.name,opts.subtitle);

		
		root_widget.show_widget(w);
		
		// if(w.ui_root!==undefined){
		//     w.ui_root.innerHTML+="<div class='panel panel-danger'>"+ msg.lineNumber + " ---------> " +dump_error(msg)+"</div>";
		//     body_node.appendChild(w.ui_root);
		// }else
		//     body_node.innerHTML+="<div class='panel panel-danger'>"+ msg.lineNumber + " ---------> " +dump_error(msg)+"</div>";

		
	    }).catch( function (e){
		
		//var error_txt="<div class='panel panel-danger'>"+dump_error(e)+"</div>";
		root_widget.message(e.stack, { type : "danger", title : e+""});
	    });
	    
	}
	
	root_widget.session_start=function(opts){
	    
	    var check_session=new request({ cmd : "/api/session/info" });
	    
	    check_session.execute(function(error, res){
		
		if(sadira.user!==undefined) delete sadira.user;
		
		if(error){
		    root_widget.message(error, { type : 'warning', title : 'Session register', last : 3000});
		    // var ep=create_widget('error_page');
		    // ep.set_value(error);
		    // window.document.body.appendChild(ep.ui_root);
		}
		
		if(res!==undefined){
		    
		    console.log("Session check : " + JSON.stringify(res));
		    
		    if(res.error){
			sadira.error_page(res.err, { name : "Session error "});
		    }
		    else{
			if(res.user!=="none"){
			    sadira.user={
				id : res.user
			    };
			    sadira.trigger('user_login', sadira.user);
			}
		    }
		    
		}
		
	    });
	}

	

	function user_login(u){
	    //lnav.fa_icon='user';
	    //tb.set_item_name(lnav, "<strong>" + u.id + "</strong>");
	    if(u.id==="everybody"){
		return;
	    }
	    net.a.style.color='springgreen';
	    net.a.innerHTML="<i class='fa fa-user'/> "+u.id;
	    login.hide();
	    signup.hide();
	    logout.hide(false);
	    
	    //lnav.elements.home.li.style.display='';
	    
	}
	function user_logout(){
	    //lnav.fa_icon='globe';
	    login.hide(false);
	    signup.hide(false);
	    logout.hide();
	    net.a.innerHTML="<i class='fa fa-globe text-primary' > </i> Connexion";
	    //tb.set_item_name(lnav, "Sadira");
	    net.a.style.color='';
	    //lnav.elements.home.li.style.display='none';
	}
	
	this.listen('user_login', function(user){
	    user_login(user);
	});
	
	this.listen('user_logout', function(user){
	    user_logout();
	});


	root_widget.setup_widget=function(w){
	}
	
	logout.hide();
	root_widget.session_start();
    	root_widget.setup_storage();
	
	root_widget.trigger("ready", window.sadira);
	console.log("sadira ready....");
	ok();
    }
    
};



(function(){
    
    window.tmaster=new local_templates();
    
    window.build_object=function(){ return tmaster.build_object.apply(tmaster,arguments); }
    window.create_object=function(){ return tmaster.create_object.apply(tmaster,arguments); }
    window.create_object_from_data=function(){ return tmaster.create_object_from_data.apply(tmaster,arguments); }
    
    
    window.addEventListener("load",function(){
	
	var body_node=document.getElementsByTagName('body')[0];
	//body_node.innerHTML="<div class='jumbotron'><h2> Sadira startup <small>please wait...</small></h2></div>";

	create_widget({
	    name : "Qk toolkit startup <br/>",
	    subtitle : "please wait...",
	    ui_opts : {
		//root_classes : "full_page",// name_node : "h2",ॐ
		char_icon : "<font color='red'><strong>ヅ</strong></font>", //"❄",
		name_classes : ["startup"],
		intro_stick : true
	    }
	}).then(function(w){
	    body_node.appendChild(w.ui_root);
	    window.root_widget=w;

	    create_widget(sadira_root_template,w).then(function(root_widget){

		body_node.innerHTML="";
		var top=cc("div", body_node); top.className='pos-f-t';
		top.appendChild(root_widget.usi.elements.toolbar.ui_root);
		body_node.appendChild(root_widget.ui_root);
		body_node.appendChild(root_widget.usi.elements.footer.ui_root);

		window.sadira=window.root_widget=root_widget;
		
		//return;
		
		var base_uri=window.location.href;
		
		var split = base_uri.split('/');
		var protocol=split[0];
		var host=split[1];
		var ncom=split.length-3;
		var coms=[];
		for(var i=3;i<3+ncom-1;i++)
		    coms.push(split[i]);
		
		var last=split[split.length-1];
		var argsplit=last.split("?");
		var args;
		if(argsplit.length===2){
		    args=argsplit[1];
		    coms.push(argsplit[0]);
		}else
		    coms.push(argsplit[0]);
		
		var widget_name=coms[coms.length-1];
		var main_toolbar=root_widget.get("toolbar");
		
		create_widget({ type : widget_name, ui_opts : { name_node : "a", name_classes : ["navbar-brand"]} }).then(function(w){
		    window.document.title=w.name;
		    root_widget.item_ui=w.ui_root;
		    root_widget.ui_root.appendChild(w.ui_root);
		    root_widget.integrate_widget(w);
		    
		}).catch(function(e){
		    //console.log("III"+dump_error(e));
		    root_widget.error("<strong>Error building "+widget_name+"</strong><br/>"+dump_error(e));
		    
		});
		
		
	    }).catch(function(e){
		w.intro="<p>Sorry, we cannot start the Qk toolkit.</p>";
		w.set_subtitle("Error ! ");
		w.error(e);
	    });
	}).catch(function(e){
	    console.log("Very bad start : " + dump_error(e));
	});
	
	
	return;
	
	// try{
	    
	//     attach_ui(root_widget, body_node);
		
	//     //attach_ui(widget_template, body_node);
	    
	    
	//     return;
	    
	    
		
	//     create_ui({},root_widget);
	    
	//     window.sadira.user!==undefined ? user_login() : user_logout();
	    
	//     widget_template.interpret_url();
	// 	attach_ui(widget_template, body_node);
	    
	    
	// }
	// catch(error){
	//     console.log("Error build widget !  " + dump_error(error));
	//     sadira.error_page("<div class='panel-heading'>While building widget ["+tpl_name+"] : </div><div class='panel-content'>" + dump_error(error) + "</div>");
	// }
	
	
	
	//window.sadira.setup_storage();
	
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
