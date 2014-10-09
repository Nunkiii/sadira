var base_templates={

    sadira : {
	//type : "template",
	tpl_builder  : "sadira",
	name : "Sadira link",
	ui_opts : { child_classes : [], child_view_type : "bar"},
	elements : {
	    url : {
		name : "Server address",
		type : "url",
		ui_opts : { editable : true, root_classes : ["inline"], bar : true},
		
		//value : "ws://sadira.iasfbo.inaf.it:9999"
		//value : "ws://localhost:9999"
	    },
	    connect : {
		ui_opts : {root_classes : ["inline"], bar : true},
		type: "action",
		name : "connect"
	    },
	    messages : {
		ui_opts : {sliding : true, slided : false, root_classes : []},
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
    }
};


