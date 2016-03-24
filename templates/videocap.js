({
    key:"videocap",
    name:"WebSpectro",
    //url:"/minispectro/intro.html",
    ui_opts:{
	root_classes:[ "container-fluid" ],
	child_classes:[  ],
	name_classes:[  ],
	//hide_item:true,
	//default_child:"none",
	icon:"/apps/minispectro/ico/minispectro_white.svg",
	child_view_type:"tabbed",
	//toolbar_brand:true
    },
    //toolbar:{ ui_opts:{ toolbar_classes:[ "navbar-fixed-top navbar-inverse" ] } },
    elements:{
	spectro:{
	    name:"Spectro",
	    ui_opts:{
		fa_icon:"line-chart",
		item_classes:[  ],
		render_name:false
	    },
	    elements:{
		left:{
		    name:"Video",
		    type : "spectro_capture"
		},
		specview:{
		    type:"spectro_view"
		}
	    },
	    widget_builder : function(ok, fail){
		console.log(" Done building spectro");
		ok();
	    }
	    
	},
	spectra:{
	    name:"Saved spectra",
	    intro:"Use the <i class='fa fa-download text-info'></i> and  <i class='fa fa-save text-success'></i> buttons on the spectrum widget below to load and save your spectra",
	    ui_opts:{ intro_title:"Edit your saved spectra",
		      root_classes:[ "container-fluid" ],
		      fa_icon:"folder",
		      intro_stick:true },
	    elements:{
		spec:{
		    name:"No spectrum loaded",
		    type:"spectrum",
		    ui_opts:{ save:"spectra" }
		}
	    }
	},
	calibration:{
	    type:"wlc",
	    ui_opts:{ render_name:true,
		      fa_icon:"calculator" } },
	doc:{ name:"Doc",
	      ui_opts:{ fa_icon:"info",
			render_name:false,
			child_view_type:"pills" },
	      elements:{ start:{ type:"getting_started" },
			 soft:{ type:"manual" },
			 building:{ name:"Building a DVD spectrograph",
				    type:"html",
				    url:"/minispectro/build.html",
				    ui_opts:{ fa_icon:"cut" } },
			 dvd_grating:{ name:"DVD as a diffraction grating",
				       type:"html",
				       url:"/minispectro/doc/dvd_reticolo_inv.svg",
				       ui_opts:{ icon:"/minispectro/doc/dvd.png" } },
			 about:{ name:"About WebSpectro",
				 type:"html",
				 url:"/minispectro/gloria.html",
				 ui_opts:{ icon:"/sadira/icons/gloria-logo-text-transp-light.svg" }
			       }
		       }
	    }
    },
    
    widget_builder:function (ok, fail){

	console.log("Videocap constructor !");
	
	var ui_opts=this.ui_opts;
	var vc=this;
	
	//var main_node=vc.ui=ce("div"); main_node.class_name="container-fluid";
	//var video=vc.get("video");
	
	var camview=vc.get("camview");
	var camwin=vc.get("camwindow");
	var spectrum=vc.get("spectro");
	var doc=vc.get("doc");

	
	var specview=vc.get("specview");//spectrum;
	var spectro_view=specview.elements.view;//spectrum;
	//var options=vc.get('setup');

	var spectro_opts=vc.get('box').elements;
	var controls=vc.get('left');
	
	var htmui=vc.ui=ce("div");
	if(vc.url){
	    download_url(vc.url,function(error, html_content){
		if(error){
		    vc.debug("Error downloading html content : "  + error);
		}else{
		    htmui.innerHTML=html_content;
		    document.getElementById("goto_app").addEventListener('click', function(){
			vc.ui_childs.select_frame(spectrum); 
		    });

		    document.getElementById("goto_doc").addEventListener('click', function(){
			vc.ui_childs.select_frame(doc); 
		    });
		}
	    });
	}
	
	var spectro_box={
	    x : vc.get('pos').elements.x,
	    y : vc.get('pos').elements.y,
	    w : vc.get('dims').elements.w,
	    h : vc.get('dims').elements.h
	};

	var dir=vc.get("dir");

	var butts=vc.get('butts').elements;
	var start=butts.start;
	var stop=butts.stop;

	var video_options=vc.get('video');
	var processing_options=vc.get('processing').elements;
	var device=video_options.get('device');

	var resolution=video_options.elements.resolution;
	var sampling=processing_options.sampling;

	var integ=processing_options.integrate.elements.enable;
	var integ_nf=processing_options.integrate.elements.nframes;

	//var save_status=spectrum.get("save_status");
	//var specname=spectrum.get("specname");

	
	//var spectra=vc.get("spectra");
	//var btns=cc("div",video.ui_root); btns.className="btn-group btn-group-lg";    

	var video_container=cc("div",camwin.ui_root);
	var spectro_win;

	//var wlc=vc.get('calibration');
	
	//wlc.set_sv(spectro_view);
	
	//var have_wlc = wlc.get('calib_func').elements.params.value.length>0;
	
	var save_spec=spectrum.get("fileops");

	save_spec.listen("save_doc",function(doc){

	    save_spec.message("Saving spectrum ..",
			      { type : 'info', title : "<span class='fa fa-spinner fa-spin text-warning'></span>"}
			     );
	    
	    //save_spec.disable();
	    
	    //save_status.set_title("Saving spectrum ...");

	    var date_obs=new Date();
	    var sn=save_spec.val('name');
	    
	    var new_spec=create_widget({
		type : 'spectrum',
		name : (sn!==undefined && sn!=="") ? sn : "Spectrum "+date_obs.toLocaleString()
	    });


	    
	    var calib_data=get_template_data(specview.get('calib'));
	    
	    new_spec.set('target',save_spec.val('target'));
	    new_spec.set('date_obs',date_obs);
	    new_spec.value=spec_data;
	    set_template_data(new_spec.get('calib'), calib_data);
	    //new_spec.update_plot(spec_data);
	    
	    doc.store_serialize(new_spec);
	    //storage_serialize(path, doc);
	    //saved_doc=doc;

	    
	    //spectra.add_child(new_spec, new_spec.name);

	    //new_spec.elements.keys.elements.target.item_ui.innerHTML="BEN QUOIIII";//.set_value("TOTOTOTOOT");
	    //new_spec.elements.keys.elements.target.set_value("TOTOTOTOOT");
	    //ui.innerHTML="BEN QUOIIII";//

	    //wlc.trigger('update_spectra', spectra.elements);

	    setTimeout(function(){
		save_spec.message("Spectrum saved",
				  { type : 'success', title : "Done", last : 2000 }
				 );
		
	    }, 1000);
	    

	    
	});

	// spectra.listen('load', function(){
	// 	console.log("Spectra load event !!!!!");
	// 	wlc.trigger('update_spectra', spectra.elements);
	// });
	
	
	video_container.style.position="relative";
	video_container.style.marginTop="1em";

	video_container.className="panel panel-default";

	var video_node=cc("video",camview.ui_root);
	video_node.setAttribute("autoplay",true);
	video_node.style.display="none";
	var canvas=cc("canvas",video_container);

	
	var stream = null;

	var ctx = canvas.getContext('2d');

	var per=null;

	function video_error(title,msg){
	    if(!per) per=ce("p");controls.ui_root.appendChild(per);
	    per.innerHTML='<p class="alert alert-danger"> <strong>'+title+'</strong>'+msg+'</p>';
	    
	}
	
	
	var errorCallback = function(e) {
	    camview.debug('Capture error : ' + dump_error(e));
	};
	
	video_node.addEventListener("loadeddata", function(){
	    
	    var iv=setInterval(function(){
		if(video_node.videoWidth!==0){
		    canvas.width= video_node.videoWidth;
		    canvas.height=video_node.videoHeight;
		    if(!spectro_win.moving)
			set_box_size();


		    console.log("LOADED ! canvas w = %d video w = %d",canvas.width,video_node.videoWidth);
		    clearInterval(iv);
		}
		
	    }, 100);

	});

	//wlc.trigger('update_spectra', spectra.elements);

	var videoSource = null;
	var iv_cap;
	var iv_video;

	stop.disable(true);
	start.disable(true);

	
	stop.listen("click",function(){
	    
	    if(iv_cap){
		clearInterval(iv_cap);
		clearInterval(iv_video);
	    }
	    
	    if (stream) {
		stream.stop();
		stream=null;
	    }
	    //camview.hide(true);
	    video_options.disable(false);

	    start.disable(false);
	    stop.disable(true);

	    // var types={};
	    // for(var b in template_ui_builders){
	    //     if(ù(tmaster.templates[b])){
	    // 	types[b]={}
	    //     }
	    // }
	    //console.log(JSON.stringify(types));

	});

	navigator.getUserMedia  = (navigator.getUserMedia ||navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);	    
	if (!navigator.getUserMedia) {
	    controls.debug("Oh No! It seems your browser doesn't support HTML5 getUserMedia.");
	    video_options.disable();
	}else{

	    if (typeof MediaStreamTrack === 'undefined' ||
		typeof MediaStreamTrack.getSources === 'undefined') {
		video_options.message("This browser does not support MediaStreamTrack. You cannot choose the input device. Try Chrome.",
				      { title : 'Note', type : 'warning' });
		video_options.disable();
		start.disable(false);
	    } else {
		start.disable(false);
		
		MediaStreamTrack.getSources(function(sourceInfos) {
		    var audioSource = null;
		    

		    var source_options=[];
		    var vi=0;
		    for (var i = 0; i != sourceInfos.length; ++i) {
			var sourceInfo = sourceInfos[i];
			if (sourceInfo.kind === 'audio') {
			    //console.log(sourceInfo.id, sourceInfo.label || 'microphone');
			    //audioSource = sourceInfo.id;
			} else if (sourceInfo.kind === 'video') {
			    vi++;
			    //console.log("VIDEO : " + JSON.stringify(sourceInfo));
			    //console.log(sourceInfo.id, sourceInfo.label || 'camera');
			    source_options.push({ label : sourceInfo.label || ('Camera ' +vi) , value : sourceInfo.id});
			    if(vi===1)videoSource = sourceInfo.id;
			    
			} else {
			    console.log('Some other kind of source: ', sourceInfo);
			}
		    }
		    //console.log("Set dev options   "  + JSON.stringify(source_options));
		    device.set_options(source_options);
		    //sourceSelected(audioSource, videoSource);

		    device.listen("change", function(id){
			videoSource=device.value;
		    });
		    
		});
	    }
	}

	
	function iv_freq(f, freq){
	    console.log("Setting frame iv to : " + 1000.0/freq + " ms");
	    return setInterval(f, 1000.0/freq);
	}
	
	function setup_buffer_loop(){
	    if(è(iv_cap))clearInterval(iv_cap);
	    iv_cap=iv_freq(function(){
		process_frame();
	    }, sampling.value );
	}
	
	sampling.listen("change", function(v){
	    if(stream!=null)
		setup_buffer_loop();
	});
	
	start.listen("click",function(){
	    
	    //camview.hide(false);
	    var hd_constraints = {
		audio: false,
		video: {
		    optional: [{
			sourceId: videoSource
		    }],
		    mandatory: {
			minWidth: 1280,
			minHeight: 720,
		    }
		}
	    };

	    var vga_constraints = {
		audio: false,
		video: {
		    optional: [{
			sourceId: videoSource
		    }],
		    mandatory: {
			minWidth: 640,
			minHeight: 480,
		    }
		}
	    };

	    var constraints = resolution.value==="HD" ? hd_constraints : vga_constraints;
	    
	    console.log("Start video source... ("+resolution.value+")" + JSON.stringify(constraints));

	    
	    navigator.getUserMedia(constraints, function(stream_in) {
		video_node.src = window.URL.createObjectURL(stream_in);
		stream=stream_in;
		
		//console.log("cavas w = %d video w = %d",canvas.width,video_node.innerWidth);
		var iv_delay=200; //integ.value? 100 : 100;

		if (stream) {
		    setup_buffer_loop();
		}
		video_options.disable(true);
		start.disable(true);
		stop.disable(false);
		
	    }, errorCallback);
	});
	
	function get_box(){
	    return [
		spectro_box.x.value,
		spectro_box.y.value,
		spectro_box.w.value,
		spectro_box.h.value
	    ];
	}
	
	function slice_arrays(){
	    var box=get_box();
	    
	    var ddim= dir.value==0 ? box[3] : box[2];
	    //console.log("Slicing [" + bx + ","+ by+ "," + bw+ "," + bh + "]to ddim="+ddim + " dir = " + dir.value);
	    if(ddim < spec_data.r.length){
		
		spec_data.r=spec_data.r.slice(0, ddim);
		spec_data.g=spec_data.g.slice(0, ddim);
		spec_data.b=spec_data.b.slice(0, ddim);
		spec_data.t=spec_data.t.slice(0, ddim);

		//spectro_view.config_range(true, true);
		//console.log("Resized !! ddim=" + ddim + " SL " + spec_data.r.length + " bh " + bh );
	    }
	    if(seq==0)
		set_box_size();
	    
	    process_spectrum();
	    spectro_view.config_range(true, true);
	    
	}
	
	function set_box_size(){
	    var scale=[canvas.clientWidth/canvas.width,canvas.clientHeight/canvas.height];
	    var box=get_box();
	    //console.log("Canvas  " + canvas.clientWidth);

	    //w.widget_div.style.transform="scale("+scale[0]+","+scale[1]+")";

	    spectro_win.widget_div.style.left=scale[0]*box[0]+"px";
	    spectro_win.widget_div.style.top=scale[1]*box[1]+"px";
	    spectro_win.widget_div.style.width=scale[0]*box[2]+"px";
	    spectro_win.widget_div.style.height=scale[1]*box[3]+"px";
	    
	}

	
	for(var be in spectro_box){
	    spectro_box[be].listen("change",function(){
		set_box_size();
		slice_arrays();
		spectro_view.config_range();	    
	    });
	};
	
	// function draw_spectrum_box(){
	// 	if(ù(w)){
	var c5=canvas.width/5.0;

	spectro_win=new widget({ x: 2*c5, y: 5, w : c5, h : canvas.height-5});
	spectro_win.widget_div.style.position="absolute";
	video_container.appendChild(spectro_win.widget_div);
	set_box_size();
	
	dir.listen("change",function(){
	    //console.log("Dir changed !");

	    var b=get_box();
	    
	    spectro_box.w.set_value(b[3]);
	    spectro_box.h.set_value(b[2]);
	    
	    slice_arrays();
	});
	
	spectro_win.listen("resize", function(sz){
	    //console.log("Resize [" +dir.value+"] !! " + JSON.stringify(sz) + " SL " + spec_data.r.length + " bh " + bh);
	    
	    //buf_data=[];
	    //spec_data={r : [], g: [], b : [], t : [] };
	    var scale=[canvas.clientWidth/canvas.width,canvas.clientHeight/canvas.height];
	    
	    spectro_box.x.set_value(Math.ceil(sz.x/scale[0]));
	    spectro_box.y.set_value(Math.ceil(sz.y/scale[1]));
	    spectro_box.w.set_value(Math.ceil(sz.w/scale[0]));
	    spectro_box.h.set_value(Math.ceil(sz.h/scale[1]));
	    
	    slice_arrays();
	    //create_plots();
	    
	});
	//	}

	//console.log("Spectrum box %d %d %d %d",bx,by,bw,bh );

	/*
	  ctx.beginPath();
	  ctx.strokeStyle="orange";
	  ctx.rect(bx,by,bw,bh);
	  ctx.stroke();
	  ctx.closePath();
	*/

	//    }

	var spec_data={r : [], g: [], b : [], t : [] };
	var pr,pg,pb,pt;
	
	// function create_plots(){
	// 	spectro_view.value=[];

	// 	if(have_wlc){
	// 	    pr=spectro_view.add_plot(spec_data.r, global_wlc.calib_func);
	// 	    pg=spectro_view.add_plot(spec_data.g, global_wlc.calib_func);
	// 	    pb=spectro_view.add_plot(spec_data.b, global_wlc.calib_func);
	// 	    pt=spectro_view.add_plot(spec_data.t, global_wlc.calib_func);

	// 	    spectro_view.xlabel="Wavelength (Å)";
	// 	}else{
    	// 	    pr=spectro_view.add_plot_linear(spec_data.r,0,1);
	// 	    pg=spectro_view.add_plot_linear(spec_data.g,0,1);
	// 	    pb=spectro_view.add_plot_linear(spec_data.b,0,1);
	// 	    pt=spectro_view.add_plot_linear(spec_data.t,0,1);

	// 	    spectro_view.xlabel="Wavelength (pixels)";
	// 	}

	// 	spectro_view.ylabel="Intensity (ADU)";
	
	// 	pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
	// 	pg.set_opts({ stroke : "#10ee08", stroke_width : ".5px", label : "Green"});
	// 	pb.set_opts({ stroke : "#0000ff", stroke_width : ".5px", label : "Blue"});
	// 	pt.set_opts({ stroke : "#aa08dd", stroke_width : "1px", label : "Mean"});
	

	
	// }	

	specview.update_plot(spec_data);
	//vc.ui_root.style.position="relative";
	//slice_arrays();
	//create_plots();
	//set_box_size();    
	
	var frid=0;
	var buf_data=[];
	var seq=0;

	function process_spectrum(){

	    //	draw_spectrum_box();
	    
	    var box=get_box();
	    var bx=box[0]*1.0,by=box[1]*1.0,bw=box[2]*1.0,bh=box[3]*1.0;

	    var ddir=dir.value==0 ? false : true; //dir.ui.selectedIndex;
	    //console.log("process spectrum ddir = " + ddir + " dv = " + dir.value);
	    if(ddir){
		for(var i=0;i<bw;i++){
		    spec_data.r[i]=0;
		    spec_data.g[i]=0;
		    spec_data.b[i]=0;
		    for(var j=0;j<bh;j++){
			var idx=((j+by)*canvas.width + (i+bx))*4;
			spec_data.r[i]+= buf_data[ idx ];
			spec_data.g[i]+= buf_data[ idx+1 ];
			spec_data.b[i]+= buf_data[ idx+2 ];
			// if(i===0 && j===0)
			//     console.log(buf_data[ idx ] + ", " + buf_data[ idx+1 ]+ ", " +buf_data[ idx+2 ]);
		    }
		    spec_data.r[i]/=bh*1.0;
		    spec_data.g[i]/=bh*1.0;
		    spec_data.b[i]/=bh*1.0;
		    
		    spec_data.t[i]=(spec_data.r[i]+spec_data.g[i]+spec_data.b[i])/3.0;
		}
	    }else{
		for(var i=0;i<bh;i++){
		    spec_data.r[i]=0;
		    spec_data.g[i]=0;
		    spec_data.b[i]=0;

		    for(var j=0;j<bw;j++){
			var idx=Math.floor(((i+by)*canvas.width + (j+bx))*4);
			spec_data.r[i]+= buf_data[idx];
			spec_data.g[i]+= buf_data[idx+1];
			spec_data.b[i]+= buf_data[idx+2];
			// if(i===0 && j===0)
			//     console.log(buf_data[ idx ] + ", " + buf_data[ idx+1 ]+ ", " +buf_data[ idx+2 ]);
		    }
		    spec_data.r[i]/=bw*1.0;
		    spec_data.g[i]/=bw*1.0;
		    spec_data.b[i]/=bw*1.0;
		    
		    spec_data.t[i]=(spec_data.r[i]+spec_data.g[i]+spec_data.b[i])/3.0;
		}
		
		//console.log("SPEC["+JSON.stringify(spec_data.r)+"]");
		
	    }

	    if(spectro_view.value!==undefined){

		if(spectro_view.value.length>=4){
		    spectro_view.value[0].data=spec_data.r.slice();
		    spectro_view.value[1].data=spec_data.g.slice();
		    spectro_view.value[2].data=spec_data.b.slice();
		    spectro_view.value[3].data=spec_data.t.slice();
		}
	    }

	    
	    if(frid===0)
		spectro_view.config_range(true, true);
	    else{
		spectro_view.config_range(false, true);
		//spectro_view.redraw();
	    }
	    frid++;
	}
	
	function process_frame(){
	    //console.log("draw spectrum Canvas w,h %d %d bufferL=%d" ,canvas.width,canvas.height,buf_data.length);

	    ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
	    ctx.drawImage(video_node, 0, 0);
	    
	    var buf = ctx.getImageData(0,0,canvas.width,canvas.height);
	    var inf=integ_nf.value*1.0;
	    //console.log("process frame in " + JSON.stringify(box));
	    
	    if(integ.value>0){
		
		if(seq>=inf){
		    for(var i=0;i<buf_data.length;i++) buf_data[i]/=inf;
		    seq=0;
		}else{
		    if(seq===0){
			buf_data=[];
			for(var i=0;i<buf.data.length;i++) buf_data[i]=buf.data[i];
		    }else
			for(var i=0;i<buf.data.length;i++) buf_data[i]+=buf.data[i];
		    //console.log("Integ " + seq + "/" + integ_nf.value);
		    seq++;
		    //draw_spectrum_box();
		    return;
		}
	    }else{
		buf_data=buf.data;
	    }
	    
	    process_spectrum();
	}
	
	ok(vc.ui);
    }
    
    
})
