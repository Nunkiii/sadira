

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
	var HH;

    this.update=function() {

	if(HH===undefined)HH=cnt.clientHeight; //parseFloat(divnoded.sty.height)+divnoded.h
	//if(ù(ho)) throw("No direction !") ; //ho=false;
	var htop=heightf();

	//console.log("HH is " + HH);
	
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

	
	hstring="400px";

	var l=this.left, r=this.right;
	var divnode = this.divnode;
	
	if(ho){
	    //divnode.style.height="3px";
	    //divnode.style.width = "100%";
	}else{
	    //divnode.style.height = "calc(100% - 1em)";
	    //divnode.style.top = "0px";
	    //divnode.style.width="3px";
	}
	

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

	var wreal=ho?parseFloat(cntd.sty.height):parseFloat(cntd.sty.width);
	// var wreal=ho?
	//     cnt.clientHeight
	//     :cnt.clientWidth;
	//var w=wreal-cntpad;

	

 	var divw=ho?
	    parseFloat(divnoded.sty.height)+divnoded.h
	    :parseFloat(divnoded.sty.width)+divnoded.w;
	//var wp=wreal-mr-ml-divw;
	
	var wp= ho ? HH : wreal-cntpad-divw;
	
	if(ho){
	    var wl=(frac/100.0*wp);//-leftd.h; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp);//-rightd.h; //-cntd.w;
	}else{
	    var wl=(frac/100.0*wp);//-leftd.w; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp);//-rightd.w; //-cntd.w;
	}

	//console.log("Wcont = " + wreal + " padd " + cntpad + " divw " + divw + " -> " + wp + " WL=" + wl + " WR="+wr + " WSUM=" + (wl+wr) );
	//console.log("HO [[" + ho +"]] wl=" + wl + " wr=" + wr + " wt=" + (wl+wr) + " wl+wr+marg="+ (wl+wr+mr+ml)+" wcnt= " + w);
	l.style.flex = "0 1 "+wl + 'px';
	r.style.flex = "0 1 "+wr + 'px';
	

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
template_ui_builders.default_before=function(ui_opts, tpl_item){
    tpl_item.get_value=function(){return tpl_item.value; }
}
template_ui_builders.default_after=function(ui_opts, tpl_item){
    
    if(typeof tpl_item.set_value != 'undefined' && typeof tpl_item.value != 'undefined'){
	//tpl_item.set_value(tpl_item.value);
    }
}
*/


function S(tpl, sname){
    if(tpl.strings===undefined) return 'No strings ( so no ' + sname + ')';
    if(tpl.strings[sname]===undefined) return 'Unknown string ' + sname;
    //console.log("Setting text to " + tpl.strings[sname] );
    return tpl.strings[sname];
}


function set_page_title(w){
    if(w.name!==undefined){
	var t= w.name;
	if(w.subtitle!==undefined) t+=" : "+w.subtitle;
	var div = document.createElement("div");
	div.innerHTML = t;
	document.title = div.textContent || div.innerText || "";
    }
}

function create_widget(t, parent, depth_in){
    
    
    //var widget_template=tmaster.build_template(t);
    var widget_template=tmaster.build_object(t);
    

    
    var depth=t.depth===undefined ? depth_in : t.depth;
    
    if(parent!==undefined){
	if(t.depth===undefined && parent.depth!==undefined)
	    depth=parent.depth+1;
	widget_template.parent=parent;
    }
    if(depth===undefined)
	depth=0;

    create_ui({},widget_template, depth);
    return widget_template;
}


function create_item_ui(ui_opts, tpl_node){
    
    
    var ui;

    
    if(tpl_node.builders!==undefined){
	var nb=0;
	var bl=tpl_node.builders.length;
	// for(var bi=0;bi<tpl_node.builders.length;bi++){
	//     var b=tpl_node.builders[bi];
	//     var bui=b(ui_opts, tpl_node);
	//     if(ui === undefined) ui=bui;
	//     nb++;	    
	// }
	
	tpl_node.builders.forEach(function(b){
	    // if(tpl_node.type=='text'){
	    // 	console.log("Calling builder " + (nb+1)+"/"+bl +" for " + tpl_node.name + " T["+tpl_node.type+"] CODE[" + b.toString()+"]");
	    // }
	    var bui=b(ui_opts, tpl_node);
	    if(ui === undefined) ui=bui;
	    nb++;
	    
	});
	//if(tpl_node.type=='spectrum'){
	
	//console.log("Calling " + nb +" builders for " + tpl_node.name + " T["+tpl_node.type+"]");
	//}
    }
    return ui;
}

function child_container(tpl_root){
    this.tpl_root=tpl_root;
    
};

child_container.prototype.childs={};

child_container.prototype.add_child_com=function(child){
    var cnt=this;
    child.parent=this.tpl_root;
    
    
    // if(ù(child.ui_views)){
    // 	child.ui_views={};
    // }
    
    // var uid=Math.random().toString(36).substring(2);
    // child.ui_views[uid]=this;
};

child_container.prototype.is_child=function(child){
    // if(ù(child.ui_views)) return false;
    // for(var u in child.ui_views) if (child.ui_views[u]===this) return u;
    return undefined;
}

child_container.prototype.remove_child_com=function(child){
    // var u=this.is_child(child);
    // if(è(u)){
    // 	delete child.ui_views[u];
    // }
};

child_container.prototype.replace_child_com=function(child){
};


function attach_ui(tpl, node){
    //document.body.appendChild(tpl.ui_root, node);
    var estring="";
    if(tpl!==undefined){
	if(tpl.ui_root!==undefined){
	    node.appendChild(tpl.ui_root);
	    tpl.trigger("view_update");
	    tpl.view_update_childs();
	    return;
	}else
	    estring='No ui_root created on widget type ' + tpl.type;
    }else
	estring="Undefined template !";

    var epage=create_widget('error_page');
    epage.set_value(estring);
    node.appendChild(epage.ui_root);
}

function get_ico_string(tpl){
    if(è(tpl.ui_opts)){
	if(è(tpl.ui_opts.icon)){
	    var s='<img src="'+tpl.ui_opts.icon+'" class="ico" ';
	    if(è(tpl.ui_opts.icon_size))
		s+='style="width:'+tpl.ui_opts.icon_size+'"';
	    s+=">"
	    //console.log("Got icon " + tpl.ui_opts.icon);
	    return s;
	}
    }
    return undefined;
}

function get_ico(tpl){
    
    var ico;
    
    if(è(tpl.ui_opts)){
	if( tpl.ui_opts.fa_icon !==undefined){
	    ico=ce('span');
	    ico.className="fa fa-"+tpl.ui_opts.fa_icon;
	    return ico;
	    //ui_name_text.innerHTML='<span class="fa fa-'+ui_opts.fa_icon+'"> </span>';
	    //ui_name_text.innerHTML='<i class="icon-'+ui_opts.fa_icon+'"> </i>';
	    //var fas=cc("span",ui_name,true);
	    //fas.className="fa fa-"
	}
	
	if(è(tpl.ui_opts.icon)){
	    ico= ce("img");
	    ico.src=tpl.ui_opts.icon;
	    ico.className="ico";
	    if(è(tpl.ui_opts.icon_size))
		ico.style.width=tpl.ui_opts.icon_size;

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

function setup_icon(tpl, node){
    var icui=get_ico(tpl);
    if(icui!==undefined)
	node.prependChild(icui);
    return icui;
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

    //console.log("Input depth = " + depth);
    if(depth!==undefined)
	tpl_root.depth=depth;
    else
	depth=tpl_root.depth;
    
    if(depth===undefined)depth=0;

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
    
    //console.log("CREATE UI FOR " + tpl_root.name + " type " + tpl_root.type) ;
    
    if(ù(ui_opts.item_root)){
	var p=tpl_root.parent;
	if(è(p)){ 
	    if(è(p.ui_opts)){
		if(è(p.ui_opts.child_classes)){
		    if(p.ui_opts.child_classes.length>0){
			//Button-group case:
			if(has_class("btn-group",p.ui_opts.child_classes[0]) || has_class("btn-group-vertical",p.ui_opts.child_classes[0])){
			    //console.log("Setting item_root to true for " + tpl_root.name);
			    ui_opts.item_root=true;
			}
		    }
		}
	    }
	}
    }

    tmaster.common_builder(tpl_root);
    
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
    new_event(tpl_root,"child_rebuild");
    new_event(tpl_root,"rebuild");
    new_event(tpl_root,"load");

    tpl_root.view_update_childs=function(){
	//tpl_root.trigger("view_update");
	for (var e in tpl_root.elements){
	    //console.log(tpl_root.name + " update childs for " + e);
	    if(tpl_root.elements[e].trigger!==undefined)
		tpl_root.elements[e].trigger("view_update");
	    if(tpl_root.elements[e].view_update_childs!==undefined)
		tpl_root.elements[e].view_update_childs();
	}
	
    }
    /*
      tpl_root.listen("view_update", function(){
      for (var e in tpl_root.elements)
      tpl_root.elements[e].trigger("view_update");
      });
    */

    function setup_container(){
	if(tpl_root.container){
	    alert(" container type = ", typeof tpl_root.container);
	}
    }
    
    function setup_root(){

	setup_container();
	
	if(ui_opts.root_element!==undefined && tpl_root.parent !== undefined){
	    if(tpl_root.parent.get===undefined){
		console.log("Undefined get on "+tpl_root.parent.type+" parent of  " + tpl_root.type);
	    }else
	    var re=tpl_root.parent.get(ui_opts.root_element);
	    if(re===undefined){
		throw "Eroor : " + tpl_root.name + " : error, root_element ["+ui_opts.root_element+"] is invalid ! ";
	    }
	    ui_root=tpl_root.ui_root=re.ui_root;
	}else{
	    ui_root=tpl_root.ui_root=ce(root_node);
	    
	    //console.log("create UI " + tpl_root.name + " type " + tpl_root.type + " opts " + tpl_root.ui_opts + " global opts " + JSON.stringify(global_ui_opts));
	    //ui_root.style.display="relative";
	    ui_root.style.zIndex=depth;
	    ui_root.className="db";// container-fluid";
	    if(ui_opts.panel) ui_root.add_class("db panel panel-default");
	    
	    if(è(tpl_root.type)){
		ui_root.setAttribute("data-type", tpl_root.type);
		ui_root.setAttribute("data-tpl", tpl_root.type);
		//console.log(tpl_root.name + " set type to " + tpl_root.type);
	    }
	    
	    //	if(è(tpl_root.template_name))
	    //	    ui_root.setAttribute("data-tpl", tpl_root.template_name);
	    
	    if(depth==0) ui_root.add_class("root");
	    
	    if(typeof ui_opts.root_classes != 'undefined')
		add_classes(ui_opts.root_classes, ui_root);
	    
	    if(typeof ui_opts.width != 'undefined') ui_root.style.width=ui_opts.width;
	}
	
	ui_content=ui_root;
	/*
	tpl_root.get=function(name){
	    for(var e in tpl_root.elements){
		//console.log(tpl_root.name+ " : looking child  [" + e + "] for name ["+name+"]");
		if(e===name)
		    return tpl_root.elements[e];
	    }
	    for(var e in tpl_root.elements){
		try{
		    var n=tpl_root.elements[e].get(name);
		    if(n) return n;
		}
		catch(err){
		    console.log("Error looking for [" + e + "] in [" + tpl_root.name + "] : " + err);
		}
	    }
	    return undefined;
	}
	*/

	tpl_root.debug_clean=function(msg){
	    if(è(tpl_root.debug_widget)){
		tpl_root.debug_widget.set_value("");
	    }
	};
	
	tpl_root.debug=function(msg){
	    if(ù(tpl_root.debug_widget)){
		tpl_root.debug_widget=create_widget({
		    name : "Widget debug", type: "text",
		    ui_opts : {
			sliding : true, sliding_dir : "h", sliding_animate : true, slided : true, label : true,
			root_classes : ["container-fluid well"],
			item_classes : ["container-fluid"]
			//name_classes : ["text-danger"]
		    }
		});
		ui_content.appendChild(tpl_root.debug_widget.ui_root);
	    }
	    //console.log("Append debug " + msg);

	    //tpl_root.debug_widget.ui_root.innerHTML+=msg;

	    tpl_root.debug_widget.append(msg+"<br/>");
	    
	}
	
	var base_uri=window.location.href;

	
	if(tpl_root.toolbar !== undefined){
	    
	    var base_uri=window.location.href.split()[0];
	    var to = base_uri.lastIndexOf('/');
	    if(to+1===base_uri.length)
		base_uri =  base_uri.substring(0,to);


	    //ui_root.removeChild(ui_name);
	    
	    //var head=tpl_root.ui_head=cc("header", ui_root, true);
	    //head.add_class("db");
	    
	    document.body.style.paddingTop="70px";
	    //console.log("count " + base_uri.length + " last/ " + to + " uri " + base_uri);
	    
	    var tb=tpl_root.toolbar;
	    var toolbar=tpl_root.ui_toolbar=cc("nav",ui_root,true);
	    toolbar.className="navbar"; //navbar-fixed-top" ;

	    if(tb.ui_opts!==undefined){
		//alert("Add classes !");
		if(tb.ui_opts.toolbar_classes!==undefined)
		    
		add_classes(tb.ui_opts.toolbar_classes,toolbar);
	    }
	    else
		toolbar.add_class("navbar-inverse");// navbar-nav navbar-default";// navbar-right";

	    
 	    toolbar.setAttribute("role","navigation");
	    var cnt=cc("div",toolbar); cnt.className="container-fluid";
	    var navhead=tb.navhead=cc("div",cnt);navhead.className="navbar-header";
	    var togb=cc("button",navhead); togb.className="navbar-toggle collapsed";
	    togb.setAttribute("data-toggle", "collapse");
	    var s=cc("span",togb); s.className="sr-only"; s.innerHTML="Toggle navigation";
	    cc("span",togb).className="icon-bar";
	    cc("span",togb).className="icon-bar";
	    cc("span",togb).className="icon-bar";
	    
	    var togid=Math.random().toString(36).substring(2);
	    togb.setAttribute("data-target", "#"+togid);

	    var tita=tb.nava=cc("a",navhead); tita.className="navbar-brand";
	    tita.setAttribute("href","javascript:void(0)");

	    
	    

	    var dnav=cc("div", cnt); dnav.className="collapse navbar-collapse";  dnav.id=togid;

	    /*
	    tita.innerHTML=tpl_root.name;
	    */



	    // 	tb.unav=cc("ul",dnav);
	    // unav.className="nav";
	    
	    // if(tb.ui_opts&& tb.ui_opts.nav_classes)
	    // 	add_classes(tb.ui_opts.nav_classes,unav);
	    // else
	    // 	unav.add_class("navbar-nav");// navbar-nav ";// navbar-right";

	    tb.create_navbar=function(classes){
		var unav=cc("ul",dnav);
		unav.className="nav navbar-nav";
		
		if(classes!==undefined){
		    unav.add_class(classes);
		}
		// else
		//     unav.add_class("navbar-nav");
		
		return unav;
	    }

	    tb.set_item_name=function(item, name){
		item.a.innerHTML=name;
		tb.setup_dropdown_link(item.a);
		tb.setup_icon(item);
	    }
	    
	    tb.setup_dropdown_link=function(tita){
		
		tita.className="dropdown-toggle";
		tita.setAttribute("href","javascript:void(0)");
		tita.setAttribute("data-toggle","dropdown");
		tita.setAttribute("role","button");
		tita.setAttribute("aria-expanded",false);

		tita.innerHTML+='<span class="caret"></span>';

	    }

	    tb.setup_dropdown=function(li, tita){

		tb.setup_dropdown_link(tita);
		var sub_ul=cc("ul",li);
		
		sub_ul.className="dropdown-menu";
		sub_ul.setAttribute("role","menu");
		return sub_ul;
	    }

	    tb.setup_icon=function(item){
		//if(item.icon===undefined){
		    
		    var icui;
		    if( item.fa_icon !==undefined){
			icui=cc('span', tita, true);
			icui.className="fa fa-"+item.fa_icon;
		    }else
			if(item.type !== undefined){
			    var mt=tmaster.get_master_template(item.type);
			    if(mt!== undefined){
				icui=get_ico(mt);
			    }
			}
		    item.icon=icui;
		//}
		
		if(item.icon!==undefined){
		    item.icon=icui;
		    item.a.prependChild(item.icon);		 
		}
		return icui;
	    }
	    
	    tb.create_item=function(item, ul){

		//console.log("Create item " + item.name + " itemel " + item.elements);
		
		var li=item.li=cc("li",ul);
		li.ti=item;
		var tita=item.a=cc("a",li);

		if(item.name!==undefined)
		    tita.innerHTML=item.name;
		else{
		    if(item.type !== undefined){
			var mt=tmaster.get_master_template(item.type);
			if(mt!== undefined){
			    tita.innerHTML=mt.name;
			}
		    }
		}
		    
		
		if(item.elements!==undefined){
		    item.subul=tb.setup_dropdown(li, tita);
		    li.className="dropdown";
		}

		tb.setup_icon(item);
		//else tita.className="navbar-link";
		//if(item.elements!==undefined)
		    
		
		return li;
	    }
	    
	    tb.add=function(node,ul){
		node.add_class("navbar-link");
		if(node.nodeName==="A") node.setAttribute("href","javascript:void(0)");
		var li=cc("li",ul);
		li.appendChild(node);
		return li;
	    };


	    tb.close_tb_ui=function(w){
		console.log("Close TB ui! " + tpl_root.tb_ui);
		if(tpl_root.tb_ui!==undefined){
		    if(tpl_root.tb_ui!==w)
			tpl_root.tb_ui.trigger('close');
		    tpl_root.tb_ui=undefined;
		}
		
	    };
	    
	    tb.activate_toolbar_widget=function(tti){
		var w;
		
		if(tti.widget === undefined){
		    if(tti.ui_opts===undefined) tti.ui_opts={};
		    tti.ui_opts.close=true;

		    // for(var p in tti){
		    //  	console.log("CWTYPE " + p + " nn " + tti[p].nodeName + " V=" + tti[p]);
		    // }
		    
		    tti.depth=tpl_root.depth+1;
		    
		    w=tti.widget=create_widget(tti);
		    //add_close_button(tti, tti.ui_title_name);
		    //tti.on=false;

		    w.listen('close', function(){
			if(tpl_root.tb_ui!==undefined){
			    tpl_root.ui_root.removeChild(tpl_root.tb_ui.ui_root);
			    tpl_root.tb_ui=undefined;
			}
			//tti.on=false;
			
			if(tpl_root.ui_childs && tpl_root.ui_childs.div)
			    tpl_root.ui_childs.div.style.display="";

			if(tpl_root.item_ui)
			    tpl_root.item_ui.style.display="";
			if(tpl_root.intro_div)
			    tpl_root.intro_div.style.display="";
			
			//tpl_root.ui_toolbar.style.display="";

			//console.log("PUSH URL HISTORY " + tpl_root.base_uri);

			window.history.pushState("object or string", "widget " + tpl_root.name, base_uri);
			set_page_title(tpl_root);
		    });
		}else w=tti.widget;
		
		//if(tti.toolbar!==undefined)
		//    tpl_root.ui_toolbar.style.display="none";

		tb.close_tb_ui(w);
		set_page_title(w);
		tpl_root.tb_ui=w;

		//console.log(tpl_root.name + " -----------------> tbui is " + tpl_root.tb_ui);

		if(tpl_root.ui_childs){
		    
		    if(tpl_root.ui_childs.div !== undefined){
		
			tpl_root.ui_childs.div.style.display="none";
		    }
		}
		
		if(tpl_root.item_ui)
		    tpl_root.item_ui.style.display="none";

		if(tpl_root.intro_div)
		    tpl_root.intro_div.style.display="none";

		tpl_root.ui_root.insertBefore(w.ui_root, toolbar.nextSibling);
	    }
	    
	    
	    tb.fill_elements=function(left_ul, elements, prefix){
		var ul;
		if(prefix===undefined) prefix='';

		for(var tbi in elements){
		    var ti=elements[tbi];

		    if(ti.pos!==undefined)
			if(ti.pos=='left')
			    ul=left_ul;
		    if(ti.pos=='right'){
			ul=tb.unav_r;
			if(tb.unav_r===undefined){
			    ul=tb.unav_r=tb.create_navbar('navbar-right');
			}
		    }else ul=left_ul;
		    
		    ti.key=tbi;
		    //ttpl.parent=tpl_root;
		    //console.log(tpl_root.name +  " adding toolbar child " + e + " name " + el.name + " elements " + JSON.stringify(ttpl.elements)) ;
		    //var ui=create_ui(global_ui_opts,ttpl, depth+1);
		    //toolbar.appendChild(ttpl.ui_root);

		    var li=tb.create_item(ti, ul);
		    
		    if(è(ti.elements)){
			
			/*
			var li=ti.ul=cc("li",ul);
			var tita=ti.a=cc("a",li); tita.className="dropdown-toggle";
			tita.setAttribute("href","javascript:void(0)");
			tita.setAttribute("data-toggle","dropdown");
			tita.setAttribute("role","button");
			tita.setAttribute("aria-expanded",false);
			tita.innerHTML=ti.name+' <span class="caret"></span>';
*/
			
			
			//prefix.push(ti.key);
			
			tb.fill_elements(ti.subul,ti.elements, prefix+'/'+ti.key);
		    }else{
			//tb.create_item(ti, ul);
			
			/*
			var tita=ti.a=ce("a");
			tita.innerHTML=ti.name;
			ti.li=tb.add(tita,ul);
			ti.li.ti=ti;

			*/
			
			if(ti.type !== undefined){

			    ti.li.addEventListener("click", function(){
		
				var tti=this.ti;
				var uri=base_uri; 
				
				if(tti.link){
				    var widurl=get_server_address()+'/widget/'+tti.type;
				    //console.log("host is " + widurl);
				    tti.a.href=widurl;
				}else{
				    tb.activate_toolbar_widget(tti);
				    //prefix.forEach(function(p){ uri+="/"+p; });
				    uri+=prefix+"/"+tti.key;
				    window.history.pushState("object or string", "widget " + ti.name, uri);
				}
				
				//if(tti.on===false){
				    
				    
				//tti.on=true;

				
				// }else{
				
				// }
								
			    });
			} else{
			}
		    }
		}

		
	    }
	    
	    var unav=tb.unav=tb.create_navbar();
	    tb.fill_elements(unav,tb.elements );
	    
	    if(è(tpl_root.ui_intro))
		head.appendChild(tpl_root.ui_intro);
	}
	
	tpl_root.interpret_url=function(){

	    var to = base_uri.lastIndexOf('/');
	    if(to+1===base_uri.length)
		base_uri =  base_uri.substring(0,to);
	    
	    to =base_uri.lastIndexOf('/widget');
	    
	    widget_uri =  base_uri.substring(to);
	    base_uri=base_uri.substring(0,to);

	    var wcomps=widget_uri.split('/');
	    var widget_name=wcomps[2];

	    base_uri=base_uri+'/widget/'+widget_name;
	    wcomps=wcomps.splice(3);

	    console.log("Base URI is " + base_uri);
	    
	    if(tpl_root.toolbar !== undefined){
		if(wcomps.length>0){
		    //console.log("wcomps l = " + wcomps.length);
		    var e;
		    if(tpl_root.toolbar.elements!==undefined)
			e=tpl_root.toolbar.elements[wcomps[0]];
		    
		    for(var i=1;i<wcomps.length;i++){
			if(e===undefined) {
			    console.log("BUG ! toolbar widget not found !");
			}else{
			    if(e.elements===undefined)
				console.log("BUG ! toolbar elements widget not found !");
			    else
				e=e.elements[wcomps[i]];
			}
			
			//console.log("Widget uri is [" + wcomps[i] + "]");
			
		    }
		    
		    if(e===undefined) 
			console.log("BUG ! toolbar widget not found !!!!!");
		    else{
			tpl_root.toolbar.activate_toolbar_widget(e);
		    }
		    
		}
	    }else {
		
	    }

	    set_page_title(tpl_root);
	}

	
    }


    var save_location = ui_opts.save;

    tpl_root.load_browser_data=function(){

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
    
    function setup_save(node){
	//console.log(tpl_root.name +  " : setup save ! node = " + node.nodeName );
	// is localStorage available?

	if (typeof window.localStorage != "undefined") {}
	
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
		// reset : {
		//     name : "",type : "action",
		//     ui_opts : { item_classes : ["btn btn-xs btn-default"], fa_icon : "reply"}
		// },
		del : {
		    name : "",type : "action",
		    ui_opts : { item_classes : ["btn btn-xs btn-danger"], fa_icon : "trash"}
		}
	    }
	});
	

	bbox.get('save').listen('click', function(){
	    var obj_data=get_template_data(tpl_root);
	    //console.log("STORE " + JSON.stringify(obj_data,null,5));
	    var bs=BSON.serialize(obj_data);
	    var b64=ab2b64(bs);
	    //var b64=atob(bs);
	    localStorage.setItem(save_location, b64);
	});
	
	bbox.get('load').listen('click', function(){
	    tpl_root.load_browser_data();
	});
	/*
	bbox.get('reset').listen('click', function(){
	    var obj_data=localStorage.getItem(save_location);
	    set_template_data(tpl_root, JSON.parse(obj_data));	    
	});
	*/
	bbox.get('del').listen('click', function(){
	    localStorage.removeItem(save_location);
	});
	
	
	//var save_but=cc("button",node);
	//save_but.className="btn btn-xs btn-info pull-right";
	//sbut.ui.innerHTML='<span class="fa fa-save"></span></button>';
	
	node.appendChild(bbox.ui_childs.div);
    }



    
    function setup_title(){
	
	function setup_intro(node){
    	    if(è(tpl_root.intro)){
		//if(ù(ui_opts.intro_visible)) ui_opts.intro_visible=false;
		
		if(ui_opts.intro_stick===undefined || ui_opts.intro_stick===false){
		    var ibtn=tpl_root.intro_btn=ce("div");
		    ibtn.className="fa fa-info-circle intro_btn";
		    node.appendChild(ibtn);
		    ibtn.setAttribute("title", "More information...");
		    ibtn.addEventListener("click", function() {
			if(ui_opts.intro_visible){
			    this.className="fa fa-info-circle intro_btn";
			}
			else
			    this.className="fa fa-close intro_btn";
			
			tpl_root.intro_div.style.display=ui_opts.intro_visible?"none":"";
			ui_opts.intro_visible=!ui_opts.intro_visible;
		    } );
		}
	    }
	}
	
	delete tpl_root.ui_name; delete ui_name;
	delete tpl_root.ui_title_name;

	if(ù(ui_opts.render_name))ui_opts.render_name=true;
	if(ù(ui_opts.label)) ui_opts.label=false;

	if(è(tpl_root.name) && ui_opts.render_name){
	    //ui_name=tpl_root.ui_name=ui_opts.label ? cc( è(ui_opts.label_node)? ui_opts.label_node : "label", ui_root) : cc("div", ui_root);

	    if(ui_opts.toolbar_brand && tpl_root.toolbar){
		ui_name=tpl_root.ui_name=tpl_root.toolbar.nava;//.appendChild(ui_name);

	    }else{
		//var hnode='div';
		//  depth===0 ? "h1" : (((depth<4)?("h"+(depth+1)):"h4"));
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
		ui_name=tpl_root.ui_name=cc( name_node, ui_root);
		
		if(tpl_root.toolbar){
		    tpl_root.toolbar.nava.parentNode.replaceChild(ui_name, tpl_root.toolbar.nava);
		    tpl_root.toolbar.nava=ui_name;
		}
		//if(ui_opts.label){
		    //ui_name.add_class('form-label');
		tpl_root.ui_title_name=ui_name;
		    //tpl_root.ui_root.add_class('form form-inline');
		//}
	    }
	    //if(!ui_opts.label) ui_name.className="row";

	    if(tpl_root.toolbar!==undefined){
		ui_name.style.cursor='pointer';
		ui_name.addEventListener('click',function(){
		    tpl_root.toolbar.close_tb_ui();
		    if(tpl_root.ui_childs.close_selected_frame!==undefined)
			tpl_root.ui_childs.close_selected_frame()
		});
	    }
	    
	    ui_name.addEventListener('click',function(){
		
	    });

	    
	    if(ui_opts.name_classes !== undefined){
		//console.log(tpl_root.name + " add name classes to "+ ui_name.nodeName+" :"  + JSON.stringify(ui_opts.name_classes));
		add_classes(ui_opts.name_classes, ui_name);
	    }
	    
	    if(ui_opts.panel){
		var phead=cc("div",ui_root); phead.className="panel-heading"; 
		var pcontent=cc("div",ui_root); pcontent.className="panel-content";
		phead.appendChild(ui_name);
		ui_content=pcontent;
	    }

	    if(typeof tpl_root.tip != 'undefined'){
		ui_name.setAttribute("title", tpl_root.tip);
	    }
	    

	    

	    
	    tpl_root.get_title_node=function(){ return this.ui_name; }

	    function get_name_text(){
		if(ui_opts.name_elm!==undefined){
		    var ne=tpl_root.get(ui_opts.name_elm);
		    if(ne !== undefined){
			return ne.value;
		    }else
			return "Invalid name element !";
		}else
		    return tpl_root.name;
	    }

	    
	    tpl_root.rebuild_name=function(){
		
		//console.log("rebuild name " + tpl_root.name);
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
			//ui_name_text.className="widget_title";
		    }
		}

		var ui_name_text=tpl_root.ui_title_name;

	//	if(ui_name_text.innerHTML===undefined)
		    ui_name_text.innerHTML=get_name_text()+" ";
		// else
		//     ui_name_text.innerHTML+=get_name_text()+" ";
		
		//console.log(tpl_root.type + "  : type  " + ui_opts.type + " set name to " + get_name_text());
		
		//     ui_name.replaceChild(tpl_root.ui_title_name, ui_name_text);
		//     tpl_root.ui_title_name=ui_name_text;
		// }
		//cc("span",ui_name);// sliding ? cc("label",ui_name) : cc("div",ui_name);

		if(ui_opts.close)
		    add_close_button(tpl_root,ui_name_text);
		
		if(è(tpl_root.subtitle)){
		    var subtitle=cc("small",ui_name_text);
		    subtitle.innerHTML=tpl_root.subtitle;
		    //subtitle.className="col-sm-12 col-md-6";
		}

		setup_intro(ui_name_text);
		

		
		//ui_name_text.add_class("title");
		//if(tpl_root.depth==1)
		//	ui_name.add_class("page-header");
		
		//		}else{
		
		//console.log("Set label name " + tpl_root.name);
		//ui_name.innerHTML="";
		
		//if(ui_opts.close) add_close_button(tpl_root,ui_name);
		//}
		
		if(ui_opts.toolbar_title_link){
		    
		}

		if(ui_opts.name_edit){

		    ui_name_text.onedit=false;
		    ui_name_text.add_class("text-info clickable");
		    ui_name_text.addEventListener('click', function(){
			if(ui_name_text.onedit){
			    return false;
			}
			
			ui_name_text.onedit=true;
			console.log("NAME EDIT CLICK !");

			var un=ui_name_text;
			var uicont=ce('div'); uicont.className="form-inline";
			var uicont_grp=cc('div', uicont); uicont_grp.className="form-group";
			var ui_grp=cc('div', uicont_grp); ui_grp.className="input-group";

			var ic=setup_icon(tpl_root,uicont); //ic.add_class("input-group-addon");
			var uil=cc('div',ui_grp); uil.className='input-group-addon';
			uil.innerHTML="New object's name :";
			var ui=cc('input',ui_grp); ui.type="text"; ui.className="form-control";
			var undo=cc('button',uicont_grp); undo.className="btn btn-default fa fa-undo"; //undo.innerHTML="Undo";// ";
			
			undo.addEventListener("click",function(){
			    uicont.parentNode.replaceChild(ui_name, uicont);
			    ui_name_text.onedit=false;
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
				ui_name_text.onedit=false;
				tpl_root.set_title(ui.value);
				
				return false;
			    }
			});
			
		    });
		}

		setup_icon(tpl_root, ui_name_text);
		
		
		if(ui_opts.save!==undefined){
		    //if(tpl_root.ui_title_name !== undefined)
		    //console.log("Setup save button!! " + tpl_root.name);
		    setup_save(ui_name_text);
		    // else
		    // if(ui_name !== undefined)
		    // 	setup_save(tpl_root.ui_title_name);
		}
		
		
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
		//ui_name.appendChild(slide_button);
	    }
	    

		
	    }
	    
	    tpl_root.rebuild_name();
	    


	}else{
	    
	    
	    if(ui_opts.save!==undefined){
		setup_save(ui_root);
	    }
	    
	    
	    setup_intro(ui_root);
	}
	
	//tpl_root.listen("name_changed", function(){rebuild_name();});

	//console.log("Define set_title for " + tpl_root.name + "["+tpl_root.type+"]");
	
	tpl_root.set_subtitle=function(subtitle){
	    tpl_root.subtitle=subtitle;
	    if(è(tpl_root.rebuild_name))
		tpl_root.rebuild_name();
	}
	
	tpl_root.set_title=function(title){
	    tpl_root.name=title;
	    //ui_name.innerHTML=title;
	    
	    if(è(tpl_root.rebuild_name))
		tpl_root.rebuild_name();
	    else
		setup_title();
	    
	    tpl_root.trigger("name_changed", title);
	    //	span.appendChild( document.createTextNode("some new content") );
	}
	

	//tpl_root.set_title(tpl_root.name ? tpl_root.name : "");

	
	/*
	  widget description (intro) setup
	*/

	tpl_root.set_intro_text=function(intro_txt){
	    if(tpl_root.intro_div===undefined){
		if(ui_opts.intro_name===true){
		    tpl_root.intro_div=cc("div",tpl_root.ui_name);
		}
		else{
		    tpl_root.intro_div=cc("div",tpl_root.ui_root);
		}
		
		tpl_root.intro_div.style.display= (ui_opts.intro_visible || ui_opts.intro_stick) ? "":"none";
		sliding_stuff.push(tpl_root.intro_div);

		
	    }

	    tpl_root.intro_div.className="text-muted";
	    tpl_root.intro_div.innerHTML=
		"" //"<div class='alert alert-default'>"//>" //
		+ intro_txt; 
	    //+ "</div>";
		


	}
	
	if(è(tpl_root.intro)){// && ui_opts.type!=="short"){
	    tpl_root.set_intro_text(tpl_root.intro);
	}

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

	    tpl_root.switch_edit_mode=function(){
		
		if(ui_opts.type=="edit"){
		    ui_opts.type=global_ui_opts.type="short";
		}else{
		    ui_opts.type=global_ui_opts.type="edit";
		}
		
		//console.log("switching edit mode to " + ui_opts.type);
		tpl_root.rebuild();
		
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

    //console.log("Created selected event on " + e.name);

    if(è(ui_opts.close)){
	new_event(tpl_root,"close");
	if(tpl_root.parent!==undefined){
	    tpl_root.listen("close", function(){
		console.log("Closing " + tpl_root.name);
		tpl_root.parent.ui_childs.remove_child(this);
		//cnt.remove_child(child);
	    });
	}else{
	    console.log(tpl_root.name + " No parent so no close event connected !");
	}
    }
    
    tpl_root.enable=function(state){
	if(!state)
	    this.ui_root.add_class("disabled");
	else
	    this.ui_root.remove_class("disabled");
    }

    tpl_root.rebuild=function (){
	//if (typeof tpl_root.sliding != 'undefined') 

	tpl_root.ui_opts.slided=slided;//!tpl_root.slided;
	//console.log("Rebuild " + tpl_root.name+"  slided = " + slided);

	tpl_root.ui_root_old=tpl_root.ui_root;
	//tpl_root.parent.ui_childs.div.removeChild(tpl_root.ui_root); //div.appendChild(new_ui);

	
	if(ui_opts.type!==undefined)global_ui_opts.type =ui_opts.type;
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );
	
	//tpl_root.parent.ui_childs.div.replaceChild(tpl_root.ui_root, oldroot);
	if(tpl_root.parent && tpl_root.parent.ui_childs){
	    tpl_root.parent.ui_childs.replace_child(tpl_root);
	    tpl_root.parent.trigger("child_rebuild", tpl_root);
	}
	else
	    ui_root.parentNode.replaceChild(tpl_root.ui_root, tpl_root.ui_root_old);
	
	tpl_root.trigger("rebuild", tpl_root.ui_opts.type);

    }

    function child_view_type(){
	if(ù(tpl_root.parent)) return undefined;
	if(ù(tpl_root.parent.ui_opts)) return undefined;
	return tpl_root.parent.ui_opts.child_view_type;
    }

    function setup_childs(){

	ui_childs=tpl_root.ui_childs= new child_container(tpl_root);
	var child_toolbar = (ui_opts.child_toolbar!==undefined) ? ui_opts.child_toolbar : (tpl_root.toolbar!==undefined);

	
	function add_child_common(e, ui, prep){
	    if(è(e.ui_opts)){
		if(e.ui_opts.in_root){
		    if(e.ui_opts.in_root === "prepend"){
			if(è(ui_name) && è(ui_name.nextSibling))
			    ui_content.insertBefore(ui, ui_name.nextSibling);
			else
			    ui_content.prependChild(ui)
		    }else
			ui_content.appendChild(ui);
		    //e.ui_opts.in_root === "prepend" ? ui_content.prependChild(ui) : ui_content.appendChild(ui);
		    return false;
		}
	    }
	    return true;
	}
	
	switch(cvtype){
	    
	case "div":
	    //	ui_childs=tpl_root.ui_childs={};
	    
	    ui_childs.add_child=function(e,ui,prep){

		if(ui===undefined) ui=e.ui_root;
		if(prep===undefined) prep=false;
		
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

		    if(ui_opts.childs_pos==="below")
			ui_content.prependChild(ui_childs.div);
		    else
			ui_content.appendChild(ui_childs.div);

		    if(sliding){
			//console.log( tpl_root.name + " : Adding child div to sliding stuff");
			sliding_stuff.push(ui_childs.div);
		    }
		    
		}

		//if(e.ui_opts.close) add_close_button(e,e.ui_name, false);
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
		    
		    ui_content.appendChild(ui_childs.div);
		    sliding_stuff.push(ui_childs.div);
		    
		}

		// if(è(e.ui_name))
		//     if(e.ui_opts.close) add_close_button(e,e.ui_name);
		
		var tr=e.tr= prep ? cc("tr",tb,true) : cc("tr",tb);

		
		attach_name_ui(tr,e);
		attach_mini_ui(tr,e);
		//prep ? ui_childs.div.prependChild(ui) : ui_childs.div.appendChild(ui);
	    }
	    
	    ui_childs.replace_child=function(nctpl){
		
		console.log(tpl_root.name + " : !!!!!!!!!childs Replaced UI "+ nctpl.ui_root_old.nodeName + " with node " + nctpl.ui_root.nodeName);
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
		    sliding_stuff.push(ui_childs.div);
		    
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
		    //sliding_stuff.push(ui_childs.div);
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
	    var uic=ui_content;

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
		    var div=ui_childs.div=cc("div", ui_content);
		    nav=this.nav=cc("ul",div);
		    
		    uic=div;
		}
		
		

		nav.className="nav";
		if(ui_opts.tabs_mode !== undefined){
		    if(ui_opts.tabs_mode==='left')
			nav.add_class("col-sm-3");
		}//else

		if(cvtype==="tabbed")
		    nav.add_class("nav-tabs");

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
	    navcnt.add_class(cvtype);
	    //cnt.add_class("child_container");
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

	    
	    sliding_stuff.push(nav);
	    sliding_stuff.push(cnt);
	    //var lm=this;
	    
	    new_event(tpl_root,"element_selected");
	    //this.frames=[];
	    var nframes=0;
	    //    var last_sel_frame;
	    var selected_frame;
	    
	    tpl_root.ui_childs.close_selected_frame=function(){
		if(selected_frame===undefined) return;
		selected_frame.ui_root.style.display='none';
		selected_frame.ui_root.remove_class("active");
		selected_frame.li.remove_class("active");
	    }
	    
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
		if(ù(e.a)){
		    e.a=cc("a",e.li); e.a.href="javascript:void(0)";
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
		    if(ui_opts.tabs_mode !== undefined){
			//if(ui_opts.tabs_mode==='left')
			//   cnt.add_class("col-xs-9");
		    }else{
			if(! child_toolbar)
			    e.ui_root.add_class("tab-pane");
		    }

		    if(!child_toolbar){
			e.ui_root.add_class("container-fluid");
			
			//e.ui_root.add_class("fade");
			//if(nframes==0) e.ui_root.add_class("in");
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
	    if(ui_opts.type=='edit'){
		if(el.ui_opts===undefined) el.ui_opts={};
		el.ui_opts.type='edit';
	    }
	       
	    var ui=create_ui(global_ui_opts,el, depth+1);

	    if(ù(ui)){
		console.log("Error creating child " + el.name + " on " + tpl_root.name + " ! ");
	    }else{
		ui_childs.add_child(el,ui);

		//var xx=ce('span');xx.innerHTML="<small>"+e+"</small>";el.ui_root.prependChild(xx);
	    }
	    //console.log(tpl_root.name +  " adding child " + el.name + " OK!");
	}


    }


    tpl_root.add_child=function(tpl, key){
	if(tpl_root.ui_childs===undefined)
	    setup_childs();
	if(key===undefined){
	    key=Math.random().toString(36).substring(2); 
	}

	
	if(ù(tpl_root.elements))
	    tpl_root.elements={};
	tpl_root.elements[key]=tpl;
	//console.log("Adding child " + tpl.name + " root is  " + tpl.ui_root);
	tpl_root.ui_childs.add_child(tpl, tpl.ui_root);
    }
    
    tpl_root.update_child=function(tpl, child_key){
	var child=tpl_root.get(child_key);
	if(ù(child)){
	    return tpl_root.add_child(tpl,child_key);
	    //return tpl_root.debug("update_child error: "+tpl_root.name+" : No such child " + child_key);
	}
	
	tpl_root.elements[child_key]=tpl;
	child.ui_root.parentNode.replaceChild(tpl.ui_root, child.ui_root);
	
    }

    tpl_root.clear_childs=function(){
	if(tpl_root.ui_childs!==undefined)
	    if(tpl_root.ui_childs.div!==undefined)
		tpl_root.ui_childs.div.innerHTML="";
	tpl_root.elements={};
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
	if(ù(rec))rec=true;

	var dis_el=ui_opts.root_element!==undefined ? tpl_root.item_ui : tpl_root.ui_root;
	
	if(dis)
	    dis_el.add_class("masked");
	else
	    dis_el.remove_class("masked");    

	//console.log(tpl_root.name + " : disabled ? " + dis);
	tpl_root.trigger("disabled", dis);
	tpl_root.disable_rec(dis,rec);
    };
    
    function on_ui_childs_ready(){
	if(tpl_root.ui_opts.label && ui_childs.div){ 
	    ui_childs.div.style.display="none";
	}
    }

    //console.log(tpl_root.name +  " added "+nch+"childs");
    


    function setup_item(){

	//console.log("SETUP ITEM " + tpl_root.name);
	
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
	
	
	try{

	    var xui=create_item_ui(ui_opts, tpl_root);

	    if(xui===undefined)
		if(tpl_root.ui!==undefined) xui=tpl_root.ui;

	    
	    item_ui=tpl_root.item_ui=xui;
	    
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

		    //console.log(tpl_root.name + " : adding item ui " + item_ui);
		    if(ui_opts.name_after===true)
			ui_content.prependChild(item_ui);
		    else
			ui_content.appendChild(item_ui);

		    if(sliding){
			//console.log(tpl_root.name + " : Adding item_ui in sliding stuff " + sliding_stuff.length);
			sliding_stuff.push(item_ui);
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
			    ui_content.appendChild(iui);
		    }
		}
		
		if(tpl_root.default_value !== undefined
		   && tpl_root.set_value!==undefined
		   && (item_ui.nodeName === "INPUT" || item_ui.nodeName === "SELECT")
		  ){
		    //console.log("Got ITEM type " + item_ui.nodeName);
		    ui_opts.wrap=true;
		    setup_wrap();
		    tpl_root.wrap_ui.add_class("input-group");

		    var reset_but=cc("span",tpl_root.wrap_ui);
		    reset_but.className="btn btn-xs btn-warning input-group-addon fa fa-reply";
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
	}
	catch(e){
	    tpl_root.debug("Error building "+tpl_root.name+" : " + dump_error(e));
	    console.log("Error building "+tpl_root.name+" : " + dump_error(e));
	}
    }
    

    	
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
	    
	
	//console.log(tpl_root.name + " Hello animate !!  " + animate + " ssl " + sliding_stuff.length + " M " + marg[0] + ", " + marg[1]);
	    
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
		//console.log("Hello marg->-100% !!  " + animate + " ssl " + sliding_stuff.length + " M " + marg[0] + ", " + marg[1]);

		sliding_stuff.forEach(function (s){
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

	    //console.log("transitionning " + sliding_stuff.length);
	    sliding_stuff.forEach(function(s){
		//s=sliding_stuff[si];
		//	sliding_stuff.forEach(function (s){
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
		    
		    sliding_stuff.forEach(function (s){
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
		sliding_stuff.forEach(function (s){
		    s.style.display="none";
		});
	    }
	    
	    update_sliding_ui();
	    
	}
    }

    
    if(ui_opts.item_root){
	//ui_root=ce("div");
	setup_root();
	setup_title();
	setup_item();
	
	if(item_ui!==undefined){
	    item_ui.setAttribute("data-type", tpl_root.type);
	    ui_root=item_ui;
	}
	else;
	    //console.log("Strange item_ui undefined !! for " + tpl_root.name + " type " + tpl_root.type);

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


    if(save_location!==undefined) tpl_root.load_browser_data();
    
    return ui_root;
}

function attach_menu(tpl_root, menu){
    menu.ul.style.zIndex=20;
    tpl_root.ui_root.replaceChild(menu.ul, tpl_root.ui_name); 
}
