var base_templates={

    main_window:{},
    progress:{},
    status:{},
    double:{},
    labelled_vector:{},
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

    db_collection : {

	name : "Object collection",

	elements : {

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
	},

	widget_builder : function(ui_opts, dbc){
	    dbc.listen("data_loaded", function(){
		dbc.set_title( dbc.val("name"));
	    })
	}
	
    },

    user_home : {

	name : "User homepage",
	ui_opts : {child_view_type : "tabbed", root_classes : ["container-fluid"] },

	elements : {
	    user_activity : {
		name : "Last activity"
	    },
	    
	    account_settings : {

		name : "Account settings",
		elements : {
		    user_data : {type : "user"}
		    
		}
	    }
	},

	widget_builder : function(ui_opts, uhome){
	    
	    uhome.debug("Hello world debug");
	}
    },
    db_browser : {

	name : "Database browser",
	ui_opts : { root_classes : ["container-fluid"], child_classes : ["row"]},
	elements : {
	    browser : {
		//name : "Object browser",
		ui_opts : { root_classes : ["col-sm-6"]},
		elements : {
		    colsel : {
			name : "Select collection",
			ui_opts : {  type : "edit", label : true},
			type : "combo"
		    },
		    list : {
			name : "Object list"
		    }
		}
	    },
	    object : {
		name : "Object view",
		ui_opts : { root_classes : ["col-sm-6"]}
	    }
	},

	widget_builder : function(ui_opts, dbb){
	    
	    console.log("DBB start " + dbb.name);
	    var object = dbb.get('object');
	    var r=new request({ cmd : '/api/dbcom/collection_list'});
	    r.execute(function(err, result){
		if(err){
		    object.ui_root.innerHTML=err;
		    return;
		}
		var colsel=dbb.get("colsel");
		if(result.length>0){
		    colsel.options=[];
		    result.forEach(function(d){
			colsel.options.push({value : d._id, label : d.els.name.value});
			//var w=create_widget(d.type);
			//set_template_data(w,d);
			//console.log("D= " + JSON.stringify(d));
			//object.ui_childs.add_child(w, w.ui_root);
		    });
		    colsel.set_options();
		}else{
		    colsel.set_title("No collection available");
		    colsel.disable();
		}
		
	    });
	    
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
	//type : "user",
	name : "User information",
	elements : {
	    credentials : {
		name : "Account credentials",
		db : { perm : { r : 'admin'} }
	    },
	    groups : {
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
	name : "A User group",
	elements : {
	    name : {
		name : "Group name",
		subtitle : "String identifier for the group",
		type : "string"
	    },
	    description : {
		type : "html",
		name : "Description", subtitle : ""
	    }
	},
    },
    local_access : {
	tpl_desc : "All info for an internally administered user.",
	name : "Local credentials",
	elements : {
	    email: {
		type: "email",
		holder_value : "Any valid email adress? ..."
	    },
	    hashpass: {
		type: "password"
	    },
	    salt: {
		type: "string",
		name: "Password salt"
	    },
	    username: {
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


    
    sadira : {
	//name : "Websocket",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    root_node : "form",
	    child_classes : ["form-group input-group"]
	},
	elements : {
	    url : {
		name : "Server",
		type : "url",
		ui_opts : {
		    //root_classes : ["input-group"],
		    name_node : "a",
		    name_classes : [],
		    item_classes : ["input-group"],
		    type : "edit",
		    //editable : true,
		    label : true,
		    item_root : true
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
		    item_root : true
		},
		type : "status",
		value : "blue",
		value_labels : { blue : "disconnected", green : "connected", red : "error"}
	    },
	    	    connect : {
		ui_opts : {
		    root_classes : ["input-group-btn"],
		    button_node : "span",
		    fa_icon : "link",

		    name_classes : [],
		    item_classes : ["btn btn-info"]
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
	name : "<strong>sadira</strong>",
	subtitle : "control panel",
	ui_opts : {
	    sliding: true, slided : false, sliding_dir : 'h',
	    name_node : "h4",
	    //root_classes : ["sadira_panel"]
	},
	elements : {
	    login : { type : 'login' }
	}

    },
    
    login : {
	name : "Login",
	subtitle : "Enter your username and password to log into sadira",
	ui_opts : {
	    //sliding: true, slided : true,
	    //label : true, //label_node : "a",
	    //sliding_animate : true,
	    //sliding_dir : "h",
	    //root_node : "li",
	    name_node : "h4",
	    root_classes : ["container-fluid panel panel-default"],
	    child_node_type : "form",
	    child_classes : ["well container-fluid form-inline"],
	    name_classes : [],
	    item_classes : []
	},

	elements : {
	    user: {
		type: "string",
		name : "User",
		holder_value : "e-mail or username",
		ui_opts : {
		    type : "edit", label : true,
		    root_classes : ["input-group"],
		    //wrap : true,
		    //wrap_classes : ["col-sm-4 nopadding"],
		    name_classes : ["input-group-addon"],
		    name_node : "div"
		}
	    },

	    password :{
		type: "password",
		name : "Password",
		holder_value : "your password",
		ui_opts : {
		    type : "edit", label: true,
		    root_element : "user",
		    //root_classes : ["input-group"],
		    wrap : false,
		    //root_classes : ["col-sm-4 nopadding"],
		    //wrap_classes : ["input-group"],
		    name_classes : ["input-group-addon"]
		}
	    },

	    status :{
		type  : "string",
		value : "Logging in ...",
		ui_opts : {
		    root_element : "user",
		    item_classes : ["input-group-addon"],
		    //root_classes : ["form-group input-group inline"]
		}
	    },

	    login : {
		name : "Log in",
		type : "action",
		ui_opts : {
		    item_root : true,
		    //root_element : "user",
		    //button_node : "span",
		    //name_node : "span",
		    //fa_icon : "link",
		    //wrap : true,
		    //wrap_classes : ["input-group-btn"],
		    
		    //name_classes : ["input-group-addon"],
		    //root_classes : ["inline"],

		    item_classes : ["btn btn-info"]
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
    marked : {
	name : "MD Text",
	type : "html"
    },
    signup : {
	name : "Create a new account",
	subtitle : "Choose a login method",
	intro : "<p>You can create a local account on this server only or use one of the supported platforms providing your authentication for us.</p>",
	//ui_opts : { sliding  : true, slided : false },
	ui_opts :{
	    child_view_type : "pills",
	    root_classes : ["container-fluid"],
	    child_classes : ["container"],
	    intro_stick: true
	},

	elements : {

	    local : {
		name : "Local account",
		subtitle : "Create a new account locally.",
		intro : "Fill up the email and password fields to create your new user account.</p><p> Enter a valid email adress, it will be used to identify you. You'll can configure a username later in your user page if you wish.</p><p> The password will be checked for basic strength.",

		ui_opts : {
		    name_node : "h3",
		    fa_icon : "leaf",
		    root_classes : ["container-fluid"],
		    child_classes : ["row"]
		},
		elements : {
		    
		    data : {
			ui_opts : {
			    child_node_type : "form",
			    child_classes : ["form-horizontal container"],
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
					    wrap : true,
					    wrap_classes : ["col-sm-6 nopadding"]
					  }
			    },
			    password : {
				name : "New password",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true ,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],item_classes : ["col-sm-6"] }
			    },
			    password_repeat : {
				name : "Enter password again",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true,
					    name_classes :["control-label col-sm-offset-1 col-sm-3"],item_classes : ["col-sm-6"] }
			    }
			    
			}
		    },
		    
		    action_panel : {
			ui_opts : { root_classes : ["col-md-12"], child_classes : [""]},
			elements : {

			    signup : {
				name : "Create new account",
				type : "action",
				ui_opts : {
				    //label: true,
				    //name_classes :["control-label","col-sm-3"],
				    //wrap : true,
				    //wrap_classes : ["col-md-6"],
				    root_classes : ["col-md-offset-5 col-md-3"],
				    item_classes : ["btn btn-primary btn-lg"],
				    //root_classes : ["form-group"],
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
		    name_node : "h3",
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
		ui_opts : { fa_icon : "facebook-official", name_node : "h3"},
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
	ui_opts : { root_classes : ["container-fluid"], child_classes : ["container-fluid"] },
	elements :{
	    btns : {ui_opts: { root_classes : ["inline"], child_classes : ["btn-group"] }, elements : {
		zoom :   { name:  "", type : "action", ui_opts:{fa_icon : "search-plus", item_classes : ["btn btn-default btn-sm"]}},  
		unzoom : { name : "", type : "action", ui_opts:{item_classes:["btn btn-default btn-sm"], fa_icon : "search-minus",}},
	    }},
	    range : {
		type : "labelled_vector",
		name : "Range",
		value_labels : ["start","end"],
		value : [0, 0],
		ui_opts: {
		    root_classes : ["inline"], label : true, fa_icon : "arrows-h", sliding : true, slided: false},
	    },
	    selection : {
		type : "labelled_vector",
		name : "Selection",
		value_labels : ["start","end"],
		value : [0, 0],
		ui_opts: {root_classes : ["inline"], label : true, fa_icon : "edit", sliding : true, slided: false},
	    },
	    lines : {ui_opts : { root_classes : ["inline"]} }
	}
    },
    dbtypes : {
	name : "Datatypes",
	subtitle : "Available sadira/tk datatypes",
	ui_opts : {root_classes : ["container-fluid"], child_classes : ["container"]},
	elements : {}
    },
    dbtemplates : {
	name : "Sadira/tk templates",
	ui_opts : {root_classes : ["container-fluid"]},
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
	name : '<span style="color: springgreen;">♐</span> Qk/Sadira',
	
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
	    child_view_type : "pills",
	    name_node : "h4",
	    intro_stick : true,
	    child_toolbar : false
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
			    type : "xd1"
			},
			minispectro : {
			    name : "Minispectro",
			    type : "videocap"
			}
		    }
		},
		login : {
		    type : "login", name : "Login"
		},
		register : {
		    type : "signup", name : "Create account"
		}
	    }
	},

	
	elements : {
	    welcome : {
		name : "INAF/IASF-Bologna ☄",
		subtitle : "— Astro-web-software",
		type : "html",
		icon : "/sadira/icons/inaf_iasfbo.png",
		//icon_size : "5em",

		intro : "<p>Qk/Sadira is an experimental, scientific-oriented, computing application framework. At the time beeing, it is a mixed ECMAScript(JS)/C++ prototype running on Node.js servers and web browsers.</p><p>The goal of Sadira is to ease the setup of scientific data acquisition, processing and pipeline design tasks, from a practical scientific researcher point of view.</p><p>It will provide rich web browser application GUI based on an original HTML toolkit engine, server interfaces to databases, entry points for low-level, high performance data analysis/reduction algorithms written in Fortran/C/C++ or using the new possibilities offered by openCL.</p>",
		url : "/sadira/welcome.html",
		ui_opts : { intro_stick : true}
			  
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
	    root_classes : ["panel panel-default row"],
	    name_classes : [],
	    item_classes : ["col-xs-offset-1 col-xs-5 col-sm-offset-1 col-sm-3"],
	    icon : "/sadira/icons/brands/nodejs.svg",
	    //icon_size : "4em",
	    name_node : "h3"
	}
    },
    
    soft_links : {
	name : "Dependencies",
	subtitle : "Software used by Sadira",
	intro : "<p>This will contain description and links to all external libraries and software used within the Sadira project.</p>",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
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
	    item_classes : [],
	    
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
