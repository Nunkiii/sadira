function add_classes(classes, class_node){

    if(!class_node || !classes) return;
    for(var c=0;c<classes.length;c++)
	class_node.className+=" "+classes[c];
}

function tab_widget(classes){

    var div=this.div=ce("div"); 
    div.className="tab_widget";
    add_classes(classes,div)

    var nav=this.nav=ce("nav");
    var lm=this;

    div.appendChild(this.nav);

    this.frames=[];

    this.select_frame=function(f){
	if(typeof this.selected_frame!='undefined'){
	    this.selected_frame.div.style.display='none';
	    this.selected_frame.className="normal_tab";
	}
	f.div.style.display='block';
	this.selected_frame=f;
	this.selected_frame.className="selected_tab";
	return f;
    }

    this.add_frame=function(title){

	var li=nav.appendChild(ce("li"));
	li.innerHTML=title;
	li.div=div.appendChild(ce("div"));
	li.div.className="tab_section";
	li.div.style.display='none';
	this.frames.push(li);
	
	li.onclick=function(){
	    console.log("Click!!");
	    lm.select_frame(this); //xd.fullscreen(false);
	}
	if(this.frames.length==1) this.select_frame(li);

	return li;
    }
    
    return this;
}


var local_templates=function(){
  this.templates={};
}

local_templates.prototype.add_templates=function(templates){
  for(var tname in templates){
    this.templates[tname]=templates[tname];
  }
}

local_templates.prototype.substitute_template=function(tpl_item){
  if(tpl_item.type=="template"){
    var tpl=this.templates[tpl_item.template_name];
    tpl_item.elements=clone_obj(tpl.elements);
    for(var o in tpl){
      switch(o){
	  case "name" : if(!tpl_item.name) tpl_item.name=tpl.name; break;
	  case "elements" : break;
	  default:
	  tpl_item[o]=tpl[o];
      }
    }
    return true;
  }
  return false;
}

local_templates.prototype.substitute_templates=function(tpl_item){
  this.substitute_template(tpl_item);
  for (var e in tpl_item.elements){
    this.substitute_templates(tpl_item.elements[e]);
  }
}

local_templates.prototype.build_template=function(template_name){
  var tpl= clone_obj(this.templates[template_name]);
//  console.log("TPL= " + JSON.stringify(tpl));
  this.substitute_templates(tpl);
  //console.log("TPL AFTER= " + JSON.stringify(tpl));
//  console.log("TPL= " + JSON.stringify(this.templates));
  return tpl;
}

template_ui_builders={};

template_ui_builders.default_before=function(ui_opts, tpl_item){
    tpl_item.get_value=function(){return tpl_item.value; }
}
template_ui_builders.default_after=function(ui_opts, tpl_item){

    if(typeof tpl_item.set_value != 'undefined' && typeof tpl_item.value != 'undefined'){
	tpl_item.set_value(tpl_item.value);
    }
}


function create_item_ui(ui_opts, tpl_node){
    
    var tpl_name=tpl_node.type;
    if(typeof tpl_name=='undefined') throw "No valid template name on tpl_node...";
    if(tpl_name=="template") return;
    //console.log("Building ["+tpl_name+"]");//...." + JSON.stringify(tpl_node,null,4));
    var builder=template_ui_builders[tpl_name];
    if (!builder){
	throw "Cannot build object type [" + tpl_name +"]";
    }
    template_ui_builders.default_before(ui_opts,tpl_node);
    var ui=builder(ui_opts, tpl_node);
    template_ui_builders.default_after(ui_opts,tpl_node);
    return ui;
}


function create_ui(global_ui_opts, tpl_root, depth){

    if(!depth){
	depth=0;
    }
    //if(typeof tpl_root.ui_opts == 'undefined' ) tpl_root.ui_opts={type:"short"}; 

    if(typeof tpl_root.ui_opts == 'undefined') tpl_root.ui_opts=global_ui_opts;
    else
	for(var o in global_ui_opts) 
	    if(!tpl_root.ui_opts[o])tpl_root.ui_opts[o]=global_ui_opts[o];

    var ui_opts=tpl_root.ui_opts;    
    var ui_root=tpl_root.ui_root=ce("div"); 
    
    var ui_name=tpl_root.ui_name= ui_opts.label ? ce("label") : ce("h1");
    
    ui_root.className="db";
    
    if(!ui_opts.label)
	ui_name.className="dbname";
    
    if(depth==0) ui_root.className+=" root";
    
    if(typeof ui_opts.root_classes != 'undefined')
	add_classes(ui_opts.root_classes, ui_root);
    
    if(typeof ui_opts.name_classes != 'undefined')
	add_classes(ui_opts.name_classes, ui_name);
    
    ui_root.appendChild(ui_name); 
    ui_name.innerHTML=tpl_root.name;

    tpl_root.enable=function(state){
	if(!state)
	    this.ui_root.add_class("disabled");
	else
	    this.ui_root.remove_class("disabled");
    }

    function rebuild(){
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );
	var cnt=new_ui.container=tpl_root.container;
	cnt.replace_child(new_ui, ui_root);
    }
    
    if(ui_opts.editable){

	var clickable_zone;
	if(ui_opts.type=="edit"){
	    ui_root.className+=" un_editable";
	    clickable_zone=ui_name;
	}else{
	    ui_root.className+=" editable";
	    clickable_zone=ui_root;
	}

	clickable_zone.addEventListener("click", function(){
	    console.log("Editable clicked");
	    if(ui_opts.type=="edit"){
		ui_opts.type="short";
	    }else{
		ui_opts.type="edit";
	    }
	    rebuild();
	}, true);
    }
    
    
    if(tpl_root.type){
	try{
	    
	    var item_ui=create_item_ui(ui_opts, tpl_root);
	    if(item_ui){
		if(ui_opts.label){
		    ui_name.appendChild(item_ui);
		    item_ui.className+=" value";
		}
		else{
		    ui_root.appendChild(item_ui);
		    item_ui.className+=" dbitem";
		}
		
		if(typeof ui_opts.item_classes != 'undefined')
		    add_classes(ui_opts.item_classes, item_ui);
	    }
	}
	catch(e){
	    console.log("Error building : " + dump_error(e));
	}
    }

    //var ne=0; for (var e in tpl_root.elements){ console.log(tpl_root.name + " + E("+ne+")="+e); ne++; }
    //console.log(tpl_root.name + " : -->Nchilds = " + ne);
    
    if(!tpl_root.elements) return ui_root;

    var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
    var ui_childs=tpl_root.ui_childs={};
    
    switch(cvtype){
    case "div":
	ui_childs.div=ce("div"); 
	ui_childs.div.className="childs";
	ui_childs.add_child=function(e,ui){ui_childs.div.appendChild(ui);}
	ui_childs.replace_child=function(new_ui,ui){
	    ui_childs.div.replaceChild(new_ui, ui);
	    console.log("Replaced UI!");
	}
	break;
    case "tabbed":
	ui_childs=new tab_widget();
	ui_childs.div.className+=" childs";
	ui_childs.add_child=function(e,ui){
	    var f=ui_childs.add_frame(e.name); 
	    e.ui_root.removeChild(e.ui_name);
	    f.div.appendChild(ui);
	}
	ui_childs.replace_child=function(new_ui,ui){ui.div.replaceChild(new_ui, ui);}
	break;
    }
    if(typeof ui_opts.child_classes != 'undefined')
	add_classes(ui_opts.child_classes, ui_childs.div);
    
    ui_root.appendChild(ui_childs.div);

    for (var e in tpl_root.elements){
	var e=tpl_root.elements[e];
	e.container=ui_childs;
	var ui=create_ui(global_ui_opts,e, depth+1 );
	
	
	ui_childs.add_child(e,ui);
    }

    return ui_root;
}



function attach_menu(tpl_root, menu){
    menu.ul.style.zIndex=20;
    tpl_root.ui_root.replaceChild(menu.ul, tpl_root.ui_name); 
}

