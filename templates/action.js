({
  key:"action",
  widget_builder:function (ok,fail){
    var action=this;
    var ui_opts=action.ui_opts;
    var ui;
    var bnode=è(ui_opts.button_node) ? ui_opts.button_node : "button";
    
    if(è(action.link)){
      
	ui = action.ui=ce("a");
	ui.href=action.link;

    }else{
	
	ui = action.ui= ce(bnode);

	new_event(action,"click");

	if(bnode === 'input' || bnode === 'button')
	    ui.type="button";
	
	ui.addEventListener("click",function(e){
	    action.trigger("click", action);	    
	},false);
    }

    
    action.ui=ui;
    

    if(ù(ui_opts.item_classes))
	ui.className="btn btn-default btn-sm";
    else
	if(è(ui_opts.wrap_classes)){
      add_classes(ui_opts.item_classes, ui);
	    delete ui_opts.item_classes;
	}

    ui.innerHTML="";
    if(è(ui_opts.fa_icon)){
	//console.log("Setting fa icon !! ");
	if(bnode!=="span")
	    ui.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
	else
	    ui.add_class("fa fa-"+ui_opts.fa_icon);
    }
    ui.innerHTML+=action.name;
    
    // if(è(ui_opts.btn_type))
    // 	ui.className+=" btn-"+ui_opts.btn_type;
    
    action.disable_element=function(dis){
	if(dis)
	    ui.setAttribute("disabled",true);
	else
	    ui.removeAttribute("disabled");
    }

    if(è(action.onclick)) action.listen("click", action.onclick);
    


    action.listen("name_changed", function(title){
	ui.innerHTML="";
	if(è(ui_opts.fa_icon)){
	    //console.log("Setting fa icon !! ");
	    ui.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
	}
	ui.innerHTML+=action.name;
    });
    /*    
	  var pmon=new proc_monitor;
	  action.ui_root.appendChild(pmon);
    */  
    if(è(action.elements)){
	
	action.ui_root.removeChild(action.ui_childs.div);
	//if(è(action.ui_intro)) action.ui_root.removeChild(action.ui_intro);
	
	var slide_button=cc("span", action.ui_title_name);
	slide_button.style.zIndex=action.ui_root.style.zIndex+1;
	
	slide_button.className="slide_button h open";
	//slide_button.innerHTML= slided ? "❌" : "▶"; 
	//slide_button.innerHTML= "▶"; 
	var slided=false;
	var cnt=action.ui_name;

	action.ui_title_name.addEventListener("click",function(){
	    //slide_button.addEventListener("click",function(){
	    if(slided){
		//if(è(action.elements))
		if(è(action.ui_intro))cnt.removeChild(action.ui_intro);
		cnt.removeChild(action.ui_childs.div);
		cnt.removeChild(ui);
		slide_button.className="slide_button h open";
		//slide_button.innerHTML= "▶"; 
		
	    }else{
		//if(è(action.elements.ui))
		if(è(action.ui_intro))cnt.appendChild(action.ui_intro);
		cnt.appendChild(action.ui_childs.div);
		cnt.appendChild(ui);
		//slide_button.innerHTML= "❌";
		slide_button.className="slide_button h close";
	    }
	    slided=!slided;
	});
	
	
	//action_ui=true;
	//action_tpl=action.elements.ui;
	//    action_ui=create_ui({}, action_tpl );
	
    }else{
	//ui=action.ui=ce("input"); ui.type="button";
	
	if(è(action.ui_title_name)){
	    if(action.ui_name!==undefined)
		;//action.ui_name.removeChild(action.ui_title_name);
	}
	
	if(action.ui_name !== undefined){
	    if(action.ui_name.parentNode===action.ui_root)
		action.ui_root.removeChild(action.ui_name);
	}
    }	


       ok(ui);

} })
