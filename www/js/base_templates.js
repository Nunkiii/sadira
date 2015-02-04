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
		ui_opts : { editable : true, root_classes : [], bar : true},
		value : "sadira.iasfbo.inaf.it"
		//value : "ws://localhost"
		//value : "ws://localhost:9999"
	    },
	    connect : {
		ui_opts : {root_classes : ["inline"], bar : true},
		type: "action",
		name : "connect"
	    },
	    messages : {
		ui_opts : {sliding : true, slided : false, root_classes : [], bar : true},
		name : "Messages",
		type : "text"
	    },
	    status : {
		name : "Status",
		ui_opts : {root_classes : ["inline"], bar : true},
		type : "status",
		value : "blue",
		value_labels : { blue : "not connected", green : "connected", red : "error"}
	    }
	}
    },
    login : {
	name : "Login",
	type : "login",
	ui_opts : {sliding: true, slided : false}
    },
    
    signup : {
	name : "Signup",
	//type : "action",
	tpl_builder : "signup",
	intro : "Choose a method for login",
	//ui_opts : { sliding  : true, slided : false },
	ui_opts :{ child_view_type : "radio", root_classes : [], sliding: false},

	elements : {

	    local : {
		name : "Lacal signup",
		intro : "Fill up the email and password fields to create your new user account. Enter a valid email adress, it will be used to identify you. You'll can configure a username later if you wish. The password will be checked for basic strength.",
		elements : {

		    data : {
			ui_opts : { child_view_type : "div", child_classes : ["list-group"] },
			elements : {
			    
			    email : {
				//
				name : "Email address",
				type : "string",
				default_value : "name@example.org",
				ui_opts : { type : "edit"}
			    },
			    password : {
				name : "New password",
				type : "password",
			ui_opts : { type : "edit"}
			    },
			    password_repeat : {
				name : "Enter password again",
				type : "password",
				ui_opts : { type : "edit"}
			    }
			}
		    },
		    signup : {
			name : "Create new account",
			type : "action"
		    }
		}
	    },
	    
	    shib : {
		name : "IDEM signup",
		elements : {

		    signup : {
			name : "Signup !",
			type : "action"
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
	elements :{
	    range : {
		type : "labelled_vector",
		name : "Range",
		value_labels : ["start","end"],
		value : [0, 0],
		ui_opts: {root_classes : []},
	    },
	    selection : {
		type : "labelled_vector",
		name : "Selection",
		value_labels : ["start","end"],
		value : [0, 0],
		ui_opts: {root_classes : []},
	    },
	    zoom : { name: "Zoom in", type : "action", ui_opts:{root_classes:[], sliding : false}},  
	    unzoom : { name : "Unzoom", type : "action", ui_opts:{root_classes:[]}}
	}
    }
    
    
};


