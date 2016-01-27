({ key:"image_url",
  widget_builder:function (ui_opts, tpl_item){
    var ui=tpl_item.ui=ce("div");
    
    function load_image(){
	if(typeof tpl_item.value!='undefined')
	    img.src=tpl_item.value;
    }

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	//var utext=cc("div",ui);
	//utext.add_class("value");
	
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	  //  utext.innerHTML=tpl_item.value;
	    load_image();
	}
	break;
    case "edit": 
	var utext=tpl_item.ui=ce("input");
	utext.type="url";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')tpl_item.value=nv;
	    utext.value=tpl_item.value;
	    load_image();
	}
	tpl_item.get_value=function(){
	    return utext.value;
	}

	utext.onchange=function(){
	    tpl_item.value=this.value; 
	    load_image();
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}
	break;
    default: 
	throw "Unknown UI type ";
    }
    var img=cc("img",ui);
    load_image();

    return tpl_item.ui;
} })