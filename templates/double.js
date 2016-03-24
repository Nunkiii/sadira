({ name:"Number",
   //subtitle:"Not set",
  ui_opts:{ root_classes:[ "form-group" ] },
  widget_builder:function (ok, fail){


  var tpl_item=this;
  var ui_opts=tpl_item.ui_opts===undefined? {} : tpl_item.ui_opts;
  //console.log(tpl_item.name + " : double builder :  " + JSON.stringify(ui_opts));
  
  ui_opts.type=ui_opts.type ? ui_opts.type : "short";
  var ui;

  tpl_item.set_parameters=function(min, max, step){
    if(min!==undefined) ui.min=min;
    if(max!==undefined) ui.max=max;
    if(step!==undefined) ui.step=step;
  };
  
  switch (ui_opts.type){
    case "short":
      ui=tpl_item.ui=ce("span");
      ui.className="text-muted";
		tpl_item.set_value=function(nv){
	//console.log(tpl_item.name + " DOUBLE SHORT set value " + nv);
	if(è(nv))
	tpl_item.value=nv; 
	if(è(tpl_item.value))
	tpl_item.ui.innerHTML=Math.floor(tpl_item.value*1000)/1000;
      }
      ui.addEventListener("change",function(){
	tpl_item.trigger("change", tpl_item.value);
	
      },false);
      break;
		
    case "edit": 
      
      ui=tpl_item.ui=ce("input");
      ui.className="form-control";
      
      if(ui_opts.input_type)
      ui.type=ui_opts.input_type;
		else
		    ui.type="number";
		
		
		tpl_item.set_value=function(nv){
		    
		    if(è(nv))
			tpl_item.value=nv; 
		    if(è(tpl_item.value))
			tpl_item.ui.value=tpl_item.value; //Math.floor(tpl_item.value*1000)/1000;
		};
		
		tpl_item.set_parameters(tpl_item.min,tpl_item.max,tpl_item.step);
		
		break;
	    default: 
		throw "Unknown UI type " + ui_opts.type + " for " + tpl_item.name;
	    }
  
	    config_common_input(tpl_item);
  ok(ui);
	},
  key:"double" })
