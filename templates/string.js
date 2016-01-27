({
  name : "Text string",
  key:"string",
  ui_opts:{
//    root_classes:[ "form-group" ]
  },
  
  widget_builder:function (ok, fail){
    var tpl_item=this;
    var ui_opts=this.ui_opts;
    if(ù(ui_opts.type)) ui_opts.type="short";
    var ui;

    switch (ui_opts.type){

    case "short":
	
	ui=tpl_item.ui=ce(è(ui_opts.text_node)?ui_opts.text_node :"div");
	//ui.className="value";
	//ui=document.createElement("div");
	//tpl_item.ui.innerHTML="CATSO!!!!!";
	//break;
	tpl_item.set_value=function(nv){

	    if(tpl_item.item_ui !== undefined)
		ui=tpl_item.item_ui;
	    
	    if(nv !==undefined)
		tpl_item.value=nv;

	    //console.log(tpl_item.name + " : STRING Set name to " +tpl_item.value);
	    //ui.innerHTML="MERDE!!!!!";
	    
	    if(tpl_item.value !== undefined){
		tpl_item.ui.innerHTML=tpl_item.value;
		//console.log("INH = " + tpl_item.ui.innerHTML);
		//tpl_item.set_title(tpl_item.value);
		//tpl_item.item_ui.innerHTML=tpl_item.value;
	    }
	    //else
	//	ui.innerHTML="Not defined !";
	}
	
	tpl_item.set_alert=function(m){
	    if(tpl_item.item_ui !== undefined) ui=tpl_item.item_ui;
	    
	    var t=m.type==="error"?"danger":m.type;
	    ui.className="";
	    
	    if(è(ui_opts.item_classes))
		add_classes(ui_opts.item_classes, ui);
	    ui.add_class("alert-"+t);
	    
	    tpl_item.set_value(//tpl_item.value +
		"<strong>"+m.type+" :</strong>"+m.content+"<br/>");
	    //tpl_item.set_value(m.type+" :"+m.content);
	}

	break;

    case "edit":
	
	//var uui=ui=ce("div");
	
	ui=ce("input");
	ui.type="text";
	ui.className="form-control";
	
	ui.addEventListener("input",function(){
	    //console.log("INPUT Event ont text");
	    tpl_item.set_value(this.value); 
	    
	},false);

	ui.addEventListener("keydown",function(e){
	    if(e.keyCode == 13){
		//console.log("Helloooo !");
		//
		tpl_item.set_value(this.value);
		if(ui_opts.editable !== undefined){
		    e.preventDefault();
		    //console.log("Helloooo EDIT !");
		    tpl_item.ui_opts.type="short";
		    tpl_item.rebuild();
		}
		return false;
	    }
	}, false);



	break;
    default: 
	return fail("Unknown UI type for string");
    }
    
    tpl_item.ui=ui;
    config_common_input(tpl_item);
    
    ok(ui);
  } })
