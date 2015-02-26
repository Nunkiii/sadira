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

    var o,i,b,rng,uniform,split;

    cmap.selected_section=-1;
    
    var cmap_plot=cmap.cmap_plot=ce('div');
    cmap.domnode=cc('div', cmap_plot);
    cmap.domnode.className="colormap";
    
    new_event(cmap,"colormap_changed");
    
    cmap.set_hex_color = function(cid, color){
	console.log("set color id " + cid + " col " + JSON.stringify(color));
	var rbgc=hex2rgb(color);
	var cv=cmap.value[cid];
	if(typeof cv != 'undefined'){
	    cv[0]=rbgc.r/255.0;
	    cv[1]=rbgc.g/255.0;
	    cv[2]=rbgc.b/255.0;
	}else
	    console.log("Error : color " + cid + " NC = " + this.value.length);
    }
    cmap.write_gradient_css_string=function(){
	//if(!this.value) return;
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

    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    switch (ui_opts.type){
	
    case "short":
	cmap.ui=cmap.cmap_plot;//domnode;
	break;
    case "edit": 
	
	var etpl=cmap.edit_tpl= tmaster.build_template("colormap_edit"); 
	var edit_node=create_ui({type : "edit", root_classes : ["column"]}, etpl);


	o=[etpl.elements.colors.elements.outleft,etpl.elements.colors.elements.outright];
	i=[etpl.elements.colors.elements.inleft,etpl.elements.colors.elements.inright];
	b=[etpl.elements.blend.elements.blendl,etpl.elements.blend.elements.blendr];
	
	
	rng=etpl.elements.range;

	for(var v in rng) console.log(" rnv " + v);

	
	uniform=etpl.elements.uniform;
	split=etpl.elements.split;


	cmap.ui=edit_node;
	edit_node.prependChild(cmap.cmap_plot);
	var sd=cmap.select_div=ce("div");
	sd.className="colormap_select_div";

	cmap.domnode.appendChild(sd);

	rng.listen("change",function(id){
	    console.log("cmap range changed !!");
	    var cid=cmap.selected_section;
	    var bn=[0,1];
	    
	    if(cid>1) bn[0]=cmap.value[cid-1][4];
	    if(cid<cmap.value.length) bn[1]=cmap.value[cid+1][4];

	    if(cid>2)
		if(cmap.value[cid-1][4]==cmap.value[cid-2][4])
		    cmap.value[cid-2][4]=this.value[0];
	    cmap.value[cid-1][4]=this.value[0];

	    if(cid<cmap.value.length-1)
		if(cmap.value[cid+1][4]==cmap.value[cid][4])
		    cmap.value[cid+1][4]=this.value[1];
	    cmap.value[cid][4]=this.value[1];
	    cmap.update_colors();

	    
	    cmap.update_select_div();
	});
	
	function update_range(){
	    
	}

	
	split.listen("click",function(){
	    var cid=cmap.selected_section;
	    var newc=[0,0,0,0,0];
	    for(var c=0;c<5;c++) newc[c]=.5*(cmap.value[cid-1][c]+cmap.value[cid][c]);
	    cmap.value.splice(cid,0,newc);
	    cmap.update_colors();
	    cmap.display_color_section(cid);
	});

	
	b[0].listen("change",function(){
	    var cid=cmap.selected_section;

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

	});

	
	b[1].listen("change",function(){
	    var cid=cmap.selected_section;

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
	});

	
	
	for(var d=0;d<2;d++){
	    i[d].listen("change",function(){
		cmap.set_hex_color(this.si, this.value);
		cmap.update_colors();
	    });
	    o[d].listen("change",function(){
		cmap.set_hex_color(this.si, this.value);
		cmap.update_colors();
	    });
	}

	
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
	    cmap.select_section(cid);
	    
	}, true);

	var cs_start, cs_end, cs_range;
	
	cmap.update_select_div=function(cid){

	    if(ù(cid)) cid=cmap.selected_section;

	    cs_start=this.value[cid-1][4];
	    cs_end=this.value[cid][4];
	    cs_range=cs_end-cs_start;
	    
	    console.log("color sec : " + cid + " start " + cs_start*1.0 );
	    
	    this.select_div.style.width=this.domnode.offsetWidth*cs_range-2+"px";
	    this.select_div.style.left=this.domnode.offsetWidth*cs_start+"px";
	    
	    //rng.set_value([cs_start, cs_end]);
	    
	}
	
	cmap.display_color_section = function (cid){

	    etpl.set_title("Color interval " + cid);
	    if(cid===0) cid=1;
	    //console.log("Display color section " + cid + " nvalues = " + this.value.length + " othernv " + cmap.value.length);
	    if(typeof rng=='undefined') return;

	    cmap.selected_section=cid; 
	    
	    cmap.update_select_div();
	    
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
		if(this.value[cid-2][4]==cs_start){ 
		    blend[0]=false; 
		    o[0].si=cid-2;
		    i[0].si=cid-1;
		}else o[0].si=cid-1;
	    } else{
		o[0].si=cid-1;
	    }
	    
	    if(cid+1<this.value.length){
		if( this.value[cid+1][4]==cs_end) { 
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

		if(o[d].si>=0){
		    o[d].set_value(hex_color(this.value[o[d].si]));
		}
		
		if(i[d].si>=0)
		    i[d].set_value(hex_color(this.value[i[d].si]));

		b[d].set_value(blend[d]);
	    }


	}
	
	break;
    default: 
	throw "Unknown UI type ";
    }

    cmap.select_section=function(cid){
	if(cmap.selected_section!=cid){
	    cmap.display_color_section(cid);
	    //console.log("!changed section  " + cid + " frac= " + frac + " P=" + screen_pix[0]);
	}
    }
    
    
    cmap.domnode.style.background=cmap.write_gradient_css_string();

    cmap.on_slide=function(slided){
	//console.log("CMAP slided !!");
	//console.log(cmap.name + " display " + this.value.length + " colors. w = " + cmap.parent.ui_root.clientWidth);
	//cmap.domnode.style.width=cmap.ui_root.clientWidth;
	//cmap.display(ui_opts);
    }

    
    
    cmap.draw_cmap_axis=function(){
	if(cmap.ui_opts.type!=='edit') return;
	var d3plot;
	d3plot=d3.select(cmap.cmap_plot);
	//var svg = d3plot.append('svg');
	var vw=500, vh=30;
	var svg = d3plot.append('svg')
	    .attr("viewBox", "0 0 "+vw+" "+vh)
	    .attr("preserveAspectRatio", "xMinYMin meet")
	    .attr("class", "cmap_axe");
	
	var width=vw; //cmap.cmap_plot.clientWidth;
	//console.log("drawing axes : " + width + " stw = " + this.cmap_plot.clientWidth + ", " + this.cmap_plot.offsetWidth);
	//if(width<=0) width=200;
	console.log("drawing axes : " + width);
	var xscale = d3.scale.linear().range([0, width]).domain([0,1]);
	var xaxis = d3.svg.axis().scale(xscale).orient("bottom").ticks(10);    
	var margin={left:0,right:0,top:0,bottom:0};
	var axis_height=vh;
	
	
	//svg.attr("width", width ).attr("height",axis_height);
	var context = svg.append("g");//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");	
	
	var axesvg=context.append("g")
	    .attr("class", "x axis")
	    .call(xaxis);
	    //.append("text")
	    //.attr("transform", "translate(0," + (axis_height-10) + ")");
	    //.text("Normalised pixel value");
    }
    
    
    cmap.display=function(){
	
    	if(this.value.length<2){
    	    console.log("Not enough colours to display");
    	    return;
    	}
    	cmap.domnode.style.background=cmap.write_gradient_css_string();
    	cmap.draw_cmap_axis();
    
	//this.domnode.innerHTML="Hello Colormap!";	
	//var width=cmap.cmwidth=cmap.parent.ui_root.clientWidth-20;//cmap.ui_root.clientWidth;
	
	//this.domnode.style.height=40+"px";

	//console.log(cmap.name + " display " + this.value.length + " colors. w = " + width);
	
	// if(width>0)
	//     this.domnode.style.width=width+"px";
	// else
	//     this.domnode.style.width="5em";
	
	//cmap.update_colors();
	
	//this.draw_cmap_axis();
	/*
	if(this.update_callback)
	    this.update_callback();
	*/
    }

    cmap.update_colors = function(){
	cmap.css_color_gradient=cmap.write_gradient_css_string();
	cmap.domnode.style.background=cmap.css_color_gradient;
	
	/*
	if(this.update_callback)
	    this.update_callback();
	*/
	//console.log("Trigger CM");
	

	cmap.trigger("colormap_changed", cmap );
    }

    cmap.on_attached=function(){
	console.log("Attached!");
	//cmap.display();
    }
    
    cmap.set_value=function(v){
	if(typeof v !='undefined')
	    cmap.value=v;
	cmap.update_colors();
	if(cmap.ui_opts.type==='edit')
	    cmap.select_section(0);
    }
    
    cmap.set_value();
    cmap.display();
    return cmap.ui;
}
