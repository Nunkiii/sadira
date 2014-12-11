// This configures an HTML element to be editable and performs the DB action required.
// All parameters are given as HTML tag property attributes.

function setup_editable(tpl_item, el){

    if(typeof el === 'undefined') el = tpl_item.ui;

    //console.log("setting edit for " + el.tagName);
    
    function kp_handler(ev){

	ev = ev || window.event;
	var code = ev.which || ev.keyCode;

	if (code == 13) { // Return key pressed
	    if (typeof ev.preventDefault != "undefined") {
		ev.preventDefault();
	    } else {
		ev.returnValue = false;
	    }
	}
    }
    
    if (typeof el.addEventListener != "undefined") {
	el.addEventListener("keypress", kp_handler, false);
	//el.addEventListener("keydown", kp_handler, false);
	//console.log("attached event listeneer");
    } else if (typeof el.attachEvent != "undefined") {
	el.attachEvent("onkeypress", kp_handler);

    }
    
}


function add_classes(classes, class_node){

    if(!class_node || !classes) return;
    for(var c=0;c<classes.length;c++)
	class_node.className+=" "+classes[c];
}

function tab_widget(parent){

}

function get_margins(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("margin-left"))+parseFloat(s.getPropertyValue("margin-right"));
    h=parseFloat(s.getPropertyValue("margin-top"))+parseFloat(s.getPropertyValue("margin-bottom"));
    return {w: w, h: h};
    
}

function get_borders(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("border-left-width"))+parseFloat(s.getPropertyValue("border-right-width"));
    h=parseFloat(s.getPropertyValue("border-top-width"))+parseFloat(s.getPropertyValue("border-bottom-width"));
    return {w: w, h: h};
}

function get_overflow(wg){
    var s=window.getComputedStyle(wg,null);
    var m=get_margins(s);
    var b=get_borders(s);
    var o={w: m.w+b.w, h: m.h+b.h, sty : s};
    //console.log("overflow " + JSON.stringify(o,null,2));
    return o;
}

function get_inner_dim(sty,dir){
    return dir? parseFloat(sty.height)+parseFloat(sty.paddingTop)+parseFloat(sty.paddingBottom):
	parseFloat(sty.width)+parseFloat(sty.paddingLeft)+parseFloat(sty.paddingRight);
}


function divider(cnt, frac, or){

    var ho=ù(or)? false : or;
    if(ù(frac)) frac=50.0;

    var div=this;

    new_event(this,"drag_start");
    new_event(this,"drag_end");
    new_event(this,"drag");
    
    var mouseconf=false;

    this.set_orientation=function(or){
	ho=or;
	//this.update();
    }

    this.update=function() {

	if(ù(ho)) throw("No direction !") ; //ho=false;

	var l=this.left, r=this.right;
	var divnode = this.divnode;
	
	var cntd=get_overflow(cnt);
	var leftd=get_overflow(l);
	var rightd=get_overflow(r);
	var divnoded=get_overflow(divnode);
	
	//var sty=document.defaultView.getComputedStyle(cnt);
	var cntpad=ho?parseFloat(cntd.sty.paddingTop)+parseFloat(cntd.sty.paddingBottom)
	    : parseFloat(cntd.sty.paddingLeft)+parseFloat(cntd.sty.paddingRight);
	//var cnth=parseFloat(sty.height);
	
	var wreal=ho?parseFloat(cntd.sty.height):parseFloat(cntd.sty.width);
	var w=wreal-cntpad;
//	var divh=sty.height;
	
	
	//sty=document.defaultView.getComputedStyle(l);
	var ml=ho?get_margins(leftd.sty).h:get_margins(leftd.sty).w;
	//var divh=get_inner_dim(leftd.sty,ho);
	//console.log("Container : w=" + w + " mtot = " + ml );//+ " sty =  " + JSON.stringify(sty));
	//console.log("Left : w=" + sty.width + " mtot = " + ml + " clientw=" + this.left.clientWidth);
	var mr=ho?get_margins(rightd.sty).h:get_margins(rightd.sty).w;

	//console.log("Right : w=" + sty.width + " mtot = " + mr + " clientw=" + this.right.clientWidth);
	sty=document.defaultView.getComputedStyle(divnode);
	divnoded.sty
	var divw=ho?parseFloat(divnoded.sty.height)+divnoded.h:parseFloat(divnoded.sty.width)+divnoded.w;
	//var wp=wreal-mr-ml-divw;
	var wp=wreal-divw;
	
	//if(ho) wp-=0;
	//console.log("Width tot margins : " + (leftd.w+cntd.w) + " divp="+divp + " nrl " + mrl + " divw " + divw);
	if(ho){
	    var wl=(frac/100.0*wp)-leftd.h; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp)-rightd.h; //-cntd.w;
	    //console.log("wl=" + wl + " wr=" + wr + " wt=" + (wl+wr) + " wl+wr+marg="+ (wl+wr+mr+ml)+" wcnt= " + w);
	    l.style.height = wl + 'px';
	    r.style.height = wr + 'px';
	    l.style.width = "";
	    r.style.width = "";
	}else{
	    var wl=(frac/100.0*wp)-leftd.w; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp)-rightd.w; //-cntd.w;
	    l.style.width = wl + 'px';
	    r.style.width = wr + 'px';
	    l.style.height = "";
	    r.style.height = "";
	}
	
	//console.log("HO= "+ho+" frac "+frac+" divw=" + divw + "  wp=" + wp + " mr="+ mr + " ml " + ml +" wcnt= " + w);

	if(!mouseconf){
	    mouseconf=true;
	    //console.log("Creating drag events");
	    divnode.addEventListener('mousedown', function(e) {


		e.preventDefault();
		var last = ho? e.pageY : e.pageX;
		//console.log("DRAG BEGIN " + last);
		
		document.documentElement.add_class('dragging');
		document.documentElement.addEventListener('mousemove', on_move, true);
		document.documentElement.addEventListener('mouseup', on_up, true);
		
		div.trigger("drag_start");
		
		function on_move(e) {
		    
		    e.preventDefault();
		    e.stopPropagation();

		    var pos=(ho ? e.pageY : e.pageX);
		    var delta = pos - last;
		    last = pos;
		    //delta -= last;

		    var sty=document.defaultView.getComputedStyle(cnt);
		    var ma=get_margins(sty);
		    
		    var m=ho? ma.h:ma.w; //(sty.marginBottom+sty.marginTop) : (sty.marginLeft+sty.marginRight);
		    var sz=ho? sty.height : sty.width;
		    frac += delta /  (parseFloat(sz)-m) * 100;
		    //console.log("delta="+delta + " m= " + m + " dim " + sty.width + " frac " + frac);		    
		    div.trigger("drag");
		    div.update(ho);
		    
		}
		
		function on_up(e) {
		    e.preventDefault();
		    e.stopPropagation();
		    document.documentElement.remove_class('dragging');
		    //document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
		    document.documentElement.removeEventListener('mousemove', on_move, true);
		    document.documentElement.removeEventListener('mouseup', on_up, true);
		    //console.log("Done move..."); 
		    div.trigger("drag_end");
		}
		
	    }, false);
	}
    }
    
}



var local_templates=function(){
  this.templates={};
}

local_templates.prototype.add_templates=function(templates){
  for(var tname in templates){
    this.templates[tname]=templates[tname];
  }
}

local_templates.prototype.update_template=function(tpl_item, tpl){
    var toup=["elements","ui_opts"];
    
    //console.log("Subst template for " + tpl.template_name +" : " + tpl_item.name + " tname is " + tpl_item.template_name);
    
    for(var ti=0;ti< toup.length;ti++){
	var t=toup[ti];
	//console.log("Check " + t + " typof " + typeof tpl_item[t] );
	
	if(typeof tpl[t]!='undefined'){
	    if(typeof tpl_item[t]=='undefined')
		tpl_item[t]=clone_obj(tpl[t]); //tpl[t];
	    else
		for(var o in tpl[t]){
		    if(typeof tpl_item[t][o]=='undefined')tpl_item[t][o]=clone_obj(tpl[t][o]);//tpl[t][o]; //
		}
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
}

local_templates.prototype.substitute_template=function(tpl_item){
    //console.log("Substitute " + tpl_item.name + " type " + tpl_item.type);

    if(tpl_item.type=="template" && typeof tpl_item.template_name!='undefined'){
	var tpl=this.templates[tpl_item.template_name];
	if(typeof tpl==='undefined')
	    throw "Unknwon template " + tpl_item.template_name;

	if(typeof tpl.template_name !='undefined'){
	    var tpls=this.templates[tpl.template_name];
	    if(typeof tpls==='undefined')
		throw "Unknwon template " + tpl.template_name;
	    this.update_template(tpl_item, tpls);
	}
	this.update_template(tpl_item, tpl);
	return true;
    }
    return false;
}

local_templates.prototype.substitute_templates=function(tpl){
    this.substitute_template(tpl);
    for (var e in tpl.elements){
	this.substitute_templates(tpl.elements[e]);
    }
    //console.log("TPL " + tpl.name + " events : " + tpl.events);
    if(typeof tpl.events!='undefined'){
	//console.log("Setting up events for " + tpl.name + " type " + tpl.type);
	tpl.events.forEach(function(e){ 
	    //console.log("Create event " + e + " for " + tpl.name);
	    new_event(tpl,e); 
	});
    }//else	console.log("NO events for " + tpl.name + " type " + tpl.type);


}

local_templates.prototype.build_template=function(template_name){

    var tplo;

    if(typeof template_name === 'string'){ 
	tplo=this.templates[template_name];
	if(typeof tplo === 'undefined') 
	    throw "Unknown template " + template_name;
    }else
	tplo=template_name;
    
    var tpl= clone_obj(tplo);
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
	//tpl_item.set_value(tpl_item.value);
    }
}


function create_item_ui(ui_opts, tpl_node){
    
    var tpl_name=tpl_node.type;
    if(ù(tpl_name)) tpl_name="none";
//    if(typeof tpl_name=='undefined') 
//	throw "No valid template name on tpl_node...";
    
    var builders=[];

//    if(tpl_name=="template"){
    //  }
    //console.log("Building ["+tpl_name+"]");//...." + JSON.stringify(tpl_node,null,4));

    if(tpl_name!=="template"){
	var builder=template_ui_builders[tpl_name];
	if(è(builder))
	    builders.push(builder);
    }else{
    }
    
    if(è(tpl_node.tpl_builder)){
	//console.log("Applying tpl_builder : " + tpl_node.tpl_builder);
	var builder=template_ui_builders[tpl_node.tpl_builder];
	if(è(builder)) builders.push(builder);
	else
	    console.log("Error : builder not found : " + tpl_node.tpl_builder);
	//tpl_name=tpl_node.tpl_builder;
    }//else return;

    if (builders.length==0){
	//console.log("Cannot build "+ tpl_node.name+" : no builder for object type " + tpl_name +"");
	//return;
    }

    template_ui_builders.default_before(ui_opts,tpl_node);
    
    var ui;

    for(var b=0;b<builders.length;b++){
	var bui=builders[b](ui_opts, tpl_node);
	if(typeof ui==='undefined') ui=bui;
    }
    
    if(typeof ui==='undefined'){
	//console.log("warning: no UI returned for type " + tpl_name);
    }
    
    template_ui_builders.default_after(ui_opts,tpl_node);
    return ui;
}

function child_container(tpl_root){
    this.tpl_root=tpl_root;
    
};

child_container.prototype.childs={};

child_container.prototype.add_child_com=function(child){
    var cnt=this;
    child.parent=this.tpl_root;
    
    if(typeof child.ui_opts.close != 'undefined'){
	new_event(child,"close");
	child.listen("close", function(){
	    console.log("Closing " + child.name);
	    cnt.remove_child(child);
	});
    }
    
    if(ù(child.ui_views)){
	child.ui_views={};
    }
    
    var uid=Math.random().toString(36).substring(2);
    child.ui_views[uid]=this;
};

child_container.prototype.is_child=function(child){
    if(ù(child.ui_views)) return false;
    for(var u in child.ui_views) if (child.ui_views[u]===this) return u;
    return undefined;
}
child_container.prototype.remove_child_com=function(child){
    var u=this.is_child(child);
    if(è(u)){
	delete child.ui_views[u];
    }
};

child_container.prototype.replace_child_com=function(child){
};


function attach_ui(tpl, node){
    document.body.appendChild(tpl.ui_root, node);
    tpl.trigger("view_update");
    tpl.view_update_childs(); 
}

function get_ico(tpl){
    var ico=undefined;
    if(è(tmaster.icons)){
	
	if(typeof tmaster.icons[tpl.type] != 'undefined'){
	    ico= ce("img");
	    ico.src=tmaster.icons[tpl.type];
	    ico.className="ico";
	}else
	    if(typeof tpl.template_name!='undefined' && typeof tmaster.icons[tpl.template_name] != 'undefined'){
		ico= ce("img");
		ico.src=tmaster.icons[tpl.template_name];
		ico.className="ico";
	    }
    }
    return ico;
}

	    
function add_close_button(e, node){
    if(e.ui_opts.close){
	var close_but = cc("span",node);
	close_but.add_class("close_button");
	close_but.innerHTML="❌";
	close_but.addEventListener("click", function(){
	    node.trigger("close");
	});
    }
}



function create_ui(global_ui_opts, tpl_root, depth){

//    console.log("create UI type "+ tpl_root.type + " name " + tpl_root.name);

    if(!depth){
	tpl_root.depth=0;
    }else 
	tpl_root.depth=depth;

    //if(typeof tpl_root.ui_opts == 'undefined' ) tpl_root.ui_opts={type:"short"}; 
    
    if(ù(tpl_root.ui_opts)){
	tpl_root.ui_opts=global_ui_opts;
	if(ù(tpl_root.ui_opts.type)) tpl_root.ui_opts.type="short";
    }
    else
	for(var o in global_ui_opts) 
	    if(ù(tpl_root.ui_opts[o]))
		tpl_root.ui_opts[o]=global_ui_opts[o];
    
    var ui_opts=tpl_root.ui_opts;    
    var ui_root=tpl_root.ui_root=ce("div");     

    //console.log("create UI " + tpl_root.name + " type " + tpl_root.type + " opts " + tpl_root.ui_opts + " global opts " + JSON.stringify(global_ui_opts));

    
    ui_root.style.display="relative";
    ui_root.style.zIndex=depth;

    
    
    var sliding = (typeof ui_opts.sliding!='undefined') ? ui_opts.sliding : false;
    var sliding_dir = (typeof ui_opts.sliding_dir != 'undefined') ? ui_opts.sliding_dir : "v";
    
    //if(typeof ui_opts.slided == 'undefined') ui_opts.slided = true;
    var slided=(typeof ui_opts.slided === 'undefined') ? true : ui_opts.slided;// = true; ui_opts.slided;

    var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
    
    var sliding_stuff=[];

    

    var ui_childs=tpl_root.ui_childs= new child_container(tpl_root);
    
    
    //console.log("Create UI : " + JSON.stringify(tpl_root.name) + " ui options  " + JSON.stringify(ui_opts));
    
    ui_root.className="db";

    new_event(tpl_root,"slided");
    new_event(tpl_root,"view_update");

    tpl_root.abort_error=function(error_message){
	ui_root.innerHTML='<div class="big_error">⚠</div><div class="error_content">'+error_message+'</div>';
    }

    
    tpl_root.view_update_childs=function(){
	//tpl_root.trigger("view_update");
	for (var e in tpl_root.elements){
	    
	    tpl_root.elements[e].trigger("view_update");
	    tpl_root.elements[e].view_update_childs();
	}

    }
    /*
    tpl_root.listen("view_update", function(){
	for (var e in tpl_root.elements)
	    tpl_root.elements[e].trigger("view_update");
    });
    */
    if(typeof tpl_root.type!='undefined'){
	ui_root.setAttribute("data-type", tpl_root.type);
	if(tpl_root.type==="template" && è(tpl_root.template_name))
	    ui_root.setAttribute("data-tpl", tpl_root.template_name);
    }


    if(depth==0) ui_root.add_class("root");
    
    if(typeof ui_opts.root_classes != 'undefined')
	add_classes(ui_opts.root_classes, ui_root);
    


    if(typeof ui_opts.width != 'undefined') ui_root.style.width=ui_opts.width;


    
//    if(typeof tpl_root.name!='undefined'){

    //var ui_name;
    if(ù(tmaster)) throw("NO TMSATER !!!!");
    /*
      widget name config
     */
    
    new_event(tpl_root,"name_changed");
    
    if(ù(ui_opts.render_name))ui_opts.render_name=true;
    if(è(tpl_root.name) && ui_opts.render_name){
	var ui_name=tpl_root.ui_name= ui_opts.label ? cc("label", ui_root) : cc("div", ui_root);
	var ico=get_ico(tpl_root);
  	if(typeof ico!='undefined')
	    ui_name.prependChild(ico);
	
	
	var ui_name_text=cc("div",ui_name);
	ui_name_text.add_class("title");
	ui_name.add_class("dbname");
	if(typeof ui_opts.name_classes != 'undefined'){
	    //console.log(tpl_root.name + " add name classes " + JSON.stringify(ui_opts.name_classes));
	    add_classes(ui_opts.name_classes, ui_name);
	}

	
	if(typeof tpl_root.tip != 'undefined'){
	    //tpl_root.ui_name.add_class("tooltip");
	    //ui_name.setAttribute("data-tip", tpl_root.name + " : " + tpl_root.tip);

	    ui_name.setAttribute("title", tpl_root.tip);
	    //ui_name.add_class("tip");
	    
	    //var tip=cc("span",ui_name); tip.className="tip";
	    //tip.innerHTML= tpl_root.tip;
	}

	tpl_root.listen("name_changed", function(title){
	    //console.log("Name changed !");
	    ui_name_text.innerHTML=title;
	});
    }
    
    tpl_root.set_title=function(title){
	tpl_root.name=title;
	//ui_name.innerHTML=title;
	tpl_root.trigger("name_changed", title);
	//	span.appendChild( document.createTextNode("some new content") );
    }
    tpl_root.set_title(tpl_root.name ? tpl_root.name : "");


    /*
      widget description (intro) setup
    */
    
    if(è(tpl_root.intro)){// && ui_opts.type!=="short"){
	var intro=cc("div",ui_root);
	intro.add_class("intro");
	intro.innerHTML= tpl_root.intro;
	sliding_stuff.push(intro);
    }

    /*
      Widget window-management
    */

    if(è(ui_opts.enable_wm)){
	
    }
    
    
    //   }


    new_event(tpl_root, "selected");
    //console.log("Created selected event on " + e.name);


    
    tpl_root.enable=function(state){
	if(!state)
	    this.ui_root.add_class("disabled");
	else
	    this.ui_root.remove_class("disabled");
    }

    function rebuild(){
	//if (typeof tpl_root.sliding != 'undefined') 
	tpl_root.ui_opts.slided=slided;//!tpl_root.slided;
	//console.log("Rebuild " + tpl_root.name+"  slided = " + slided);

	tpl_root.ui_root_old=tpl_root.ui_root;
	//tpl_root.parent.ui_childs.div.removeChild(tpl_root.ui_root); //div.appendChild(new_ui);
	
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );
	
	//tpl_root.parent.ui_childs.div.replaceChild(tpl_root.ui_root, oldroot); 
	tpl_root.parent.ui_childs.replace_child(tpl_root); 

//	var cnt=tpl_root.ui_childs; //new_ui.container=tpl_root.container;
	
//	if(typeof cnt!="undefined"){

//	    cnt.replace_child(tpl_root, new_ui);
	    //ui_root=new_ui;
	// }
	// else{
	//     console.log(tpl_root.name + " cannot rebuild : undef container  " );
	// }
    }

    function child_view_type(){
	if(ù(tpl_root.parent)) return undefined;
	if(ù(tpl_root.parent.ui_opts)) return undefined;
	return tpl_root.parent.ui_opts.child_view_type;
    }
    
    if(ui_opts.editable){

	var clickable_zone;

	if(ui_opts.type==="edit"){
	    ui_root.add_class("un_editable");

	    var vt=child_view_type();


	    // if(vt){
	    // 	if(vt === "tabbed" || vt === "radio"){
	    // 	    console.log("Root zone....");
	    // 	    clickable_zone=ui_root;

	    // 	}
	    // 	else
	    // 	    clickable_zone=ui_name;
	    // }else
	    
	    clickable_zone=ui_name;
	}else{
	    ui_root.add_class("editable");
	    clickable_zone=ui_root;
	}

	clickable_zone.addEventListener("click", function(e){
	    
	    console.log("Drawing " + tpl_root.name + " : EDITABLE CLICK type = " + ui_opts.type);
	    
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

    
    if(typeof tpl_root.clicked != 'undefined'){
	//console.log("CLICKABLE found! " + tpl_root.name);
	var clickable_zone;
	clickable_zone=ui_root;
	ui_root.className+=" clickable";

	clickable_zone.addEventListener("click", function(e){
	    tpl_root.clicked(e);

	    e.cancelBubble = true;
	    
	    if (e.stopPropagation){
		e.stopPropagation();
		//console.log(tpl_root.name + " : editable stop propagation...");
	    }
	    return false;
	}, false);
    }

    
    var item_ui;




    //var ne=0; for (var e in tpl_root.elements){ console.log(tpl_root.name + " + E("+ne+")="+e); ne++; }
    //console.log(tpl_root.name + " : -->Nchilds = " + ne);
    //if(!tpl_root.elements) return ui_root;
    
    //console.log("Config " + tpl_root.name + " child view ["+cvtype+"] type " + tpl_root.type);


    function add_child_common(e, ui, prep){
	
	if(è(e.ui_opts)){
	    if(e.ui_opts.in_root){
		prep ? ui_root.prependChild(ui) : ui_root.appendChild(ui);
		return false;
	    }
	}
	return true;
    }

    //ui_root.add_class(cvtype);


    switch(cvtype){
	
    case "div":
//	ui_childs=tpl_root.ui_childs={};

	ui_childs.add_child=function(e,ui,prep){
	    if(!add_child_common(e,ui,prep)) return;

	    this.add_child_com(e);

	    if(typeof ui_childs.div=='undefined'){
		ui_childs.div=ce("div"); 
		ui_childs.div.className="childs";
		
		if(typeof ui_opts.child_classes != 'undefined'){
		    //console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
		    add_classes(ui_opts.child_classes, ui_childs.div);
		}
		
		ui_root.appendChild(ui_childs.div);
		sliding_stuff.push(ui_childs.div);
		
	    }
	    if(e.ui_opts.close) add_close_button(e,e.ui_name);
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

    case "divider":
	//	ui_childs=tpl_root.ui_childs={};
	
	var ho=false;

	ui_childs.add_child=function(e,ui,prep){
	    if(!add_child_common(e,ui,prep)) return;
	    
	    this.add_child_com(e);
	    if(è(ui_opts.divdir)) ho=ui_opts.divdir;

	    if(typeof ui_childs.divider=='undefined'){
		//ui_childs.div=ce("div"); 
		//ui_childs.div.className="childs";
		
		//ui_childs.divider=new divider(ui_childs.div, 50,ho );
		ui_childs.divider=new divider(ui_root, 50,ho );

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
		//sliding_stuff.push(ui_childs.div);
		//ui_childs.div.add_class(ho?"h":"v");
		ui_root.add_class(ho?"h":"v");
		
		on_ui_childs_ready();
	    }


	    e.parent=tpl_root;
	    prep ? ui_root.prependChild(ui) : ui_root.appendChild(ui);

	    if(ù(ui_childs.divider.left)){
		ui_childs.divider.left=ui;
		ui.add_class("divided");
		ui.add_class("one");
		var divnode = ui_childs.divider.divnode=cc('div',ui_root);
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
	    }else
		if(ù(ui_childs.divider.right)){
		    ui_childs.divider.right=ui;
		    ui.add_class("divided");
		    ui.add_class("two");
		    ui_childs.divider.update();
		}else{
		    console.log("Error ! already 2 childs in divider panned child view! ");
		}
	    
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
		sliding_stuff.push(nav);
		sliding_stuff.push(ui_childs.div);

		on_ui_childs_ready();
	    }

	    function nav_include_div(e){
		ui_childs.div.appendChild(e.ui_root);
	    }
	    
	    function nav_include(e){
		if(e.ui_opts.bar){ 
		    var liti=cc("li",nav);//

		    if(ui_opts.close){
			if(è(e.ui_name)) add_close_button(e,e.ui_name);
			else
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
		    if(è(e.ui_name)) add_close_button(e,e.ui_name);
		    else
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

	    ui_childs.div.replaceChild(nctpl.ui_root, nctpl.ui_root_old);

	    // if(oldui.parentNode===ui_childs.div)
	    // 	ui_childs.div.replaceChild(new_ctpl.ui_root, new_ctpl.ui_root_old);

	}
//	tpl_root.ui_childs=ui_childs=tpl_root.parent.ui_childs;
	
	break;

    case "tabbed":
    case "radio":
	
	//var div=this.div=ce("div"); 
	//div.className="tab_widget";
	//    add_classes(classes,div)

	var navcnt=cc("div",ui_root); navcnt.className="navcnt";
	var nav=this.nav=cc("nav",navcnt);
	var cnt=this.cnt=cc("div", ui_root);

	navcnt.add_class(cvtype);
	cnt.add_class("child_container");

	sliding_stuff.push(nav);
	sliding_stuff.push(cnt);
	//var lm=this;
	
	new_event(tpl_root,"element_selected");
	//this.frames=[];
	var nframes=0;
	//    var last_sel_frame;
	var selected_frame;

	var select_frame=function(f){
	    //console.log("Select tab/radio child " + f.name);

	    if(typeof selected_frame!='undefined'){
		selected_frame.ui_root.style.display='none';
		selected_frame.ui_root.remove_class("selected_tab");
		selected_frame.ui_root.add_class("normal_tab");
		//	    last_sel_frame=this.selected_frame;
		
		selected_frame.li.remove_class("selected");
		cnt.replaceChild(f.ui_root,selected_frame.ui_root);

		
	    }else
		cnt.appendChild(f.ui_root);
	    
	    f.ui_root.style.display='block';
	    selected_frame=f;
	    
	    selected_frame.ui_root.add_class("selected_tab");
	    selected_frame.li.add_class("selected");

	    if(è(f.rad)) f.rad.checked=true;

	    if(è(f.parent))
		f.parent.trigger("element_selected", f);
	    else
		console.log("No parent??");
	    f.trigger("selected");


	    return f;
	}
	
	ui_childs.remove_child=function(e){
	    this.remove_child_com(e);
	
	    //if(e.ui_root.f === this.selected_frame)
	    var prev=e.ui_root.f.previousSibling;
	    while(prev && prev.nodeName!="LI"){
		prev=prev.previousSibling;
	    }
	    if(prev) 
		console.log("Found prev " + prev.nodeName + " fdiv? " + prev.div);
	    if(prev) 
		this.select_frame(prev);
	    
	    div.removeChild(e.ui_root.f.div);
	    nav.removeChild(e.ui_root.f);
	    nframes--;
	}
	
	var rad_group;

	var set_frame_name=function(e){
	    e.li.innerHTML="";
	    if(e.name)
		e.li.innerHTML=e.name;
	    else{
		if(e.type)
		    e.li.innerHTML="Anon " +e.type;
		else e.li.innerHTML="Container";
	    }
	    
	    var ico=get_ico(e);
  	    if(è(ico))
		e.li.prependChild(ico);

	    if(e.ui_opts.close) add_close_button(e,e.li);
	    
	    if(cvtype==="radio") {
		if(ù(rad_group))rad_group=Math.random().toString(36).substring(2);
		e.rad=cc("input",e.li);
		e.rad.type="radio";
		e.rad.name=rad_group;
	    }
	}
	
	var add_frame=function(e){
	    e.li=nav.appendChild(ce("li"));
	    set_frame_name(e);
	    
	    if(!e.ui_opts.label){
		e.ui_root.add_class("tab_section");
		e.ui_root.style.display='none';
		
		e.li.addEventListener("click",function(){
		    //console.log("Click!!");
		    select_frame(e); //xd.fullscreen(false);

		});
		//e.tabdiv.appendChild(e.ui_root);
		nframes++;
		//if(this.frames.length==1) 
		
		if(ù(selected_frame))
		    select_frame(e);
		
	    }//else console.log("LAAABELLL " + e.name);
	    
	    e.listen("name_changed", function(new_title){
		set_frame_name(e);
	    });

	    return e.li;
	}
	
	
	//tpl_root.ui_childs=ui_childs=new tab_widget(tpl_root);

	//ui_childs.div.add_class("childs");
	
	if(typeof ui_opts.child_classes != 'unxdefined')
	    add_classes(ui_opts.child_classes, ui_childs.div);
	
	//ui_root.appendChild(ui_childs.div);
	//sliding_stuff.push(ui_childs.div);
	
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
	on_ui_childs_ready();

	break;
    default:
	throw "NO VALID CHILD VIEW TYPE";
	break;
    }
    
    
    function on_ui_childs_ready(){
	if(tpl_root.ui_opts.label){ 
	    ui_childs.div.style.display="none";
	}
    }


    for (var e in tpl_root.elements){
	var el=tpl_root.elements[e];
	el.container=ui_childs;
	el.parent=tpl_root;
	//console.log(tpl_root.name +  " adding child " + e + " name " + el.name);
	var ui=create_ui(global_ui_opts,el, depth+1);

	ui_childs.add_child(el,ui);

	//console.log(tpl_root.name +  " adding child " + el.name + " OK!");
    }
    
    
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
	    
	    if(è(ui_opts.item_classes))	add_classes(ui_opts.item_classes, item_ui);
	    if(è(tpl_root.on_attached))	tpl_root.on_attached();

	}
    }
    catch(e){
	console.log("Error building "+tpl_root.name+" : " + dump_error(e));
    }

    if(sliding){

	var animate=ui_opts.sliding_animate;
	if(ù(animate))animate=false;

	if(tpl_root.parent)
	    if(typeof tpl_root.parent.ui_opts.child_view_type != "undefined")
		if(tpl_root.parent.ui_opts.child_view_type == "bar") 
		    //if(!tpl_root.ui_opts.bar) 
		    sliding_stuff.push(ui_root);
	
	function update_arrows(){
	    switch(sliding_dir){
	    case "v":
		slide_button.className="slide_button_v";
		slide_button.innerHTML= slided ? "❌" : "▶" ;
//▲❌▼
		break;
	    case "h":
		slide_button.className="slide_button_h";
		slide_button.innerHTML= slided ? "❌" : "▶"; 
		break;
	    default: break;
	    }
	}

	function update_ui(){
	    var marg=[];

	    if(animate){

		switch(sliding_dir){
		case "h":
		    marg[0]="marginLeft";
		    marg[1]="marginLeft";
		    break;
		case "v":
		    marg[0]="marginTop";
		    marg[1]="marginBottom";
		    break;
		default: throw("Bug!!here "); return;
		};
	    }

	    if(slided){
		
		sliding_stuff.forEach(function (s){
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
		sliding_stuff.forEach(function (s){
		    if(animate){
			s.style[marg[0]]="-100%";
			s.style[marg[1]]="-100%";
			s.style.opacity="0.0";
		    }else s.style.display="none";
		});
		if(è(ui_name)){
		    ui_name.remove_class("slided");
		    ui_name.add_class("unslided");
		}
	    }
	    
	    //if(item_ui)console.log(tpl_root.name + " update UI slided = " + slided);
	    
	    update_arrows();

	    if(!animate)tpl_root.trigger("slided", slided);
	    //tpl_root.trigger("slided", slided);
	    //if(typeof ui_opts.on_slide!='undefined') ui_opts.on_slide(slided);
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
	
	var slide_button=ce("span");
	è(tpl_root.ui_name)? tpl_root.ui_name.appendChild(slide_button) : tpl_root.ui_root.appendChild(slide_button);
	slide_button.style.zIndex=ui_root.style.zIndex+1;
	
	//ui_childs.div.style.display;
	//var dispi=item_ui?item_ui.style.display:"none";
	
	new_event(tpl_root, "slided");
	
	sliding_stuff.forEach(function (s){
	    
	    s.disp_orig=s.style.display;
	    
	    if(animate){

		s.add_class("sliding");
		
		//console.log("ENABLE sliding! ");
		s.addEventListener("transitionstart",function(){
		    //  console.log("Ani start ! " + slided );
		}, false);
		
		s.addEventListener("transitionend",function(){
		    //console.log("Ani end ! "+ slided );
		    if(!slided)
			s.style.display="none";
		    tpl_root.trigger("slided", slided);
		    //if(typeof tpl_root.on_slide != 'undefined') tpl_root.on_slide(slided);
		}, false);
	    }
	});
			     
	slide_button.addEventListener("click",function(e){
	    //console.log(tpl_root.name + "  SLIDE click !  " + slided);
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


	if(!slided){
	    sliding_stuff.forEach(function (s){
		s.style.display="none";
	    });
	    
	}

	update_ui();

    }

    
    tpl_root.disable_rec=function(dis, rec){

	if(è(this.disable_element)) this.disable_element(dis);
	if(rec && è(tpl_root.elements))
	    for(var e in tpl_root.elements){
		tpl_root.elements[e].disable_rec(dis, rec);
	    };
	
    }
    
    tpl_root.disable=function(dis,rec){
	if(ù(rec))rec=true;
	if(dis)
	    ui_root.add_class("masked");
	else
	    ui_root.remove_class("masked");    
	tpl_root.disable_rec(dis,rec);
    };



    if(è(ui_opts.root)){
	//console.log("Root widget ! " + tpl_root.name + " opts " + JSON.stringify(ui_opts));
	tpl_root.listen("view_update",function(){
	    //console.log("resize root widget " + window.innerWidth + ", " + window.innerHeight);
	    tpl_root.ui_root.style.width=(window.innerWidth-0)+'px';
	    tpl_root.ui_root.style.height=(window.innerHeight-0)+'px';
	    //tpl_root.ui_root.style.border="1px solid red";
	});
	window.addEventListener("resize", function(sz_data){
	    //console.log("Win resize " + window.innerWidth + ", " + window.innerHeight);
	    tpl_root.trigger("view_update");
	    tpl_root.view_update_childs();
	});
	//tpl_root.trigger("view_update");
    }
    
    return ui_root;
}

function attach_menu(tpl_root, menu){
    menu.ul.style.zIndex=20;
    tpl_root.ui_root.replaceChild(menu.ul, tpl_root.ui_name); 
}

