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
		value : "ws://sadira.iasfbo.inaf.it"
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


