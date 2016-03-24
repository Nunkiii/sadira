({
    key : "spectro_view",
    name:"Spectrograph",
    type:"spectrum",
    y_range:[ 0, 255 ],
    ui_opts:{
	name_edit:false,
	intro_stick:true,
	fa_icon:"line-chart",
	root_classes:[ "col-md-7 col-xs-12 container-fluid" ],
	toolbar_brand:true,
	save:"Spectro view config",
	default_child:"none"
    },
    elements:{
	keys:{
	    ui_opts:{
		//create:false
	    }
	},
	view:{ ui_opts:{} },
	lines:{
	    name:"Display features",
	    subtitle:"Add spectral features to be displayed in the live spectrum.",
	    ui_opts:{ fa_icon:"magnet" }
	},
	fileops:{
	    name:"Save spectrum",
	    subtitle:"Save visible spectrum on browser's webstorage",
	    type:"object_save",
	    collection:"spectra",
	    ui_opts:{
		fa_icon:"save",
		root_classes:[ "col-sm-12 vertical_padding panel" ],
		child_classes:[ "row" ]
	    },
	    widget_builder:function (ok, fail){
		console.log("Fieops done !!");
		ok();
	    },
	    elements:{
		// p:{
		//     ui_opts:{ prep:true },
		//     elements:{
		// 	// ui_opts:{
		// 	// 	  root_classes:[ "col-sm-10 col-xs-12" ],
		// 	// 	  child_classes:[ "row" ]
		// 	// },
		// 	specname:{ type:"string",
		// 		   name:"Name :",
		// 		   holder_value:"Auto (Date)",
		// 		   ui_opts:{
		// 		       root_classes:[ "col-xs-12 col-sm-6" ],
		// 		       wrap:true,
		// 		       wrap_classes:[ "col-xs-8 input-group" ],
		// 		       name_classes:[ "col-xs-4" ],
		// 		       type:"edit" }
		// 		 },
		// 	target:{
		// 	    type:"string",
		// 	    name:"Target :",
		// 	    holder_value:"An interesting light source",
		// 	    ui_opts:{ root_classes:[ "col-xs-12 col-sm-6" ],
		// 		      wrap:true,
		// 		      wrap_classes:[ "col-xs-8 input-group" ],
		// 		      name_classes:[ "col-xs-4" ],
		// 		      type:"edit" }
		// 	}
		//     }
		// }
	    }
	}
    },
    widget_builder:function (ok, fail){
	var sv=this;
	console.log(sv.name + " Specview BUILDER !!");
	this.deserialize=function(d){
	}
	ok();
	//sv.ui_childs.remove_child(sv.elements.keys);
    }
})
