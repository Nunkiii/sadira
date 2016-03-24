({
    name:"Cursor",
    ui_opts:{ root_classes:[ "container-fluid" ],
	      child_classes:[ "container-fluid" ] },
    elements:{
	position:{
	    ui_opts:{
		root_classes:[ "container-fluid panel panel-default" ],
		child_classes:[ "row" ]
	    },
	    elements:{
		screen:{ type:"labelled_vector",
			 name:"Screen pixel",
			 value_labels:[ "X",
					"Y" ],
			 value:[ 0,
				 0 ],
			 ui_opts:{ label:true,
				   root_classes:[ "col-sm-6" ],
				   child_classed:[ "inline" ] } },
		astro:{ type:"labelled_vector",
			name:"Equatorial coordinates",
			value_labels:[ "Ra",
				       "Dec" ],
			value:[ 0,
				0 ],
			ui_opts:{ label:true,
				  root_classes:[ "col-sm-6" ],
				  child_classed:[ "inline" ] } } } },
	layers:{
	    ui_opts:{
		root_classes:[ "col-sm-12" ],
		child_classes:[ "row" ]
	    },
	    elements : {
		l0 : {
		    ui_opts : { root_classes : ["disabled"]},
		    type : "cursor_layer_info"
		},
		l1 : {
		    ui_opts : { root_classes : ["disabled"]},
		    type : "cursor_layer_info"
		},
		l2 : {
		    ui_opts : { root_classes : ["disabled"]},
		    type : "cursor_layer_info"
		},

		
		l3 : {
		    ui_opts : { root_classes : ["disabled"]},
		    type : "cursor_layer_info"
		}
		
	    }
	}
    },
    key:"cursor_info",
    widget_builder:function (ok, fail){
	ok();
    }
})
