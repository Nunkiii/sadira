({
  key:"color",
  widget_builder:function (ok, fail){
    //console.log(tpl_item.name + " color builder " + tpl_item.value);
    var tpl_item=this;
    var ui_opts=tpl_item.ui_opts;
    
    var ui=tpl_item.ui=ce("div"); ui.className="color_container";
    var cui=ce("input"); cui.type="color";
    ui.appendChild(cui);

    new_event(tpl_item,"change");
    
    cui.addEventListener("input", function() {
	
        ui.style.backgroundColor = this.value;

	tpl_item.value=this.value;
	tpl_item.trigger("change", this.value);
	
    },false);

    ui.style.backgroundColor = cui.value;    
    
    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv;
	cui.value=tpl_item.value;
	ui.style.backgroundColor = nv;
	
	/*
	if ("createEvent" in document) {
	    var evt = document.createEvent("HTMLEvents");
	    evt.initEvent("change", false, true);
	    cui.dispatchEvent(evt);
	}
	else
	    cui.fireEvent("onchange");
	*/

	//cui.trigger(new Event('change'));
    }

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";

    switch (ui_opts.type){
    case "short":
	break;
    case "edit": 
	/*
	cui.addEventListener("change",function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	*/
	break;
    default: 
	throw "Unknown UI type ";
    }

    tpl_item.set_value();
    ok(tpl_item.ui);
} })
