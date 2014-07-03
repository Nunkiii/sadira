
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

function colormap_element (color, frac, cmap){
    this.cmap=cmap;    
    this.color = clone_obj(color);
    this.step_color = null;
    this.frac=frac;
}

colormap_element.prototype.next=function(){
    var index = this.cmap.color_sections.indexOf(this);
    if(index >= 0 && index < this.cmap.color_sections.length - 1)
	return this.cmap.color_sections[index + 1];
    return null;
}
colormap_element.prototype.prev=function(){
    var index = this.cmap.color_sections.indexOf(this);
    if(index > 0 && index < this.cmap.color_sections.length)
	return this.cmap.color_sections[index - 1];
    return null;
}

colormap_element.prototype.split=function(){
    var prev=this.prev();
    if(prev==null) return;

    
    var nfrac=.5*(this.frac+prev.frac);
    var ncol=[];
    var pcol=prev.step_color ? prev.step_color : prev.color;
    for(var c=0;c<4;c++) ncol[c]=.5*(pcol[c]+this.color[c]);
    
    return this.insert_color(ncol,nfrac );
}



colormap_element.prototype.update_mouse = function(e){

    var mousedx=get_mouse_pos(e)[0]-this.cmap.mousexstart;
    var W=parseInt(this.cmap.domnode.style.width,10);

    //console.log("lastfrac="+this.cmap.lastfrac + " mousedx=" + mousedx + " W=" + W);

    this.frac=this.cmap.lastfrac+mousedx/W; 

    this.cmap.end_range.value=this.frac;

    this.update_colors();
    this.next().update_colors();

    //console.log("mousemove DX="+ mousedx + " csize="+csize) ;	
}


colormap_element.prototype.insert_color=function(c, frac){
    var prev=this.prev();
    if(prev==null){
	console.log("No left element!");
	return;
    }
    
    if(frac<=prev.frac || frac>=this.frac){
	console.log("Out of bound frac !" + frac);
	return;
    }
    var index = this.cmap.color_sections.indexOf(this);
    var cme = new colormap_element(c,frac, this.cmap);
    this.cmap.color_sections.splice(index,0,cme);
    
    return cme;
}


//------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------

colormap_element.prototype.debug = function(){

    var cs='',c;
    
    for(c=0;c<4;c++){
	cs+= Math.floor( (this.color[c]*255) );
	if(c!=3){ cs+=','; }
    }
    var w= ( typeof this.cmenode == 'undefined')? -1 : this.cmenode.style.width;
    return 'Frac= '+ this.frac  +" -> color : "+cs + " w= "+ w;
}


colormap_element.prototype.update_colors = function(){
    var prev=this.prev();  
    if(prev==null) return;
    //    console.log("Before: Update colors of "+ this.debug());
    
    var cs='',ce='',c;
    
    
    for(c=0;c<4;c++){
	cs+= Math.floor( (prev.color[c]*255) );
	ce+= Math.floor( (this.color[c]*255) );
	if(c!=3){ cs+=','; ce+=','; }
    }
    
    //console.log("node is "+ JSON.stringify(this.cmap.domnode.style) );
    var globw=200;//this.cmap.domnode.style.width;    //this.cmap.domnode.offsetWidth
    
    var new_w=Math.floor((this.frac-prev.frac)*parseInt(globw,10) );
  
    console.log("setting new w = " + new_w + " glob w= [" + globw + "] offsetW=" + this.cmap.domnode.offsetWidth);
    
    this.cmenode.style.width=""+new_w + 'px';
    this.cmenode.style.background='-webkit-gradient(linear, left center, right center, from(rgba('+cs+')), to(rgba('+ce+')))';
    this.cmenode.style.background='-moz-linear-gradient(left,  rgba('+cs+'),rgba('+ce+'))';
    
}


colormap_element.prototype.display = function(ui_opts){
    var prev=this.prev();  

    if(prev==null){
	console.log("No left element");
	return;
    }
    
    this.cmenode=document.createElement('li');

//    this.cmenode.style.height='30px'; 
//    this.cmenode.style.border='none';
    this.update_colors();	


//    document.styleSheets[0].insertRule('#elid:hover { border: 1px solid red; }', 0);
    //console.log("drawing frac = "+ this.frac + " width = " + this.cmap.domnode.style.width + " this with ="+this.cmenode.style.width);
    
    this.cmap.domnode.appendChild(this.cmenode);
    

    if(prev!=null && this.next()!=null && ui_opts.type=="edit")
	this.display_division();

    this.cmenode.ceci=this;
    
    this.cmenode.onmousedown = function(e) {
	
	if(this.ceci.selected_element != null){
	  //  ceci.selected_element.cmenode.style.border='none';	    
	  //  ceci.selected_element.cmenode.style.width= (ceci.selected_element.cmenode.style.width+4.0)+'px';
	}
	
	//console.log("select ceci = " + ceci);
	//ceci.cmenode.style.border='2px solid orange';
	//ceci.cmenode.style.width= (ceci.cmenode.style.width-4.0)+'px';

	this.ceci.cmap.select_element(this.ceci);
    }
    
}


colormap_element.prototype.display_division = function(){

//    this.handlenode=document.createElement('div');
    this.handlenode=document.createElement('li');
    

//    this.handlenode.style.display='inline';
//    this.handlenode.style.float='left';
    this.handlenode.style.width='4px';
    //this.handlenode.style.backgroundColor='rgba(0,0,0,10)';
    this.handlenode.style.height='31px';
    this.handlenode.style.marginLeft='-2px';
    this.handlenode.style.marginRight='-2px';
    this.handlenode.style.marginTop='30px';
    this.handlenode.style.zIndex='3';


    this.handlenode.className='color_handle';
    
    
//    this.cmap.domnode.appendChild(this.handlenode);
    this.cmap.domnode.appendChild(this.handlenode);
    
    var ceci=this;
    
    this.handlenode.onmousedown = function(e) {

	if(!ceci.cmap.mousemove){
	    
	    //console.log("Mousedown " + ceci.frac);
	    
	    //this.cmap.lastsize=this.frac;//parseInt(ceci.cmenode.style.width,10);
	    ceci.cmap.lastfrac=ceci.frac;
	    ceci.cmap.mousexstart= get_mouse_pos(e)[0];
	    ceci.cmap.mousemove=1;
	    ceci.cmap.mouse_object=ceci;
	}
	
	//console.log("mousedown! "+ e.clientX);
	
    }
    
}

colormap_element.prototype.hex_color = function(e) {
    return rgb2hex(Math.floor( (this.color[0]*255)), Math.floor( (this.color[1]*255)), Math.floor( (this.color[2]*255)) );
}

colormap_element.prototype.set_hex_color = function(color){

    rbgc=hex2rgb(color); //color.toRgb();
    
    this.color[0]=rbgc.r/255.0;
    this.color[1]=rbgc.g/255.0;
    this.color[2]=rbgc.b/255.0;
    //	this.start_color[3]=rbgc.a/255.0;	
    
    this.update_colors();
    var next=this.next();
    if(next!=null) 
	next.update_colors();
}
/*

c------(c) c-------(c)


*/

colormap_element.prototype.update_color_selection = function(e) {
    var prev=this.prev();

    if(prev==null){
	console.log("No prev element!");
	return;
    }

    var colors=this.cmap.edit_tpl.elements;
    var frac=this.cmap.edit_tpl.elements.frac;

    colors_ui.start.value=prev.hex_color();
    colors_ui.start.set_value();

    colors_ui.end.value=this.hex_color();
    colors_ui.end.set_value();

    frac.value=[this.frac];
    frac.set_value();
    
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
   

    // var etpl=tpl_item.edit_tpl = {
    // 	name : "Color section",
    // 	ui_opts : {root_classes : ["column"], type : "edit" },
    // 	type : "template",
    // 	template_name : "colormap_section",
	
			    //   onchange : function(){
			    // 	  //	console.log("Change ! + ");
			    // 	  clr=this.value;
			    // 	  cmap.selected_element.prev().set_hex_color(clr);
			    // 	  cmap.update_callback();
			    //   }

			    // onchange : function(){
			    // 	//	console.log("Change ! + ");
			    // 	clr=this.value;
			    // 	cmap.selected_element.set_hex_color(clr);
			    // 	cmap.update_callback();
			    // }

//	elements:{

	// 	onclick : function(){
	// 	    if(cmap.selected_element!=null){
    	// 		cmap.selected_element.split(cmap);
    	// 		cmap.display();
			
    	// 	    }else
    	// 		console.log("No selected element !");
		    
	// 	}
	//     }
		// }
//    }
    
    cmap.color_sections = [];
    cmap.domnode=ce('div');
    
    cmap.mousexstart=0;
    cmap.lastfrac=0;
    cmap.mousemove=0;
    cmap.mouse_object=null;
    cmap.selected_element=null;

    cmap.selected_section=0;

    

/*   
    cmap.domnode.onmousemove = function(e) {
	if(cmap.mousemove){
	    cmap.mouse_object.update_mouse(e);
	    cmap.update_callback();
	}
    }
    cmap.domnode.onmouseup = function(e) {
	//console.log("Mouse UP ???");
	if(cmap.mousemove){
	    //console.log("Mouse UP !");
	    cmap.mouse_done(e);	    
	}
    }

    cmap.mouse_done = function(e){
	
	//console.log("Mouse done ...");
	if(this.mouse_object!=null){
	    console.log("Mouse done ..." + this.mouse_object.debug() );
	    this.mouse_object.update_mouse(e);
	    this.mousemove=0;
	    this.mouse_object=null;
	    this.update_callback();
	}
    }
    
    cmap.select_element=function(e){
	//console.log("Selecting "+ e.debug());
	e.update_color_selection();
	this.selected_element=e;
    }
    
    cmap.move=function(x,y,w,h){
	this.domnode.marginLeft=x+'px';
	this.domnode.marginTop=y+'px';
	this.domnode.style.width=w+'px';
	this.domnode.style.height=h+'px';
    }
  */
  
    cmap.write_gradient_css_string=function(){
	console.log("writing css gradient nc=" +this.value.length );
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

    cmap.display=function(ui_opts){
	
	if(this.value.length<2){
	    console.log("Not enough colours to display");
	return;
	}
	console.log("Display " + this.value.length + " colors....");
	this.domnode.innerHTML="Hello Colormap!";	
	//this.domnode.style.width=200+"px";
	//this.domnode.style.height=40+"px";
	this.domnode.style.background=this.write_gradient_css_string();


	if(ui_opts.type=="edit"){
	    var sd=this.select_div=ce("div");
	    sd.className="colormap_select_div";
	    this.domnode.appendChild(this.select_div);
	}

	

	if(this.update_callback)
	    this.update_callback();

    }
    

    cmap.create_colors = function(colors){
	if( this.color_sections.length!=0){
	    console.log("already created!");
	    return;
	}
	
	for(var i=0;i<colors.length;i++){
	    this.color_sections.push(new colormap_element(colors[i], colors[i][4], this));
	}
	
    }
    
    
    cmap.create = function(start_color, end_color){
	
	if(this.color_sections.length!=0){
	    console.log("already created!");
	    return;
	}
	
	this.color_sections.push(new colormap_element(start_color, 0.0, this));
	this.color_sections.push(new colormap_element(end_color, 1.0, this));
	
    }
    
    cmap.update_colors = function(){
	for(var i=1; i<this.color_sections.length;i++)
	    this.color_sections[i].update_colors();
	
    }
    

    console.log("Hello cmap build!");
    cmap.domnode.className="colormap";
    
    switch (ui_opts.type){
    case "short":
	cmap.ui=cmap.domnode;
      break;
    case "edit": 
	var etpl=cmap.edit_tpl  = tmaster.build_template("colormap_edit"); 
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
	    if(cmap.selected_section!=cid){
		cmap.display_color_section(cid);
		//console.log("!changed section  " + cid + " frac= " + frac + " P=" + screen_pix[0]);

	    }
	    

	}, true);
	
	cmap.display_color_section = function (cid){
	    this.selected_section=cid; 

	    var start=this.value[cid-1][4];
	    var end=this.value[cid][4];
	    
	    
	    var range=end-start;

	    console.log("color sec : " + cid + " start " + start*1.0 );

	    this.select_div.style.width=this.domnode.offsetWidth*range-2+"px";
	    this.select_div.style.left=this.domnode.offsetWidth*start+"px";

	    var ol=this.edit_tpl.elements.outleft;
	    var il=this.edit_tpl.elements.inleft;
	    var ir=this.edit_tpl.elements.inright;
	    var or=this.edit_tpl.elements.outright;

	    var rng=this.edit_tpl.elements.range;

	    var blendl=this.edit_tpl.elements.blendl;
	    var blendr=this.edit_tpl.elements.blendr;

	    var uniform=this.edit_tpl.elements.uniform;
	    var split=this.edit_tpl.elements.split;

	    rng.set_value([start, end]);

	    console.log("Settng color " + hex_color(this.value[cid-1]));

	    ol.set_value(hex_color(this.value[cid-1]));
	    or.set_value(hex_color(this.value[cid]));

	    if(cid-2>0){
		if(this.value[cid-2][4]==start){ //non-blend
		    blendl.ui_root.style.display="inline-block";
		    uniform.ui_root.style.display="none";
		    il.ui_root.style.display="inline-block";
		    il.set_value(hex_color(this.value[cid-1]));
		    ol.set_value(hex_color(this.value[cid-2]));
		}else{
		    blendl.ui_root.style.display="none";
		    uniform.ui_root.style.display="inline-block";
		    il.ui_root.style.display="none";
		}
	    }else{
		blendl.ui_root.style.display="none";
		ol.set_value(hex_color(this.value[cid-1]));
	    }


	    if(cid+1<this.value.length){
		if(this.value[cid+1][4]==end){ //non-blend
		    blendr.ui_root.style.display="inline-block";
		    uniform.ui_root.style.display="none";
		    ir.ui_root.style.display="inline-block";
		    ir.set_value(hex_color(this.value[cid]));
		    or.set_value(hex_color(this.value[cid+1]));
		}else{
		    blendr.ui_root.style.display="none";
		    uniform.ui_root.style.display="inline-block";
		    ir.ui_root.style.display="none";
		    or.set_value(hex_color(this.value[cid]));
		}
	    }else{
		blendr.ui_root.style.display="none";
		or.set_value(hex_color(this.value[cid]));
		ir.ui_root.style.display="none";
	    }

	    
	}
	
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    cmap.display(ui_opts);
    return cmap.ui;
}
    