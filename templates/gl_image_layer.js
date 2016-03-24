({ name:"Image view",
  ui_opts:{ root_classes:[ "container-fluid" ],
    child_view_type:"tabbed",
    close:true },
  elements:{ geometry:{ name:"Layer options",
      subtitle:"Set up parameters for this layer",
      type:"geometry",
      ui_opts:{ name_node:"h4" },
      elements:{ enable:{ name:"Display",
          type:"bool",
          value:true,
          ui_opts:{ label:true,
            type:"edit",
            root_classes:[ "inline" ] } },
        lum:{ name:"Luminosity",
          type:"double",
          min:"0",
          max:"1.0",
          step:"0.01",
          value:".1",
          ui_opts:{ input_type:"range",
            editable:true,
            type:"short",
            root_classes:[ "inline" ],
            label:true,
            fa_icon:"lightbulb-o" } } } },
    cmap:{ type:"colormap",
      ui_opts:{ name_node:"h4" } },
    histo:{ name:"Data histogram, value cuts",
      subtitle:"Display the histogram and select the value bounds fitting into the colormap.",
      intro:"<br/><br/><p class='alert alert-warning'><strong>This is buggy, sorry !</strong>The vector view (based on d3.js) is not yet very stable.</p>",
      type:"vector",
      ui_opts:{ root_classes:[ "container-fluid" ],
        fa_icon:"signal",

		name_node:"h4",
        enable_selection:true },
      elements:{ cuts:{ name:"Value cuts",
          type:"cuts",
          ui_opts:{ editable:true,
            type:"short",
            label:true } } } } },
  key:"gl_image_layer",
   widget_builder:function (ok, fail){


var def_parameters=[
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     20.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     5.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ],
    [0, //low cut
     2.0, //high cut
     0, //Tx
     0, //Ty
     1.0, //Scale
     0, //Rot
     .85, //Luminosity
     0
    ]
];


       
      var layer=this;
    //function layer(xd, id, cb){
    //var div=this.div=document.createElement("div"); 

    layer.p_values=def_parameters[0];
    layer.rotcenter=[0,0];
    
    layer.xd1_attach=function(glm, id){
	this.glm=glm;
	this.id=id;
	this.gl=glm.gl;
	update_pvalues();	    
	cmap.update_colors();
    }

    var histo_tpl=layer.get('histo');
    var cuts=layer.get('cuts');//=histo_tpl.elements.cuts; 

    //
    var cmap=layer.cmap=layer.get('cmap');
    var geometry=layer.get('geometry');

    var lum=geometry.get('lum');
    var layer_enable=geometry.get('enable');
    var tr=geometry.get('translation');
    var zm=geometry.get('zoom');
    var ag=geometry.get('angle'); 
    var rc=geometry.get('center');

    var image=layer.get('image');

    var nbins=512;
    var bsize=null; 
    var length;

    var slct=histo_tpl.get('selection');
//    slct.ui_root.add_class("disabled");
    //histo_tpl.elements.range.ui_root.add_class("disabled");

    //for(var p in cuts) console.log("cutprop " + p);
    //cuts.set_value([12,13]);
    
    function update_histo_cmap(){
	var brg=histo_tpl.select_brg;
	//console.log("Selection changed brg = " + brg);
	var xmarg=0.0;//histo_tpl.ui_opts.margin.left;

	if(brg!=null){

	    var pt  = histo_tpl.svg_node.createSVGPoint(); 

	    function rect_corners(rect){
		//console.log("Getting corners for " + rect );
		var corners = {};
		var matrix  = rect.getScreenCTM();
		
		//console.log("Getting matrix " + JSON.stringify(matrix) );
		pt.x = rect.x.animVal.value;
		pt.y = rect.y.animVal.value;
		corners.nw = matrix ? pt.matrixTransform(matrix) : pt;
		pt.x += rect.width.animVal.value;
		corners.ne = matrix ? pt.matrixTransform(matrix): pt;
		pt.y += rect.height.animVal.value;
		corners.se = matrix ? pt.matrixTransform(matrix): pt;
		pt.x -= rect.width.animVal.value;
		corners.sw = matrix ? pt.matrixTransform(matrix): pt;
		return corners;
	    }

	    
	    //histo_cmap.style.width=(brg[1].getBBox().width+0.0)+'px';
	    //histo_cmap.style.marginLeft=(brg[1].getBBox().x+xmarg)+'px';
	    var bid=0;
	    
	    brg.selectAll("rect").each(function(){
		// brg.each(function(){

		var bcr=histo_tpl.ui.getBoundingClientRect();
		
		if(bid==1){
		    var corners=rect_corners(this);
		    //console.log("BRUSH "+bid+": x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
		    //console.log("Corners : " + JSON.stringify(corners));
		    var w=corners.ne.x-corners.nw.x;
		    var x=corners.nw.x-bcr.left-1;
		    var y=corners.nw.y-bcr.top-5;
		    //this.node().style.background=cmap.css_color_gradient;
		    //histo_cmap.style.width=(this.getBBox().width+0.0)+'px';
		    histo_cmap.style.width=w+'px';
		    
		    histo_cmap.style.left=x+'px';
		    histo_cmap.style.top=y+'px';
		    
		}
		bid++;
		
	    });	       	
	    
	}else
	    ;//console.log("brg is NULL !");



    }

    layer.listen("close", function(){
	console.log("Layer close !");
	this.glm.delete_layer(this.id);
    });


    
    histo_tpl.listen("slided",function(slided){
	console.log("Histo slide ! " + slided);
	if(slided){
	    //histo_tpl.ui_opts.width=
	    //
	    compute_histogram(nbins, cuts.value);
	    histo_tpl.redraw(); 
	}
    });

    
       histo_tpl.listen("selection_change",function(new_cuts){
	//console.log("Histo selection change !" + new_cuts[0] + ", " + new_cuts[1]);
	//for(var p in cuts) console.log("cutprop " + p);
	cuts.set_value(new_cuts);
	cuts.trigger("change");
	update_histo_cmap();
    });
    
       create_widget({
	   type: "action", name : "Auto cuts", ui_opts : { item_classes : ["btn btn-default btn-sm"], fa_icon: "gears", item_root : true }
       }).then(function(autocout){

	   histo_tpl.elements.btns.add_child(autocout);
	   
	   autocout.listen("click",function(){
	       console.log("Unzoom Range change !, recomp histo");
	       reset_histogram();
	   });
	   
       });
       
    //histo_tpl.elements.btns.ui_childs.div.appendChild(autocout.ui_root);
    

    /*
    histo_tpl.elements.btns.elements.unzoom.listen("click",function(){
	console.log("Unzoom Range change !, recomp histo");
	compute_histogram(nbins, layer.ext);
	update_histo_cmap();
    });
    
    histo_tpl.elements.btns.elements.zoom.listen("click",function(new_range){
	console.log("Histo Range change !, recomp histo");
	compute_histogram(nbins, histo_tpl.elements.range.value);
	update_histo_cmap();
    });
    */
    
    var histo_cmap=cc("div",histo_tpl.ui);
    histo_cmap.style.position="absolute";//className="histo_cmap";
    histo_cmap.style.top="0em";
    histo_cmap.style.height="1em";

    cmap.listen("colormap_changed", function(cm){
	histo_cmap.style.background=cmap.css_color_gradient;
    }, true);

    
    layer_enable.listen("change", function(){
	//console.log("Change !!!");
	if(layer.glm===undefined) return;
	var glm=layer.glm;
	glm.layer_enabled[layer.id]=this.value;
	var le_loc=layer.gl.getUniformLocation(glm.program, "u_layer_enabled");
	layer.gl.uniform4iv(le_loc, glm.layer_enabled);
	glm.render();
    });

    cuts.listen("change",function(){
	layer.p_values[0]=this.value[0];
	layer.p_values[1]=this.value[1];
	//console.log("Cuts changed to " + JSON.stringify(this.value));
	update_pvalues();
    });
    
    tr.listen("change",function(){
	layer.p_values[2]=this.value[0];
	layer.p_values[3]=this.value[1];
	update_pvalues();
    });

    zm.listen("change",function(){
	layer.p_values[4]=this.value;
	update_pvalues();
    });

    ag.listen("change",function(){
	layer.p_values[5]=this.value;
	update_pvalues();
    });

    lum.listen("change",function(){
	layer.p_values[6]=this.value;
	update_pvalues();
    });

    rc.listen("change",function(){
	var rc_loc=layer.gl.getUniformLocation(glm.program, "u_rotcenters");
	glm.p_rotcenters[2*layer.id]=this.value[0];
	glm.p_rotcenters[2*layer.id+1]=this.value[1];
	console.log("Setting rotcenter for layer " + layer.id + " : " + JSON.stringify(glm.p_rotcenters));
	layer.gl.uniform2fv(rc_loc, glm.p_rotcenters);
	glm.render();
	
    });


    layer.update_geometry=  function (){
	
	var glm=this.glm;	
	var alpha_l=1.0*this.p_values[5];
	
	this.g_lzoom=1.0*this.p_values[4]; //*glm.zoom;
	this.g_trl=[1.0*this.p_values[2],1.0*this.p_values[3]]; //glm.tr[]
	this.g_rm=[[Math.cos(alpha_l),Math.sin(alpha_l)],[-1.0*Math.sin(alpha_l),Math.cos(alpha_l)]];
	this.g_rmi=[[this.g_rm[0][0],-this.g_rm[0][1]],[-this.g_rm[1][0],this.g_rm[1][1]]];    
	this.g_screen_center=[glm.canvas.clientWidth/2.0, glm.canvas.clientHeight/2.0];
	this.g_rotc=[1.0*glm.p_rotcenters[2*this.id],1.0*glm.p_rotcenters[2*this.id+1]];
	this.g_texc=[this.width/glm.w/2.0, this.height/glm.h/2.0];
	
	//    console.log("ROTC = " + JSON.stringify(this.g_rotc) + "TEXC " + JSON.stringify(this.g_texc)+ "TR " + JSON.stringify(this.g_trl) + " scale " + this.g_lzoom + " screen center " + JSON.stringify(this.g_screen_center + " global rot " + JSON.stringify(this.g_rmg)));
	this.draw_frame();
    }

    
    //var canvas_info  = document.getElementById('canvas_info');
    
    //    var x_domain_full=null; //[low+.5*bsize,low+(nbins-.5)*bsize];

    function auto_cuts22(){
	
	var histo=histo_tpl.value;
	var max=0,maxid=0, total=0, frac=.95, cf=0;

	//console.log("cuts.... ND=" + histo.length);

	for(var i=0;i<histo.length;i++){
	    var v=histo[i];
	    if(v>max){max=v;maxid=i;}
	    total+=v;
	}
	
	var i;
	for(i=0;i<histo.length;i++){
	    cf+=histo[i];
	    if(cf*1.0/total>=frac) break;
	}
	
	//if(maxid>0) maxid-=1;
	var autocouts=[histo_tpl.start+histo_tpl.step*maxid,histo_tpl.start+histo_tpl.step*i];

	//console.log("cuts.... total " + total + " maxid " + maxid + " max " + max + " -> cuts " + JSON.stringify(autocouts));
	

	cuts.set_value(autocouts);
	cuts.onchange();

    }


    function auto_cuts(){
	if(ù(layer)) return;
	if(ù(layer.arr)) return;
	
	var ns=2000;
	var ab=new ArrayBuffer(4*ns);
	var fa=new Float32Array(ab);
	var lo=0.05, hi=0.99;

	var ll=layer.arr.length;
	for (var i=0;i<fa.length;i++){
	    var pix=Math.floor(Math.random()*ll);
	    fa[i]=layer.arr[pix];
	}
	var sort=radixsort();
	var sfa = sort(fa);

	var newcuts=[sfa[Math.floor(lo*ns)], sfa[Math.floor(hi*ns)]];

	//	for (var i=0;i<sfa.length/20;i++)
	//	    console.log( i + " : " + sfa[i]);
	
	//console.log("AUTOCOUT Number of items : " + fa.length, " NB = " + ab.byteLength + " npix="+ll + " cuts + " + JSON.stringify(newcuts));
	
	cuts.set_value(newcuts);
	//histo_tpl.set_selection(newcuts);
	cuts.trigger("change");
    }
    

    function reset_histogram(){

	if(layer.ext===undefined) return;
	
	var low=layer.ext[0];
	var high=layer.ext[1];

	//cuts.set_value([low+.5*bsize,low+(nbins-.5)*bsize]);
	//console.log("X DOM " + x_domain[0] + ", " + x_domain[1]);
	//bsize=(high-low)/nbins;
	compute_histogram(nbins,layer.ext);
	auto_cuts();

	
	var cl2=.5*(cuts.value[1]-cuts.value[0]);
	var autoc=[cuts.value[0]-cl2, cuts.value[1]+cl2];
	if(autoc[0]<layer.ext[0])autoc[0]=layer.ext[0];
	if(autoc[1]>layer.ext[1])autoc[1]=layer.ext[1];
	
	compute_histogram(nbins, autoc);
	update_histo_cmap();
	histo_tpl.config_range();

	//draw_histogram();
	
    }

    layer.pointer_info  = document.createElement('div');
    layer.pointer_info.className="pointer_info";

    layer.width=0;
    layer.height=0;

    layer.g_tr=[0,0];
    layer.g_mrot=[[1,0],[0,1]];
    layer.g_screen_center=[0,0];
    layer.g_scale=1.0;
    
    //var cb= cmap.event_callbacks["colormap_changed"];
    //console.log("Have the cb ? " + cb);
    
    layer.listen("name_changed", function(n){
	
    });

    var cmt;
    
    cmap.listen("colormap_changed", function(cm){
	var glm=layer.glm;
	var cmap_data=cmap.value;
	glm.ncolors[layer.id]=cmap_data.length;

	layer.set_title( '<div style="background : '+cm.css_color_gradient+'; width: 100%; height : .5em; display : inline-block; " ></div><span>Layer ' + (layer.id+1)+ '</span>');

	// if(è(layer.get_title_node)){
	//     var tn=layer.get_title_node();
	//     tn.style.background=cm.css_color_gradient;
	// }
		
	var of=256*4*layer.id;
	for(var cmi=0;cmi<cmap_data.length;cmi++){
	    var c=cmap_data[cmi];
	    for(var k=0;k<4;k++)
		glm.cmap_texdata[of+4*cmi+k]=c[k];
	    glm.cmap_fracdata[of+4*cmi]=c[4];
	}
	
	for(var cmi=cmap_data.length;cmi<256;cmi++){
	    for(var k=0;k<4;k++)
		glm.cmap_texdata[of+4*cmi+k]=-1.0;
	    glm.cmap_fracdata[of+4*cmi]=-1;
	}
	
	// for(var k=0;k<4;k++){
	//     console.log("Layer " + k + " nc=" + ncolors[k] );
	//     for(var cmi=0;cmi<ncolors[k];cmi++){
	// 	console.log("L"+k+" C"+cmi + "=" + cmap_texdata[k*256*4+cmi*4]+","+ cmap_texdata[k*256*4+cmi*4+1]+","+ cmap_texdata[k*256*4+cmi*4+2]+","+ cmap_texdata[k*256*4+cmi*4+3]+"" );
	//     }
	// }
	
	//console.log("NCOLORS="+JSON.stringify(ncolors));

	var gl=layer.gl;
	var ncolors_loc = gl.getUniformLocation(glm.program, "u_ncolors");
	gl.uniform4iv(ncolors_loc, glm.ncolors);
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, glm.cmap_texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 4, 0, gl.RGBA, gl.FLOAT, glm.cmap_texdata);
	gl.uniform1i(gl.getUniformLocation(glm.program, "u_cmap_colors"), 1);
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, glm.cmap_frac);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256,4, 0, gl.RGBA, gl.FLOAT, glm.cmap_fracdata);
	gl.uniform1i(gl.getUniformLocation(glm.program, "u_cmap_fracs"), 2);
	
	
	glm.render();
	
	//console.log("Update colormap for layer "+layer.id + "cm="+JSON.stringify(glm.cmap_fracdata) + " OK" );
	
    });

    //console.log("Have the cb ? L=" + cb.length);    

    function setup_bbig(w, h){
	var glm=layer.glm;
	var gl=glm.gl;
	//console.log("Setup bbig for image size " + w + ", " + h);
	
	function up2(x){var p2=1;while(p2 < x) p2*=2; return p2;}

	function create_bbig_buffer(w,h){
	    var b=new ArrayBuffer(4*4*w*h);
	    var fv=b.fv = new Float32Array(b);
	    for(var i=0;i<fv.length;i++){
		fv[i]=0.0;
	    }
	    return b;
	}
	
	if(glm.bbig!=null){
	    if(glm.w>=w && glm.h>=h){
		//console.log("Buffer big enough " + glm.w + ", " + glm.h);
		//return; //Ok, GL buffer is big enough
	    }else{

		//We need to resize the GL Buffer...
		//console.log("Resizing bbig buffer");
		
		var w=up2(w);
		var h=up2(h);
		
		//Copy the actual content into the bigger buffer
		
		var newbbig=create_bbig_buffer(w,h);
		var newfv= newbbig.fv;
		var bbig=glm.bbig;
		var fv=glm.fv;
		
		var n=4*glm.w*glm.h;
		//for(var c=0;c<n;c++)newfv[c] = fv[c];
		
		for(var l=0;l<glm.h;l++){
		    for(var c=0;c<4*glm.w;c++){
			newfv[4*l*w+c] = fv[4*l*glm.w+c];
		    }
		}
		
		delete glm.bbig;
		delete glm.fv;
		
		glm.fv=newfv;
		glm.bbig=newbbig;
		glm.w=w;
		glm.h=h;
		
		//console.log("Resizing bbig buffer done");
	    }

	}else{
	    //console.log("Creating initial bbig");
	    var w=glm.w=up2(w);
	    var h=glm.h=up2(h);

	    //canvas_info.innerHTML="GL texture ("+ w + ", " + h + ")";
	    glm.bbig=create_bbig_buffer(w,h);
	    glm.fv=glm.bbig.fv;
	}
	

	var resolutionLocation = gl.getUniformLocation(glm.program, "u_resolution");
	gl.uniform2f(resolutionLocation, glm.w, glm.h);
	glm.update_layer_ranges();
	
    }
    
    function init_fits_source() {
    }

    //dinfo.innerHTML+="Requesting image binary data...<br/>";
    
    function draw_histogram(){
	
    }
    
    
    function compute_histogram(nbins, data_bounds){
	var data=layer.arr;
	if(ù(data)){
	    console.log("cannot compute histogram : no data !");
	    return;
	}

	var dl=data.length ? data.length : data.byteLength;
	
	var step=(data_bounds[1]-data_bounds[0])/nbins; //histo_tpl.value.length;
	var start=data_bounds[0];//+.5*step;

	var range=histo_tpl.get('range');
	
	bsize=(range.value[1]-range.value[0])/nbins;

	var histo=[];
	for(var i=0;i<nbins;i++){
	    histo[i]=0;
	}
	
	//console.log("Compute histo Data bounds : " + layer.ext[0] + ", " + layer.ext[1], " bin size = " + bsize + " nbins " + nbins + " ndata=" + dl + " start " + start + " step " + step);
	
	
	for(var i=0;i<dl;i++){
	    var v=data[i];
	    if(v>=data_bounds[0]&&v<=data_bounds[1]){
		var bid=Math.floor( (v-data_bounds[0])/step);
		if(bid>=0&&bid<nbins)
		    histo[bid]++; 
	    }
	}
	
	if(histo_tpl.value===undefined || histo_tpl.value.length===0){
	    histo_tpl.add_plot_linear(histo, start, step);
	    
	}else{
	    var p= histo_tpl.value[0];
	    p.args[1]=start;
	    p.args[2]=step;
	    p.data=histo;
	    
	    histo_tpl.config_range();
	    //histo_tpl.set_range();
	}
	
	//console.log("Histo : " + JSON.stringify(layer.histo));
	
    }  
    
    


    function update_pvalues(){
	var glm=layer.glm;
	//console.log("update pv for " + glm.name + " pvl "+ glm.p_vals.length);
	//for(var p in glm) console.log("glm p = " + p);
	for(var p=0; p<8;p++) glm.p_vals[layer.id*8+p]=layer.p_values[p];
	//console.log("Setting parms for layer " + layer_id + " : " + JSON.stringify(p_vals));
	
	var pv_loc=layer.gl.getUniformLocation(glm.program, "u_pvals");
	layer.gl.uniform4fv(pv_loc, glm.p_vals);
	if(zm.ui)
	    zm.ui.step=zm.ui.value/10.0;
	if(layer.update_geometry !==undefined)
	    layer.update_geometry();
	else
	    console.log("UPDATE GEO NOT DEFINED!");
	glm.render();
    }
    
    layer.setup_image=function(image){

	var glm=layer.glm;
	var gl=glm.gl;

	var iw=image.elements.dims.value[0];
	var ih=image.elements.dims.value[1];
	var ext=image.elements.bounds.value;

	//console.log("Setting up layer " + layer.id + "... Img is " + iw + ", " + ih);

	layer.subtitle=image.name;
	layer.rebuild_name();
	layer.width=iw;
	layer.height=ih;
	
	layer.p_values[0]=ext[0];
	layer.p_values[1]=ext[1];

	
	layer.arr=image.fvp;
	layer.ext=ext;

	setup_bbig(iw,ih);

	var w=glm.w;
	var h=glm.h;

	var fv=glm.fv;
	var id=layer.id;

	//console.log("Setting up layer " + id + "... BIG is " + w + ", " + h + " fv length " + fv.length);


	for(var i=0;i<ih;i++){
	    for(var j=0;j<iw;j++){
		fv[4*(i*w+j)+id]=1.0*image.fvp[i*iw+j];
	    }
	}
	

	//histo_tpl.set_range(ext);
	histo_tpl.set_selection(cuts.value);
	reset_histogram();
	//histo_tpl.redraw();

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, glm.texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, glm.fv);
	gl.uniform1i(gl.getUniformLocation(glm.program, "u_image"), 0);

	glm.fullscreen(false);

    }
    

    layer.get_screen_pos= function (ipix){
	var l=this,glm=this.glm;
	var spos=[ipix[0]-l.width/2.0, ipix[1]-l.height/2.0];
	var screen_dims=[glm.canvas.clientWidth, glm.canvas.clientHeight];
	var screen_center=[screen_dims[0]/2.0, screen_dims[1]/2.0];
	
	spos= numeric.dot(l.g_rmi,spos);
	
	spos[0]=(spos[0]-l.g_trl[0]);
	spos[1]=(spos[1]+l.g_trl[1]);
	
	spos[0]=spos[0]*l.g_lzoom;
	spos[1]=spos[1]*l.g_lzoom;
	
	spos= numeric.dot(glm.g_rmgi,spos);
	
	spos[0]=(spos[0]-glm.tr.value[0]);
	spos[1]=(spos[1]+glm.tr.value[1]);
	
	spos[0]=spos[0]*glm.zm.value;
	spos[1]=spos[1]*glm.zm.value;
	
	spos[0]+=screen_center[0];
	spos[1]+=screen_center[1];
	return spos;
    }
    
    layer.is_in_screen=function (spos){
	return (spos[0]<0||spos[0]>=screen_dims[0]||spos[1]<0||spos[1]>=screen_dims[1]) ? false : true; 
    }


    layer.draw_frame=function(){

	var l=this, glm=this.glm; //glm.layers[0];
	//    if(!l) return;
	var lcorners=[ [0,0], [0,l.height], [l.width, l.height], [l.width, 0] ];
	var lcenter=[l.width/2.0,l.heigth/2.0];
	
	
	var tcorners=[];
	for(var c=0;c<lcorners.length;c++) tcorners[c]=l.get_screen_pos(lcorners[c]);
	var tcenter=l.get_screen_pos(lcenter);
	var cursor_dims=[50,30];

	var ctx2d=glm.ctx2d;
	ctx2d.beginPath();
	ctx2d.moveTo(tcorners[0][0],tcorners[0][1]);
	ctx2d.lineTo(tcorners[1][0],tcorners[1][1]);
	ctx2d.lineTo(tcorners[2][0],tcorners[2][1]);
	ctx2d.lineTo(tcorners[3][0],tcorners[3][1]);
	ctx2d.lineTo(tcorners[0][0],tcorners[0][1]);
	//	    ctx2d.fillStyle = 'yellow';
	//	    ctx2d.fill();
	ctx2d.lineWidth = 2;
	ctx2d.strokeStyle = 'yellow';
	ctx2d.stroke();
	ctx2d.closePath();

	ctx2d.font = "12px sans-serif";//"italic 200 36px/2 Unknown Font, sans-serif";
	ctx2d.strokeStyle = "yellow"; // set stroke color to blue
	ctx2d.fillStyle = "white";  // set fill color to red
	ctx2d.lineWidth = "1";  //  set stroke width to 3pmx

	ctx2d.strokeText("Layer " + l.id, tcorners[0][0],tcorners[0][1]-10);
	ctx2d.fillText("Layer " + l.id, tcorners[0][0],tcorners[0][1]-10);

    }

    layer.sample_image_1d= function(start,end,size) {
	var v=[end[0]-start[0],end[1]-start[1]];
	var l=Math.sqrt(v[0]*v[0]+v[1]*v[1]);
	if(typeof size==='undefined') size=Math.floor(l);

	var d=[v[0]/l,v[1]/l];
	var dl=l/(size-1.0);
	//console.log("sample N= " + size+" D="+JSON.stringify(d) + " l= " + l + " dl=" + dl);

	var c=this.arr;
	var dims=[this.width,this.height];
	var b=new ArrayBuffer(4*size);
	var fb= new Float32Array(b);
	var x=[];
	for(var step=0;step<size;step++){
	    x[0]=start[0]+d[0]*step*dl;
	    x[1]=start[1]+d[1]*step*dl;

	    if (x[0]<0||x[0]>=dims[0]||x[1]<0||x[1]>=dims[1]) fb[step]=0.0;
	    else
		fb[step]=c[Math.floor(x[1])*dims[0]+Math.floor(x[0])];

	}
	
	return fb;
    }

    layer.get_image_pixel= function(screen_pixel) {
	if(typeof this.g_trl=="undefined") return [0,0];


	var glm=this.glm;

	var ipix=[
	    (screen_pixel[0]-this.g_screen_center[0])/glm.zm.value+glm.tr.value[0]-glm.rc.value[0],
	    (screen_pixel[1]-this.g_screen_center[1])/glm.zm.value-glm.tr.value[1]-glm.rc.value[1]
	];

	ipix= numeric.dot(glm.g_rmg,ipix);

	ipix[0]=((ipix[0]+glm.rc.value[0])/this.g_lzoom+this.g_trl[0]-this.g_rotc[0]);
	ipix[1]=((ipix[1]+glm.rc.value[1])/this.g_lzoom-this.g_trl[1]-this.g_rotc[1]);

	ipix= numeric.dot(this.g_rm,ipix);

	/*
	  p =rmg*((gl_FragCoord.xy-u_screen/2.0)/u_zoom+u_tr-u_rotc)+u_rotc;
	  p = p/lzoom+trl-u_rotcenters[l];
	  p = (rm*p+u_rotcenters[l])/u_resolution+u_layer_range[l]/2.0;
	*/

	//var ures=[glm.canvas.clientWidth, glm.canvas.clientHeight];

	//    ipix[0]=(((ipix[0]+this.g_rotc[0])/glm.w+.5)*this.width);
	//    ipix[1]=(((ipix[1]+this.g_rotc[1])/glm.h+.5)*this.height);

	//ipix[0]=(ipix[0]+this.g_rotc[0]);///ures[0]/2+glm.p_layer_range[0]/2.0;
	//ipix[1]=(ipix[1]+this.g_rotc[1]);///ures[1]/2+glm.p_layer_range[1]/2.0;

	ipix[0]=(ipix[0]+this.g_rotc[0])+this.width/2.0;///glm.w+this.g_texc[0];
	ipix[1]=this.height/2.0-(ipix[1]+this.g_rotc[1]);///glm.h+this.g_texc[1];

	//ipix[0]=ipix[0]*this.width;
	//ipix[1]=ipix[1]*this.height;

	//console.log("P4="+JSON.stringify(ipix));
	return ipix;
    }

    layer.update_pointer_info=function(screen_pixel, cinfo_tpl){

	
	if(typeof this.arr === 'undefined') return;
	
	//this.update_geometry();

	var ipix=this.get_image_pixel(screen_pixel);
	
	if(ipix[0]<0 || ipix[0]>=this.width || ipix[1]<0 || ipix[1]>=this.height){
	    this.pointer_info.innerHTML="outside<br/>image";
	    return;
	}
	
	ipix[0]=Math.floor(ipix[0]);
	ipix[1]=Math.floor(ipix[1]);

	var pos=ipix[1]*this.width+ ipix[0];
	var pixel_value = this.arr[pos];
	//console.log("Set val " + JSON.stringify(ipix) );
	cinfo_tpl.elements.imgpos.set_value(ipix);
	cinfo_tpl.elements.pixval.set_value(Math.floor(pixel_value*1000)/1000.0);
	
	var cursor_dir=[0,1];
	var line_height=50;
	var cursor_pos=[0,0];
	var screen_dims=[this.glm.canvas.clientWidth,this.glm.canvas.clientHeight];
	var liney=screen_pixel[1];
	var ctx2d=this.glm.ctx2d;
	//var tcenter=e.cursor;
	var cutsv=cuts.value;


	this.draw_frame();

	if(this.glm.elements.options.elements.x_plot.value == true){
	    var start=this.get_image_pixel([0,liney]);
	    var end=this.get_image_pixel([screen_dims[0],liney]);
	    //console.log("asked for " + screen_dims[0] + " start " + JSON.stringify(start)+ " end " + JSON.stringify(end));
	    var line_data=this.sample_image_1d(start,end, screen_dims[0]);
	    //console.log(" got " + line_data.length + " start " + JSON.stringify(start)+ " end " + JSON.stringify(end));

	    ctx2d.beginPath();
	    ctx2d.moveTo(0,screen_dims[1]);
	    for(var p=0;p<line_data.length;p++)
		//ctx2d.lineTo(p,line_data[p]/1000.0);
		ctx2d.lineTo(p,screen_dims[1]-(line_data[p]-cutsv[0])/(cutsv[1]-cutsv[0])*line_height);
	    
	    ctx2d.lineWidth = 2;
	    ctx2d.strokeStyle = 'orange';
	    ctx2d.stroke();
	    ctx2d.closePath();
	}
	
	//console.log("yplot ? " + this.glm.options.tpl.elements.options.elements.y_plot.value); 

	if(this.glm.elements.options.elements.y_plot.value == true){
	    var start=this.get_image_pixel([screen_pixel[0],0]);
	    var end=this.get_image_pixel([screen_pixel[0],screen_dims[1]]);
	    //console.log("asked for " + screen_dims[0] + " start " + JSON.stringify(start)+ " end " + JSON.stringify(end));
	    var line_data=this.sample_image_1d(start,end, screen_dims[1]);
	    
	    ctx2d.beginPath();
	    ctx2d.moveTo(0,0);
	    for(var p=0;p<line_data.length;p++)
		//ctx2d.lineTo(p,line_data[p]/1000.0);
		ctx2d.lineTo((line_data[p]-cutsv[0])/(cutsv[1]-cutsv[0])*line_height,p);
	    
	    ctx2d.lineWidth = 2;
	    ctx2d.strokeStyle = 'blue';
	    ctx2d.stroke();
	    ctx2d.closePath();
	}
	//console.log("("+ipix[0]+","+ipix[1]+")<br/>" + Math.floor(pixel_value*1000)/1000.0);
    }
       ok();
   }
 })
