({ ui_opts:{ type:"edit" },
  key:"combo",
  widget_builder:function (){
      var combo=this;
      var ui_opts=combo.ui_opts;
      var ui;
      var style=ui_opts.style||"select",ul;
      ui_opts.type='edit';
      
      
      new_event(combo,"change");
    
    if(style==="menu"){
	ui=combo.ui=ce("div"); ui.className="dropdown";
	var a=cc("a",ui);
	a.className="btn btn-default";
	a.id="dLabel";
	//a.setAttribute("type","button");
	a.setAttribute("data-toggle","dropdown");
	a.setAttribute("aria-haspopup",true);
	a.setAttribute("expanded",false);
	a.innerHTML="Dropdown trigger<span class='caret'></span>";
	var ul=cc("ul",ui);
	ul.className="dropdown-menu";
	a.setAttribute("role","button");
	a.setAttribute("aria-labelledby","dLabel");
    }
    else{
	ui=combo.ui=ce("select"); ui.className="form-control";
	
	ui.addEventListener('change', function(c){
	    combo.set_value(this.value);
	
	},false);
	
    }
    
    combo.set_options=function(options){
	
	if(options!==undefined)combo.options=options;
	//console.log(this.name + " Setting options " + JSON.stringify(options));
	if(combo.options===undefined) return;
	//combo.parent.debug(combo.name + " style "+style+" : Setting options :" + JSON.stringify(combo.options));
	//combo.ui.innerHTML="SETTING UP";
	combo.options.forEach(function(ov){
	    var o;
	    if(style==="menu"){
		var l=cc("li",ul); o=cc("a",l);
		if(typeof ov === "string"){
		    o.innerHTML=ov; o.id=ov;
		}else{
		    o.id=ov.value; o.innerHTML=ov.label;
		}
	    }else{
		var o=ov.option_ui=cc("option",ui);
		
		if(typeof ov === "string"){
		    o.value=ov; o.innerHTML=ov;
		}else{
		    o.value=ov.value; o.innerHTML=ov.label;
		}
		
	    }
	});
	
	if(combo.options.length>0 && combo.value===undefined){
	    var oo=combo.options[0];
	    if(typeof oo === "string")
		combo.set_value(oo);
	    else
		combo.set_value(oo.value);
	    
	    if(oo.option_ui!==undefined)
		oo.option_ui.setAttribute("selected",true);
	}
	
    }
    

	
    // }else{
    // 	ui=combo.ui=ce("span");
    // 	ui.className="";
    // }

    
    // combo.set_holder_value=function(v){
    // 	combo.set_value(v);
    // }
    
    // combo.set_value=function(v){
    // 	if(è(v))combo.value=v;
    // 	combo.ui.value=v;
    // 	/*
    // 	else{
    // 	    if(è(combo.options))
    // 		if(combo.options.length>0)
    // 		    combo.value=combo.options[0];
    // 		    }*/
	
    // 	ui.innerHTML=combo.value;
    // }


    //config_common_input(combo);
    
    
    combo.set_value=function(nv){
	
	if(è(nv)){
	    //console.log("COMBO + "+ combo.name + "  set value to " + nv);
	    var ch=(nv!==combo.value);
	    combo.value=nv;
	    if(ch)
	     	combo.trigger("change", combo.value);
	}
	
	if(è(combo.value)){
	    combo.ui.value=combo.value;
	}
	// else
	//     if(è(combo.set_placeholder_value))
	// 	combo.set_placeholder_value();
    }
    
    
    combo.set_default_value=function(){
	if(è(combo.default_value)) return combo.set_value(combo.default_value);
	
	if(è(combo.options))
	    if(combo.options.length>0)
		return combo.set_value(combo.options[0].value);

	//if(è(combo.holder_value)) combo.set_holder_value(combo.holder_value);
    }	

    combo.set_options();
    combo.set_default_value();
    return ui;
} })
