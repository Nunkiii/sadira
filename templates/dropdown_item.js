({
    key : "dropdown_item",
    ui_opts : {
	root_node : 'a',
	root_classes : 'dropdown-item',
	render_name : false
    },
    widget_builder : function(ok, fail){
	new_event(this,'click');
	var a=this.ui_root;
	a.href="javascript:void(0)";
	var ico=get_icon(this.ui_opts);
	//console.log("Get icon for " + JSON.stringify(this.ui_opts) + " ico " + ico);
	if(ico!==undefined) a.appendChild(ico);
	a.innerHTML+=this.name;
	a.addEventListener('click',function(){this.trigger('click'); });
	ok();
    }
})
