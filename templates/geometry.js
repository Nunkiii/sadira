({
    name:"Geometry",
    ui_opts:{
	child_view_type:"div",
	fa_icon:"crop",
	root_classes:[ "col-md-12" ],
	child_classes:[ "container-fluid" ]
    },
    elements:{
	zoom:{
	    name:"Scale",
	    type:"double",
	    min:0.0001,
	    max:1000,
	    step:0.001,
	    value:1.0,
	    ui_opts:{
		editable:true,
		root_classes:[ "list-group-item inline" ],
		item_classes:[ "inline" ],
		sliding:false,
		sliding_dir:"h",
		slided:true,
		name_node : "strong",
		fa_icon:"crosshairs"
	    }
	},
	translation:{
	    name:"Translation",
	    tip:"Translation vector in image pixels units",
	    type:"labelled_vector",
	    value:[ 0,
		    0 ],
	    value_labels:[ "T<sub>X</sub>",
			   "T<sub>Y</sub>" ],
	    min:"-8192",
	    max:"8192",
	    step:"1",
	    ui_opts:{
		name_node : "strong",
		root_classes:[ "list-group-item inline number_fixed_size" ],
		child_classes:[ "inline" ],
		editable:true,
		sliding:false,
		sliding_dir:"h",
		slided:true,
		fa_icon:"arrows"
		
	    }
	},
	rotation:{
	    name:"Rotation",
	    ui_opts:{
		sliding:false,
		sliding_dir:"h",
		slided:true,
		root_classes:[ "list-group-item inline" ],
		//label:true,
		name_node : "strong",
		fa_icon:"rotate-left",
		child_classes:[ "inline" ]
	    },
	    elements:{
		angle:{
		    name:"R<sub>α</sub>",
		    type:"angle",
		    value:0,
		    min:-100,
		    max:100,
		    step:0.02,
		    tip:"Rotation angle value, in radians, trigonometric counting",
		    ui_opts:{
			editable:true,
			root_classes:[ "inline" ],
			label:true,
			item_classes:[ "inline" ]
		    }
		},
		center:{
		    name:"R<sub>C</sub>",
		    tip:"Rotation center in image frame pixel units",
		    type:"labelled_vector",
		    value:[ 0,
			    0 ],
		    value_labels:[ "Rx",
				   "Ry" ],
		    min:"-8192",
		    max:"8192",
		    step:"1",
		    ui_opts:{ root_classes:[ "inline" ],
			      child_classes:[ "inline" ],
			      editable:true,
			      sliding:false,
			      sliding_dir:"h",
			      slided:false,
			      label:true
			    }
		}
	    }
	}
    },
    key:"geometry",
    widget_builder:function (ok, fail){ ok(); }
})
