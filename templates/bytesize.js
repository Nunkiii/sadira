({
    key:"bytesize",
    type : "double",
    widget_builder:function (ok, fail){
	var tpl_item=this;
	var ui_opts=this.ui_opts;
	
	var ui=tpl_item.ui;
	ui_opts.type=ui_opts.type ? ui_opts.type : "short";
	
	switch (ui_opts.type){
	case "short":
	    tpl_item.set_value=function(nv){
		if(typeof nv!='undefined')
		    tpl_item.value=nv;
		//ui.innerHTML=nv;
		//console.log("Bytesize setting val : " + tpl_item.value + " nv = " + nv);
		if(tpl_item.value!==undefined)
		    ui.innerHTML=format_byte_number(tpl_item.value);
		else
		    ui.innerHTML=0+'b';
	    }
	    break;
	case "edit": 
	    break;
	default: 
	    throw "Unknown UI type ";
	}
	
	tpl_item.set_value();
	ok(ui);
    }
})
