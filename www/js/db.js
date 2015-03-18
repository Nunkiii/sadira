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


function get_paddings(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("padding-left"))+parseFloat(s.getPropertyValue("padding-right"));
    h=parseFloat(s.getPropertyValue("padding-top"))+parseFloat(s.getPropertyValue("padding-bottom"));
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
    var p=get_paddings(s);
    var b=get_borders(s);
    var o={w: m.w+b.w+p.w, h: m.h+b.h+p.h, sty : s, m : m, p : p, b : b};
    //console.log("overflow " + JSON.stringify(o,null,2));
    return o;
}

function get_inner_dim(sty,dir){
    return dir? parseFloat(sty.height)+parseFloat(sty.paddingTop)+parseFloat(sty.paddingBottom):
	parseFloat(sty.width)+parseFloat(sty.paddingLeft)+parseFloat(sty.paddingRight);
}


function divider(cnt, frac, or, heightf){

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

	//if(ù(ho)) throw("No direction !") ; //ho=false;
	var htop=heightf();
	
	if(isNaN(htop) ){
	    console.log("Nan value for htop !");
	    return;
	}

	var head=document.body.querySelector("header");
	var foot=document.body.querySelector("footer");

	var wh=window.innerHeight+"px";	
	var hstring="calc( "+wh;
	if(è(head)){
	    var hs=window.getComputedStyle(head,null);
	    hstring+=" - "+ hs.height;
	}
	//console.log("Head height " + JSON.stringify(hs,null,5));
	if(è(foot)){
	    var fs=window.getComputedStyle(foot,null);
	    hstring+=" - "+ fs.height;
	}

	hstring+=" - " + htop +"px - 20px )";
	//console.log("Head height " + hs.height + "footer height " + fs.height + " window " + wh + " htop " + htop);

	//console.log("Setting height to ["+hstring+"]");
	//hstring="400px";
	var l=this.left, r=this.right;
	var divnode = this.divnode;
	
	var cntd=get_overflow(cnt);
	var leftd=get_overflow(l);
	var rightd=get_overflow(r);
	var divnoded=get_overflow(divnode);
	
	//var sty=document.defaultView.getComputedStyle(cnt);
	

	// parseFloat(cntd.sty.paddingTop)+parseFloat(cntd.sty.paddingBottom)+
	//     parseFloat(cntd.sty.marginTop)+parseFloat(cntd.sty.marginBottom)
	//     : parseFloat(cntd.sty.paddingLeft)+parseFloat(cntd.sty.paddingRight)+
	//     parseFloat(cntd.sty.marginRight)+parseFloat(cntd.sty.marginLeft);
	//var cnth=parseFloat(sty.height);
	//	var divh=sty.height;
	
	
	//sty=document.defaultView.getComputedStyle(l);

	//var ml=ho?get_margins(leftd.sty).h:get_margins(leftd.sty).w;

	//var divh=get_inner_dim(leftd.sty,ho);
	//console.log("Container : w=" + w + " mtot = " + ml );//+ " sty =  " + JSON.stringify(sty));
	//console.log("Left : w=" + sty.width + " mtot = " + ml + " clientw=" + this.left.clientWidth);

	//var mr=ho?get_margins(rightd.sty).h:get_margins(rightd.sty).w;

	//console.log("Right : w=" + sty.width + " mtot = " + mr + " clientw=" + this.right.clientWidth);
	//sty=document.defaultView.getComputedStyle(divnode);
	
	
	//if(ho) wp-=0;
	//console.log("Width tot margins : " + (leftd.w+cntd.w) + " divp="+divp + " nrl " + mrl + " divw " + divw);

	//var cntpad=ho? cntd.m.h+cntd.b.h : cntd.m.w+cntd.b.w;
	var cntpad=ho? cntd.p.h : cntd.p.w; 

	//var wreal=ho?parseFloat(cntd.sty.height):parseFloat(cntd.sty.width);
	var wreal=ho?cnt.clientHeight:cnt.clientWidth;
	//var w=wreal-cntpad;

	

 	var divw=ho?parseFloat(divnoded.sty.height)+divnoded.h:parseFloat(divnoded.sty.width)+divnoded.w;
	//var wp=wreal-mr-ml-divw;
	var wp=wreal-cntpad-divw;

	console.log("Wcont = " + wreal + " padd " + cntpad + " divw " + divw + " -> " + wp );
	
	if(ho){
	    var wl=(frac/100.0*wp)-leftd.h; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp)-rightd.h; //-cntd.w;
	}else{
	    var wl=(frac/100.0*wp);//-leftd.w; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp);//-rightd.w; //-cntd.w;
	}
	//console.log("HO [[" + ho +"]] wl=" + wl + " wr=" + wr + " wt=" + (wl+wr) + " wl+wr+marg="+ (wl+wr+mr+ml)+" wcnt= " + w);
	if(ho){
	    
	    l.style.height = wl + 'px';
	    r.style.height = wr + 'px';
	    l.style.width = "100%";
	    r.style.width = "100%";
	}else{

	    l.style.width = wl + 'px';
	    r.style.width = wr + 'px';
	    hstring=cnt.clientHeight+"px";
	    divnode.style.height = hstring;
	    l.style.height = hstring;
	    r.style.height = hstring;
	    
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

/*
  Template base functions
*/

function build_data_structure(t){
    
    var data={};
    if(è(t.value)) data.value=t.value;
    if(è(t.elements)){
	data.childs={};
	for(var t in t.elements)
	    data.childs.t=serialize(t.elements[e]);
    }
    return data;
}

function encode_data_structure(t){
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
	//console.log("subst for " + tpl_item.name + " tpl " + tpl.template_name);
	
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
    if(è(tpl.toolbar)){
	for(var tbi in tpl.toolbar){
	    this.substitute_templates(tpl.toolbar[tbi]);
	}
    }
}

local_templates.prototype.build_template=function(template_name){

    var tpl;

    if(typeof template_name === 'string'){ 
	tpl=clone_obj(this.templates[template_name]);
	if(typeof tpl === 'undefined') 
	    throw "Unknown template " + template_name;
	tpl.template_name=template_name;
    }else{
	//console.log("Template is an object " + typeof template_name + " : " + JSON.stringify(tpl));
	tpl=template_name;
    }
    
    //var tpl= clone_obj(tplo);
    
    //console.log("TPL= " + JSON.stringify(tpl));
    this.substitute_templates(tpl);

    //    console.log("TPL AFTER= " + JSON.stringify(tpl,null,4));
    //  console.log("TPL= " + JSON.stringify(this.templates));
    return tpl;
}

template_ui_builders={};

/*
template_ui_builders.default_before=function(ui_opts, tpl_item){
    tpl_item.get_value=function(){return tpl_item.value; }
}
template_ui_builders.default_after=function(ui_opts, tpl_item){
    
    if(typeof tpl_item.set_value != 'undefined' && typeof tpl_item.value != 'undefined'){
	//tpl_item.set_value(tpl_item.value);
    }
}
*/

function create_widget(t){
    var widget_template=tmaster.build_template(t);
    create_ui({},widget_template);
    return widget_template;
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

    //template_ui_builders.default_before(ui_opts,tpl_node);
    
    var ui;

    for(var b=0;b<builders.length;b++){
	var bui=builders[b](ui_opts, tpl_node);
	if(typeof ui==='undefined') ui=bui;
    }
    
    if(typeof ui==='undefined'){
	//console.log("warning: no UI returned for type " + tpl_name);
    }
    
    //template_ui_builders.default_after(ui_opts,tpl_node);
    return ui;
}

function child_container(tpl_root){
    this.tpl_root=tpl_root;
    
};

child_container.prototype.childs={};

child_container.prototype.add_child_com=function(child){
    var cnt=this;
    child.parent=this.tpl_root;
    
    
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
    //document.body.appendChild(tpl.ui_root, node);
    node.appendChild(tpl.ui_root);
    tpl.trigger("view_update");
    tpl.view_update_childs(); 
}

function get_ico(tpl){
    var ico=undefined;
    
    if(è(tpl.ui_opts)){
	if(è(tpl.ui_opts.icon)){
	    ico= ce("img");
	    ico.src=tpl.ui_opts.icon;
	    ico.className="ico";
	    if(è(tpl.ui_opts.icon_size))
		ico.style.width=tpl.ui_opts.icon_size;
	    //console.log("Got icon " + tpl.ui_opts.icon);
	    return ico;
	}
    }
    
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
	close_but.addEventListener("click", function(event){
	    e.trigger("close");
	    event.stopPropagation();
	});
    }
}



function create_ui(global_ui_opts, tpl_root, depth){

    if(ù(tmaster)) throw("NO TMASTER");

    if(ù(global_ui_opts)){
	console.log("Not even the ui_opts... :(");
	return;
    }

    if(ù(tpl_root)){
	console.log("No tpl root !!!");
	return;
    }
    
    
    if(!depth)depth=0;

    if(!tpl_root.depth)
	tpl_root.depth=depth;
    
    if(ù(tpl_root.ui_opts)){

	//tpl_root.ui_opts={};
	tpl_root.ui_opts=clone_obj(global_ui_opts);

	if(ù(tpl_root.ui_opts.type))
	    tpl_root.ui_opts.type="short";
    }
    //    else
    for(var o in global_ui_opts){
	//console.log(tpl_root.name + " : Global ui opts are : " + JSON.stringify(global_ui_opts));
	//if(ù(tpl_root.ui_opts[o]))
	//console.log("forcing global opt " + o + " to " + global_ui_opts[o] +" for " + tpl_root.name );
	tpl_root.ui_opts[o]=global_ui_opts[o];
    }
    
    var ui_opts=tpl_root.ui_opts;    
    
    if(ù(ui_opts.item_root)){
	var p=tpl_root.parent;
	if(è(p)){
	    if(è(p.ui_opts)){
		if(è(p.ui_opts.child_classes)){
		    if(p.ui_opts.child_classes.length>0){
			if(has_class("btn-group",p.ui_opts.child_classes[0]) || has_class("btn-group-vertical",p.ui_opts.child_classes[0])){
			    //console.log("Setting item_root to true for " + tpl_root.name);
			    ui_opts.item_root=true;
			}
		    }
		}
	    }
	}
    }
    
    //console.log(tpl_root.name + " : create_ui. global ui opts are : " + JSON.stringify(global_ui_opts));
    
    //console.log("create UI type "+ tpl_root.type + " name " + tpl_root.name + " : "  + JSON.stringify(global_ui_opts) + " tpl " + JSON.stringify(tpl_root.ui_opts) );
    
    var sliding = (typeof ui_opts.sliding!='undefined') ? ui_opts.sliding : false;
    var sliding_dir = (typeof ui_opts.sliding_dir != 'undefined') ? ui_opts.sliding_dir : "v";
    var animate=è(ui_opts.sliding_animate) ? ui_opts.sliding_animate : false;
    var slided=(typeof ui_opts.slided === 'undefined') ? true : ui_opts.slided;// = true; ui_opts.slided;
    var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
    var root_node = è(ui_opts.root_node) ? ui_opts.root_node : "div";
    
    var sliding_stuff=[];
    var item_ui,ui_childs,slide_button,ui_root,ui_name,ui_content;

    //The main widget div
    clear_events(tpl_root);

    //console.log("TPL " + tpl.name + " events : " + tpl.events);
    if(typeof tpl_root.events!='undefined'){
	//console.log("Setting up events for " + tpl.name + " type " + tpl.type);
	tpl_root.events.forEach(function(e){ 
	    //console.log("Create event " + e + " for " + tpl.name);
	    new_event(tpl_root,e); 
	});
    }//else	console.log("NO events for " + tpl.name + " type " + tpl.type);
    //console.log("Create UI : " + JSON.stringify(tpl_root.name) + " ui options  " + JSON.stringify(ui_opts));

    tpl_root.abort_error=function(error_message){
	ui_root.innerHTML='<div class="big_error">⚠</div><div class="error_content">'+error_message+'</div>';
    }

    new_event(tpl_root,"selected");
    new_event(tpl_root,"view_update");
    new_event(tpl_root,"name_changed");
    new_event(tpl_root,"hide");
    new_event(tpl_root,"disable");

    tpl_root.view_update_childs=function(){
	//tpl_root.trigger("view_update");
	for (var e in tpl_root.elements){
	    //console.log(tpl_root.name + " update childs for " + e);
	    //if(è(tpl_root.elements[e].trigger))
	    tpl_root.elements[e].trigger("view_update");
	    //if(è(tpl_root.elements[e].trigger))
	    tpl_root.elements[e].view_update_childs();
	}

    }
    /*
      tpl_root.listen("view_update", function(){
      for (var e in tpl_root.elements)
      tpl_root.elements[e].trigger("view_update");
      });
    */

    function setup_root(){
	
	ui_root=tpl_root.ui_root=ce(root_node);
	
	//console.log("create UI " + tpl_root.name + " type " + tpl_root.type + " opts " + tpl_root.ui_opts + " global opts " + JSON.stringify(global_ui_opts));
	//ui_root.style.display="relative";
	ui_root.style.zIndex=depth;
	ui_root.className="db";// container-fluid";
	if(ui_opts.panel) ui_root.add_class("db panel panel-default");

	if(è(typeof tpl_root.type))
	    ui_root.setAttribute("data-type", tpl_root.type);
	
	if(è(tpl_root.template_name))
	    ui_root.setAttribute("data-tpl", tpl_root.template_name);

	if(depth==0) ui_root.add_class("root");
	
	if(typeof ui_opts.root_classes != 'undefined')
	    add_classes(ui_opts.root_classes, ui_root);
	
	if(typeof ui_opts.width != 'undefined') ui_root.style.width=ui_opts.width;
	
	
	ui_content=ui_root;
    }

    /*
      widget name config
    */

    function setup_save(node){
	console.log(tpl_root.name +  " : setup save !");
	
	var bbox=create_widget({
	    ui_opts : { child_classes : ["btn-group pull-right"]},
	    elements : {
		save : {
		    name : "",type : "action",
		    ui_opts : { item_classes : ["btn btn-xs btn-warning"], fa_icon : "save"}
		},
		load : {
		    name : "",type : "action",
		    ui_opts : { item_classes : ["btn btn-xs btn-info"], fa_icon : "download"}
		},
		reset : {
		    name : "",type : "action",
		    ui_opts : { item_classes : ["btn btn-xs btn-info"], fa_icon : "reply"}
		}
	    }
	});
	
			      

	//var save_but=cc("button",node);
	//save_but.className="btn btn-xs btn-info pull-right";
	//sbut.ui.innerHTML='<span class="fa fa-save"></span></button>';
	node.appendChild(bbox.ui_childs.div);
    }
    


    
    function setup_title(){
	
	
	if(ù(ui_opts.render_name))ui_opts.render_name=true;
	if(ù(ui_opts.label)) ui_opts.label=false;

	function setup_intro(node){
    	    if(è(tpl_root.intro)){
		if(ù(tpl_root.intro_visible)) tpl_root.intro_visible=false;
		
		tpl_root.intro_btn=ce("span");
		tpl_root.intro_btn.className="intro_btn fa fa-lightbulb-o";
		node.appendChild(tpl_root.intro_btn);
		tpl_root.intro_btn.addEventListener("click", function() {
		    tpl_root.intro_div.style.display=tpl_root.intro_visible?"none":"";
		    tpl_root.intro_visible=!tpl_root.intro_visible;
		} );
	    }

	}

	if(ui_opts.save)
	    setup_save(ui_root);

	
	if(è(tpl_root.name) && ui_opts.render_name){
	    
	    ui_name=tpl_root.ui_name=ui_opts.label ? cc( è(ui_opts.label_node)? ui_opts.label_node : "label", ui_root) : cc("div", ui_root);

	    //if(!ui_opts.label) ui_name.className="row";
			    
	    if(ui_opts.panel){
		var phead=cc("div",ui_root); phead.className="panel-heading"; 
		var pcontent=cc("div",ui_root); pcontent.className="panel-content";
		phead.appendChild(ui_name);
		ui_content=pcontent;
	    }
	    
	    tpl_root.get_title_node=function(){ return this.ui_name; }

	    tpl_root.rebuild_name=function(){
		
		//console.log("rebuild name " + tpl_root.name);
		ui_name.innerHTML="";
		
		var ico=get_ico(tpl_root);
		
		if(!ui_opts.label){
		    //var title_type = (depth>0)?("h"+(depth+2)):"h1";
		    var name_node=è(ui_opts.name_node) ? ui_opts.name_node : ((depth>0)?"h4":"h1");
		    
		    var ui_name_text=tpl_root.ui_title_name= cc(name_node, ui_name);
		    ui_name_text.className="widget_title";
		    //cc("span",ui_name);// sliding ? cc("label",ui_name) : cc("div",ui_name);
		    
		    if(è(ui_opts.fa_icon)){
			ui_name_text.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
			//ui_name_text.innerHTML='<i class="icon-'+ui_opts.fa_icon+'"> </i>';
			//var fas=cc("span",ui_name,true);
			//fas.className="fa fa-"
		    }
		    
		    ui_name_text.innerHTML+=tpl_root.name+" ";
		    
		    if(è(tpl_root.subtitle)){
			var subtitle=cc("small",ui_name_text);
			subtitle.innerHTML=tpl_root.subtitle;
			//subtitle.className="col-sm-12 col-md-6";
		    }
		    
  		    if(typeof ico!='undefined')
			ui_name_text.prependChild(ico);
		    
		    setup_intro(ui_name_text);
		    //ui_name_text.add_class("title");
		    //if(tpl_root.depth==1)
		    //	ui_name.add_class("page-header");
		}else{

		    //console.log("Set label name " + tpl_root.name);
		    ui_name.innerHTML="";
		    if(è(ui_opts.fa_icon)){
			ui_name.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
		    }
		    ui_name.innerHTML+=tpl_root.name;
		    if(typeof ico!='undefined')
			ui_name.prependChild(ico);
		    setup_intro(ui_name);
		}
		
		if(typeof ui_opts.name_classes != 'undefined'){
		    //console.log(tpl_root.name + " add name classes " + JSON.stringify(ui_opts.name_classes));
		    add_classes(ui_opts.name_classes, ui_name);
		}
		
		if(typeof tpl_root.tip != 'undefined'){
		    ui_name.setAttribute("title", tpl_root.tip);
		}
		

		if(sliding){
		    if(ù(slide_button)){
			slide_button=tpl_root.slide_button=cc("button",ui_name); 
			slide_button.style.zIndex=ui_root.style.zIndex+1;
		    }else
			ui_name.appendChild(slide_button);
		    
		    update_sliding_arrows();
		    //ui_name.appendChild(slide_button);
		}

		
	    }
	    
	    
	    tpl_root.rebuild_name();
	}else{
	    setup_intro(ui_root);
	}

	//tpl_root.listen("name_changed", function(){rebuild_name();});
	
	tpl_root.set_title=function(title){
	    tpl_root.name=title;
	    //ui_name.innerHTML=title;
	    tpl_root.trigger("name_changed", title);
	    if(è(tpl_root.rebuild_name))
		tpl_root.rebuild_name();
	    //	span.appendChild( document.createTextNode("some new content") );
	}
	//tpl_root.set_title(tpl_root.name ? tpl_root.name : "");

	
	/*
	  widget description (intro) setup
	*/
	
	if(è(tpl_root.intro)){// && ui_opts.type!=="short"){

	    if(ui_opts.intro_name===true){
		tpl_root.intro_div=cc("div",tpl_root.ui_name);
		tpl_root.intro_div.className="text-muted";
	    }
	    else{
		tpl_root.intro_div=cc("div",tpl_root.ui_root);
		tpl_root.intro_div.className="text-muted col-sm-9";
	    }

	    tpl_root.intro_div.innerHTML= "<div class='alert alert-default'>"+tpl_root.intro+"</div>";
	    tpl_root.intro_div.style.display=tpl_root.intro_visible ? "":"none";
	    sliding_stuff.push(tpl_root.intro_div);
	}

	if(ui_opts.editable){
	    
	    var clickable_zone;
	    
	    if(ui_opts.type==="edit"){
		ui_name.add_class("un_editable");
		
		var vt=child_view_type();
		clickable_zone=ui_name;
	    }else{
		ui_name.add_class("editable");
		clickable_zone=ui_name;
	    }

	    tpl_root.switch_edit_mode=function(){
		if(ui_opts.type=="edit"){
		    ui_opts.type=global_ui_opts.type="short";
		}else{
		    ui_opts.type=global_ui_opts.type="edit";
		}
		
		//console.log("switching edit mode to " + ui_opts.type);
		rebuild();
		
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
	
	/*
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
	*/


    }

    
    /* Toolbar */
    

    
    /*
      Widget window-management
    */

    if(è(ui_opts.enable_wm)){
	
    }


    
    
    //   }
    
    
    
    //console.log("Created selected event on " + e.name);



    if(è(ui_opts.close)){
	new_event(tpl_root,"close");
	tpl_root.listen("close", function(){
	    console.log("Closing " + tpl_root.name);
	    tpl_root.parent.ui_childs.remove_child(this);
	    //cnt.remove_child(child);
	});
    }
    

    
    
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

	
	//global_ui_opts.type =ui_opts.type=="edit"?"short":"edit";	
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );
	
	//tpl_root.parent.ui_childs.div.replaceChild(tpl_root.ui_root, oldroot); 
	tpl_root.parent.ui_childs.replace_child(tpl_root); 
    }

    function child_view_type(){
	if(ù(tpl_root.parent)) return undefined;
	if(ù(tpl_root.parent.ui_opts)) return undefined;
	return tpl_root.parent.ui_opts.child_view_type;
    }
    


    




    //var ne=0; for (var e in tpl_root.elements){ console.log(tpl_root.name + " + E("+ne+")="+e); ne++; }
    //console.log(tpl_root.name + " : -->Nchilds = " + ne);
    //if(!tpl_root.elements) return ui_root;
    
    //console.log("Config " + tpl_root.name + " child view ["+cvtype+"] type " + tpl_root.type);


    function setup_childs(){

	ui_childs=tpl_root.ui_childs= new child_container(tpl_root);
	
	function add_child_common(e, ui, prep){
	    
	    if(è(e.ui_opts)){
		if(e.ui_opts.in_root){
		    prep ? ui_content.prependChild(ui) : ui_content.appendChild(ui);
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
		
		if(ù(ui_childs.div)){
		    var child_node_type = è(ui_opts.child_node_type) ? ui_opts.child_node_type : "div"
		    ui_childs.div=ce(child_node_type); 
		    //ui_childs.div.className="container-fluid";
		    
		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    ui_content.appendChild(ui_childs.div);
		    sliding_stuff.push(ui_childs.div);
		    
		}
		if(è(e.ui_name))
		    if(e.ui_opts.close) add_close_button(e,e.ui_name);
		//ui.add_class("row");
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
	    var tb;
	    ui_childs.add_child=function(e,ui,prep){
		if(!add_child_common(e,ui,prep)) return;

		this.add_child_com(e);

		if(typeof ui_childs.div=='undefined'){
		    tb=ui_childs.div=ce("table"); 
		    ui_childs.div.className="childs";
		    
		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    ui_content.appendChild(ui_childs.div);
		    sliding_stuff.push(ui_childs.div);
		    
		}
		if(è(e.ui_name))
		    if(e.ui_opts.close) add_close_button(e,e.ui_name);

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

	case "bbox":
	    break;
	    var tb;

	    ui_childs.add_child=function(e,ui,prep){
		if(!add_child_common(e,ui,prep)) return;

		this.add_child_com(e);

		if(typeof ui_childs.div=='undefined'){
		    tb=ui_childs.div=ce("table"); 
		    ui_childs.div.className="childs";
		    
		    if(typeof ui_opts.child_classes != 'undefined'){
			//console.log("ADDING CHILD CLASSES "+ JSON.stringify(ui_opts.child_classes)+ " to " + tpl_root.name );
			add_classes(ui_opts.child_classes, ui_childs.div);
		    }
		    
		    ui_content.appendChild(ui_childs.div);
		    sliding_stuff.push(ui_childs.div);
		    
		}
		if(è(e.ui_name))
		    if(e.ui_opts.close) add_close_button(e,e.ui_name);

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
		    //ui_childs.div=ce("div"); 
		    //ui_childs.div.className="childs";
		    
		    //ui_childs.divider=new divider(ui_childs.div, 50,ho );
		    var split_frac=è(ui_opts.split_frac) ? ui_opts.split_frac : 50;
		    console.log("split at " + split_frac);

		    ui_childs.divider=new divider(ui_root, split_frac,ho, function(){
			var h=0;
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
		    //sliding_stuff.push(ui_childs.div);
		    //ui_childs.div.add_class(ho?"h":"v");
		    ui_root.add_class(ho?"h":"v");
		    
		    on_ui_childs_ready();
		}

		
		//e.parent=tpl_root;
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

		ui_childs.div.replaceChild(new_ctpl.ui_root, new_ctpl.ui_root_old);

		// if(oldui.parentNode===ui_childs.div)
		// 	ui_childs.div.replaceChild(new_ctpl.ui_root, new_ctpl.ui_root_old);

	    }
	    //	tpl_root.ui_childs=ui_childs=tpl_root.parent.ui_childs;
	    
	    break;

	case "tabbed":
	case "pills":
	case "radio":
	    
	    //var div=this.div=ce("div"); 
	    //div.className="tab_widget";
	    //    add_classes(classes,div)

	    //var navcnt=cc("div",ui_root); navcnt.className="navcnt";
	    var nav;
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
				
	    else
		nav=this.nav=cc("ul",ui_root);

	    nav.className="nav";
	    if(typeof ui_opts.tab_classes != 'undefined')
		add_classes(ui_opts.tab_classes, nav);
	    else{
		nav.add_class(cvtype==="tabbed" ? "nav-tabs" : "nav-pills");
	    }
	    
	    var cnt=this.cnt=cc("div", ui_content);
	    var navcnt=nav;
	    navcnt.add_class(cvtype);
	    //cnt.add_class("child_container");
	    cnt.add_class("tab-content");
	    cnt.add_class(cvtype);
	    //cnt.add_class("tab-content");

	    
	    sliding_stuff.push(nav);
	    sliding_stuff.push(cnt);
	    //var lm=this;
	    
	    new_event(tpl_root,"element_selected");
	    //this.frames=[];
	    var nframes=0;
	    //    var last_sel_frame;
	    var selected_frame;

	    var select_frame=function(f){
		//console.log("Selecting tab/radio child " + f.name + " selected = " + selected_frame);

		if(typeof selected_frame!='undefined'){
		    selected_frame.ui_root.style.display='none';
		    selected_frame.ui_root.remove_class("active");
		    //selected_frame.ui_root.add_class("normal_tab");
		    //	    last_sel_frame=this.selected_frame;
		    
		    //selected_frame.li.remove_class("selected");
		    selected_frame.li.remove_class("active");
		    
		    cnt.replaceChild(f.ui_root,selected_frame.ui_root);
		}else
		    cnt.appendChild(f.ui_root);
		
		f.ui_root.style.display='block';
		selected_frame=f;
		
		selected_frame.li.add_class("active");
		selected_frame.ui_root.add_class("active");
		
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
		if(ù(e.a)){ e.a=cc("a",e.li); e.a.href="javascript:void(0)";}
		
		e.a.innerHTML="";
		if(è(e.ui_opts.fa_icon)){
		    e.a.innerHTML='<span class="fa fa-'+e.ui_opts.fa_icon+'"> </span>';
		}
		
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
		
		if(e.ui_opts.close) add_close_button(e,e.a);
		
		if(cvtype==="radio") {
		    if(ù(rad_group))rad_group=Math.random().toString(36).substring(2);
		    e.rad=cc("input",e.a);
		    e.rad.type="radio";
		    e.rad.name=rad_group;
		}
	    }
	    
	    var add_frame=function(e){
		//console.log("Add tab/radio frame " + e.name);
		e.li=cc("li", nav); e.li.setAttribute("role","presentation");

		e.get_title_node=function(){
		    //console.log("tab/rad get title node ! ");
		    return e.li;
		}
		
		set_frame_name(e);
		
		if(!e.ui_opts.label){
		    e.ui_root.add_class("tab-pane tab_pane container-fluid");
		    //e.ui_root.add_class("fade");
		    //if(nframes==0) e.ui_root.add_class("in");
		    e.ui_root.setAttribute("role","tabpanel");
		    e.ui_root.style.display='none';
		    
		    e.li.addEventListener("click",function(){
			//console.log("Li Click !!");
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
	    
	    if(typeof ui_opts.child_classes != 'undefined')
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
	    throw (tpl_root.name +" Invalid child view type : " + cvtype);
	    break;
	}


	for (var e in tpl_root.elements){
	    var el=tpl_root.elements[e];
	    el.parent=tpl_root;
	    var ui=create_ui(global_ui_opts,el, depth+1);

	    if(ù(ui)){
		console.log("Error creating child " + el.name + " on " + tpl_root.name + " ! ");
	    }else{
		ui_childs.add_child(el,ui);
	    }
	    //console.log(tpl_root.name +  " adding child " + el.name + " OK!");
	}
    }

    tpl_root.hide=function(hide){
	ui_root.style.display=hide? "none":"";
    }
    
    tpl_root.disable_rec=function(dis, rec){
	
	if(è(this.disable_element)) this.disable_element(dis);
	if(rec && è(tpl_root.elements))
	    for(var e in tpl_root.elements){
		tpl_root.elements[e].disable_rec(dis, rec);
	    };
	
    }
    
    tpl_root.disable=function(dis,rec){
	if(ù(dis)){ dis=true; rec=true;}
	else if(ù(rec))rec=true;
	if(dis)
	    ui_root.add_class("masked");
	else
	    ui_root.remove_class("masked");    
	tpl_root.disable_rec(dis,rec);
    };
    
    function on_ui_childs_ready(){
	if(tpl_root.ui_opts.label && ui_childs.div){ 
	    ui_childs.div.style.display="none";
	}
    }

    //console.log(tpl_root.name +  " added "+nch+"childs");
    
    if(false && è(tpl_root.toolbar)){
	
	//ui_root.removeChild(ui_name);

	//var head=tpl_root.ui_head=cc("header", ui_root, true);
	//head.add_class("db");

	var toolbar=tpl_root.ui_toolbar=cc("nav",ui_root,true);
	toolbar.className="navbar navbar-default";
	toolbar.setAttribute("role","navigation");
	var cnt=cc("div",toolbar); cnt.className="container-fluid";
	var navhead=cc("div",cnt);navhead.className="navbar-header";
	var togb=cc("button",navhead); togb.className="navbar-toggle collapsed";
	togb.setAttribute("data-toggle", "collapse");
	var s=cc("span",togb); s.className="sr-only"; s.innerHTML="Toggle navigation";
	cc("span",togb).className="icon-bar";
	cc("span",togb).className="icon-bar";
	cc("span",togb).className="icon-bar";
	
	var togid=Math.random().toString(36).substring(2);
	togb.setAttribute("data-target", "#"+togid);
	var tita=cc("a",navhead); tita.className="navbar-brand";
	tita.setAttribute("href","javascript:void(0)");

	//if(è(tpl_root.ui_name))
	//  tita.appendChild(tpl_root.ui_name);
	tita.innerHTML=tpl_root.name;

	var dnav=cc("div", cnt); dnav.className="collapse navbar-collapse";  dnav.id=togid;
	var unav=cc("ul",dnav); unav.className="nav navbar-nav";


	
	function fill_elements(ul, elements){
	    for(var tbi in elements){
		var ti=elements[tbi];
		//ttpl.parent=tpl_root;
		//console.log(tpl_root.name +  " adding toolbar child " + e + " name " + el.name + " elements " + JSON.stringify(ttpl.elements)) ;
		//var ui=create_ui(global_ui_opts,ttpl, depth+1);
		//toolbar.appendChild(ttpl.ui_root);
		var li=cc("li",ul);
		
		if(è(ti.elements)){
		    var tita=cc("a",li); tita.className="dropdown-toggle";
		    tita.setAttribute("href","javascript:void(0)");
		    tita.setAttribute("data-toggle","dropdown");
		    tita.setAttribute("role","button");
		    tita.setAttribute("aria-expanded",false);
		    tita.innerHTML=ti.name+' <span class="caret"></span>';
		    var sub_ul=cc("ul",li); sub_ul.className="dropdown-menu";
		    sub_ul.setAttribute("role","menu");
		    fill_elements(sub_ul,ti.elements);
		}else{
		    var tita=cc("a",li); tita.className="navbar-link";
		    tita.setAttribute("href","javascript:void(0)");
		    tita.innerHTML=ti.name;
		}
	    }
	}

	fill_elements(unav,tpl_root.toolbar);
	
	if(è(tpl_root.ui_intro))
	    head.appendChild(tpl_root.ui_intro);
    }


    function setup_item(){
	
	try{
	    
	    item_ui=tpl_root.item_ui=create_item_ui(ui_opts, tpl_root);
	    
	    if(ui_opts.label && è(item_ui)){
		if(sliding){
		    new_event(tpl_root,"slided");

		}else{
		    if(è(ui_name)){
			var uid=Math.random().toString(36).substring(2); item_ui.id=uid;
			ui_name.setAttribute("for",uid);
		    }
		    
		}
	    }

	    if(item_ui){

		if(!ui_opts.item_root){
		    ui_content.appendChild(item_ui);
		    sliding_stuff.push(item_ui);
		}

		if(è(ui_opts.wrap)){
		    var iui;
		    
		    iui=ce("div");
		    
		    if(è(ui_opts.wrap_classes)){
			console.log("Adding wrap " + JSON.stringify(ui_opts.wrap_classes) +" to " + tpl_root.name);
			add_classes(ui_opts.wrap_classes, iui);
		    }
		    else
			iui.add_class("col-md-5");
		    
		    iui.appendChild(item_ui);
		    if(!ui_opts.item_root)
			ui_content.appendChild(iui);
		}
		
		if(è(ui_opts.edit_apply)){
		}

		if(è(tpl_root.default_value)){
		    if(è(tpl_root.set_value)){
			
			var bbox=create_widget({
			    ui_opts : { root_classes : ["inline"], child_classes : ["btn-group pull-right"]},
			    elements : {
				/*
				save : {
				    name : "",type : "action",
				    ui_opts : { item_classes : ["btn btn-xs btn-warning"], fa_icon : "save"}
				},
				load : {
				    name : "",type : "action",
				    ui_opts : { item_classes : ["btn btn-xs btn-info"], fa_icon : "download"}
				},
				*/
				reset : {
				    name : "",type : "action",
				    ui_opts : { item_classes : ["btn btn-xs btn-default"], fa_icon : "reply"}
				}
			    }
			});
			
			create_widget(bbox);

			if(è(tpl_root.ui_title_name))
			    tpl_root.ui_title_name.appendChild(bbox.ui_childs.div);
			else
			    item_ui.prependChild(bbox.ui_childs.div);
			
			if(tpl_root.has_event("change")){
			    
			}
		    }else{
			console.log("Lacking set_value function on "+ tpl_root.name +"!");
		    }
		}
		
		if(è(ui_opts.item_classes))	add_classes(ui_opts.item_classes, item_ui);
		//if(è(tpl_root.on_attached))	tpl_root.on_attached();
	    }
	    
	}
	catch(e){
	    console.log("Error building "+tpl_root.name+" : " + dump_error(e));
	}
    }
    

    	
	function update_sliding_arrows(){
	    slide_button.className="slide_button fa";
	    slide_button.className+=" "+sliding_dir;
	    //slide_button.innerHTML= slided ? "❌" : "▶" ;
	    //▲❌▼
	    slide_button.className+=slided? " fa-chevron-circle-left" : " fa-chevron-circle-right";
	}

	function update_sliding_ui(){
	    
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
	    
	    update_sliding_arrows();
	    
	    if(!animate)tpl_root.trigger("slided", slided);
	    //tpl_root.trigger("slided", slided);
	    //if(typeof ui_opts.on_slide!='undefined') ui_opts.on_slide(slided);
	}
	

    
    function setup_sliding(){

	new_event(tpl_root, "slided");


	if(sliding){
	    
	    if(tpl_root.parent)
		if(typeof tpl_root.parent.ui_opts.child_view_type != "undefined")
		    if(tpl_root.parent.ui_opts.child_view_type == "bar") 
			//if(!tpl_root.ui_opts.bar) 
			sliding_stuff.push(ui_root);
	    
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
	    
	    for(var si=0;si<sliding_stuff.length;si++){
		s=sliding_stuff[si];
		//	sliding_stuff.forEach(function (s){
		
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
	    }
	    
	    //console.log("adding slide button click event for  " + tpl_root.name);
	    
	    var click_element = è(tpl_root.ui_title_name)? tpl_root.ui_title_name : slide_button;
	    
	    click_element.addEventListener("click",function(e){
		//slide_button.addEventListener("click",function(e){
		//console.log(tpl_root.name + "  SLIDE click !  " + slided);
		slided=!slided;
		
		sliding_stuff.forEach(function (s){
		    //console.log("display stuff " + s.disp_orig );
		    s.style.display=s.disp_orig;
		    
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
	    
	    
	    if(!slided){
		sliding_stuff.forEach(function (s){
		    s.style.display="none";
		});
		
	    }
	    
	    update_sliding_ui();
	    
	}
    }

    
    if(ui_opts.item_root){
	ui_root=ce("div");
	setup_item();
	ui_root=item_ui;
	tpl_root.ui_root=tpl_root.ui_content=ui_content=ui_root;
    }else{
	setup_root();
	setup_title();
	setup_childs();
	setup_item();
	setup_sliding();
    }

    
    if(ui_opts.root){
	//console.log("Root widget ! " + tpl_root.name + " opts " + JSON.stringify(ui_opts));
	tpl_root.listen("view_update",function(){
	    //console.log("resize root widget " + window.innerWidth + ", " + window.innerHeight);

	    //tpl_root.ui_root.style.width=(window.innerWidth-0)+'px';
	    //tpl_root.ui_root.style.height=(window.innerHeight-0)+'px';

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

