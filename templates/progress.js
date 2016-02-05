({ ui_opts:{},
  key:"progress",
  widget_builder:function (ok, fail){
    var prog=this;
    //var ui=prog.ui=ce("div");
    //ui.className="progress";
    var cui=ce("div");
    var pui=prog.ui=cc("div",cui);

    pui.className="progress-bar";
    cui.className="progress";

    
    prog.setup_ui=function(){
	
	pui.setAttribute("role","progressbar");
	pui.setAttribute("aria-valuemin",prog.min);
	pui.setAttribute("aria-valuemax",prog.max);
	
	if(typeof prog.value ==='undefined') prog.value=0.0;
	if(typeof prog.min ==='undefined') prog.min=0.0;
	if(typeof prog.max ==='undefined') prog.max=100.0;
	if(typeof prog.max ==='undefined') prog.value=0.0;

    }

    prog.set_value=function(v){
	if(typeof v !=='undefined')
	    prog.value=v;
	if(isFinite(prog.value)){
	    pui.style.width=prog.value+"%";
	    pui.setAttribute("aria-valuenow",prog.value);
	    pui.innerHTML=prog.value+"%";
	}
    }
    prog.setup_ui();
    prog.set_value();
    
      ok(cui);
} })
