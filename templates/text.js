({ key:"text",
   widget_builder:function (ok, fail){
       var tpl_item=this;
       var ui_opts=this.ui_opts;
    var div=tpl_item.ui=ce("div");
    var ui=tpl_item.preui=cc("pre",div);
    //ui.innerHTML="Hello!!!!!!!!!!!!!!"
    ui.add_class("text");

    tpl_item.set_value=function(nv){
	
	if(typeof nv !='undefined')
	    this.value=nv;
	
	//console.log("HTML text to " + this.value + " ui is " + ui);
	
	if(typeof this.value !== 'undefined')
	    tpl_item.preui.innerHTML=this.value;
    }
    
    tpl_item.append=function(txt){
	if(typeof this.value === 'undefined')
	    this.set_value(txt);
	else{
	    
	    this.value+=txt;
	    this.set_value();
	}
	this.ui.scrollTop = this.ui.scrollHeight;
    }
    
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "edit": 
	ui.setAttribute("contentEditable",true);
	ui.onchange=function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange)
		tpl_item.onchange();
	}
	break;
    default: break;
    }

    tpl_item.set_value();
       ok(tpl_item.ui);
} })
