({
    key : "widget_launcher",
    type : "dropdown_item",

    widget_builder : function(ok, fail){
	var wl=this;
	console.log("WL build");
	
	this.listen('click', function(){
	    function fail(m){
		console.log(dump_error(m));
		//for(var e in wl.usi) console.log("WU " +e);
		return;
	    }
	    
	    var parent=wl.get_top_parent('toolbar');if(parent===undefined) return fail("Cannot find a parent toolbar");
	    var target=parent.parent;if(target===undefined) return fail("Found toolbar has no parent");
	    var launch=wl.usi.launch;if(launch===undefined) return fail("No launch object on template usi");
	    
	    if(launch.ui_opts===undefined) launch.ui_opts={}; launch.ui_opts.close=true;

	    target.message("Lauch : " + JSON.stringify(launch));
	    
	    create_widget(launch).then(function(w){
		w.listen('close', function(){
		    w.ui_root.parentNode.removeChild(w.ui_root);
		});

		insertAfter(parent.ui_root, w.ui_root);
	    }).catch(fail);
	    
	});
	ok();
    }
})
    
