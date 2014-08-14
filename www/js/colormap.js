/* Quarklib, 2001-2014, PG Sprimont. */

function hex2rgb(hex) {
  
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
    
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgb2hex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

    

function get_mouse_pos(e){

    var pos = [0,0];

    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
	
	pos[0] = e.pageX;
	pos[1] = e.pageY;
    }
    else if (e.clientX || e.clientY) {
	
	pos[0] = e.clientX + document.body.scrollLeft
	    + document.documentElement.scrollLeft;
	pos[1] = e.clientY + document.body.scrollTop
	    + document.documentElement.scrollTop;
    }
    return pos;
}

function hex_color(c) {
    return rgb2hex(Math.floor( (c[0]*255)), Math.floor( (c[1]*255)), Math.floor( (c[2]*255)) );
}

template_ui_builders.colormap=function(ui_opts, cmap){
    
    
    var o,i,
    b,
    rng,
    uniform,
    split;

    cmap.color_sections = [];

    cmap.domnode=ce('div');
    
    cmap.mousexstart=0;
    cmap.lastfrac=0;
    cmap.mousemove=0;
    cmap.mouse_object=null;
    cmap.selected_element=null;
    cmap.selected_section=0;


    cmap.set_hex_color = function(cid, color){
	//console.log("set color id " + cid + " col " + JSON.stringify(color));
	var rbgc=hex2rgb(color);
	var cv=this.value[cid];
	
	cv[0]=rbgc.r/255.0;
	cv[1]=rbgc.g/255.0;
	cv[2]=rbgc.b/255.0;
    }
    
  
    cmap.write_gradient_css_string=function(){

	var cstr='linear-gradient(to right';

	for (var i=0;i<this.value.length;i++){
	    
	    var r=Math.floor(this.value[i][0]*255);
	    var g=Math.floor(this.value[i][1]*255);
	    var b=Math.floor(this.value[i][2]*255);
	    var a=Math.floor(this.value[i][3]*255);
	    var f=this.value[i][4]*100;

	    cstr+=",rgba("+r+","+g+","+b+","+a+") "+f+"%";
	}
	cstr+=")";
	this.gradient_css_string=cstr;
	return this.gradient_css_string;
    }

    cmap.on_slide=function(slided){
	console.log("CMAP slided !!");
	console.log(cmap.name + " display " + this.value.length + " colors. w = " + cmap.parent.ui_root.clientWidth);
	cmap.domnode.style.width=cmap.ui_root.clientWidth;
    }

    cmap.display=function(ui_opts){
	
	if(this.value.length<2){
	    console.log("Not enough colours to display");
	return;
	}
	console.log(cmap.name + " display " + this.value.length + " colors. w = " + cmap.parent.ui_root.clientWidth);

	//this.domnode.innerHTML="Hello Colormap!";	

	
	//this.domnode.style.height=40+"px";

	this.domnode.style.background=this.write_gradient_css_string();

	if(ui_opts.type=="edit"){
	    var sd=this.select_div=ce("div");
	    sd.className="colormap_select_div";
	    this.domnode.appendChild(this.select_div);
	    select_section(1);
	}

	

	if(this.update_callback)
	    this.update_callback();

    }
    
    cmap.update_colors = function(){
	cmap.domnode.style.background=cmap.write_gradient_css_string();
	if(this.update_callback)
	    this.update_callback();
	
    }

    cmap.display_color_section = function (cid){
	
	if(typeof rng=='undefined') return;

	selected_section=cid; 
	
	var start=this.value[cid-1][4];
	var end=this.value[cid][4];
	
	
	var range=end-start;
	
	console.log("color sec : " + cid + " start " + start*1.0 );
	
	this.select_div.style.width=this.domnode.offsetWidth*range-2+"px";
	this.select_div.style.left=this.domnode.offsetWidth*start+"px";
	
	rng.set_value([start, end]);
	
	for(var d=0;d<2;d++){	    
	    o[d].si=-1;
	    i[d].si=-1;
	}
	
	//ol.set_value(hex_color(this.value[cid-1]));
	//or.set_value(hex_color(this.value[cid]));
	
	var blend=[true,true];
	uniform.ui_root.style.display="none";
	
	b[0].enable(cid-1>0);
	b[1].enable(cid+1<this.value.length);

	rng.inputs[0].enable(cid-1>0);
	rng.inputs[1].enable(cid+1<this.value.length);
	
	if(cid-2>0){
	    if(this.value[cid-2][4]==start){ 
		blend[0]=false; 
		o[0].si=cid-2;
		i[0].si=cid-1;
	    }else o[0].si=cid-1;
	} else{
	    o[0].si=cid-1;
	}
	
	if(cid+1<this.value.length){
	    if( this.value[cid+1][4]==end) { 
		blend[1]=false;
		i[1].si=cid;
		o[1].si=cid+1;
	    }else o[1].si=cid;
	}else{
	    
	    o[1].si=cid;
	}
	
	
	for(var d=0;d<2;d++){
	    
	    o[d].enable(o[d].si>=0);
	    i[d].enable(i[d].si>=0);

	    if(o[d].si>=0)
		o[d].set_value(hex_color(this.value[o[d].si]));
	    
	    if(i[d].si>=0)
		i[d].set_value(hex_color(this.value[i[d].si]));

	    b[d].set_value(blend[d]);
	}
	
    }
    
    cmap.domnode.className="colormap";
    
    switch (ui_opts.type){

    case "short":
	cmap.ui=cmap.domnode;
	break;
    case "edit": 
	
	var etpl=cmap.edit_tpl  = tmaster.build_template("colormap_edit"); 
	
	o=[etpl.elements.colors.elements.outleft,etpl.elements.colors.elements.outright];
	i=[etpl.elements.colors.elements.inleft,etpl.elements.colors.elements.inright];
	b=[etpl.elements.blend.elements.blendl,etpl.elements.blend.elements.blendr];
	rng=etpl.elements.range;
	uniform=etpl.elements.uniform;
	split=etpl.elements.split;
	

	rng.onchange=function(id){
	    var cid=selected_section;
	    var bn=[0,1];
	    
	    if(cid>1) bn[0]=cmap.value[cid-1][4];
	    if(cid<cmap.value.length) bn[1]=cmap.value[cid+1][4];
	    
	    cmap.value[cid-1][4]=this.value[0];
	    cmap.value[cid][4]=this.value[1];
	    cmap.update_colors();	    
	}
    
	function select_section(cid){
	    if(cmap.selected_section!=cid){
		cmap.display_color_section(cid);
		//console.log("!changed section  " + cid + " frac= " + frac + " P=" + screen_pix[0]);
	    }
	}

	function update_range(){
	    
	}
	
	split.onclick=function(){
	    var cid=selected_section;
	    var newc=[0,0,0,0,0];
	    for(var c=0;c<5;c++) newc[c]=.5*(cmap.value[cid-1][c]+cmap.value[cid][c]);
	    cmap.value.splice(cid,0,newc);
	    cmap.update_colors();
	    cmap.display_color_section(cid);
	}

	b[0].onchange=function(){
	    var cid=selected_section;

	    if(this.value){
		var newc=[0,0,0,0,cmap.value[cid-1][4]];
		for(var c=0;c<4;c++) newc[c]=.5*(cmap.value[cid-1][c]+cmap.value[cid-2][c]);
		cmap.value.splice(cid-2,1);
		cmap.value[cid-2]=newc;
		cmap.display_color_section(cid-1);
	    }else{
		var newc=[0,0,0,0,cmap.value[cid-1][4]];
		for(var c=0;c<4;c++) newc[c]=cmap.value[cid-1][c];
		cmap.value.splice(cid-1,0,newc);
		cmap.display_color_section(cid);
	    }
	    cmap.update_colors();

	}

	b[1].onchange=function(){
	    var cid=selected_section;

	    if(this.value){
		var newc=[0,0,0,0,cmap.value[cid][4]];
		for(var c=0;c<4;c++) newc[c]=.5*(cmap.value[cid][c]+cmap.value[cid+1][c]);
		cmap.value.splice(cid,1);
		cmap.value[cid]=newc;
	    }else{
		var newc=[0,0,0,0,cmap.value[cid][4]];
		for(var c=0;c<4;c++) newc[c]=cmap.value[cid][c];
		cmap.value.splice(cid,0,newc);
	    }
	    cmap.update_colors();
	    cmap.display_color_section(cid);
	}

	for(var d=0;d<2;d++){
	    i[d].onchange=function(){
		cmap.set_hex_color(this.si, this.value);
		cmap.update_colors();
	    }
	    o[d].onchange=function(){
		cmap.set_hex_color(this.si, this.value);
		cmap.update_colors();
	    }
	}

	var edit_node=create_ui({type : "edit", root_classes : ["column"]}, etpl);
	cmap.ui=edit_node;
	edit_node.prependChild(cmap.domnode);

	
	cmap.domnode.addEventListener("click", function(e){
	    
	    var screen_pix=[];
	    
	    if(e.offsetX) {screen_pix=[e.offsetX, e.offsetY];}
	    else if(e.layerX){ screen_pix=[e.layerX, e.layerY]};
	    
	    for(var p=0;p<2;p++)if(screen_pix[p]<0) screen_pix[p]=0;
	    
	    var frac=screen_pix[0]/cmap.domnode.offsetWidth;
	    var cid;
	    for(cid=0;cid<cmap.value.length;cid++){
		//console.log("f="+frac+" cmvf:"+ cmap.value[cid][4] + " cid="+cid);
		if(frac <= cmap.value[cid][4]) break;
	    }
	    if(cid==0)cid=1;
	    if(cid==cmap.value.length){
		console.log("Bug here ! cid=" + cid);
		return;
	    }
	    
	    select_section(cid);
	    
	    
	}, true);
	

	
	break;
    default: 
	throw "Unknown UI type ";
    }

    cmap.set_value=function(v){
	cmap.value=v;
	cmap.update_colors();
    }
    
    cmap.display(ui_opts);
    return cmap.ui;
}
