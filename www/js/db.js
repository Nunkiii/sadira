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
	    this.selected_frame.remove_class("selected_tab");
	    this.selected_frame.add_class("normal_tab");
	}
	f.div.style.display='block';
	this.selected_frame=f;
	this.selected_frame.add_class("selected_tab");
	return f;
    }

    this.add_frame=function(title){

	var li=nav.appendChild(ce("li"));
	//li.innerHTML=title;
	li.appendChild(title); 
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

      var toup=["elements","ui_opts"];
      
      for(var ti=0;ti< toup.length;ti++){
	  var t=toup[ti];
	  //console.log("Check " + t + " typof " + typeof tpl_item[t] );
	  if(typeof tpl_item[t]=='undefined')
	      tpl_item[t]=clone_obj(tpl[t]); //tpl[t];
	  else
	      for(var o in tpl[t]){
		  if(typeof tpl_item[t][o]=='undefined')tpl_item[t][o]=clone_obj(tpl[t][o]);//tpl[t][o]; //
	      }
      }

      for(var o in tpl){
	  switch(o){
	  case "name" : if(!tpl_item.name) tpl_item.name=tpl.name; 
	      break;
	  case "elements" : break; 
	  case "ui_opts" : break;
	  default:
	      tpl_item[o]=clone_obj(tpl[o]);
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
//    console.log("TPL AFTER= " + JSON.stringify(tpl,null,4));
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
	tpl_root.depth=0;
    }else tpl_root.depth=depth;
    //if(typeof tpl_root.ui_opts == 'undefined' ) tpl_root.ui_opts={type:"short"}; 

    if(typeof tpl_root.ui_opts == 'undefined') tpl_root.ui_opts=global_ui_opts;
    else
	for(var o in global_ui_opts) 
	    if(!tpl_root.ui_opts[o])tpl_root.ui_opts[o]=global_ui_opts[o];

    var ui_opts=tpl_root.ui_opts;    
    var ui_root=tpl_root.ui_root=ce("div");     
    
    ui_root.style.display="relative";
    ui_root.style.zIndex=depth;


    var sliding = (typeof ui_opts.sliding!='undefined') ? ui_opts.sliding : false;
    var sliding_dir = (typeof ui_opts.sliding_dir != 'undefined') ? ui_opts.sliding_dir : "v";
    
    //if(typeof ui_opts.slided == 'undefined') ui_opts.slided = true;
    var slided=(typeof ui_opts.slided == 'undefined') ? true : ui_opts.slided;// = true; ui_opts.slided;

    var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
    var ui_childs=tpl_root.ui_childs={};
    

    //console.log("Create UI : " + JSON.stringify(tpl_root.name) + " ui options  " + JSON.stringify(ui_opts));
    
    ui_root.className="db";

    if(depth==0) ui_root.className+=" root";
    
    if(typeof ui_opts.root_classes != 'undefined')
	add_classes(ui_opts.root_classes, ui_root);
    
    if(typeof ui_opts.width != 'undefined') ui_root.style.width=ui_opts.width;
    
//    if(typeof tpl_root.name!='undefined'){

    var ui_name=tpl_root.ui_name= ui_opts.label ? cc("label", ui_root) : cc("h1", ui_root);
    ui_name.innerHTML="Hello";
    if(!ui_opts.label) ui_name.className="dbname";
    
    if(typeof ui_opts.name_classes != 'undefined'){
	//console.log(tpl_root.name + " add name classes " + JSON.stringify(ui_opts.name_classes));
	add_classes(ui_opts.name_classes, ui_name);
    }

    tpl_root.set_title=function(title){
	ui_name.firstChild.data=title;
//	span.appendChild( document.createTextNode("some new content") );
    }
    
    tpl_root.set_title(tpl_root.name ? tpl_root.name : "");
    
 //   }



    tpl_root.enable=function(state){
	if(!state)
	    this.ui_root.add_class("disabled");
	else
	    this.ui_root.remove_class("disabled");
    }

    function rebuild(){
	//if (typeof tpl_root.sliding != 'undefined') 
	tpl_root.ui_opts.slided=slided;//!tpl_root.slided;
	console.log("Rebuild " + tpl_root.name+"  slided = " + slided);

	var oldroot=tpl_root.ui_root;
	//tpl_root.parent.ui_childs.div.removeChild(tpl_root.ui_root); //div.appendChild(new_ui);
	
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );

	tpl_root.parent.ui_childs.div.replaceChild(tpl_root.ui_root, oldroot); //div.appendChild(new_ui);

	var cnt=tpl_root.ui_childs; //new_ui.container=tpl_root.container;
	
//	if(typeof cnt!="undefined"){

//	    cnt.replace_child(tpl_root, new_ui);
	    //ui_root=new_ui;
	// }
	// else{
	//     console.log(tpl_root.name + " cannot rebuild : undef container  " );
	// }
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

	clickable_zone.addEventListener("click", function(e){
	    
	    console.log(tpl_root.name + " : EDITABLE CLICK");
	    
	    if(ui_opts.type=="edit"){
		ui_opts.type="short";
	    }else{
		ui_opts.type="edit";
	    }
	    
	    e.cancelBubble = true;
	    
	    if (e.stopPropagation){
		e.stopPropagation();
		//console.log(tpl_root.name + " : editable stop propagation...");
	    }

	    rebuild();
	   	    
	    return false;
	}, false);
    }
    
    var item_ui;
    var sliding_stuff=[];



    if(tpl_root.type){
	try{
	    
	    item_ui=tpl_root.item_ui=create_item_ui(ui_opts, tpl_root);

	    if(item_ui){
		if(ui_opts.label){
		    ui_name.appendChild(item_ui);
		    item_ui.className+=" value";
		}
		else{
		    ui_root.appendChild(item_ui);
		    //ui_childs.div.appendChild(item_ui);
		    item_ui.className+=" dbitem";
		    sliding_stuff.push(item_ui);
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
    //if(!tpl_root.elements) return ui_root;

    //console.log("Config " + tpl_root.name + " child view ["+cvtype+"] type " + tpl_root.type);

    switch(cvtype){
	
    case "div":
//	ui_childs=tpl_root.ui_childs={};
	ui_childs.div=ce("div"); 
	ui_childs.div.className="childs";
	ui_childs.add_child=function(e,ui){ui_childs.div.appendChild(ui);}
	if(typeof ui_opts.child_classes != 'undefined')
	    add_classes(ui_opts.child_classes, ui_childs.div);
	
	ui_root.appendChild(ui_childs.div);
	sliding_stuff.push(ui_childs.div);

    ui_childs.replace_child=function(e,new_ui){
	var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
	//console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
	ui_childs.div.replaceChild(new_ui, ui);
	
    }

	break;
    case "bar":
	//console.log("ui root " + ui_root.nodeName);
//	ui_childs=tpl_root.ui_childs={};
	var nav=tpl_root.nav=ce("nav");
	ui_root.appendChild(nav);
	ui_childs.div=ce("div");
	ui_childs.div.className="childs";
	//tpl_root.ui_root.appendChild(ui_childs.div);
//	ui_childs.div=item_ui;
	//ui_childs.div.className="childs";
	ui_childs.add_child=function(e,ui){
	    //console.log("BAR add child on " + ui_childs.div.nodeName);
	    if(e.ui_name){
		if(e.ui_name.parentNode)
		    e.ui_name.parentNode.removeChild(e.ui_name);
		
		cc("li",nav).appendChild(e.ui_name);
	    }
	    if(!e.ui_opts.label)
		ui_childs.div.appendChild(ui);
	}
	ui_childs.replace_child=function(e,new_ui){
	    var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
	    //console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
	    ui_childs.div.replaceChild(new_ui, ui);
	    
	}

	if(typeof ui_opts.child_classes != 'undefined')
	    add_classes(ui_opts.child_classes, ui_childs.div);
	
	ui_root.appendChild(ui_childs.div);
	

	sliding_stuff.push(nav);
	sliding_stuff.push(ui_childs.div);

	
//	tpl_root.ui_childs=ui_childs=tpl_root.parent.ui_childs;
	
	break;
    case "tabbed":
	tpl_root.ui_childs=ui_childs=new tab_widget();
	ui_childs.div.className+=" childs";
	if(typeof ui_opts.child_classes != 'undefined')
	    add_classes(ui_opts.child_classes, ui_childs.div);
	
	ui_root.appendChild(ui_childs.div);
	sliding_stuff.push(ui_childs.div);

	ui_childs.add_child=function(e,ui){
	    var uin;
	    if( e.ui_name )
		uin = e.ui_name;
	    else {
		uin =  ce("span");
		uin.innerHTML="Noname";
	    }

	    if( uin.parentNode){
		uin.parentNode.removeChild(uin);
	    }
	    var f=ui_childs.add_frame(uin); 
	    
	    e.f=f;
	    f.div.appendChild(ui);
	}
	
	ui_childs.replace_child=function(e,new_ui){

	    //console.log("TAB replace node " + ui.nodeName + " with node " + new_ui.nodeName);
	    e.f.div.replaceChild(new_ui, ui);
	}
	break;
    default:
	throw "NO VALID CHILD VIEW TYPE";
	break;
    }
    
    

    //console.log(tpl_root.name +  " CONF CHILDS " );
    
    for (var e in tpl_root.elements){
	var e=tpl_root.elements[e];
	e.container=ui_childs;
	e.parent=tpl_root;
	//console.log(tpl_root.name +  " adding child " + e.name + " to childs elem " + ui_childs.div.nodeName);

	var ui=create_ui(global_ui_opts,e, depth+1 );
	

	ui_childs.add_child(e,ui);
	//console.log(tpl_root.name +  " adding child " + e.name + " OK!");
    }
    //console.log(tpl_root.name +  " CONF CHILDS DONE.");
    //console.log("----> Create UI : " + JSON.stringify(ui_opts) + " SLIDING " + sliding);

    if(sliding==true){
	
	if(tpl_root.parent)
	    if(typeof tpl_root.parent.ui_opts.child_view_type != "undefined")
		if(tpl_root.parent.ui_opts.child_view_type == "bar") 
		    sliding_stuff.push(ui_root);
	
	function update_arrows(){
	    switch(sliding_dir){
	    case "v":
		slide_button.className="slide_button_v";
		slide_button.innerHTML= slided ? "▲" : "▼" ;
		break;
	    case "h":
		slide_button.className="slide_button_h";
		slide_button.innerHTML= slided ? "◀" : "▶"; 
		break;
	    default: break;
	    }
	}

	function update_ui(){
	    var marg;
	    switch(sliding_dir){
	    case "h":
		marg="marginLeft";
		break;
	    case "v":
		marg="marginTop";
		break;
	    default: throw("Bug!!here "); return;
	    };
	    
	    if(slided){
		sliding_stuff.forEach(function (s){
		    s.style[marg]="0%";
		    s.style.opacity="1.0";
		});
		ui_name.remove_class("unslided");
		ui_name.add_class("slided");
	    }else{
		sliding_stuff.forEach(function (s){
		    s.style[marg]="-100%";
		    s.style.opacity="0.0";
		});
		ui_name.remove_class("slided");
		ui_name.add_class("unslided");
	    }
	    
	    //if(item_ui)console.log(tpl_root.name + " update UI slided = " + slided);
	    
	    update_arrows();
	    
	    if(typeof ui_opts.on_slide!='undefined') ui_opts.on_slide(slided);
	}


	switch(sliding_dir){
	case "h":
		marg="marginLeft";
		//disp="inline-block";
		//dispi="inline-block";
	    break;
	    case "v":
		marg="marginTop";
		//disp="inline-block"; 
		//dispi="inline-block";
		// disp="block";
		// dispi="block";
		break;
	    default: throw("Bug!!here "); return;
	    };
	


//	ui_name.style.zIndex=200;
	//ui_childs.div.style.zIndex=0;

	var slide_button=cc("span", ui_name);
	slide_button.style.zIndex=ui_root.style.zIndex+1;

	//ui_childs.div.style.display;
	//var dispi=item_ui?item_ui.style.display:"none";
	
	sliding_stuff.forEach(function (s){
	    
	    s.disp_orig=s.style.display;
	    s.add_class("sliding");
	    
	    //console.log("ENABLE sliding! ");
	    s.addEventListener("transitionstart",function(){
		//  console.log("Ani start ! " + slided );
	    }, false);
	    
	    s.addEventListener("transitionend",function(){
		//console.log("Ani end ! "+ slided );
		if(!slided)
		    s.style.display="none";
		if(typeof tpl_root.on_slide != 'undefined') tpl_root.on_slide(slided);
	    }, false);
	});

	slide_button.addEventListener("click",function(e){
	    console.log(tpl_root.name + "  SLIDE click !  " + slided);
	    slided=!slided;
	    
	    sliding_stuff.forEach(function (s){
		s.style.display=s.disp_orig;
	    });

	    setTimeout(function(){
		update_ui();
		
	    }, 100);
	    
	    e.cancelBubble = true;
	    
	    if (e.stopPropagation){
		e.stopPropagation();
		//console.log(tpl_root.name + " : SLIDE stop propagation...");
	    }

	    return false;
	}, false);

	update_ui();

	if(!slided){
	    sliding_stuff.forEach(function (s){
		s.style.display="none";
	    });
	    
	}
    }


    return ui_root;
}

function attach_menu(tpl_root, menu){
    menu.ul.style.zIndex=20;
    tpl_root.ui_root.replaceChild(menu.ul, tpl_root.ui_name); 
}

