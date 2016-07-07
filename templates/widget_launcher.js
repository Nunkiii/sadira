({
    key : "widget_launcher",
    type : "dropdown_item",

    widget_builder : function(ok, fail){
	var wl=this;
	console.log("WL build : " + wl.name + " uiroot " + wl.ui_root);
	
	var parent=wl.get_top_parent('toolbar');if(parent===undefined) return fail("Cannot find a parent toolbar");
	var target=parent.parent;if(target===undefined) return fail("Found toolbar has no parent");
	var launch=wl.usi.launch;if(launch===undefined) return fail("No launch object on template usi");
    
	if(launch.ui_opts===undefined) launch.ui_opts={}; launch.ui_opts.close=true;
	var ico=get_icon(wl.ui_opts);
	
	tmaster.get_template(launch.type).then(function(t){
	    
	    console.log("launcher template " + wl.name); //JSON.stringify(t));
	    wl.set_caption(wl.name===undefined? t.name : wl.name, ico===undefined? get_ico(t) : ico);
	    
	}).catch(function(e){
	    wl.parent.error(e);
	    wl.set_caption(wl.name, ico);
	});
	
	this.listen('click', function(){
	    
	    //target.message("Lauch : " + JSON.stringify(launch));
	    
	    create_widget(launch).then(function(w){

		target.show_widget(w);
		return;
		
		w.listen('close', function(){
		    w.ui_root.parentNode.removeChild(w.ui_root);
		    //wl.hide_content(false);
		});
		//wl.hide_content();
		target.ui_root.appendChild(w.ui_root);
		//insertAfter(parent.ui_root, w.ui_root);
	    }).catch(function(e){
		target.error(dump_error(e));
	    });
	    
	});
	ok();
    }
})
    
