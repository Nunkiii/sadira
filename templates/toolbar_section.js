({
    key:"toolbar_section",
    ui_opts:{
	root_node:"ul",
	root_classes:[ "nav navbar-nav" ],
	child_view_type:"root"
    },
    widget_builder:function (ok, fail) {
	
	
	var p=this.get_parent();
	if(p.type!=="toolbar"){
	    if(p.toolbar !== undefined){
		//this.ui_opts.attach=false;
		//p.toolbar.dnav.prependChild(this.ui_root);
	    }
	}
	
	ok();
    }
    
})
