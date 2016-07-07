({
    key : "dropdown_item",
    ui_opts : {
	root_node : "a",
	root_classes : "dropdown-item",
	render_name : false
    },
    widget_builder : function(ok, fail){
	var ddi=this;
	new_event(this,'click');
	var a=ddi.ui_root;
	console.log("dropdown ui root is " + ddi.ui_root);
	a.href="javascript:void(0)";

	console.log("dropdown ui root is " + ddi.ui_root);
	
	ddi.set_caption=function(name, ico){
	    ddi.ui_root.innerHTML="";
	    if(ico!==undefined) ddi.ui_root.appendChild(ico);
	    
	    ddi.ui_root.innerHTML+=name;
	}

	var ico=get_icon(this.ui_opts);
	ddi.set_caption(this.name, ico);
	
	a.addEventListener('click',function(){ddi.trigger('click'); });
	ok();
    }
})
