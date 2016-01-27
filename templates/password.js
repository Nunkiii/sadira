({ key:"password",
   widget_builder:function (ok, fail){
       var tpl_item=this;
       var ui_opts=tpl_item.ui_opts;
       ui_opts.type=ui_opts.type ? ui_opts.type : "short";
       new_event(tpl_item,"change");
       //console.log(tpl_item.name + " building ....");
       
       var ui;
       switch (ui_opts.type){

    case "short":

	ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined')
		tpl_item.value=nv;
	    if(typeof tpl_item.value !== 'undefined')
		ui.innerHTML=tpl_item.value;
	}
	break;

    case "edit":
	var cnt;
	if(ui_opts.wrap){
	    ui=ce("div");
	    ui.className="input-group";
	    cnt=ui;
	 }else{
	     cnt=tpl_item.ui_root;
	 }
	
	var pui=tpl_item.pui=cc("input",cnt);
	var lab=tpl_item.lui=cc("span",cnt);
	
	lab.className="btn btn-default input-group-addon";
	lab.innerHTML="<i class='fa fa-eye'></i>";
	//var show=cc("input",lab); show.type="checkbox";
	pui.className="form-control";
	pui.type="password";
	//pui.className="form-control";
	pui.show=false;

	lab.onclick=function(){
	    pui.show=!pui.show;
	    pui.type= pui.show ? "text" : "password";
	    var eye=pui.show ? "-slash" : "";
	    lab.innerHTML="<i class='fa fa-eye"+eye+"'></i>";
	    //console.log("pt = " + pui.type);

	}
	tpl_item.set_value=function(nv){
	    if(typeof nv !='undefined'){
		tpl_item.value=nv;
		pui.value=tpl_item.value;
	    }
	    else
		if(è(tpl_item.holder_value)){
		    //console.log("Setting placeholder value");
		    pui.setAttribute("placeholder",tpl_item.holder_value);
		}
	    
	    
	}
	tpl_item.get_value=function(){
	    return pui.value;
	}
	pui.addEventListener("change", function(){
	    tpl_item.value=this.value; 
	    tpl_item.trigger("change");
	});
	
	tpl_item.set_value();
	
	break;
    default: 
	throw "Unknown UI type ";
    }
    
       ok(ui);
} })
