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

template_ui_builders.glscreen=function(ui_opts, gls){

    gls.w=0;
    gls.h=0;
    gls.bbig=null;

    var ui=gls.canvas = ce("canvas"); ui.id="glscreen";
    
    var mouseon = false;
    var mouse_start={};
    var t_start=[];

    new_event(gls,"resize");
    new_event(gls,"dragging");
    new_event(gls,"drag_end");
    new_event(gls,"drag_begin");
    new_event(gls,"wheel");
    new_event(gls,"cursor_move");

    function get_screen_position(e){
	var screen_pix=[];
	if(e.offsetX) screen_pix=[e.offsetX, e.offsetY];
	else if(e.layerX)screen_pix=[e.layerX, e.layerY];
	
	return screen_pix;
    }
    
    ui.addEventListener('mousemove', function(e){
	gls.trigger("cursor_move",{ cursor : get_screen_position(e)});
    }, true);

    ui.addEventListener('mousedown', function(e) {
	e.preventDefault();
	//var lastX = e.pageX;
	var start_pos = get_screen_position(e);
	//document.documentElement.className += ' dragging';
	document.documentElement.addEventListener('mousemove', moveHandler, true);
	document.documentElement.addEventListener('mouseup', upHandler, true);

	gls.trigger("drag_begin",{ cursor : get_screen_position(e), from : start_pos});

	function moveHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            // var deltaX = e.pageX - lastX;
            // lastX = e.pageX;
            // leftPercent += deltaX / parseFloat(document.defaultView.getComputedStyle(xdone_node).width) * 100;
	    gls.trigger("dragging",{ cursor : get_screen_position(e), from : start_pos});
	}
	
	function upHandler(e) {
            e.preventDefault();
            e.stopPropagation();
            document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
            document.documentElement.removeEventListener('mousemove', moveHandler, true);
            document.documentElement.removeEventListener('mouseup', upHandler, true);

	    gls.trigger("drag_end",{ cursor : get_screen_position(e), from : start_pos});
	}
    }, false);


    addWheelListener(ui, function(e){
	gls.trigger("wheel",e);
    });
    
    gls.webgl_start=function(options, cb){
	var gl=gls.gl=ui.getContext('experimental-webgl');
	
	if(!gl)
	    return cb("WebGL support lacking on your browser, you cannot use this application, sorry!");
	
	var available_extensions = gl.getSupportedExtensions();
	var floatTextures = gl.getExtension('OES_texture_float');

	if (!floatTextures)
	    return cb('WebGL is working, but it does not provide floating point texture on your system !\n\n :< \n\nTry with another video device &| drivers!');
	gls.resize=function(w,h){
	    ui.width=w;
	    ui.height=h;
	    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	    gls.trigger("resize", { w : w, h: h} );
	    console.log("resize gl " + gl.drawingBufferWidth+","+ gl.drawingBufferHeight);

	}
	

	cb(null,gl);
    }
    

    return ui;
}
