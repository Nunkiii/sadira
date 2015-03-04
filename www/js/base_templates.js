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
	    connect : {
		ui_opts : {root_classes : ["inline"], item_classes : ["btn-xs"]},
		type: "action",
		name : "connect"
	    },
	    messages : {
		ui_opts : {sliding : true, slided : false, root_classes : ["inline"],  label : true},
		name : "Messages",
		type : "text"
	    },
	    status : {
		name : "Status",
		ui_opts : {root_classes : ["inline"],  label : true},
		type : "status",
		value : "blue",
		value_labels : { blue : "not connected", green : "connected", red : "error"}
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
	intro : "Choose a method for login",
	//ui_opts : { sliding  : true, slided : false },
	ui_opts :{ child_view_type : "tabbed", tab_classes : ["nav-pills"], root_classes : ["col-sm-11 col-sm-offset-1"], sliding: false},

	elements : {

	    local : {
		name : "Create a local account",
		subtitle : "It's free and always will be.",
		intro : "Fill up the email and password fields to create your new user account.</p><p> Enter a valid email adress, it will be used to identify you. You'll can configure a username later in your user page if you wish.</p><p> The password will be checked for basic strength.",

		ui_opts : {
		    name_node : "h2",
		    fa_icon : "leaf"
		},
		elements : {

		    data : {
			ui_opts : { child_view_type : "div", child_node_type : "form", child_classes : ["form-horizontal"] },
			elements : {
			    
			    email : {
				//
				name : "Email address",
				type : "string",
				default_value : "name@example.org",
				ui_opts : { type : "edit",
					    root_classes : ["form-group"],
					    label : true,
					    name_classes : ["control-label","col-sm-3"],
					    label_cnt_classes : ["col-sm-6"] }
			    },
			    password : {
				name : "New password",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true ,
					    name_classes : ["control-label","col-sm-3"],label_cnt_classes : ["col-sm-6"] }
			    },
			    password_repeat : {
				name : "Enter password again",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true,
					    name_classes :["control-label","col-sm-3"],label_cnt_classes : ["col-sm-6"] }
			    },
			    signup : {
				name : "Create new account",
				type : "action",
				ui_opts : {
				    type : "edit", label: true,
				    name_classes :["control-label","col-sm-3"],
				    item_classes : ["btn-primary","btn-lg"],
				    root_classes : ["form-group"],
				    label_cnt_classes : ["col-sm-3","col-sm-offset-5"]
				}
			    }
			}
		    },

		}
	    },
	    
	    shib : {
		name : "IDEM signup",
		intro : "Signup using your IDEM-GARR account",
		ui_opts : {
		    name_node : "h2",
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
		intro : "Signup using your Facebook account",
		ui_opts : { fa_icon : "facebook-official", name_node : "h2"},
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
		intro : "Signup using your Google account",
		ui_opts : {
		    name_node : "h2",
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
	ui_opts : {child_classes : ["row"], item_classes : ["row"]},
	elements :{
	    zoom : { name: "Zoom in", type : "action", ui_opts:{item_classes:["btn-xs"], fa_icon : "search-plus"}},  
	    unzoom : { name : "Unzoom", type : "action", ui_opts:{item_classes:["btn-xs"], fa_icon : "search-minus"}},
	    range : {
		type : "labelled_vector",
		name : "Range",
		value_labels : ["start","end"],
		value : [0, 0],
		ui_opts: {root_classes : ["inline"], label : true, fa_icon : "arrows-h", sliding : true, slided: false},
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
    }
};


