({ widget_builder:function (ok, fail){
	    var tpl_item=this;
	    var ui_opts=tpl_item.ui_opts;
	    tpl_item.ui_root.add_class('checkbox');
	    ui_opts.type=è(ui_opts.type) ? ui_opts.type : "short";
	    ui_opts.name_after=true;
	    
	    new_event(tpl_item,"change");
	    
	    var ui;
	    tpl_item.set_value=function(nv){
		
		//console.log("Bool : " + tpl_item.name + " : " + nv);
		if(nv !== undefined){
		    tpl_item.value=nv;
		    tpl_item.trigger("change", tpl_item.value);
		}
		else
		    if(tpl_item.value===undefined)
			if(tpl_item.default_value!==undefined)
			    tpl_item.value=tpl_item.default_value;
		
		if(tpl_item.value===undefined)tpl_item.value=false;
		if(ui!==undefined)
		    ui.checked=tpl_item.value;
	    }
	    
	    
	    switch (ui_opts.type){
	    case "short":
		ui=tpl_item.ui=ce("span");
		//ui.className="value";
		tpl_item.set_value=function(nv){
		    if(typeof nv !='undefined')tpl_item.value=nv;
		    ui.innerHTML=tpl_item.value? "On":"Off";
		}
	break;
	    case "edit": 
		//var lab=ce("label"); lab.innerHTML=tpl_item.name;
		//if(è(tpl_item.ui_name))
		//    tpl_item.ui_root.removeChild(tpl_item.ui_name);
		
		//tpl_item.ui_name.innerHTML="";
		//var ui=tpl_item.ui=cc("input", tpl_item.ui_name, true);
		ui=tpl_item.ui=ce("input");
		//ui.innerHTML=tpl_item.name;
		ui.type="checkbox";
		
		//tpl_item.ui_root.add_class("checkbox");
		//tpl_item.ui_root.appendChild(lab);
		
		
		
		ui.addEventListener("change",function(){
		    tpl_item.set_value(this.checked); 
		});
		break;
	    default: 
		throw "Unknown UI type ";
	    }
	    
	    tpl_item.set_value();
	    if(ui_opts.label!==true)
		return tpl_item.ui;
	    else {
		tpl_item.ui_name.prependChild(tpl_item.ui);
  }
    ok();
	},
  key:"bool" })
