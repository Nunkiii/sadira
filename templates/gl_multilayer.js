({
    name:"GL Multilayer",
    events:[ "gl_ready" ],
    ui_opts:{
	child_view_type:"pills",
	render_name:false,
	close:true,
	root_classes:[ "" ],
	child_classes:[ "" ]
    },
    usi : {
	elements:{
	    glscreen : {
		type : "glscreen"
	    }
	}
    },
    elements:{
	geometry:{ tip:"View geometry",
		   subtitle:"Change GL view's geometrical parameters",
		   type:"geometry",
		   ui_opts:{ root_classes:[  ],
			     name_node:"h4" } },
	cursor:{
	    subtitle:"Display cursor position information",
	    type:"cursor_info",
	    ui_opts:{
		fa_icon:"bullseye",
		name_node:"h4"
	    },
	    elements : {

	    }
	},
	options:{ type:"gl_options",
		  subtitle:"GL display options",
		  ui_opts:{ fa_icon:"list",
			    name_node:"h4" } },
	layers:{ name:"Image Layers",
		 subtitle:"Configure this view's image layers.",
		 intro:"<p>Up to four image layers can be displayed using a unique floating point RGBA texture as data input.</p><p> Geometry and color computations are done for every screen pixel using an OpenGL shader program using the 4-band floating-point texture and other small pseudo-textures containing the geometrical, colormap and other parameters needed for the final pixel color computation.</p><p> All the texture data is pre-loaded in the GPU RAM and parallel processed by the many potential GPU cores (thousands on high end hardware), resulting in an incredibly fast rendering of the rather complex XD-1 image pipeline.</p>",
		 ui_opts:{ root_classes:[  ],
			   child_classes:[ "row" ],
			   child_view_type:"tabbed",
			   render_name:true,
			   fa_icon:"film",
			   name_node:"h4" },
		 elements:{} },
	iexport:{ name:"Export image",
		  intro:"<p>The WebGL canvas content is encoded as a  base64 string embedded to an html image attached to a new browser tab/window.</p><p>This is the most straight way to produce a PNG image from an HTML canvas.",
		  subtitle:"Save current GL view as a bitmap.",
		  ui_opts:{ root_classes:[  ],
			    item_classes:[  ],
			    name_node:"h4" },
		  elements:{ topng:{ name:"Save view to PNG",
				     type:"action" } } } },
    key:"gl_multilayer",
    widget_builder:function (ok,fail){
	
	var glm=this;
	var ui_opts=this.ui_opts;
	var glscreen=glm.glscreen=glm.usi.elements.glscreen;
	
	// if(ù(glscreen)){
	//     glscreen=glm.glscreen=tmaster.build_template("glscreen"); 
	//     create_ui({}, glscreen,0 );
	// }

	glm.canvas=glscreen.canvas;
	var ctx2d=glm.ctx2d=glscreen.canvas2d.getContext("2d");
	var server_root=è(glm.server_root) ? glm.server_root : "";
	var layer_objects=glm.elements.layers;
	
	
	var geo=glm.elements.geometry.elements;

	var tr=glm.tr=geo.translation;
	var zm=glm.zm=geo.zoom; 
	var ag=glm.ag=geo.rotation.elements.angle; 
	var rc=glm.rc=geo.rotation.elements.center;

	var topng=glm.elements.iexport.elements.topng;
	
	var interp_cmap=glm.get("interp_cmap");



	
	// if(typeof glm.drawing_node === 'undefined'){
	// 	console.log("No drawing node specified...");
	// 	glm.drawing_node=glm.ui_root;
	// }
	//
	
	glm.listen("close", function(){
	    console.log("GLM close !");
	    glm.drawing_node.removeChild(glscreen.ui);
	    delete glm;
	});

	
	
	glm.pvals=[];
	glm.maxlayers=4;
	glm.layers=[];
	//glm.layer_enabled=[];
	//glm.p_layer_range=[];
	
	var cursor=glm.elements.cursor; 
	var options_tpl=glm.elements.options; 

	var layer_ci=[];
	var cil = cursor.elements.layers;
	var i=0;
	for(var l in cil.elements){
	    layer_ci[i]=cil.elements[l];
	    i++;
	};
	/*
	for(var l=0;l<4;l++){
	layer_ci[l]=tmaster.build_template("cursor_layer_info"); 
	    var lui=create_ui({},layer_ci[l]);
	    cil.ui_childs.add_child(layer_ci[l], lui);
	    lui.add_class("disabled");
	}
*/

	var layer_enabled = glm.layer_enabled= new Int32Array([0,0,0,0]);
	
	glm.p_vals=new Float32Array(4*8);
	glm.p_rotcenters=new Float32Array(4*2);
	glm.p_layer_range=new Float32Array(4*2);
	glm.ncolors=new Int32Array([0,0,0,0]);
	var switches=glm.switches=new Int32Array([interp_cmap.value===true ? 1:0,0,0,0]);    
	glm.cmap_texdata = new Float32Array(16*256);
	glm.cmap_fracdata = new Float32Array(16*256);



		function create_shader(gldev, shader_source, type) {
	    
	    var shader;
	    
	    if (typeof type == 'undefined')
		shader = gldev.createShader(gldev.FRAGMENT_SHADER);
	    else
		if (type == "x-shader/x-fragment" || type == "fragment") {
		    shader = gldev.createShader(gldev.FRAGMENT_SHADER);
		} else if (type == "x-shader/x-vertex" || type == "vertex") {
		    shader = gldev.createShader(gldev.VERTEX_SHADER);
		} else {
		    shader = gldev.createShader(gldev.FRAGMENT_SHADER);
		}
	    
	    gldev.shaderSource(shader, shader_source);
	    gldev.compileShader(shader);
	    
	    if (!gldev.getShaderParameter(shader, gldev.COMPILE_STATUS)) {
		alert(gldev.getShaderInfoLog(shader));
		return null;
	    }
	    
	    return shader;
	}
	
	
	function get_shader(gldev, script_node) {
	    
	    if (typeof script_node == 'undefined') {
		console.log("Shader-script dom-element ["+""+"] not found!");
		return null;
	    }
	    var str = "";
	    
	    var k = script_node.firstChild;
	    
	    while (k) {
		if (k.nodeType == 3) {
		    str += k.textContent;
		}
		k = k.nextSibling;
	    }
	    
	    //    str=script_node.innerHTML;
	    //    console.log("Got shader code ["+str+"]");
	    return create_shader(gldev, str, script_node.type); 
	    
	}


	
	glscreen.webgl_start({}, function(error, gl){
	    
	    if(error){
		alert(error);
		cb(error);
		return;
	    }

	    //console.log("Webgl started ok!");
	    
	    glm.gl=gl;

	    
	    interp_cmap.listen('change', function(sw){
    		glm.switches[0]=sw ? 1 : 0;
		//var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
		gl.uniform4iv(glm.switches_loc, glm.switches);
		glm.render();
	    });
	    
	    
	    tr.listen("change",function(){
		//console.log("TR changed ! " + this.value[0]);
		gl.uniform2fv(glm.tr_loc, this.value);
		glm.render();
	    });
	    
	    zm.listen("change",function(){
		update_zoom();
	    });

	    ag.listen("change",function(){
		update_angle();
		glm.render();
	    });
	    
	    rc.listen("change",function(){
		gl.uniform2fv(glm.rotcenter_loc, rc.value);
		glm.render();
	    });
	    
	    glm.set_drawing_node=function(node){
		glm.drawing_node=node;
		glm.drawing_node.appendChild(glscreen.ui);

		glm.listen("view_update", function() {
		    //console.log("glm view update");
		    glm.glscreen.resize(glm.drawing_node.clientWidth, glm.drawing_node.clientHeight);
		    glm.glscreen.canvas.focus();
		    glm.render();
		    //glm.ui_childs.add_child(glscreen.ui, glscreen);
		    //var ov={w:0,h:0};//
		    //var ov=get_overflow(glm.drawing_node);
		    //var sz={w: parseFloat(ov.sty.width)-ov.w, h: parseFloat(ov.sty.height)-ov.h};
		    
		    //var sz={ w : glm.drawing_node.clientWidth, h: glm.drawing_node.clientHeight};
		    //glscreen.resize(sz.w, sz.h);
		});
		
		topng.listen("click", function(){
		    var w=window.open(glm.glscreen.canvas.toDataURL("image/png"));
		    //w.document.write("<img src='"+d+"' alt='from canvas'/>");
		    
		});

		
	    }

	    glm.update_layer_ranges=function(){
		var w=glscreen.canvas.clientWidth;
		var h=glscreen.canvas.clientHeight;
		
		for(var l=0;l<glm.layers.length;l++){
		    var lay=glm.layers[l];
		    if(typeof lay!='undefined'){
			glm.p_layer_range[2*lay.id]=lay.width*1.0/glm.w;
			glm.p_layer_range[2*lay.id+1]=lay.height*1.0/glm.h;		
		    }
		}
		//console.log("setting new range " + JSON.stringify(glm.p_layer_range));
		
    		var rangeLocation = gl.getUniformLocation(glm.program, "u_layer_range");	
		gl.uniform2fv(rangeLocation, glm.p_layer_range);
	    }
	    

	    function update_angle(){
		var alpha=1.0*glm.ag.value;
		gl.uniform1f(glm.angle_loc, alpha);
		glm.g_rmg=[[Math.cos(alpha),Math.sin(alpha)],[-1.0*Math.sin(alpha),1.0*Math.cos(alpha)]];
		glm.g_rmgi=[[glm.g_rmg[0][0],-glm.g_rmg[0][1]],[-glm.g_rmg[1][0],glm.g_rmg[1][1]]];
	    }
	    
	    function update_zoom(){
		glm.gl.uniform1f(glm.zoom_loc, zm.value);
		zm.set_value(Math.floor(zm.value*1000.0)/1000);
		zm.ui.step=Math.floor(zm.value*100)/1000; 
		glm.render();
		
	    }

	    glscreen.listen("cursor_move", function(e){
		
		var screen_pos=[e.cursor[0]+.5,glscreen.canvas.clientHeight-e.cursor[1]-.5];
		var cursor_size=[40, 20]; //pixels...

		//pointer_info.innerHTML="Screen : (" +screen_pos[0]+"," +screen_pos[1] +") "; 
		cursor.elements.position.elements.screen.set_value(screen_pos);
		//console.log("clear " + glscreen.canvas.clientWidth + " " + glscreen.canvas.clientHeight);
		ctx2d.clearRect(0,0,glscreen.canvas.clientWidth, glscreen.canvas.clientHeight);
		
		for(var l=0;l<glm.layers.length;l++)
		    if(glm.layer_enabled[l])
			glm.layers[l].update_pointer_info(e.cursor, layer_ci[l]);

		//var ctx2d=this.glm.ctx2d;
		/*
		  var tcenter=e.cursor;
		  
		  ctx2d.beginPath();
		  ctx2d.moveTo(tcenter[0]-cursor_size[0],tcenter[1]);
		  ctx2d.lineTo(tcenter[0]+cursor_size[0],tcenter[1]);
		  ctx2d.lineWidth = 2;
		  ctx2d.strokeStyle = 'red';
		  ctx2d.stroke();
		  ctx2d.closePath();
		  

		  ctx2d.beginPath();
		  ctx2d.moveTo(tcenter[0],tcenter[1]-cursor_size[1]);
		  ctx2d.lineTo(tcenter[0],tcenter[1]+cursor_size[1]);
		  ctx2d.lineWidth = 2;
		  ctx2d.strokeStyle = 'red';
		  ctx2d.stroke();
		  ctx2d.closePath();
		*/
	    });
	    
	    
	    glscreen.listen("wheel", function(e){
		var delta=e.deltaY;
		//console.log("wheel : " + delta);
		
		(delta > 0)? zm.value-=zm.value/10.0 : zm.value+=zm.value/10.0;
		zm.set_value();
		update_zoom();	    
		
	    });
	    
	    glscreen.listen("resize", function(sz){
		if(ù(glm.program)) return;
		var loc = gl.getUniformLocation(glm.program, "u_screen");
		gl.uniform2f(loc, sz.w,sz.h );
		glm.render();
	    });

	    var trstart;

	    glscreen.listen("drag_begin", function(e){
		trstart=[tr.value[0], tr.value[1]];
	    });

	    glscreen.listen("dragging", function(e){
		var mouse_delta=[e.cursor[0]-e.from[0],e.cursor[1]-e.from[1]];
		//console.log("canvas dragging... delta " + JSON.stringify(mouse_delta));

		tr.value[0]=trstart[0]-mouse_delta[0]/zm.value;
		tr.value[1]=trstart[1]+mouse_delta[1]/zm.value;
		
		tr.set_value();
		gl.uniform2fv(glm.tr_loc, tr.value);
		glm.render();
		
	    });
	    


	    glm.render=function () {
		var nl; for(nl=0;nl<glm.layers.length;nl++) if(glm.layer_enabled[glm.layers[nl].id]) break;
		if(nl===glm.layers.length) return;
		
		var positionLocation = gl.getAttribLocation(glm.program, "vPosition");

		//console.log("Render vp " + glm.drawing_node.clientWidth + " , " +  glm.drawing_node.clientHeight);
		//gl.viewport(0, 0, glm.drawing_node.clientWidth, glm.drawing_node.clientHeight);

		
		//window.requestAnimationFrame(render, canvas);
		
		gl.clearColor(1.0, 1.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		ctx2d.clearRect(0,0,glm.canvas.clientWidth,glm.canvas.clientHeight);
		
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		

		for(var l=0;l<glm.layers.length;l++)
		    if(glm.layer_enabled[glm.layers[l].id]){
			if(glm.layers[l].update_geometry!==undefined)
			    glm.layers[l].update_geometry();
			else
			    console.log("Strange NO UPDATE GEO !");
		    }
		
		
		//ctx2d.fillStyle = "#FF0000";
		//ctx2d.fillRect(0,0,150,75);
		/*
		  p =rmg*((gl_FragCoord.xy-u_screen/2.0)/u_zoom+u_tr-u_rotc)+u_rotc;
		  p = p/lzoom+trl-u_rotcenters[l];
		  p = (rm*p+u_rotcenters[l])/u_resolution+u_layer_range[l]/2.0;
		*/

	    }
	    
	    glm.fullscreen=function(on){


		

		
 		//glm.infs=false;
 	    }
	    
	    
	    function create_vertex_buffer(){
		
		glm.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, glm.buffer);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
		
		gl.bufferData(
		    gl.ARRAY_BUFFER, 
		    new Float32Array([
			    -1.0, -1.0,
			1.0, -1.0, 
			    -1.0,  1.0, 
			    -1.0,  1.0, 
			1.0, -1.0, 
			1.0,  1.0]), 
		    gl.STATIC_DRAW
		);
	    }

	    
	    //var glsl_loc="./"+server_root+"/xd1.glsl";
	    var glsl_loc="/apps/xd1/gl/xd1.glsl";
	    //console.log("Downloading glsl [" + glsl_loc+"]" );
	    xhr_query(glsl_loc, function (error, shader_src) {
		
		if(error!=null){
		    console.log("Error downloading XD1 shader code " + error);
		    glm.message("Error while downloading XD1 shader code : "+error, { type : "danger"});
		    return;
		}
		
		//console.log("GLM linking programs...");
		
		var texture = gl.createTexture();
		var cmap_texture = gl.createTexture();
		var cmap_frac = gl.createTexture();
		
		glm.texture=texture;
		glm.cmap_texture=cmap_texture;
		glm.cmap_frac=cmap_frac;
		
		var program = glm.program=gl.createProgram();
		var xd1_fragment_shader = create_shader(gl, shader_src);    

		//Simplest vertex shader for the unique "static" screen box : all geometry is done in the fragment shader.
		var vertex_shader_src="attribute vec4 vPosition; void main() {gl_Position = vPosition;}";
		
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertex_shader_src);
		gl.compileShader(vertexShader);
		
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, xd1_fragment_shader);
		
		gl.linkProgram(program);
		gl.useProgram(program);
		
		glm.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
		glm.le_loc=gl.getUniformLocation(program, "u_layer_enabled");	
		glm.zoom_loc=gl.getUniformLocation(program, "u_zoom");
		glm.angle_loc=gl.getUniformLocation(program, "u_angle");
		glm.tr_loc=gl.getUniformLocation(program, "u_tr");
		glm.rotcenter_loc=gl.getUniformLocation(program, "u_rotc");
		glm.switches_loc=gl.getUniformLocation(program, "u_switches");

		
		gl.uniform4iv(glm.le_loc, layer_enabled);
		gl.uniform4iv(glm.switches_loc, switches);
		
		gl.uniform2f(glm.resolutionLocation, glscreen.canvas.clientWidth, glscreen.canvas.clientHeight);
		gl.uniform1f(glm.zoom_loc, zm.value );
		// gl.uniform1f(angle_loc, ag.value);
		gl.uniform2fv(glm.tr_loc, tr.value);
		gl.uniform2fv(glm.rotcenter_loc, rc.value);
		
		update_angle();

		create_vertex_buffer();

		glm.trigger("gl_ready");


		console.log("GLM : program ready");

		//cb(null,glm);
	    });

	    glm.get_layer=function(lid){
		for(var l=0;l<glm.layers.length;l++)
		    if(glm.layers[l].id === lid) return l;
		return undefined;
	    }
	    
	    glm.delete_layer=function(lid){
		var lay=glm.get_layer(lid);
		
		if(ù(lay)) {
		    console.log("No such layer " + lid);
		    return;
		}
		
		glm.layer_enabled[lid]=0;
		//var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
		gl.uniform4iv(glm.le_loc, glm.layer_enabled);
		//glm.nlayers--;
		glm.layers.splice(lay,1);
		
		layer_ci[lid].ui_root.add_class("disabled");
		
		console.log("After delete : NLAYERS = " + glm.layers.length);
		
		glm.trigger("view_update");

	    }

	    glm.create_layer=function(image, lid){
		var pro = new Promise(function(oui, non){
		    
		    if(ù(lid)){
			lid=glm.maxlayers+1;
			for(var l=0;l<4;l++)
			    if(glm.layer_enabled[l]===0){
				lid=l; break;
			    }
		    }
		    
		    if(lid<0 || lid>=glm.maxlayers){
			alert("["+lid+"]All four layers already active, please remove one before adding a new one.");
			return non("No more layers available!");
		    }
		    
		    var ex_lay=glm.get_layer(lid);
		    if(è(ex_lay)){
			glm.layers[ex_lay].trigger("close");
			//glm.delete_layer(lid);
		    }
		    
		    //console.log("Creating new layer at position " + lid);
		    
		    create_widget("gl_image_layer", layer_objects).then(function(layer){
			
			//var lay_ui=create_ui({}, layer, 0);
			layer.xd1_attach(glm, lid);
			
		    
			layer.listen("name_changed", function(n){
			    //console.log("Layer name changed");
			    layer_ci[this.id].subtitle=n;
			    layer_ci[this.id].set_title("Layer "+this.id);
			});
			
	    		
			layer.set_title(image.name);
			
			layer.get('cmap').listen("colormap_changed", function(cm){
			    layer_ci[lid].cmdiv.style.background=cm.css_color_gradient;
			});
			
			
			
			//layer.container=layer_objects.ui_childs;
			layer_objects.add_child(layer);
		    //layer.view_update_childs();
			
			glm.layers.push(layer);
			glm.layer_enabled[lid]=1;
			//var le_loc=gl.getUniformLocation(glm.program, "u_layer_enabled");
			gl.uniform4iv(glm.le_loc, glm.layer_enabled);
			
			
			layer_ci[lid].ui_root.remove_class("disabled");
			
			//glm.nlayers++;

			
			if(typeof image != 'undefined'){
			    layer.setup_image(image);
			}
			
			glm.trigger("view_update");
			//layer.get('cmap').trigger("colormap_changed", layer.cmap);

			oui(layer);
		    });   
		    //return layer;
		    
		});
		
		return pro;
	    };
	});
	
	ok();
	//return drawing_node;
	
    }
})
