
function create_widget(t, parent){
    
    var promise=new Promise(function(resolv,reject){

	if(t===undefined)
	    return console.log("Building UNDEFINED widget !!");
	
	//console.log("Building widget " + t.type);

	function build_widget(w){
	    //console.log("Building widget " + t.type + " tpl name = " + w.name) ;
	    //w.ui_root=ce("div"); w.ui_root.innerHTML=w.name + ", " + w.type + " : " + dump_error(w.value);
	    try{
		w.create_ui().then(function(){resolv(w);}).catch(function(e){reject(e);});
	    }
	    catch(e){
		
		//console.log("Create widget ["+t.type+"] ERROR " + dump_error(e) + "\n\n\nStack------------ " + e.stack);
		reject(e);
		//if(tmaster.templates[ttype]!==undefined)
	    }
	    //  resolv(w);
	    
	}

	if(parent===undefined)
	    build_object(t)
	    .then(function(w){
		build_widget(w);
	    })
	    .catch(function(error){
		console.log("Error building widget " + error);
		reject(error);
	    });
	else	    
	    parent.create_child(t)
	    .then(function(w){
		build_widget(w);
	    })
	    .catch(function(error){
		reject(error);
	    });
    });
    
    return promise;
}

template_object.prototype.setup_icon=function(node){

    var tpl_root=this;
    var icui=get_ico(tpl_root);

    //
    if(icui!==undefined){
	//tpl_root.ui_name.appendChild(icui);return;
	
	if(tpl_root.usi.icui!==undefined && tpl_root.usi.icui.parentNode!==null){
	    if(node!==tpl_root.usi.icui.parentNode){
		
		if(node!==undefined){
		    tpl_root.usi.icui.parentNode.removeChild(tpl_root.usi.icui);
		    node.prependChild(icui);
		}
		else tpl_root.usi.icui.parentNode.replaceChild(icui, tpl_root.usi.icui);
		
	    }
	    else
		tpl_root.usi.icui.parentNode.replaceChild(icui, tpl_root.usi.icui);
	}else{
	    if(node!==undefined)
		node.prependChild(icui);
	    else{
		if(tpl_root.ui_name!==undefined)
		    tpl_root.ui_name.prependChild(icui);
		else
		    tpl_root.message("No node specified, cannot place icon!", {type : 'warning'});
	    }
	}
	
	tpl_root.usi.icui=icui;
	
	//tpl_root.message("Changed icon to <strong> ICON :" + icui.textContent + " </strong>! " + icui);

    }
    return icui;
}

template_object.prototype.build_childs_ui=function(cnt){
    var tpl_root=this;
    
    function build_child_ui(el){
	var prom = new Promise(function(ok, fail){
	    //var el=cnt[e];
	    
	    if(el.ui_opts===undefined || el.ui_opts.create!==false){
		el.parent=tpl_root;
		//el.key=e;
		if(el.ui_opts===undefined) el.ui_opts={};
		
		//console.log(tpl_root.type + " + Create UI for " + el.type);
		if(el.ui_root!==undefined){
		    console.log(el.type + " has already been built !");
		    ok();
		}else
		    el.create_ui().then(function(){
			
			// if(ù(ui)){
			//     //console.log("Error creating child " + el.name + " on " + tpl_root.name + " ! ");
			// }else{
			
			if(el.ui_opts.attach!==false){
			    if(tpl_root.ui_childs!==undefined)
				tpl_root.ui_childs.add_child(el,el.ui_root);
			    else console.log(tpl_root.type + " No ui child to attach " + el.type );
			}
			//var xx=ce('span');xx.innerHTML="<small>"+e+"</small>";el.ui_root.prependChild(xx);
			//console.log(tpl_root.name +  " adding child " + el.name + " OK!");
			ok();
		    }).catch(fail);
	    }
	});
	
	return prom;
	
    }
    
    
    var prom=new Promise(function(ok,fail){
	var childs=[];
	for(var e in cnt){
	    childs.push(cnt[e]);
	    //tpl_root.build_child_ui(e,tpl_root.usi.elements);
	}
	//console.log("Building childs " + tpl_root.ui_childs + " L=" + childs.length);
	if(childs.length===0) return ok();
	
	series(build_child_ui, childs).then(ok).catch(fail);
    });
    return prom;
}




template_object.prototype.create_ui=function(){

    var tpl_root=this;
    
    var prom = new Promise(function(ok,fail){
	
	if(tpl_root.usi===undefined)
	    tpl_root.usi={};
	
	//console.log(tpl_root.name + " type " + tpl_root.type + " : create UI !!");
	
	if(tpl_root.ui_opts===undefined) tpl_root.ui_opts={};
	var depth=tpl_root.depth=tpl_root.parent!==undefined? tpl_root.parent.depth+1 : 0;
	if(tpl_root.ui_opts===undefined) tpl_root.ui_opts={};
	var ui_opts=tpl_root.ui_opts;        
	
	tpl_root.sliding = (typeof ui_opts.sliding!='undefined') ? ui_opts.sliding : false;
	tpl_root.sliding_dir = (typeof ui_opts.sliding_dir != 'undefined') ? ui_opts.sliding_dir : "v";
	tpl_root.animate=è(ui_opts.sliding_animate) ? ui_opts.sliding_animate : false;
	tpl_root.slided=(typeof ui_opts.slided === 'undefined') ? true : ui_opts.slided;// = true; ui_opts.slided;
	
	
	var root_node = è(ui_opts.root_node) ? ui_opts.root_node : "div";
	
	tpl_root.sliding_stuff=[];
	//   var item_ui,ui_childs,slide_button,ui_root,ui_name;
	
	//The main widget div
	clear_events(tpl_root);
	var ui_root;
	
	if(ui_opts.root_element!==undefined && tpl_root.parent !== undefined){
	    if(tpl_root.parent.get===undefined){
		return fail(tpl_root.name + " : undefined get on parent type "+tpl_root.parent.type+" name "+tpl_root.parent.name+ " parent of  " + tpl_root.type);
		
	    }else{
		
		var re=tpl_root.parent.get(ui_opts.root_element);
		if(re===undefined){
		    return fail("Eroor : " + tpl_root.name + " : error, root_element ["+ui_opts.root_element+"] is invalid ! ");
		}
		ui_root=tpl_root.ui_root=re.ui_root;
	    }
	}else{
	    ui_root=tpl_root.ui_root=ce(root_node);
	    
	    //console.log("create UI " + tpl_root.name + " type " + tpl_root.type + " opts " + tpl_root.ui_opts + " global opts " + JSON.stringify(global_ui_opts));
	    //ui_root.style.display="relative";
	    ui_root.style.zIndex=20-depth;
	    //ui_root.className="db";// container-fluid";
	    if(ui_opts.panel) ui_root.add_class("db panel panel-default");
	    
	    if(è(tpl_root.type)){
		ui_root.setAttribute("data-type", tpl_root.type);
		//ui_root.setAttribute("data-tpl", tpl_root.type);
		//console.log(tpl_root.name + " set type to " + tpl_root.type);
	    }
	    
	    //	if(è(tpl_root.template_name))
	    //	    ui_root.setAttribute("data-tpl", tpl_root.template_name);
	    
	    //if(depth==0) ui_root.add_class("root");
	    
	    if(typeof ui_opts.root_classes != 'undefined')
		add_classes(ui_opts.root_classes, ui_root);
	    
	    if(typeof ui_opts.width != 'undefined') ui_root.style.width=ui_opts.width;
	}
	
	tpl_root.ui_content=ui_root;
	
	tpl_root.setup_ui_childs().then(function(){
	    
	    tpl_root.setup_title();
	    tpl_root.setup_childs().then(function(){
		tpl_root.setup_item().then(function(){
		    ok();
		}).catch(fail);
	    }).catch(fail);
	}).catch(fail);
    });
    
    return prom;
    
}



template_object.prototype.setup_ui_childs=function(){
    var tpl_root=this;
    
    var prom=new Promise(function(ok, fail){
	if(tpl_root.usi===undefined) return ok();
	tpl_root.build_childs_ui(tpl_root.usi.elements).then(ok).catch(fail);
	
    });
    return prom;
}

template_object.prototype.get_top_parent=function(type){
    var parent=this.parent;

    while(parent!==undefined && parent.type!==type)
	parent=parent.parent;
    

    return parent;
}


template_object.prototype.wait=function(message){
    if(message!==false){
	var wmsg="<span class='fa fa-spinner fa-spin text-success'></span>"+ message;
	if(true ||this.ui_name!==undefined){
	    if(this.waiting===false || this.waiting===undefined)
		this.subtitle_orig=this.subtitle;
	    this.set_subtitle(wmsg);
	    this.waiting=true;
	}else{
	    this.wmsg=cc('div', this.ui_root, true);
	    this.wmsg.innerHTML=wmsg;
	}
    }
    else {
	
	if(true || this.ui_name!==undefined){
	    if(this.subtitle_orig!==undefined){
		//this.message("Restoring subtitle to " + this.subtitle_orig);
		this.set_subtitle(this.subtitle_orig);
	    }
	    else
		this.set_subtitle("");
	    this.waiting=false;
	}else{
	    this.ui_root.removeChild(this.wmsg);
	    delete this.wmsg;
	}
    }
}


template_object.prototype.browse=function(w){
    var obj=this;
    obj.ui_name.appendChild(w.ui_name);
}

template_object.prototype.warning=function(estring, title){
    this.message(estring,{type : "warning", title : title});
}
template_object.prototype.error=function(estring, title){
    this.message(dump_error(estring),{type : "danger", title : title});
}


template_object.prototype.debug_clean=function(msg){
    var tpl_root=this;
    if(è(tpl_root.debug_widget)){
	tpl_root.debug_widget.set_value("");
    }
};

template_object.prototype.debug=function(msg){
    var tpl_root=this;
    if(ù(tpl_root.debug_widget)){
	create_widget({
	    name : "Widget debug", type: "text",
	    ui_opts : {
		sliding : true, sliding_dir : "h", sliding_animate : true, slided : true, label : true,
		root_classes : ["container-fluid"],
		item_classes : ["container-fluid"]
		//name_classes : ["text-danger"]
	    }
	}).then(function(w){
	    tpl_root.debug_widget=w;
	    tpl_root.ui_content.appendChild(w.ui_root);
	    tpl_root.debug_widget.append(msg+"<br/>");
	});
    }else tpl_root.debug_widget.append(msg+"<br/>");
    //console.log("Append debug " + msg);
    
    //tpl_root.debug_widget.ui_root.innerHTML+=msg;
    
    
    
}

template_object.prototype.message=function(msg, opts_in){
    var tpl_root=this;
    
    var ui_content=tpl_root.ui_content;
    var opts = opts_in===undefined ? {} : opts_in;
    if(opts.type===undefined) opts.type='info';
    if(opts.title===undefined){
	opts.title=tpl_root.name;
    }
    if(opts.subtitle===undefined){
	opts.subtitle=tpl_root.type===undefined? "[raw]" : "["+tpl_root.type+"]";
    }

    if(tpl_root.usi.messages_ui===undefined){
	//	tpl_root.usi.messages=[];
	tpl_root.usi.messages_ui=cc("div",tpl_root.ui_root);
    }

    var icon;
    if(opts.type==="danger")
	icon="<i class='fa fa-bomb'>";
    else
	if(opts.type==="warning")
	    icon="<i class='fa fa-warning'>";
    else icon="<i class='fa fa-info'>";
    
    // var eui=tpl_root.eui;
    
    // if(tpl_root.eui!==undefined){
    // 	ui_content.removeChild(eui.ui_root);
    // 	delete tpl_root.eui;
    // }
    
    if(opts.wait===true){
	opts.title='<i class="fa fa-spinner fa-spin"></i>'+opts.title;
    }
    
    
    create_widget({
	name :  icon+" " +opts.title + " " ,
	subtitle : " "+opts.subtitle+" ",
	//type: "string",
	//value : "<p><blockquote class='card-blockquote'>" + msg + "</blockquote></p>",
	ui_opts : {
	    close : true,
	    //label : true,
	    name_node : "h4",
	    root_classes : ["card card-inverse card-"+opts.type],

	    name_classes : ["card-header text-"+opts.type+""],
	    wrap_classes : ["card-block"],
	    wrap : true,
	    item_classes : ["card-text"],
	    //name_classes : ["text-danger"]
	},
	widget_builder : function(ok,fail){
	    var o=this;
	    this.listen("close", function(){
		o.ui_root.parentNode.removeChild(o.ui_root);
	    });
	    var ui=ce("div");
	    ui.innerHTML= "<p><blockquote class='card-blockquote'>" + msg + "</blockquote></p>";
	    ok(ui);
	    
	}
    }).then(function(w){
	
	//tpl_root.usi_messages.push(w);
	//console.log("Adding message " + dump_error(msg));
	tpl_root.usi.messages_ui.appendChild(w.ui_root);
	
	
	// if(tpl_root.ui_toolbar!==undefined)
	//     insertAfter(tpl_root.ui_toolbar, w.ui_root);
	// else{
	//     if(tpl_root.ui_name!==undefined)
	// 	insertAfter(tpl_root.ui_name, w.ui_root);
	//     else
	// 	tpl_root.ui_root.prependChild(w.ui_root);
	// }
	
	
	//ui_content.appendChild(eui.ui_root);
	
	if(opts.last!==undefined)
	    setTimeout(function(){
		function close(){
		    tpl_root.usi.messages_ui.removeChild(w.ui_root);
		    delete w;
		}
		if(opts.onclose!==undefined){
		    opts.onclose(function(){
			close();
		    });
		}else close();

	    },opts.last);
    }).catch(function(e){
	
    });
    
    
}




template_object.prototype.load_browser_data=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    var save_location = ui_opts.save;
    if(save_location===undefined)
	return this.debug("No browser save location !");

    try{
	var storage_string=localStorage.getItem(save_location);
	if(storage_string===null)
	    ;//this.debug("storage string not found : " + save_location );
	else{

	    var nm=tpl_root.name;
	    tpl_root.set_title("Loading webstorage...");
	    
	    var b=base64DecToArr(storage_string);
	    set_template_data(tpl_root, BSON.deserialize(b));
	    tpl_root.trigger("load", tpl_root);
	    tpl_root.set_title(nm);
	}
    }
    catch (e){
	this.debug("While loading browser data @ " + save_location + ": " + dump_error(e));
    }
    
    
}



template_object.prototype.setup_title=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;    
    var depth=tpl_root.depth;
    var ui_root=tpl_root.ui_root;
    if(tpl_root.ui_name!==undefined) return;
    
    delete tpl_root.ui_name; delete ui_name;
    delete tpl_root.ui_title_name;

    new_event(tpl_root, 'name_changed');
    
    if(ù(ui_opts.render_name))ui_opts.render_name=true;
    if(ù(ui_opts.label)) ui_opts.label=false;
    
    if(è(tpl_root.name) && ui_opts.render_name){
	var name_node;
	if(ui_opts.label){
	    name_node=è(ui_opts.label_node) ? ui_opts.label_node : 'label';  //(è(ui_opts.label) ?  "label": hnode);
	    
	}
	else{
	    //console.log("Depth= " + depth);
	    var hnode=  depth===0 ? "h1" : (((depth<5)?("h"+(depth+1)):"h5"));
	    //var name_node=è(ui_opts.name_node) ? ui_opts.name_node : ((depth>0)?"h4":"h1");
	    name_node=è(ui_opts.name_node) ? ui_opts.name_node : hnode;
	    
	    //name_node=è(ui_opts.title_node) ? ui_opts.title_node : 'div';  //(è(ui_opts.label) ?  "label": hnode);
	}
	var tb=tpl_root.get("toolbar");

	if(tb!==undefined ){
	    if(tb.ui_root!==undefined){
		//tpl_root.message(tpl_root.name + " Havea toolbar " + tb.ui_root + " name " + tb.name);
		tpl_root.listen("name_changed", function(t,s){
		    //console.log("Name changed... " + t + " S " + s);
		    tb.set_title(t,s);
		})
		tb.ui_opts.fa_icon=tpl_root.ui_opts.fa_icon;
		tb.ui_opts.icon=tpl_root.ui_opts.icon;
		tb.set_title(tpl_root.name,tpl_root.subtitle);
		tb.rebuild_name();
		
		//if(tb.ui_root!==undefined)
		//tpl_root.message( " AAAAAdding toolbar .... " + tb.ui_root);
		//console.log(tpl_root.name + "AAAAAAAAAAAAAAAAAAAAdding toolbar .... " + tb.ui_root);
		ui_root.appendChild(tb.ui_root);
		//tpl_root.message("Adding toolbar .... " + tb.ui_root +" OKOKOKOK ");
		// setTimeout(function(){
		// 	console.log("Toolbar root is " + tb.ui_root + " name " + tb.name + " parent " + tb.parent.name);
		// 	ui_root.appendChild(tb.ui_root);
		// }, 1000);
		return;
	    }//else tpl_root.message("TB has bad root " + tb.ui_root, { type : "warning"});
	    
	}
	
	tpl_root.ui_name=cc(name_node, ui_root);
	tpl_root.ui_title_name=tpl_root.ui_name;
	
	if(ui_opts.name_classes !== undefined){
	    //console.log(tpl_root.name + " add name classes to "+ ui_name.nodeName+" :"  + JSON.stringify(ui_opts.name_classes));
	    add_classes(ui_opts.name_classes, tpl_root.ui_name);
	}

	tpl_root.listen("name_changed", function(t,s){
	    //console.log("Name changed MAIN  " + t + "s "+s);
	    //	    if(è(tpl_root.rebuild_name))
	    tpl_root.rebuild_name();
	    //	    else
	    //		setup_title();
	});
	
	tpl_root.rebuild_name();
	
	// if(ui_opts.panel){
	//     var phead=cc("div",ui_root); phead.className="panel-heading"; 
	//     var pcontent=cc("div",ui_root); pcontent.className="panel-content";
	//     phead.appendChild(ui_name);
	//     ui_content=pcontent;
	// }

	
	//tpl_root.get_title_node=function(){ return this.ui_name; }
    }
}




template_object.prototype.get_name_text=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    if(ui_opts.name_elm!==undefined){
	var ne=tpl_root.get(ui_opts.name_elm);
	if(ne !== undefined){
	    return ne.value;
	}else
	    return "Invalid name element !";
    }else
	return tpl_root.name;
}


template_object.prototype.rebuild_name=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    var ui_name=tpl_root.ui_name;    
    
    //console.log("rebuild name " + tpl_root.name + " ui_name = " + tpl_root.ui_name.nodeName);
    //ui_name.innerHTML="";
    var name_node;
    
    if(!ui_opts.label){
    }else
	name_node=è(ui_opts.name_node) ? ui_opts.name_node : 'label';
    
    
    if(tpl_root.ui_title_name===undefined){
	
	if(false&&tpl_root.toolbar){
	    tpl_root.ui_title_name=tpl_root.toolbar.nava;
	}else{
	    //if(!ui_opts.label)
	    tpl_root.ui_title_name=cc(name_node, ui_name);
	    // else
	    //     tpl_root.ui_title_name=ui_name;
	    //ui_name.className="widget_title";
	}
    }
    
    ui_name.innerHTML=" "+tpl_root.get_name_text()+" ";
    
    if(ui_opts.close)
	add_close_button(tpl_root,ui_name);
    
    if(è(tpl_root.subtitle)){
	var subtitle=tpl_root.ui_subtitle=cc("small",ui_name); subtitle.className="text-muted";
	subtitle.innerHTML=" "+tpl_root.subtitle;
	//subtitle.className="col-sm-12 col-md-6";
    }

    //console.log(tpl_root.type + "  : type  " + ui_opts.type + " set name to " + tpl_root.ui_name.innerHTML);
    
    tpl_root.setup_intro(ui_name);

    if(è(tpl_root.intro)){// && ui_opts.type!=="short"){
	tpl_root.set_intro_text(tpl_root.intro);
    }
    
    if(ui_opts.name_edit){
	
	ui_name.onedit=false;
	ui_name.add_class("text-info clickable");
	ui_name.addEventListener('click', function(){
	    if(ui_name.onedit){
		return false;
	    }
	    
	    ui_name.onedit=true;
	    console.log("NAME EDIT CLICK !");
	    
	    var un=ui_name;
	    var uicont=ce('div'); uicont.className="form-inline";
	    var uicont_grp=cc('div', uicont); uicont_grp.className="form-group";
	    var ui_grp=cc('div', uicont_grp); ui_grp.className="input-group";
	    
	    //var ic=
	    tpl_root.setup_icon(uicont); //ic.add_class("input-group-addon");

	    var uil=cc('div',ui_grp); uil.className='input-group-addon';
	    uil.innerHTML="New object's name :";
	    var ui=cc('input',ui_grp); ui.type="text"; ui.className="form-control";
	    var undo=cc('button',uicont_grp); undo.className="btn btn-default fa fa-undo"; //undo.innerHTML="Undo";// ";
	    
	    undo.addEventListener("click",function(){
		uicont.parentNode.replaceChild(ui_name, uicont);
		ui_name.onedit=false;
	    });
	    
	    ui.value=tpl_root.name;
	    
	    ui_name.parentNode.replaceChild(uicont, ui_name);
	    //ui_name.replaceChild(uicont, un);
	    
	    ui.addEventListener("change",function(){
		console.log("CHANGE Event ont text");
	    },false);
	    
	    ui.addEventListener("input",function(){
		console.log("INPUT Event ont text");
		//tpl_item.set_value(this.value); 
		
	    },false);
	    
	    ui.addEventListener("keydown",function(e){
		
		if(e.keyCode == 13){
		    e.preventDefault();
		    
		    //alert(ui.value);
		    uicont.parentNode.replaceChild(ui_name, uicont);
		    //ui_root.replaceChild(ui_name, uicont);
		    //ui_name.replaceChild(un, uicont);
		    ui_name.onedit=false;
		    tpl_root.set_title(ui.value);
		    
		    return false;
		}
	    });
	    
	});
    }

    tpl_root.setup_icon(ui_name);
    

    if(ui_opts.editable){
	
	var clickable_zone;
	if(è(ui_name)){
	    if(ui_opts.type==="edit"){
		ui_name.add_class("un_editable");
		//var vt=child_view_type();
	    }else{
		ui_name.add_class("editable");
	    }
	    clickable_zone=ui_name;
	    
	}else{
	    clickable_zone=ui_content;
	}
	
	clickable_zone.addEventListener("click", function(e){
	    
	    //console.log("Drawing " + tpl_root.name + " : EDITABLE CLICK type = " + ui_opts.type);
	    
	    tpl_root.switch_edit_mode();
	    e.cancelBubble = true;
	    
	    if (e.stopPropagation){
		e.stopPropagation();
		//console.log(tpl_root.name + " : editable stop propagation...");
	    }
	    
	    return false;
	}, false);
    }

}


template_object.prototype.set_intro_text=function(intro_txt){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    if(tpl_root.intro_div===undefined) setup_intro();
    tpl_root.intro_content.innerHTML=
	"" //"<div class='alert alert-default'>"//>" //
	+ intro_txt; 
    //+ "</div>";
    
    
    
}


template_object.prototype.setup_intro=function(node){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;		    

    if(è(tpl_root.intro)){
	
	if(tpl_root.intro_div===undefined){
	    var intro_node=ui_opts.intro_node!==undefined ? ui_opts.intro_node : 'blockquote';
	    
	    
	    if(ui_opts.intro_name===true){
		tpl_root.intro_div=cc(intro_node,tpl_root.ui_name);
	    }
	    else{
		tpl_root.intro_div=cc(intro_node,tpl_root.ui_root);
		
	    }
	    
	    if(ui_opts.intro_stick===undefined || ui_opts.intro_stick===false || ui_opts.intro_title!==undefined){
		var title='<i class="fa fa-info-circle text-info">';
		title+=' </i>';
		if(ui_opts.intro_title!==undefined){
		    title+=' <strong class="text-info">'+ui_opts.intro_title+'</strong>';
		}else
		    title+=' <strong class="text-info"> More information</strong>';
		
		tpl_root.intro_div.innerHTML=title;
	    }
	    
	    tpl_root.intro_div.style.display= (ui_opts.intro_visible || ui_opts.intro_stick) ? "":"none";
	    tpl_root.sliding_stuff.push(tpl_root.intro_div);
	    
	    if(ui_opts.intro_stick===undefined || ui_opts.intro_stick===false){
		var ibtn=tpl_root.close_intro_btn=ce("div");
		ibtn.className="fa fa fa-close text-danger pull-right intro_btn";
		tpl_root.intro_div.appendChild(ibtn);
		ibtn.setAttribute("title", "Close information panel");
		ibtn.addEventListener("click", function() {
		    tpl_root.intro_btn.style.display='';
		    tpl_root.intro_div.style.display='none';
		    ui_opts.intro_visible=false;//!ui_opts.intro_visible;
		});
	    }
	    
	    tpl_root.intro_content=cc('div',tpl_root.intro_div);
	    
	}
	
	tpl_root.intro_div.className="text-muted";// small";
	
	//if(ù(ui_opts.intro_visible)) ui_opts.intro_visible=false;
	
	if(ui_opts.intro_stick===undefined || ui_opts.intro_stick===false){
	    var ibtn=tpl_root.intro_btn=ce("div");
	    ibtn.className="fa fa-info-circle intro_btn text-info";
	    node.appendChild(ibtn);
	    ibtn.setAttribute("title", "Click for more information...");
	    ibtn.addEventListener("click", function() {
		tpl_root.intro_btn.style.display='none';
		tpl_root.intro_div.style.display='';
		ui_opts.intro_visible=true;
	    } );
	}
    }
}

template_object.prototype.add_close_button=function(e, node, prep){

    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
}

function add_close_button(e, node, prep){

    prep = prep || false;
    e.ui_opts.close=true;

    //console.log(e.name + " : adding CLOSE X");
    if(node.has_button===undefined){
	node.has_button=true; 
	
	//var close_but = cc("span",node);
	
	//close_but.add_class("close_button");

	var close_but = cc("span",node, prep);
	close_but.className="fa fa-times close_button";
	
	//close_but.innerHTML="❌";

	close_but.addEventListener("click", function(event){
	    e.trigger("close");
	    event.stopPropagation();
	});
	
    }
}




template_object.prototype.switch_edit_mode=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    if(ui_opts.type=="edit"){
	ui_opts.type=global_ui_opts.type="short";
    }else{
	ui_opts.type=global_ui_opts.type="edit";
    }
    
    //console.log("switching edit mode to " + ui_opts.type);
    tpl_root.rebuild();
    
}

template_object.prototype.switch_edit_mode=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;

    tpl_root.enable=function(state){
	if(!state)
	    this.ui_root.add_class("disabled");
	else
	    this.ui_root.remove_class("disabled");
    }
}

template_object.prototype.rebuild=function (){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    tpl_root.ui_opts.slided=slided;//!tpl_root.slided;
    //console.log("Rebuild " + tpl_root.name+"  slided = " + slided);
    
    tpl_root.ui_root_old=tpl_root.ui_root;
    //tpl_root.parent.ui_childs.div.removeChild(tpl_root.ui_root); //div.appendChild(new_ui);
    
    delete tpl_root.ui_name;
    
    if(ui_opts.type!==undefined)global_ui_opts.type =ui_opts.type;
    
    tpl_root.create_ui(global_ui_opts,tpl_root, depth ).then(function(){
	
	//tpl_root.parent.ui_childs.div.replaceChild(tpl_root.ui_root, oldroot);
	if(tpl_root.parent && tpl_root.parent.ui_childs){
	    tpl_root.parent.ui_childs.replace_child(tpl_root);
	    tpl_root.parent.trigger("child_rebuild", tpl_root);
	}
	else
	    ui_root.parentNode.replaceChild(tpl_root.ui_root, tpl_root.ui_root_old);
	
	tpl_root.trigger("rebuild", tpl_root.ui_opts.type);
    });
}


function child_container(tpl_root){
    this.tpl_root=tpl_root;
    
};

child_container.prototype.childs={};

child_container.prototype.add_child_com=function(child){
    var cnt=this;
    child.parent=this.tpl_root;
};


template_object.prototype.setup_childs=function (){

    //console.log(this.name + " setup childs " + JSON.stringify(this));
    var tpl_root=this;

    var prom=new Promise(function(ok, fail){
	
	var ui_opts=tpl_root.ui_opts;
	
	var ui_childs=tpl_root.ui_childs= new child_container(tpl_root);

	new_event(tpl_root, 'add_child');
	new_event(tpl_root, 'remove_child');
        
	if(ui_opts.display_childs===false){
	    ui_childs.add_child=function(){};
	    ui_childs.remove_child=function(){};
	    return;
	}
	
	
	var child_toolbar = false ;//(ui_opts.child_toolbar!==undefined) ? ui_opts.child_toolbar : (tpl_root.toolbar!==undefined);
	
	
	function add_child_common(e, ui, prep){
	    if(è(e.ui_opts)){
		if(e.ui_opts.in_root){
		    if(e.ui_opts.in_root === "prepend"){
			if(child_toolbar){
			    ui_content.insertBefore(ui, tpl_root.ui_toolbar.nextSibling);
			}else{
			    if(è(tpl_root.ui_name) && è(tpl_root.ui_name.nextSibling)){
				tpl_root.ui_content.insertBefore(ui, tpl_root.ui_name.nextSibling);
			    }
			    else
				tpl_root.ui_content.prependChild(ui)
			}
		    }else
			tpl_root.ui_content.appendChild(ui);
		    //e.ui_opts.in_root === "prepend" ? ui_content.prependChild(ui) : ui_content.appendChild(ui);
		    return false;
		}
	    }
	    return true;
	}
	
	
	function create_childs_div(){
	    if(ù(ui_childs.div)){
		var child_node_type = è(ui_opts.child_node_type) ? ui_opts.child_node_type : "div"
		ui_childs.div=ce(child_node_type); 
		
		//console.log( tpl_root.name + "("+tpl_root.name +") : Created child div");
		//ui_childs.div.className="container-fluid";
		
		if(typeof ui_opts.child_classes != 'undefined'){
		    //console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
		    add_classes(ui_opts.child_classes, ui_childs.div);
		}
		
		if(ui_opts.childs_pos==="below")
		    tpl_root.ui_content.prependChild(ui_childs.div);
		else
		    tpl_root.ui_content.appendChild(ui_childs.div);
		
		if(tpl_root.sliding){
		    //console.log( tpl_root.name + " : Adding child div to sliding stuff");
		    tpl_root.sliding_stuff.push(ui_childs.div);
		}
		
	    }
	    
	}
	var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
	
	//console.log(this.name + " building childs /// " + cvtype);
	switch(cvtype){
	case 'dummy' : 
	    ui_childs.add_child=function(e){
		//var div;
		if(ui_childs.div===undefined){
		    create_childs_div();
		    //ui_childs.div=cc('div',ui_content);
		    //ui_childs.div.className='row';

		    ui_childs.child_list=cc('div',ui_childs.div);
		    ui_childs.child_view=cc('div',ui_childs.div);
		    
		    ui_childs.child_list.className='list-group col-sm-4';
		    ui_childs.child_view.className='list-group col-sm-8';
		}
		var a=cc('a',ui_childs.child_list);
		
		a.className='list-group-item';
		
		a.innerHTML=e.name;
		if(e.ui_name!==undefined)
		    e.ui_name.add_class('no_vertical_margin');
		e.listen('name_changed', function(){
		    a.innerHTML="";
		    a.appendChild(get_ico(e));
		    a.innerHTML+=e.name;
		});
		
		a.addEventListener('click',function(){
		    ui_childs.child_view.innerHTML="";
		    ui_childs.child_view.appendChild(e.ui_root);
		    if(ui_childs.active!==undefined) ui_childs.active.remove_class('active');
		    ui_childs.active=a;
		    ui_childs.active.add_class('active');
		});
		
		//tpl_root.debug("Add child DUMMY " + e.name);
		tpl_root.trigger('add_child', e);
	    };
	    ui_childs.replace_child=function(nctpl){tpl_root.trigger('update_child', e);};
	    ui_childs.remove_child=function(e){tpl_root.trigger('remove_child', e);};
	    
	    break;

	case 'root' : 
	    ui_childs.add_child=function(e){
		tpl_root.ui_content.appendChild(e.ui_root);
		tpl_root.trigger('add_child', e);
	    };
	    ui_childs.replace_child=function(nctpl){
		tpl_root.trigger('update_child', e);};
	    ui_childs.remove_child=function(e){
		tpl_root.trigger('remove_child', e);};
	    
	    break;
	    
	    
	case "div":
	    //	ui_childs=tpl_root.ui_childs={};
	    
	    ui_childs.add_child=function(e,ui,prep){

		if(ui===undefined) ui=e.ui_root;
		if(prep===undefined){
		    if(e.ui_opts!==undefined)
			prep=e.ui_opts.prep;
		    if(prep===undefined)
			prep=false;
		}
		
		if(!add_child_common(e,ui,prep)) return;
		this.add_child_com(e);
		
		create_childs_div();
		//console.log(tpl_root.name + " Adding child " + e.name + " ui is " + ui);
		prep ? ui_childs.div.prependChild(ui) : ui_childs.div.appendChild(ui);
	    }
	    

	    ui_childs.replace_child=function(nctpl){
		//var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
		//console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
		ui_childs.div.replaceChild(nctpl.ui_root, nctpl.ui_root_old);
	    }

	    ui_childs.remove_child=function(e){
		ui_childs.div.removeChild(e.ui_root);
	    }

	    break;

	case "table":
	    var tbl,tb;

	    function attach_mini_ui(tr,e, eold){
		var td=cc("td",tr);
		if(e.ui_opts.mini_elm!==undefined){
		    if(e.ui_opts.mini_elm!==""){
			var me=e.get(e.ui_opts.mini_elm);
			if(me!==undefined)
			    td.appendChild(me.ui);
			else{
			    var ere=ce("span");
			    ere.innerHTML="Invalid mini_elm !";
			    td.appendChild(ere);
			}
		    }
		}
		else
		    td.appendChild(e.ui_root);
	    }
	    
	    function attach_name_ui(tr,e, eold){
		var td=cc("td",tr);

		if(e.ui_name !== undefined){
		    // delete e.intro;
		    // delete e.subtitle;
		    // e.ui_opts.type="short";
		    // e.rebuild();
		    td.appendChild(e.ui_name);
		}else
		    td.innerHTML=e.name;
		//e.rebuild_name();
		
	    }
	    
	    ui_childs.add_child=function(e,ui,prep){
		if(!add_child_common(e,ui,prep)) return;

		this.add_child_com(e);

		if(ui_childs.div===undefined){


		    tbl=ui_childs.div=ce("table");
		    tb=cc("tbody",tbl);
		    ui_childs.div.className="table table-hover";
		    
		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    tpl_root.ui_content.appendChild(ui_childs.div);
		    tpl_root.sliding_stuff.push(ui_childs.div);
		    
		}

		// if(è(e.ui_name))
		//     if(e.ui_opts.close) add_close_button(e,e.ui_name);
		
		var tr=e.tr= prep ? cc("tr",tb,true) : cc("tr",tb);

		
		attach_name_ui(tr,e);
		attach_mini_ui(tr,e);
		//prep ? ui_childs.div.prependChild(ui) : ui_childs.div.appendChild(ui);
	    }
	    
	    ui_childs.replace_child=function(nctpl){
		
		//console.log(tpl_root.name + " : !!!!!!!!!childs Replaced UI "+ nctpl.ui_root_old.nodeName + " with node " + nctpl.ui_root.nodeName);
		//return;
		if(è(nctpl.tr))
		    nctpl.tr.innerHTML="";
		else
		    nctpl.tr=cc("tr", tb);
		attach_name_ui(nctpl.tr,nctpl);
		attach_mini_ui(nctpl.tr,nctpl);
		
		//ui_childs.div.replaceChild(nctpl.ui_root, nctpl.ui_root_old);
	    }
	    
	    ui_childs.remove_child=function(e){
		ui_childs.div.removeChild(e.ui_root);
	    }

	    break;

	case "bbox":
	    break;
	    var tb;

	    ui_childs.add_child=function(e,ui,prep){
		if(!add_child_common(e,ui,prep)) return;

		this.add_child_com(e);

		if(typeof ui_childs.div=='undefined'){
		    tb=ui_childs.div=ce("table"); 
		    //ui_childs.div.className="childs";
		    
		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    ui_content.appendChild(ui_childs.div);
		    tpl_root.sliding_stuff.push(ui_childs.div);
		    
		}
 		// if(è(e.ui_name))
		//     if(e.ui_opts.close) add_close_button(e,e.ui_name);

		var tr=e.tr= prep ? cc("tr",tb,true) : cc("tr",tb);

		var td=cc("td",tr); if(è(e.ui_name))td.appendChild(e.ui_name);
		
		td=cc("td",tr); td.appendChild(e.ui_root); 
		
		//prep ? ui_childs.div.prependChild(ui) : ui_childs.div.appendChild(ui);
		
		
	    }

	    ui_childs.replace_child=function(nctpl){
		//var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
		//console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
		ui_childs.div.replaceChild(nctpl.ui_root, nctpl.ui_root_old);
	    }

	    ui_childs.remove_child=function(e){
		ui_childs.div.removeChild(e.ui_root);
	    }

	    break;

	    
	case "divider":
	    //	ui_childs=tpl_root.ui_childs={};
	    
	    var ho=false;

	    ui_childs.add_child=function(e,ui,prep){
		if(!add_child_common(e,ui,prep)) return;
		
		this.add_child_com(e);
		if(è(ui_opts.divdir)) ho=ui_opts.divdir;
		
		if(typeof ui_childs.divider=='undefined'){
		    var d=this.div=cc("div", ui_root);
		    //this.div.style.height="75vh";
		    d.className="divider_container";
		    
		    //ui_childs.divider=new divider(ui_childs.div, 50,ho );
		    var split_frac=è(ui_opts.split_frac) ? ui_opts.split_frac : 50;
		    //console.log("split at " + split_frac);

		    this.divider=new divider(d, split_frac,ho, function(){
			var h=0;
			return 0;
			if(è(tpl_root.ui_head)){
			    var of=get_overflow(tpl_root.ui_head);
			    h=tpl_root.ui_head.offsetHeight + of.h;
			    return h;
			}
			
			if(è(tpl_root.ui_name)){
			    var of=get_overflow(tpl_root.ui_name);
			    h=tpl_root.ui_name.offsetHeight + of.h;
			    //h=get_inner_dim(tpl_root.ui_name.style, true);
			    
			    //h=tpl_root.ui_name.clientHeigth;
			    //console.log("ui_name : total height overflow [" + of.w+ "," + of.h +"] h= " + h);
			}
			if(è(tpl_root.ui_intro)){
			    var of=get_overflow(tpl_root.ui_intro);
			    h+=tpl_root.ui_intro.offsetHeight + of.h;
			    //console.log("ui_intro : total height overflow [" + of.w+ "," + of.h +"] h= " + h);
			}
			//console.log("Total height = " + h);
			return h;
		    });

		    tpl_root.listen("view_update", function(){
			//console.log("Divider "+tpl_root.name+" : View Update!");
			ui_childs.divider.update();
			tpl_root.view_update_childs();
		    });

		    ui_childs.divider.listen("drag_end", function(){
			//console.log("Divider "+tpl_root.name+" : DRAG View Update!");
			//ui_childs.divider.update();
			tpl_root.view_update_childs();
		    });


		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    //ui_root.appendChild(ui_childs.div);
		    //tpl_root.sliding_stuff.push(ui_childs.div);
		    //ui_childs.div.add_class(ho?"h":"v");
		    d.add_class(ho?"h":"v");
		    
		    on_ui_childs_ready();
		}
		
		//e.parent=tpl_root;
		prep ? ui_childs.div.prependChild(ui) : ui_childs.div.appendChild(ui);

		if(ù(ui_childs.divider.left)){
		    ui_childs.divider.left=ui;
		    ui.add_class("divided");
		    ui.add_class("one");
		    var divnode = ui_childs.divider.divnode=cc('div',ui_childs.div);
		    divnode.add_class("divider_bar");
		    var divnode_rotate=cc("span",divnode); divnode_rotate.add_class("divnode_rotate");
		    divnode_rotate.innerHTML="↴"; 
		    divnode_rotate.addEventListener("click", function(){
			ui_root.remove_class(ho?"h":"v");
			ho=!ho;
			ui_root.add_class(ho?"h":"v");
			ui_childs.divider.set_orientation(ho);
			tpl_root.trigger("view_update");
		    })
		}else{
		    if(ù(ui_childs.divider.right)){
			ui_childs.divider.right=ui;
			ui.add_class("divided");
			ui.add_class("two");
			ui_childs.divider.update();
		    }else{
			console.log("Error ! already 2 childs in divider panned child view! ");
		    }
		}
		
		//ui_childs.divider.update();
	    }
	    

	    ui_childs.replace_child=function(nctpl){
		//var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
		//console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
		ui_root.replaceChild(nctpl.ui_root, nctpl.ui_root_old);
	    }
	    
	    ui_childs.remove_child=function(e){
		ui_root.removeChild(e.ui_root);
	    }

	    break;



	case "bar":
	    //console.log("ui root " + ui_root.nodeName);
	    //	ui_childs=tpl_root.ui_childs={};
	    //tpl_root.ui_root.appendChild(ui_childs.div);
	    //	ui_childs.div=item_ui;
	    //ui_childs.div.className="childs";
	    var nav;
	    ui_childs.add_child=function(e,ui,prep){
		
		
		if(!add_child_common(e,ui,prep)) return;
		
		this.add_child_com(e);
		//console.log("BAR add child on " + ui_childs.div.nodeName);

		if(typeof ui_childs.div=='undefined'){
		    
		    var navcnt=cc("div",ui_root); navcnt.className="navcnt";

		    nav=tpl_root.nav=cc("nav",navcnt);
		    //nav=tpl_root.nav=ce("nav");
		    navcnt.add_class(cvtype);
		    //ui_root.appendChild(navcnt);
		    
		    if(ui_opts.bar){
			nav.appendChild(ui_name);
			ui_name.add_class("dbname_bar");
		    }

		    ui_childs.div=ce("div");
		    ui_childs.div.className="childs";
		    
		    if(typeof ui_opts.child_classes != 'undefined')
			add_classes(ui_opts.child_classes, ui_childs.div);
		    
		    ui_root.appendChild(ui_childs.div);
		    tpl_root.sliding_stuff.push(nav);
		    tpl_root.sliding_stuff.push(ui_childs.div);

		    on_ui_childs_ready();
		}

		function nav_include_div(e){
		    ui_childs.div.appendChild(e.ui_root);
		}
		
		function nav_include(e){
		    if(e.ui_opts.bar){ 
			var liti=cc("li",nav);//

			if(ui_opts.close){
			    //if(è(e.ui_name)) add_close_button(e,e.ui_name);
			    //else
			    add_close_button(e,liti);
			}

			liti.appendChild(e.ui_root);
			e.bar_replace=function(){
			    var newliti=ce("li"); newliti.appendChild(this.ui_root);
			    nav.replaceChild(newliti, liti);
			    liti=newliti;
			}
		    }else
			nav_include_div(e);
		}
		function nav_include_sliding(e){
		    
		    var liti=e.liti=cc("li",nav);//

		    if(ui_opts.close){
			add_close_button(e,liti);
		    }
		    
		    e.listen("slided", function(slided){
			if(slided){
			    if(è(e.nav))
				e.nav.prependChild(e.ui_name);
			    else
				e.ui_root.prependChild(e.ui_name);
			    
			    liti.add_class("disabled");
			}else{
			    //if(!ui_opts.bar)
			    liti.appendChild(e.ui_name);
			    liti.remove_class("disabled");
			}
		    });
		    
		    liti.appendChild(e.ui_name);
		    
		    if(!e.ui_opts.label)
			ui_childs.div.appendChild(ui);

		    e.bar_replace=function(){
			var newliti=ce("li"); newliti.appendChild(this.ui_name);
			nav.replaceChild(newliti, liti);
			liti=newliti;
		    }
		    
		    e.trigger("slided",e.ui_opts.slided);
		}

		if(e.ui_name){
		    if(typeof e.ui_opts !=='undefined'){
			if(typeof e.ui_opts.sliding !== 'undefined'){
			    if(e.ui_opts.sliding===true){
				nav_include_sliding(e);
			    }else{
				nav_include(e);
			    }
			}else nav_include(e);
		    }else nav_include(e);
		    //liti.innerHTML=e.title;
		    //cc("li",nav).innerHTML=e.name;
		}
		

	    }
	    
	    ui_childs.remove_child=function(e){
		ui_childs.div.removeChild(e.ui_root);
	    }


	    ui_childs.replace_child=function(new_ctpl){
		//var ui=e.ui_opts.label ? e.ui_name :  e.ui_root;
		//console.log("DIV Replaced UI "+ ui.nodeName + " with node " + new_ui.nodeName);
		if(typeof new_ctpl.bar_replace!=='undefined')
		    new_ctpl.bar_replace();

		ui_childs.div.replaceChild(new_ctpl.ui_root, new_ctpl.ui_root_old);

		// if(oldui.parentNode===ui_childs.div)
		// 	ui_childs.div.replaceChild(new_ctpl.ui_root, new_ctpl.ui_root_old);

	    }
	    //	tpl_root.ui_childs=ui_childs=tpl_root.parent.ui_childs;
	    
	    break;

	case "tabbed":
	case "pills":
	case "radio":
	    
	    
	    var nav;
	    var uic=tpl_root.ui_content;

	    //console.log(tpl_root.name + " : child toolbar : " + child_toolbar);
	    if(child_toolbar){
		nav=tpl_root.toolbar.unav;
	    }else{
		
		if(è(ui_opts.tabs_on_name)){
		    
		    nav=this.nav=cc("ul",ui_name);
		    tpl_root.ui_title_name.style.display="inline-block";
		    tpl_root.ui_title_name.style.borderBottom="1px solid lightgrey";
		    
		    // tpl_root.ui_title_name.style.margin="0em";
		    // tpl_root.ui_title_name.style.padding="0em";
		    tpl_root.ui_title_name.style.paddingRight=".5em";
		    //tpl_root.ui_title_name.style.paddingBottom=".5em";
		    // tpl_root.ui_title_name.style.position="relative";
		    
		    tpl_root.ui_title_name.style.bottom="0px";
		    
		    //nav.style.position="relative";
		    //nav.style.top="1.75em";
		    nav.style.marginBottom="-7px";
		    
		    
		    //ui_name.
		    nav.style.display="inline-block";
		}
		
		else{
		    var div=ui_childs.div=cc("div", uic);
		    nav=this.nav=cc("ul",div);
		    
		    uic=div;
		}
		
		
		
		nav.className="nav";
		if(ui_opts.tabs_mode !== undefined){
		    if(ui_opts.tabs_mode==='left')
			nav.add_class("col-sm-3");
		}//else

		if(cvtype==="tabbed"){
		    nav.add_class("nav-tabs");
		    nav.setAttribute("role","tablist");
		}

		if(cvtype==="pills")
		    nav.add_class("nav-pills");

		
		if(typeof ui_opts.tabs_mode != 'undefined'){
		    if(ui_opts.tabs_mode==='left')
			nav.add_class("tabs-left");
		}
		
		
		if(typeof ui_opts.tab_classes != 'undefined')
		    add_classes(ui_opts.tab_classes, nav);


	    }
	    
	    var cnt=this.cnt=tpl_root.ui_childs.div=cc("div", uic);
	    var navcnt=nav;
	    //navcnt.add_class(cvtype);

	    if(!child_toolbar)
		cnt.add_class("tab-content");

	    if(typeof ui_opts.tabs_mode != 'undefined'){
		if(ui_opts.tabs_mode==='left')
		    cnt.add_class("col-xs-9");
	    }
	    
	    if(è(ui_opts.tab_scroll_height)){
		cnt.style.maxHeight=ui_opts.tab_scroll_height;
		cnt.style.overflowY="auto";
	    }
	    cnt.add_class(cvtype);
	    //cnt.add_class("tab-content");

	    
	    tpl_root.sliding_stuff.push(nav);
	    tpl_root.sliding_stuff.push(cnt);
	    //var lm=this;
	    
	    new_event(tpl_root,"element_selected");
	    //this.frames=[];
	    var nframes=0;
	    //    var last_sel_frame;
	    
	    
	    tpl_root.ui_childs.close_selected_frame=function(){
		var selected_frame=ui_childs.selected_frame;
		if(selected_frame===undefined) return;
		selected_frame.ui_root.style.display='none';
		selected_frame.ui_root.remove_class("active");
		selected_frame.li.remove_class("active");
	    }
	    
	    var select_frame=tpl_root.ui_childs.select_frame=function(f){
		var selected_frame=tpl_root.ui_childs.selected_frame;

		if(tpl_root.tb_ui!==undefined) tpl_root.tb_ui.trigger('close');
		
		
		if(typeof selected_frame!='undefined'){

		    //console.log("Selecting tab/radio child " + f.name+ " selected = " + selected_frame.name);
		    
		    
		    selected_frame.ui_root.style.display='none';
		    selected_frame.ui_root.remove_class("active");
		    //selected_frame.ui_root.add_class("normal_tab");
		    //	    last_sel_frame=this.selected_frame;
		    
		    //selected_frame.li.remove_class("selected");
		    selected_frame.li.remove_class("active");

		    if(selected_frame.ui_root.parentNode===cnt)
			cnt.replaceChild(f.ui_root,selected_frame.ui_root);
		    else
			cnt.appendChild(f.ui_root);
		}else
		    cnt.appendChild(f.ui_root);
		
		f.ui_root.style.display='block';
		selected_frame=tpl_root.ui_childs.selected_frame=f;
		
		selected_frame.li.add_class("active");
		selected_frame.ui_root.add_class("active");
		
		if(è(f.rad)) f.rad.checked=true;

		if(è(f.parent))
		    f.parent.trigger("element_selected", f);
		else
		    console.log("No parent??");

		if(ui_opts.hide_item && tpl_root.item_ui!==undefined){
		    tpl_root.item_ui.style.display='none';
		}

		f.trigger("selected");


		return f;
	    }
	    
	    ui_childs.remove_child=function(e){
		this.remove_child_com(e);

		/*
		  if(e === selected_frame){

		  var prev=e.ui_root.previousSibling;
		  while(prev && prev.nodeName!="LI"){
		  prev=prev.previousSibling;
		  }
		  if(prev) 
		  console.log("Found prev " + prev.nodeName + " fdiv? " + prev.div);
		  if(prev) 
		  this.select_frame(prev);
		  }
		*/
		cnt.removeChild(e.ui_root);
		nav.removeChild(e.li);
		selected_frame=undefined;
		nframes--;
	    };
	    
	    var rad_group;

	    var set_frame_name=function(e){
		if(ù(e.a)){
		    e.a=cc("a",e.li); e.a.href="javascript:void(0)";
		    e.a.className="nav-link";
		}
		
		e.a.innerHTML="";

		// if(è(e.ui_opts.fa_icon)){
		//     e.a.innerHTML='<span class="fa fa-'+e.ui_opts.fa_icon+'"> </span>';
		// }
		
		if(e.name){
 		    e.a.innerHTML+=e.name;
		}
		else{
		    if(e.type)
			e.a.innerHTML="Another " +e.type;
		    else
			e.a.innerHTML="Container";
		}

		var ico=get_ico(e);
  		if(è(ico))
		    e.a.prependChild(ico);
		
		//if(e.ui_opts.close) add_close_button(e,e.a);
		
		if(cvtype==="radio") {
		    if(ù(rad_group))rad_group=Math.random().toString(36).substring(2);
		    e.rad=cc("input",e.a);
		    e.rad.type="radio";
		    e.rad.name=rad_group;
		}
	    }
	    
	    var add_frame=function(e){
		//console.log("Add tab/radio frame " + e.name);
		e.li=cc("li", nav);
		e.li.className="nav-item";
		e.li.setAttribute("role","presentation");

		if(child_toolbar){
		    e.li.setAttribute('data-toggle',"collapse");
		    e.li.setAttribute("data-target",".navbar-collapse.in");
		}
		
		e.get_title_node=function(){
		    //console.log("tab/rad get title node ! ");
		    return e.li;
		}
		
		set_frame_name(e);
		
		if(!e.ui_opts.label){
		    if(ui_opts.tabs_mode !== undefined){
			//if(ui_opts.tabs_mode==='left')
			//   cnt.add_class("col-xs-9");
		    }else{
			if(! child_toolbar)
			    e.ui_root.add_class("tab-pane");
		    }

		    if(!child_toolbar){
			//e.ui_root.add_class("container-fluid");
			e.ui_root.setAttribute("role","tabpanel");
		    }
		    e.ui_root.style.display='none';
		    
		    e.li.addEventListener("click",function(){
			//console.log("Li Click !!");
			select_frame(e); //xd.fullscreen(false);

		    });
		    //e.tabdiv.appendChild(e.ui_root);
		    nframes++;
		    //if(this.frames.length==1) 
		    
		    if(ù(tpl_root.ui_childs.selected_frame)){
			if(ui_opts.default_child!==undefined){
			    if(ui_opts.default_child===e.key)
				select_frame(e);
			}else
			    select_frame(e);
		    }
		}//else console.log("LAAABELLL " + e.name);
		

		if(!e.ui_opts.close){
		    e.ui_opts.close=true;
		    //add_close_button(e,e.a);
		    e.set_title();
		}
		e.listen('close', function(){
		    tpl_root.ui_childs.close_selected_frame();
		});
		
		e.listen("name_changed", function(new_title){
		    set_frame_name(e);
		});

		return e.li;
	    }
	    
	    
	    //tpl_root.ui_childs=ui_childs=new tab_widget(tpl_root);

	    //ui_childs.div.add_class("childs");
	    
	    if(typeof ui_opts.child_classes != 'undefined')
		add_classes(ui_opts.child_classes, ui_childs.div);
	    
	    //ui_root.appendChild(ui_childs.div);
	    //tpl_root.sliding_stuff.push(ui_childs.div);
	    
	    ui_childs.add_child=function(e,ui,prep){
		//console.log("tab/radio add child " + e + " name=" + e.name);
		this.add_child_com(e);
		//e.parent=tpl_root;
		
		if(add_child_common(e,ui,prep)){
		    if(typeof tpl_root.ui_childs=='undefined'){
			
		    }
		    var li=add_frame(e);
		    ui.f=li;
		}
		//f.div.appendChild(ui);
	    }
	    
	    ui_childs.replace_child=function(new_ctpl){
		if(selected_frame===new_ctpl){
		    cnt.replaceChild(new_ctpl.ui_root,new_ctpl.ui_root_old);
		}
		console.log("TAB replace node " + new_ctpl.name + " ");
		//ui.f.div.replaceChild(new_ctpl.ui_root, oldui);
		
	    }
	    //on_ui_childs_ready();

	    break;
	default:
	    throw (tpl_root.name +" Invalid child view type : " + cvtype);
	    break;
	}
	
	if(tpl_root.ui_opts.build_childs!==false){
	    
	    tpl_root.build_childs_ui(tpl_root.elements).then(ok).catch(fail);
	}
	else {
	    console.log("Not building childs for " + tpl_root.name);
	    ok();
	}
    });

    return prom;
    
}




template_object.prototype.add_child=function(tpl, key){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;

    if(tpl_root.elements===undefined) tpl_root.elements={};
    if(tpl_root.ui_childs===undefined) setup_childs();
    
    if(key===undefined)key=Math.random().toString(36).substring(2); 
    tpl_root.elements[key]=tpl;
    //console.log("Adding child " + tpl.name + " root is  " + tpl.ui_root);
    
    tpl_root.ui_childs.add_child(tpl, tpl.ui_root);
    return tpl;
};

template_object.prototype.remove_child=function(key){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    var c=this.elements[key];
    if(c===undefined) throw Error("Error removing child ["+key+"] : No such child ");
    tpl_root.ui_childs.remove_child(c);

    delete this.elements[key];
    delete c;
};

template_object.prototype.update_child=function(tpl, child_key){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    var child=tpl_root.get(child_key);
    if(ù(child)){

	//console.log("Repalced child  (WAS UNDEF) key "+ child_key + " new name " + tpl.name  );
	
	return tpl_root.add_child(tpl,child_key);
	//return tpl_root.debug("update_child error: "+tpl_root.name+" : No such child " + child_key);
    }
    
    tpl_root.elements[child_key]=tpl;
    if(tpl.ui_root!==undefined)
	child.ui_root.parentNode.replaceChild(tpl.ui_root, child.ui_root);
    else
	console.log("Repalced child  key "+ child_key + " N=" + tpl.name + "T["+tpl.type+"] NO ui_root !" );
    
}

template_object.prototype.clear_childs=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;

    if(tpl_root.ui_childs!==undefined)
	if(tpl_root.ui_childs.div!==undefined)
	    tpl_root.ui_childs.div.innerHTML="";
    tpl_root.elements={};
}

template_object.prototype.hide=function(hide){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    if(hide===undefined) hide=true;
    tpl_root.ui_root.style.display= hide===true ? "none":"";
    if(tpl_root.ui_root.ui_childs!==undefined && tpl_root.ui_root.ui_childs.div!==undefined)
	tpl_root.ui_root.ui_childs.div.style.display=hide === true? "none":"";
}

template_object.prototype.disable_rec=function(dis, rec){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    if(è(this.disable_element)) this.disable_element(dis);
    if(rec && è(tpl_root.elements))
	for(var e in tpl_root.elements){
	    tpl_root.elements[e].disable(dis, rec);
	    //tpl_root.elements[e].disable_rec(dis, rec);
	};
    
}

template_object.prototype.disable=function(dis,rec){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    if(ù(dis)){ dis=true; rec=true;}
    if(ù(rec))rec=true;

    var dis_els = [tpl_root.item_ui, tpl_root.ui_root];
    
    dis_els.forEach(function(de){
	if(de!==undefined){
	    if(dis)
		de.setAttribute('disabled',true);
	    else
		de.removeAttribute('disabled');
	}
    });
    
    //dis_el.remove_class("masked");    
    
    //console.log(tpl_root.name + " : disabled ? " + dis);
    tpl_root.disable_rec(dis,rec);
    tpl_root.trigger("disabled", dis);
};


template_object.prototype.setup_item=function(){

    //console.log(this.type + ":" + this.name + "  setup item");
    var tpl_root=this;

    var prom=new Promise(function(ok,fail){
	
	var ui_opts=tpl_root.ui_opts;
	var ui_childs=tpl_root.ui_childs;
	
	
	if(tpl_root.parent!==undefined){
	    if(tpl_root.parent.ui_opts!==undefined){
		var uio=tpl_root.parent.ui_opts;
		if(uio.container!==undefined){
		    if(uio.container.del){
			//console.log(tpl_root.name + " : Adding close feature ");
			tpl_root.ui_opts.close=true;
		    }
		}
	    }
	}
	
	
	//    try{
	
	
	tpl_root.build().then(function(item_ui){
	    
	    tpl_root.item_ui=item_ui;
	    
	    if(ui_opts.label && è(item_ui)){
		if(tpl_root.sliding){
		    new_event(tpl_root,"slided");
		    
		}else{
		    if(è(tpl_root.ui_name)){
			var uid=Math.random().toString(36).substring(2); item_ui.id=uid;
			tpl_root.ui_name.setAttribute("for",uid);
		    }
		    
		}
	    }
	    
	    if(item_ui!==undefined){
		if(!ui_opts.item_root){
		    //console.log(tpl_root.type + " : adding item ui " + item_ui.constructor.name);
		    if(ui_opts.name_after===true)
			tpl_root.ui_content.prependChild(item_ui);
		    else{
			
			if(ui_opts.item_bottom===true)
			    tpl_root.ui_content.appendChild(item_ui);
			else{
			    if(ui_childs && ui_childs.div !==undefined)
				ui_childs.div.parentNode.insertBefore(item_ui, ui_childs.div);
			    else
				tpl_root.ui_content.appendChild(item_ui);
			}
			//	
			//  else
			    
		    }
		    
		    if(tpl_root.sliding){
			//console.log(tpl_root.name + " : Adding item_ui in sliding stuff " + tpl_root.sliding_stuff.length);
			tpl_root.sliding_stuff.push(item_ui);
		    }
		}
		
		function setup_wrap(){
		    if(ui_opts.wrap===true){
			var iui;
			
			iui=tpl_root.wrap_ui=ce("div");
			
			if(è(ui_opts.wrap_classes)){
			    //console.log("Adding wrap " + JSON.stringify(ui_opts.wrap_classes) +" to " + tpl_root.name);
			    add_classes(ui_opts.wrap_classes, iui);
			}
			
			//else
			//iui.add_class("col-md-5");
			
			iui.appendChild(item_ui);
			
			if(!ui_opts.item_root)
			    tpl_root.ui_content.appendChild(iui);
		    }
		}
		
		if(false && tpl_root.default_value !== undefined
		   && tpl_root.set_value!==undefined
		   && (item_ui.nodeName === "INPUT" || item_ui.nodeName === "SELECT")
		  ){
		    
		    //console.log("Got ITEM type " + item_ui.nodeName);
		    ui_opts.wrap=true;
		    setup_wrap();
		    tpl_root.wrap_ui.add_class("input-group");
		    
		    var reset_but=cc("span",tpl_root.wrap_ui);
		    reset_but.className="btn btn-xs btn-warning input-sm input-group-addon fa fa-reply";
		    reset_but.addEventListener("click", function(){
			tpl_root.set_default_value();
		    });
		}else
		    setup_wrap();
		
		
		
		
		if(è(ui_opts.edit_apply)){
		}
		
		
		if(ui_opts.item_classes !== undefined) add_classes(ui_opts.item_classes, item_ui);
		//if(è(tpl_root.on_attached))	tpl_root.on_attached();
		
		
		
	    }

	    
	    if(è(tpl_root.set_value)){
		if(ù(tpl_root.set_default_value)){
		    tpl_root.set_default_value=function(){
			if(è(this.default_value)) this.set_value(this.default_value);
		    }
		    tpl_root.set_default_value();
		}
	    }
	    
	    if(typeof ui_opts.tip != 'undefined'){
		if(tpl_root.ui_name!==undefined)
		    tpl_root.ui_name.setAttribute("title", ui_opts.tip);
		else
		    tpl_root.ui_root.setAttribute("title", ui_opts.tip);
	    }

	    ok();
	    
	}).catch(fail);
    });

    return prom;
    
    
    // }
    // catch(e){
    // 	//tpl_root.debug("Error building "+tpl_root.name+" : " + dump_error(e));
    // 	throw e;
    // }
}


template_object.prototype.setup_sliiiding=function(){
    var tpl_root=this;
    var ui_opts=tpl_root.ui_opts;
    
    function update_sliding_arrows(){
	if(slide_button!==undefined){
	    
	    slide_button.className="text-info fa sliding_icon";
	    //slide_button.className+=" "+sliding_dir;
	    //slide_button.innerHTML= slided ? "❌" : "▶" ;
	    //▲❌▼
	    slide_button.innerHTML=slided? '\uf0a8' : '\uf0a9';
	    //slide_button.className+=slided? " fa-chevron-sign-left" : " fa-chevron-sign-right";
	}else
	    console.log(tpl_root.name + " : Bug? sliding and no slide button ! ");
    }

    function update_sliding_ui(){
	
	var marg=[];
	
	if(animate){
	    
	    switch(sliding_dir){
	    case "h":
		marg[0]="marginLeft";
		marg[1]="marginRight";
		break;
	    case "v":
		marg[0]="marginTop";
		marg[1]="marginBottom";
		break;
	    default: throw("Bug!!here "); return;
	    };
	}
	
	
	//console.log(tpl_root.name + " Hello animate !!  " + animate + " ssl " + tpl_root.sliding_stuff.length + " M " + marg[0] + ", " + marg[1]);
	
	if(slided){
	    
	    tpl_root.sliding_stuff.forEach(function (s){

		if(animate){
		    s.style[marg[0]]="0%";
		    s.style[marg[1]]="0%";
		    s.style.opacity="1.0";
		}else
		    s.style.display=s.disp_orig;
		
		
	    });
	    if(è(ui_name)){
		ui_name.remove_class("unslided");
		ui_name.add_class("slided");
	    }
	}else{
	    //console.log("Hello marg->-100% !!  " + animate + " ssl " + tpl_root.sliding_stuff.length + " M " + marg[0] + ", " + marg[1]);

	    tpl_root.sliding_stuff.forEach(function (s){
		if(animate){
		    s.style[marg[0]]="-100%";
		    s.style[marg[1]]="100%";
		    s.style.opacity="0.0";
		}else s.style.display="none";
	    });
	    if(è(ui_name)){
		ui_name.remove_class("slided");
		ui_name.add_class("unslided");
	    }
	}
	
	//if(item_ui)console.log(tpl_root.name + " update UI slided = " + slided);
	
	update_sliding_arrows();
	
	if(!animate)tpl_root.trigger("slided", slided);
	//tpl_root.trigger("slided", slided);
	//if(typeof ui_opts.on_slide!='undefined') ui_opts.on_slide(slided);
    }
    

    
    function setup_sliding(){

	new_event(tpl_root, "slided");


	if(sliding){

	    if(ù(slide_button)){
		if(è(tpl_root.ui_title_name))
		    slide_button=tpl_root.slide_button=cc("span",tpl_root.ui_title_name);
		else
		    slide_button=tpl_root.slide_button=cc("span",ui_name); 
		
	    }else{
		if(è(tpl_root.ui_title_name))
		    tpl_root.ui_title_name.appendChild(slide_button);
		else
		    ui_name.appendChild(slide_button);
	    }
	    slide_button.style.zIndex=ui_root.style.zIndex+1;
	    update_sliding_arrows();

	    
	    if(tpl_root.parent)
		if(typeof tpl_root.parent.ui_opts.child_view_type != "undefined")
		    if(tpl_root.parent.ui_opts.child_view_type == "bar") 
			//if(!tpl_root.ui_opts.bar) 
			tpl_root.sliding_stuff.push(ui_root);
	    
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

	    //console.log("transitionning " + tpl_root.sliding_stuff.length);
	    tpl_root.sliding_stuff.forEach(function(s){
		//s=tpl_root.sliding_stuff[si];
		//	tpl_root.sliding_stuff.forEach(function (s){
		//s.disp_orig=s.style.display;
		
		if(animate){
		    
		    s.add_class("sliding");
		    
		    //console.log("ENABLE sliding! ");
		    s.addEventListener("transitionstart",function(){
			//  console.log("Ani start ! " + slided );
		    }, false);
		    
		    s.addEventListener("transitionend",function(){

			if(!slided){
			    console.log(" Ani end ! setting display to none ! " + slided + " e : " + s.nodeName );
			    s.style.display="none";
			}
			tpl_root.trigger("slided", slided);
			//if(typeof tpl_root.on_slide != 'undefined') tpl_root.on_slide(slided);
		    }, false);
		}
	    });
	    
	    //console.log("adding slide button click event for  " + tpl_root.name);
	    
	    var click_elements = [];

	    if(slide_button!==undefined)
		click_elements.push(slide_button);
	    
	    //if(tpl_root.ui_title_name !== undefined) click_elements.push(tpl_root.ui_title_name);
	    
	    if(ui_opts.label === true) click_elements.push(tpl_root.ui_name);   

	    
	    
	    click_elements.forEach(function(ce){
		//console.log(tpl_root.type + "  add  SLIDE click ! ----> " + click_elements.length );
		//console.log(tpl_root.name + "  add  SLIDE click !  " + ce.nodeName);
		ce.addEventListener("click",function(e){
		    //slide_button.addEventListener("click",function(e){
		    //console.log(tpl_root.name + "  SLIDE click !  " + slided);
		    slided=!slided;
		    
		    tpl_root.sliding_stuff.forEach(function (s){
			//console.log("display stuff " + s.disp_orig );
			s.style.display="";//s.disp_orig;
			
		    });
		    
		    if(animate){
			setTimeout(function(){
			    update_sliding_ui();
			    
			}, 100);
		    }else
			update_sliding_ui();
		    
		    e.cancelBubble = true;
		    
		    if (e.stopPropagation){
			e.stopPropagation();
			//console.log(tpl_root.name + " : SLIDE stop propagation...");
		    }
		    
		    return false;
		}, false);
	    });
	    
	    if(!slided){
		tpl_root.sliding_stuff.forEach(function (s){
		    s.style.display="none";
		});
	    }
	    
	    update_sliding_ui();
	    
	}
    }
}


function config_common_input(tpl_item){

    tpl_item.listen("disabled", function(disabled){
	if(disabled)
	    tpl_item.ui.setAttribute("disabled", true);
	else
	    tpl_item.ui.removeAttribute("disabled");
    });
    
    new_event(tpl_item,"change");
    new_event(tpl_item,"input");
    


    switch (tpl_item.ui_opts.type){
    case "short":
	tpl_item.ui.add_class("control-label");
	break;
    case "edit": 
	tpl_item.set_placeholder_value=function(){
	    if(è(tpl_item.holder_value)){
		//console.log("Setting placeholder value");
		tpl_item.ui.setAttribute("placeholder",tpl_item.holder_value);
	    }
	}

	
	tpl_item.ui.addEventListener("change",function(){
	    tpl_item.set_value(this.value); 
	},false);

	tpl_item.ui.addEventListener("input",function(){
	    tpl_item.trigger('input',this.value); 
	},false);

	//tpl_item.ui_root.add_class('form-inline');
	
	break;
    default: break;
    };


    if(tpl_item.ui_opts.type === 'edit'){
	
	//    if(tpl_item.get_value===undefined)
	tpl_item.get_value=function(){return tpl_item.value;}

	//    if(tpl_item.set_value===undefined)
	tpl_item.set_value=function(nv){
	    //console.log("input set value to " + nv);
	    if(è(nv)){
		var ch=(nv!=tpl_item.value);
		tpl_item.value=nv;
		if(ch)
		    tpl_item.trigger("change", tpl_item.value);
	    }
	    
	    if(è(tpl_item.value)){
		tpl_item.ui.value=tpl_item.value;
	    }
	    else
		if(è(tpl_item.set_placeholder_value))
		    tpl_item.set_placeholder_value();
	}
	
    }
    
    //if(tpl_item.set_default_value===undefined)
    tpl_item.set_default_value=function(){
	if(tpl_item.set_value!==undefined)
	    tpl_item.set_value(tpl_item.default_value);
    }
    
    //if(è(tpl_item.ui_name)) tpl_item.ui_name.add_class("control-label");
    
    if(è(tpl_item.value))
	tpl_item.set_value();
    else
	tpl_item.set_default_value();
    
}
