var base_templates={

    sadira : {
	//type : "template",
	tpl_builder  : "sadira",
	name : "Websocket link",
	ui_opts : { child_classes : [], child_view_type : "div"},
	elements : {
	    url : {
		name : "Server",
		type : "url",
		ui_opts : { editable : true, root_classes : ["inline"],  label : true},
		value : "ws://sadira.iasfbo.inaf.it"
	        //value : "ws://localhost"
		//value : "ws://localhost:9999"
	    },
	    status : {
		//name : "Status",
		ui_opts : {root_classes : ["inline"],  label : true},
		type : "status",
		value : "blue",
		value_labels : { blue : "disconnected", green : "connected", red : "error"}
	    },
	    connect : {
		ui_opts : {root_classes : ["inline"], item_classes : ["btn btn-default btn-xs"], fa_icon : "link"},
		type: "action",
		name : "connect"
	    },
	    messages : {
		ui_opts : {sliding : true, slided : false, root_classes : ["inline"],  label : true},
		name : "Messages",
		type : "text"
	    }
	} 
    },
    login : {
	name : "Login",
	type : "login",
	ui_opts : {sliding: true, slided : false, label : true, label_node : "label",
		   root_node : "li",
		   child_classes : ["navbar-form", "navbar-right"],
		   item_classes : []},
	elements : {
	    user: {
		type: "string",
		name : "User",
		default_value : "e-mail or username",
		ui_opts : { type : "edit", label : true, root_classes : ["form-group"], item_classes : ["input-sm"]}
	    },
	    password :{
		type: "password",
		name : "Password",
		default_value : "your password",
		ui_opts : { type : "edit", label: true, root_classes : ["form-group"]}
	    },
	    status :{
		type  : "string",
		value : "Logging in ...",
		ui_opts : {
		    item_classes : ["text-info"],
		    root_classes : ["form-group"]}
	    },
	    login : {
		name : "Log in",
		type : "action"
	    },
	    fb_login : {
		name : "Facebook log in",
		type : "action"
	    }
	}
    },
    
    signup : {
	name : "Sign Up",
	//type : "action",
	tpl_builder : "signup",
	subtitle : "Choose a method for login",
	intro : "<p>You can create a local account on this server only or use one of the supported platforms providing your authentication for us.</p><p>Additional features might be available if your account is linked to a social-network account. You'll can configure your account settings on your user page once logged in. </p> ",
	intro_visible : true,
	//ui_opts : { sliding  : true, slided : false },
	ui_opts :{
	    child_view_type : "tabbed",
	    tab_classes : ["nav-pills"],
	    root_classes : ["container"],
	    child_classes : ["container"]
	},

	elements : {

	    local : {
		name : "Local account",
		subtitle : "Create a new local account.",
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
				default_value : "name@example.org",
				ui_opts : { type : "edit",
					    root_classes : ["form-group"],
					    label : true,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],
					    wrap : true,
					    wrap_classes : ["col-sm-6"]
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
		type : "template",
		template_name : "sadira",
		name : "Link"
	    },
	    workers : {
		name : "Workers"
	    }
	}

    },
    vector : {
	name : "Vector view",
	tpl_builder: "vector",
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
	tpl_builder : "dbtypes",
	ui_opts : {root_classes : ["container-fluid"], child_classes : ["container"]},
	elements : {}
    },
    dbtemplates : {
	name : "Sadira/tk templates",
	tpl_builder : "dbtemplates",
	ui_opts : {root_classes : ["container-fluid"]},
	elements : {
	    build_progress : { name : "Building templates ... ", type : "progress", value : 0}
	}
    },

    sadira_home : {
	//name : "The Quarklib/Sadira project",
	ui_opts : { root_classes : ["container-fluid"], child_classes : ["container"], child_view_type : "tabbed", name_node : "h2"},
	elements : {
	    welcome : {
		name : "Sadira",
		type : "html",
		url : "/sadira/welcome.html",
		ui_opts : {item_classes : ["container"], name_node:"h2"}
	    },
	    deps : {
		name : "Software deps",
		type : "template",
		template_name : "soft_links",
		ui_opts : {item_classes : ["container"], name_node:"h2"}
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
	    intro_visible : true
	    //child_view_type : "table"
	},
	elements : {
	    node : {
		type : "template", template_name : "soft_tpl",
		ui_opts : {
		    icon : "/sadira/icons/brands/nodejs.svg",
		},
		name : "Node.js",
		intro : "<p>Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.</p>",
		value : "https://nodejs.org/"
	    },
	    mongo : {
		type : "template", template_name : "soft_tpl",ui_opts : {icon : "/sadira/icons/brands/logo-mongodb.png"},
		name : "mongo DB",
		intro : "<p><strong>Agile and Scalable.</strong>MongoDB makes working with a database simple and elegant, providing agility and freedom to scale.</p>",
		value : "http://www.mongodb.org/"
	    }

	    
	}
	
	
    }
    
};


