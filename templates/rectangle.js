({
    name:"Rectangle",
    //intro:"Origin coordinates and dimensions",
    ui_opts:{
	root_classes:[ "list-group-item col-xs-12 vertical_margin" ],
	name_classes:[ "col-xs-8" ],
	child_classes:[ "col-xs-12 form-inline" ],
	fa_icon:"crop"
    },
    elements:{
	pos:{
	    ui_opts:{
		root_classes:[ "container-fluid" ],
		child_classes:[ "row" ]
	    },
	    elements:{
		x:{
		    name:"x",
		    type:"double",
		    default_value:300,
		    step:1,
		    min:0,
		    ui_opts:{
			type:"edit",
			name_node:"strong",
			wrap:true,
			wrap_classes:[ "col-xs-8 input-group" ],
			root_classes:[ "col-xs-6 " ],
			name_classes:[ "col-xs-4" ],
			item_classes:[ "input-sm" ]
		    }
		},
		y:{
		    name:"y",
		    type:"double",
		    default_value:50,
		    step:1,
		    min:0,
		    ui_opts:{ type:"edit",
			      wrap:true,
			      wrap_classes:[ "col-xs-8 input-group" ],
			      name_node:"strong",
			      root_classes:[ "col-xs-6" ],
			      name_classes:[ "col-xs-4" ],
			      item_classes:[ "input-sm" ] }
		}
	    }
	},
	dims:{
	    ui_opts:{ root_classes:[ "col-sm-12 vertical_margin" ],
		      child_classes:[ "row" ] },
	    elements:{
		w:{
		    name:"width",
		    type:"double",
		    default_value:30,
		    step:1,
		    min:1,
		    ui_opts:{ type:"edit",
			      wrap:true,
			      wrap_classes:[ "col-xs-8 input-group" ],
			      name_node:"strong",
			      root_classes:[ "col-xs-6 " ],
			      name_classes:[ "col-xs-4" ],
			      item_classes:[ "input-sm" ] } },
		h:{
		    name:"height",
		    type:"double",
		    default_value:300,
		    step:1,
		    min:1,
		    ui_opts:{ type:"edit",
			      wrap:true,
			      wrap_classes:[ "col-xs-8 input-group" ],
			      name_node:"strong",
			      root_classes:[ "col-xs-6 " ],
			      name_classes:[ "col-xs-4" ],
			      item_classes:[ "input-sm" ]
			    }
		}
	    }
	}
    },
    key:"rectangle",
    widget_builder:function (ok, fail){
	ok();
    }
})
