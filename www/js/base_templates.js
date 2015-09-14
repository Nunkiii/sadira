var base_templates={

    progress:{},
    status:{},
    double:{},
    labelled_vector:{ serialize_fields : ["value_labels"]},
    local_file:{},
    bytesize:{},
    bool:{},
    string:{},
    text:{},
    password:{},
    date:{},
    url:{},
    image_url:{},
    html:{},
    code:{},
    combo:{ ui_opts : { type : "edit"} },
    template_list:{},
    action:{},
    color:{},
    angle:{},
    expo_setup:{},
    demo_multilayer:{},
    object_editor:{},
    xd1_layer:{},
    
    container : {
	name : "Container of typed objects",
	ui_opts : {
	    max_objects : 20
	},
	elements : {
	    browse : {
		name : 'Browser',
		ui_opts : {},
		object_builder : function(ui_opts, browse){
		}
	    },
	    view : { name : 'Object details : '}
	}

    },

    browser : {
	ui_opts : {
	    
	},
	widget_builder : function(ui_opts, browser){
	}
    },
    
    error_page : {

	name : "Ooops...",
	subtitle : "an error occured !",
	type : "html",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    item_classes : ["container alert alert-danger"]
	},
	value : "Error message"
    },

    db_collection : {

	name : "Object collection",
	ui_opts : {
	    fa_icon : "reorder",
	    name_elm : "name",
	    mini_elm : "description"
	},
	elements : {

	    description  : {
		type : "string",
		name : "Description",
		default_value : "Description of this collection..."
	    },
	    
	    name : {
		name : "Collection name",
		type : "string",
		holder_value : "Enter name here",
		ui_opts : { label : true}
	    },

	    template : {
		name : "Collection template",
		type : "string",
		ui_opts : { label : true}
	    },
	    
	    dbname : {
		name : "Database name",
		type : "string",
		ui_opts : { label : true}
	    }
	}

	// widget_builder : function(ui_opts, dbc){
	//     dbc.listen("data_loaded", function(){
	// 	dbc.set_title( dbc.val("name"));
	//     })
	// }
	
    },

    user_admin : {
	name : "User administration",
	ui_opts : {
	    fa_icon : "user",
	    root_classes : ["container-fluid"]

	},
	elements : {
	    browse : {
		name : "User list",
		type : "db_browser",
		ui_opts : {
		    collection : 'Users',
		    //fa_icon : "user"
		}
	    }
	    
	}
    },

    group_admin : {
	name : "Group administration",
	ui_opts : {
	    fa_icon : "group",
	    root_classes : ["container-fluid"]
	},

	elements : {
	    browse : {
		name : "Group list",
		type : "db_browser",
		ui_opts : {
		    collection : 'Groups',
		    
		}
		
	    }
	    
	}
    },
    
    user_home : {

	name : "User homepage",
	ui_opts : {
	    child_view_type : "tabbed",
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
	    fa_icon : "home"
	},

	toolbar : {
	    ui_opts : {
		toolbar_classes : [""]
	    },
	    elements : {
		admin : {
		    name : "System admin",
		    groups : ['Admin'],
		    elements : {
			user_adm : {
			    type  : "user_admin",
			},
			group_adm : {
			    type  : "group_admin",
			}
		    }
		    
		}
	    }
	},
	
	elements : {
	    // user_activity : {
	    // 	name : "Last activity"
 
	    account_settings : {

		name : "Account settings",
		elements : {
		    user_data : {type : "user"}
		    
		}
	    }
	},
	
	widget_builder : function(ui_opts, uhome){
	    
	    //uhome.debug("Hello world debug");
	    var test = {
		a : "skjadkjsa",
		f : function(e){ return e*33.0; }
	    };
	    var bs=BSON.serialize(test,true,true,true);
	    var result=BSON.deserialize(bs, {evalFunctions : true});
	    for (var e in result){				  
		console.log("Bson " + e + " type " + typeof(result[e]));
		
	    }
	    console.log("66 =? " + result.f(2.0));

	    
	    
	}
    },
    
    db_browser : {

	name : "Database browser !!!!",
	
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
	    fa_icon : "archive"
	},

	elements : {
	    colsel : {
		name : "Select collection",
		
		ui_opts : {
		    type  : "edit",
		    label :  true,
		    root_classes : ["col-sm-12"],
		},
		type : "combo"
	    },
	    cnt : {
		ui_opts : {
		    root_classes : ["container-fluid"],
		    child_classes : ["row"]
		},
		elements : {
		    browser : {
			//name : "Object browser",
			ui_opts : { root_classes : ["col-sm-6"]},
			elements : {
			    list : {
				ui_opts : {
				    root_classes : ["container_fluid"]
				},
				name : "Object list"
			    }
			}
		    }
		    ,
		    object : {
			//name : "Object view",
			ui_opts : {
			    root_classes : ["col-sm-6"],
			    child_classes : ["container-fluid"]
			}
		    }
		}
	    }
	},

	widget_builder : function(ui_opts, dbb){
	    
	    //console.log("DBB start " + dbb.name);

	    var browser = dbb.get('browser');
	    var list = dbb.get('list');
	    var colsel=dbb.get("colsel");
	    var object=dbb.get("object");
	    
	    var tb=cc('table',list.ui_root);
	    
	    tb.className='table table-hover';
	    
	    function get_collection_list(cb){
		var r=new request({ cmd : '/api/dbcom/get'});
		
		r.execute(function(err, result){

		    if(err){
			object.ui_root.innerHTML=err;
			return;
		    }
		    
		    if(result.length>0){
			
			colsel.options=[];
			
			result.forEach(function(d){
			    colsel.options.push({value : d.els.name.value, label : d.els.name.value /*d._id*/});
			    //var w=create_widget(d.type);
			    //set_template_data(w,d);
			    //console.log("D= " + JSON.stringify(d));
			    //object.ui_childs.add_child(w, w.ui_root);
			});
			
			colsel.set_options();
			cb(true);
			
		    }else{
			colsel.set_title("No collection available");
			colsel.disable();
			cb(true);
		    }
		    
		    colsel.listen("change", function (value) {
			console.log("changed to " + value);
			get_collection_objects(colsel.value);
		    });
		
		});
	    }

	    function get_collection_objects(collection_name){

		console.log("Col name : " + collection_name);
		var r=new request({ cmd : '/api/dbcom/get', args : { collection : collection_name} });
		

		r.execute(function(err, result){

		    if(err){
			dbb.debug(err);
			return;
		    }
		    
		    //dbb.debug(JSON.stringify(result,null,5));
		    
		    if(result!==undefined){
			if(result.error !== undefined)
			    return dbb.debug(result.error);

			dbb.debug_clean();
			
			list=create_widget({
			    //name : "Collection <i>" + collection_name + "</i>",
			    ui_opts : {
				root_classes : ["col-sm-12"],
				child_classes : ["container-fluid"],
				//child_view_type : "table"
			    }
			}, browser);
			
			browser.update_child(list,"list");
			
			result.forEach(function(d, i){
			    
			    //dbb.debug( i + " : " + JSON.stringify(d));
			    
			//colsel.options.push({value : d._id, label : d.els.name.value});
			    var w=tmaster.build_template(d.type);
			    if(w.ui_opts === undefined) w.ui_opts={
			    };
			    //if(w.ui_opts.root_classes===undefined)
				w.ui_opts.root_classes=[];
			    //if(w.ui_opts.name_classes===undefined)
			    w.ui_opts.name_classes=[];
			    w.ui_opts.root_classes.push("panel panel-success");
			    w.ui_opts.name_classes.push("panel-heading");
			    w.ui_opts.child_classes=["panel-body"];
			    w.ui_opts.name_node="div";
			    //w.ui_opts.name_node="h3";
			    w.parent=list;
			    //list.debug("List depth = " + list.depth);
			    
			    create_ui({},w, list.depth+1);
			    
			    w.set_title(d.name + " : " + d._id);
			    set_template_data(w,d);
			    w.rebuild_name();
			    //console.log("D= " + JSON.stringify(d));
			    
			    list.ui_childs.add_child(w, w.ui_root);
			    
			    //w.tr.addEventListener("click", function(){
			    w.ui_name.addEventListener("click", function(){
				
				var ww=create_widget(d.type, object);

				set_template_data(ww,d);
				ww.rebuild_name();

				if(object.obj === undefined){
				    object.ui_root.appendChild(ww.ui_root);
				}else
				    object.ui_root.replaceChild(ww.ui_root, object.obj.ui_root);
				
				object.obj=ww;
			    });

			    
			});
		    }
		});
	    }

	    if(ui_opts.collection===undefined){
		get_collection_list(function(ok){
		    if(ok === true){
			console.log("Got collections");
			get_collection_objects(colsel.value);
		    }
		});
	    }else{
		colsel.hide(true);
		get_collection_objects(ui_opts.collection);
	    }
	    
	}
    },

    music_app : {
	name : "StudyMusic",
	subtitle : "Learn music in tempo. Yeah ! ",
	
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_view_type : "tabbed",
	    fa_icon : "leaf"
	},

	toolbar : {
	    elements : {
		file_menu : {
		    name : "Lessons",
		    elements : {
			open : { name : "Lesson1"},
			load : { name : "Lesson2"},
			close : { name : "Lesson3"},
		    }
		}
	    }
	},
	
	elements : {
	    lessons : {
		name : "My lessons",
		subtitle : "Manage your lessons here"
		
	    },

	    time : {
		name : "Time organization",
		subtitle : "Manage your lessons here"
	    },

	    account : {
		name : "User account",
		subtitle : "Setup your user account",
		type : "user"
	    }
	}

    },
    
    
    user : {
	name : "User information",

	ui_opts : {
	    child_view_type : "div",
	    root_classes : ["container-fluid"],
	    fa_icon : "user",
	    name_elm : "username",
	    mini_elm : ""
	},
	elements : {
	    nick : {
		name : "Nickname",
		ui_opts : {
		    editable : true,
		    root_classes : ["form form-inline form-group-lg"],
		    name_node : 'label'
		},
		type : 'string',
		holder_value : 'Enter a nickname'
		
	    },
	    default_email : {
		name : "Default email account",
		type : "email"
	    },
	    credentials : {
		name : "Account credentials",
		db : { perm : { r : 'admin'} }
	    },
	    groups : {
		ui_opts : { child_view_type : "pills"},
		name : "Groups",
		db : { perm : { w : 'admin'} }
	    }
	},
	object_builder : function(user){
	    user.get_login_name=function(){
		var cred;
		cred= user.get("local");
		if(cred!==undefined){
		    var un=cred.val('username');
		    if(un!==undefined) return un;
		    var un=cred.val('email');
		    if(un!==undefined) return un;
		}

		return "Unknown";
	    }
	}
    },
    user_group : {
	name : "User Group",
	ui_opts : {
	    fa_icon : "group",
	    name_elm : "name",
	    mini_elm : "description",
	    //name_node : "h5"
	},
	elements : {
	    name : {
		name : "Group name",
		subtitle : "String identifier for the group",
		type : "string",
		ui_opts : {
		    //label : true
		}
	    },
	    description : {
		type : "html",
		name : "Description",
		subtitle : "",
		ui_opts : {
		    //label : true
		}
	    },
	},
    },
    local_access : {
	tpl_desc : "All info for an internally administered user.",
	name : "Local credentials",
	ui_opts : {
	    fa_icon : "leaf"
	},
	elements : {
	    email: {
		ui_opts : {
		    label : true,
		    fa_icon : "envelope"
		},
		name : "E-mail",
		type: "string",
		holder_value : "Any valid email adress? ..."
	    },
	    hashpass: {
		ui_opts : {
		    label : true,
		    fa_icon : "eye-close"
		},
		name : "Hashed password",
		type: "password"
	    },
	    salt: {
		ui_opts : { label : true },
		name : "Hashed password salt",
		type: "string",
		name: "Password salt"
	    },
	    username: {
		ui_opts : { label : true },
		name : "User name",
		type: "string"
	    }
	}
    },
    facebook_access : {
	name : "Facebook credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    email        : { name : "Email", type : "email"},
	    name         : { name : "Name", type : "string"},
	}
    },
    twitter_access : {
	name : "Twitter credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    displayName  : { name : "Display name", type : "string"},
	    userName     : { name : "User name", type : "string"},
	}
    },
    google_access : {
	name : "Google credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    email        : { name : "Email", type : "email"},
	    name         : { name : "Name", type : "string"},
	}
    },

    socket_manager : {
	name : "Socket manager",
	intro : "Active sockets :",
	container : "socket",
	ui_opts : { intro_stick : true, fa_icon : 'road', root_classes : ["container-fluid"], type : 'edit' },
	elements : {},
    },
    
    socket : {
	name : "Websocket",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    root_node : "form",
	    child_classes : ["form-group input-group"],
	    fa_icon : 'tty'
	},
	elements : {
	    url : {
		name : "Server",
		type : "url",
		ui_opts : {
		    //root_classes : ["input-group"],
		    label_node : "div",
		    root_classes : ["input-group"],
		    name_classes : ["input-group-addon"],
		    type : "edit",
		    label : true,
		    //item_root : true
		},
		default_value : "ws://sadira.iasfbo.inaf.it"
	        //value : "ws://localhost"
		//value : "ws://localhost:9999"
	    },

	    status : {
		//name : "Status",
		ui_opts : {
		    //root_classes : ["input-group-addon"],
		    //name_classes : [],
		    item_classes : ["input-group-addon"],
		    root_element : 'url'
		},
		type : "status",
		value : "blue",
		value_labels : { blue : "disconnected", green : "connected", red : "error"}
	    },
	    connect : {
		ui_opts : {
		    //root_classes : ["input-group-btn"],
		    //button_node : "span",
		    fa_icon : "link",

		    wrap : true,
		    wrap_classes : ["input-group-btn"],
		    item_classes : ["btn btn-info"],

		    
		    name_classes : [],
		    
		    root_element : 'url'
		    //item_root : true
		},
		type: "action",
		name : "connect"
	    },

	    messages : {
		ui_opts : {
		    sliding : true, slided : false,
		    root_classes : [],
		    name_classes : [],
		    item_classes : [],  
		    label : true,
		    in_root : "append"
		},
		name : "Info",
		type : "text"
	    }
	} 
    },

    sadira_panel : {
	name : "<strong>Sadira</strong>",
	subtitle : "control panel",
	ui_opts : {
	    sliding: true, slided : false, sliding_dir : 'h',
	    sliding_animate: true,
	    name_node : "h4",
	    //root_classes : ["sadira_panel"]
	},
	elements : {
	    login : { type : 'login' }
	}

    },

  
    login : {
	name : "Log into Sadira",
	intro : "<p>Enter your username and password to log into Sadira</p>",
	ui_opts : {
	    //sliding: true, slided : true,
	    //label : true, //label_node : "a",
	    //sliding_animate : true,
	    //sliding_dir : "h",
	    //root_node : "li",
	    name_node : "h1",
	    fa_icon : "sign-in",
	    root_classes : ["container-fluid"],
	    child_node_type : "form",
	    //child_classes : ["form form-inline text-center input-lg"],
	    child_classes : ["col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2 form-horizontal"],
	    intro_stick : true,
	    //name_classes : ["col-sm-6"],
	    //item_classes : ["col-sm-6"]
	},

	elements : {

	    user: {
		type: "string",
		name : "",
		holder_value : "username or e-mail",
		ui_opts : {
		    type : "edit",
		    root_classes : ["input-group vertical_margin"],
		    label : true,
		    fa_icon : "user",
		    //name_classes : ["control-label col-sm-offset-1 col-sm-3"],
		    label_node : 'span',
		    name_classes : ["input-group-addon"],
		    //wrap : true,
		    //wrap_classes : ["col-sm-3 nopadding"]
		}
		
	    },
	    
	    password :{
		name : "",
		type : "password",
		ui_opts : {
		    type : "edit",
		    root_classes : ["input-group vertical_margin"],
		    label : true ,
		    fa_icon : "key",
		    //wrap : true,
		    label_node : 'span',
		    name_classes : ["input-group-addon"],
		    //name_classes : ["control-label col-sm-offset-1 col-sm-3"],
		    //item_classes : ["col-sm-3"]
		},
		
		holder_value : 'password'
		
	    },
	    /*
	    status :{
		type  : "string",
		value : "Logging in ...",
		ui_opts : {
		    root_element : "user",
		    item_classes : ["input-group-addon"],
		    //root_classes : ["form-group input-group inline"]
		}
	    },
*/
	    login : {
		name : "Log in !",
		type : "action",
		ui_opts : {
		    //item_root : true,
		    //root_element : "user",
		    //button_node : "span",
		    //name_node : "span",
		    //fa_icon : "link",
		    root_classes : ["vertical_margin"],
		    wrap : true,
		    wrap_classes : ["input-group-btn text-right"],
		    item_classes : ["btn btn-success"]
		}
	    },

	    // fb_login : {
	    // 	name : "Facebook log in",
	    // 	type : "action",
	    // 	ui_opts : {
	    // 	    item_classes : ["btn btn-primary"],
	    // 	    root_classes : ["form-group"]
	    // 	}
	    // }
	}
    },

    logout : {
	name : "Log out of Sadira...",
	intro : "Unknown login status",
	strings : {
	    intro1 : "confirm you want to disconnect from the Sadira network.",
	    intro2 : "You are not logged in.",
	    intro3 : "You are curently logged in as "
	},
	
	ui_opts : {
	    fa_icon : "sign-out",
	    intro_stick : true,
	    root_classes : ["container-fluid"]
	   
	},
	elements : {
	    logout_but : {
		name : "Log me out !",
		type : "action",
		ui_opts : { root_classes : ["text-center"], item_classes : ["btn btn-danger btn-lg"]}
	    }
	},

	widget_builder : function(ui_opts, logout){

	    var b=logout.get('logout_but');
	    function enable_logout(){
		logout.set_intro_text( '<p>'+ S(logout, 'intro3')+' <strong>'+window.sadira.user.id +'</strong>,' + S(logout,'intro1') + '</p>');
		b.disable(false);
	    }
	    function disable_logout(){
		b.disable(true);
		logout.set_intro_text(
		    S(logout,'intro2')
		);
	    }
	    
	    b.listen('click',function(){
		var rq=new request({ cmd : "/logout"});
		rq.execute(function(error, res){
		    if(error){
			logout.debug("Error logout : " + error);
			return;
		    }
		    
		    if(è(res.error))
			logout.debug(res.error);
		    else{
			window.sadira.user={};
			window.sadira.trigger('user_logout');
		    }
		});
		
	    });
	    
	    window.sadira.listen('user_login', function(user){enable_logout();});
	    window.sadira.listen('user_logout', function(user){
		console.log("Disable logout !");
		disable_logout();
	    } );
	    
	    window.sadira.user ? enable_logout() : disable_logout();

	}
    },
    
    marked : {
	name : "MD Text",
	type : "html"
    },

    signup : {
	name : "Create a new account",
	//subtitle : 
	intro : "<p>You can create a local sadira account or use one of the supported platforms providing your authentication for us.</p><p><strong>Choose a login method : </p></strong>",
	//ui_opts : { sliding  : true, slided : false },
	ui_opts : {
	    child_view_type : "pills",
	    root_classes : ["container-fluid"],
	    //name_classes : ["panel-heading"],
	    //name_node : 'div',
	    child_classes : ["container-fluid"],
	    intro_stick: true,
	    fa_icon : 'key'
	},

	elements : {

	    local : {
		name : "Local account",
		subtitle : "Create a new account locally.",
		intro : "<strong><p>Fill up the email and password fields to create your new user account.</p></strong><p><ul><li> Enter a valid email adress, it will be used to identify you.</li><li> You'll can configure a username later in your user page if you wish.</li><li> The password will be checked for basic strength.</li></ul></p>",

		ui_opts : {
		    //name_node : "h3",
		    fa_icon : "leaf",
		    root_classes : ["container-fluid"],
		    child_classes : ["container-fluid"],
		    intro_stick: true
		},
		elements : {
		    
		    data : {
			//name : "Fill up your data :",
			ui_opts : {
			    child_node_type : "form",
			    child_classes : ["form-horizontal container-fluid"],
			    root_classes : ["container-fluid"]
			},
			elements : {
			    
			    email : {
				//
				name : "Email address",
				type : "string",
				holder_value : "name@example.org",
				ui_opts : { type : "edit",
					    root_classes : ["form-group"],
					    label : true,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],
					    //item_classes :  ["col-sm-4"]
					    wrap : true,
					    wrap_classes : ["col-sm-4"]
					  }
			    },
			    password : {
				name : "New password",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true ,
					    wrap : true,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],
					    wrap_classes : ["col-sm-4"]
					  }
			    },
			    password_repeat : {
				name : "Enter password again",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true,
					    wrap : true,
					    name_classes :["control-label col-sm-offset-1 col-sm-3"],
					    wrap_classes : ["col-sm-4"] }
			    }
			    
			}
		    },
		    
		    action_panel : {
			ui_opts : { root_classes : ["col-md-12"], child_classes : []},
			elements : {

			    signup : {
				name : "Create new account",
				type : "action",
				ui_opts : {
				    //label: true,
				    //name_classes :["control-label","col-sm-3"],
				    //wrap : true,
				    //wrap_classes : ["col-md-6"],
				    //root_classes : ["col-md-offset-5 col-md-3"],
				    item_classes : ["btn btn-primary btn-lg"],
				    root_classes : ["text-center"],
				    //label_cnt_classes : ["col-sm-3","col-sm-offset-5"]
				}
			    },
			    status : {
				type : "html",
				value : "<p><strong>Congrats!</strong> You just created your account. Welcome.</p>",
				ui_opts : {root_classes : ["col-md-6"], item_classes : ["alert alert-info"], }
			    }

			}
		    }

		    
		}
	    },
	    
	    shib : {
		name : "IDEM signup",
		subtitle : "Signup using your IDEM-GARR account",
		ui_opts : {
		    //name_node : "h3",
		    fa_icon : "institution"
		},
		elements : {

		    signup : {
			name : "Signup !",
			type : "action"
		    }
		    
		}
		
	    },

	    fb : {
		name : "Facebook",
		subtitle : "Signup using your Facebook account",
		ui_opts : {
		    fa_icon : "facebook-official",
		    //name_node : "h3"
		},
		elements : {
		    signup : {
			name : "Signup !",
			type : "action",
			link : "/auth/facebook"
		    }
		}
	    },

	    google : {
		name : "Google",
		subtitle : "Signup using your Google account",
		ui_opts : {
		    name_node : "h3",
		    fa_icon : "google-plus"
		},
		elements : {
		    
		    signup : {
			name : "Signup !",
			type : "action",
			link : "/auth/google",
			ui_opts : { fa_icon : "google-plus" }
		    }
		}
	    }
		
	}
    },
    
    process : {
	name : "Process",
	elements : {
	    uptime : {
		name : "Uptime",
		type : "double"
	    },
	    memuse : {
		name : "Memory use",
		type : "bytesize"
	    }
	}
    },

    sysmon : {
	name : "Sadira system monitor",
	elements : {
	    cnx : {
		
		type : "sadira",
		name : "Link"
	    },
	    workers : {
		name : "Workers"
	    }
	}

    },
    vector : {
	name : "Vector view",
	ui_opts : {
	    // root_classes : ["container-fluid"],
	    //child_classes : ["container-fluid"]

	    enable_range : false,
	    enable_selection : false
	},
	elements :{
	    btns : {
		store : false,
		ui_opts: { root_classes : ["inline"], child_classes : [] },
		elements : {
		    // zoom :   { name:  "", type : "action", ui_opts:{fa_icon : "search-plus", item_classes : ["btn btn-default btn-sm"]}},  
		    // unzoom : { name : "", type : "action", ui_opts:{item_classes:["btn btn-default btn-sm"], fa_icon : "search-minus",}},
		}
	    },

	    ctls: {
		ui_opts: {
		    root_classes : ["inline"],
		    child_classes : ["container-fluid"] },
		elements : {
	    	    range : {
			type : "labelled_vector",
			name : "Range",
			value_labels : ["from","to","zoom"],
			value : [0.0, 0.0, 0.0],
			ui_opts: {
			    root_classes : ["inline"], label : true, fa_icon : "arrows-h",//, sliding : true, slided: false
			    child_classes : ["inline"]
			},
		    },
		    selection : {
			type : "labelled_vector",
			name : "Selection",
			value_labels : ["start","end"],
			value : [0, 0],
			ui_opts: {root_classes : ["inline"], label : true, fa_icon : "edit", sliding : true, slided: false},
		    },
		    lines : {
			name : "Plots",
			ui_opts : {
			    label : true,
			    child_classes : ["inline"],
			    sliding: true,
			    slided: true
			}
		    }
		}
	    }
	    /*
	    controls : {
	
		elements : {
		}
	    }
	    */
	}
    },
    dbtypes : {
	name : "Datatypes",
	subtitle : "Available sadira/tk datatypes",
	ui_opts : {root_classes : ["container-fluid"], child_classes : ["container"]},
	elements : {}
    },
    dbtemplates : {
	name : "Sadira widget templates",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    //child_view_type : ""
	},
	elements : {
	    build_progress : {
		name : "Building templates ... ",
		type : "progress", value : 0
	    }
	}
    },

    root_widget : {
	

    },
    
    sadira_home : {
	name : '<span style="color: springgreen;">ॐ</span> <strong> Sadira </strong>',
	ui_opts : {
	    root_classes : ["container-fluid left"],
	    //child_classes : ["container-fluid"],
	    //child_view_type : "pills",
	    //name_node : "h4",
	    //name_classes : ["title_logo"],
	    
	    intro_stick : true,
	    child_toolbar : false,
	    toolbar_brand : true
	},

	toolbar : {
	    elements : {
		/*
		file_menu : {
		    name : "File",
		    elements : {
			open : { name : "Open"},
			load : { name : "Load"},
			close : { name : "Close"},
		    }
		},
		*/
		demos : {
		    name : "Demos",
		    elements : {
			xd1 : {
			    name : "XD-1",
			    type : "xd1",
			    link : true
			    
			},
			minispectro : {
			    name : "Minispectro",
			    type : "videocap",
			    link : true
			}
		    }
		},
		toolkit : {
		    name : "Web Toolkit",
		    elements : {
			demo : {
			    name : "Toolkit sandbox",
			    type : "ui_demo"
			},
			
			tuto : {
			    name : "Sadira Toolkit tutorial",
			    type : "stk_tutorial"
			},

			tlist : {
			    name : "Templates",
			    type : "dbtemplates"
			}
		    }
		},
		database : {
		    name : "Dev",
		    elements : {
			browser : {
			    name : "Database browser",
			    type : "db_browser"
			},
			sock_mgr : {
			    type : "socket_manager"
			},
			nunki : {
			    type : "nunki",
			    link : true
			}
		    }
		}
		/*,
		login : {
		    type : "login", name : "Login"
		}

		register : {
		    type : "signup", name : "Create account"
		}
*/


	    }
	},

	
	elements : {
	    welcome : {
		subtitle : "INAF/IASF-Bologna — <i>Astro-web-software </i>",
		name : "QK/Sadira",
		type : "html",
		icon : "/sadira/icons/inaf_iasfbo.png",
		//icon_size : "5em",
		
		//intro : "",
		url : "/sadira/welcome.html",
		ui_opts : {
		    //root_classes : ["row"],
		  //  intro_stick : true,
		    //render_name : false,
		    //item_classes : ["row"]
		}
			  
	    },
	    
	    deps : {
		name : "Software deps",
		
		type : "soft_links",
		ui_opts : {item_classes : ["container-fluid"], name_node:"h2"}
	    }
	}
    },
    
    soft_tpl : {
	name : "SoftName",
	type : "url",
	ui_opts : {
	    root_classes : ["panel panel-default"],
	    name_classes : ["panel-heading"],
	    item_classes : ["panel-content"],
	    icon : "/sadira/icons/brands/nodejs.svg",
	    intro_stick : true,
	    //icon_size : "4em",
	    name_node : "div",
	    
	}
    },
    
    soft_links : {
	name : "Dependencies",
	subtitle : "Software used by Sadira",
	intro : "<p>This will contain description and links to all external libraries and software used within the Sadira project.</p>",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["list-group"],
	    intro_stick : true
	    //child_view_type : "table"
	},
	elements : {
	    node : {
		type : "soft_tpl",
		ui_opts : {
		    icon : "/sadira/icons/brands/nodejs.svg",
		},
		name : "Node.js",
		intro : "<p>Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.</p>",
		value : "https://nodejs.org/"
	    },
	    mongo : {
		 type : "soft_tpl",ui_opts : {icon : "/sadira/icons/brands/logo-mongodb.png"},
		name : "mongo DB",
		intro : "<p><strong>Agile and Scalable.</strong>MongoDB makes working with a database simple and elegant, providing agility and freedom to scale.</p>",
		value : "http://www.mongodb.org/"
	    }

	    
	}
	
	
    },

    ui_demo : {
	name : "Toolkit test", subtitle : "Sadira/Tk sandbox",
	intro : "<p>Write the template and builder code for your widget then try to run it</p>",
	ui_opts : {
	    root: true,
	    root_classes : ["container-fluid"],
	    child_classes : ["row"]
	},
	//toolbar : {},

	elements : {
	    code : {
		//name : "Widget source code",
		ui_opts : {
		    root_classes : ["col-md-6"],
		    child_classes : ["container-fluid"],
		    child_view_type : "tabbed"
		},
		elements : {
		    source : {
			name : "Source code",
			ui_opts : {child_view_type : "tabbed"},
			elements : {
			    template : {
				name : "Template",subtitle : "Edit source code (in JavaScript for simplicity)",
				type : "code",
				default_value : '{\n\ttype : "hello",\n\tname : "Hello",\n\tsubtitle : "Hello Sadira/Tk!",\n\t elements : {\n\t\tbtn : {\n\t\t\ttype : "action",\n\t\t\tname : "Click me !"\n\t\t},\n\t\ttext : {\n\t\t\tname : "Result :",\n\t\t\t type : "string"\n\t\t}\n\t}\n}',
				
				//default_value: '{}',
				ui_opts : {
				    type : "edit",
				    root_classes : ["container-fluid"],
				    highlight_source : true
				}
			    },
			    builder : {
				name : "Template builder",subtitle : "Edit your widget builder source code",
				type : "code",
				default_value : 'function(ui_opts, hello_tpl){\n\thello_tpl.get("btn").listen("click", function(){\n\t\thello_tpl.get("text").set_value("Hello World!");\n\t});\n }',
				ui_opts : {
				    type : "edit",
				    root_classes : ["container-fluid"],
				    
				    highlight_source : true
				}
			    },
			    widget : {
				name : "Choose an existing widget to start with :",
				ui_opts: {
				    type : "edit",//,
				    label : true,
				    in_root: "prepend",
				    root_classes : ["container-fluid"],child_classes : ["form-group input-group"]
				},
				elements :{
				    tlist : {
					//name : "Choose:",
					type : "template_list",
					//type : "string",
					ui_opts : {
					    type : "edit",
					    item_classes : [],
					    //style:"menu",
					    text_node : "span",
					    label : true,
					    item_root : true,
					}
				    },
				    tpl_set : {
					type : "action",
					name : "Set template in editor",
					ui_opts : {
					    button_node : "span",
					    item_classes : ["btn btn-info "], fa_icon : "play",
					    //item_root : true,
					    root_classes : ["input-group-btn"]
					}
				    }
				}
			    },
			    
			}
		    },
	    	    compile : {
			name : "Compilation",
			ui_opts : {
			    root_classes : ["container-fluid"],
			    child_classes : ["container-fluid"],
			},
			elements : {
			    build : {
				name : "Build/rebuild widget",
					type : "action",
				ui_opts : {item_classes : ["btn btn-primary"], item_root : true}
			    },
			    status : {
				ui_opts : {
				    root_classes : ["well row"], label:true
				},
				type : "string",
				name : "JS compile"
			    },
			    build_status : {
				ui_opts : { root_classes : ["well row" ], label:true},
				type : "string",
				name : "Widget build"
			    }
			}
			
		    },
		    
		}
	    },

	    view : {
		name : "Your widget",
		ui_opts : {
		    root_classes : ["col-md-6 "],
		    child_classes : ["container-fluid panel panel-default"],
		}
		
	    }

	}


    },

    colormap : { 
	name : "Colormap",
	subtitle : "Buggy!",
	intro : "<br/><br/><p class='alert alert-warning'><strong>This is buggy, sorry !</strong>Need rewrite. New version will offer a list of «common» colormaps for straight use and user colormaps will be stored in webstorage.</p>",
	ui_opts : {
	    type : "edit",
	    //editable : true,
	    root_classes : ["container-fluid"],
	    item_classes : []
	    //mini_elm : "cmap"
	    
	},
	// value : [[0,0,0,1,0],
	// 	      [0.8,0.2,0.8,1.0,0.2],
	// 	      [0.9,0.9,0.2,1.0,0.2],
	// 	      [0.9,0.9,0.2,1.0,0.5],
			// 	      [0.9,0.2,0.2,1.0,0.5],
	// 	      [1,1,1,1,1]] },
	
	
	value : [[0,0,0,1,0],
		 [0.7,0.2,0.1,1.0,0.2],
		 [0.8,0.9,0.1,1.0,0.6],
		 [1,1,1,1,1]],

	elements : {
	    select : {
		name : "Select colormap",
		type : "combo",
		ui_opts : { label : true}
	    }
	}
    },
};

var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

if(nodejs)
    module.exports=base_templates;
