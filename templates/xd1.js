({
    name:"XD-1",
    subtitle:"FITS viewer",
    // toolbar:{
    // 	ui_opts:{
    // 	    toolbar_classes:[ "navbar-fixed-top navbar-inverse" ]
    // 	}
    // },
    ui_opts:{
	icon:"/icons/xd1/discovery1_small.png",
	child_view_type:"tabbed",
	//root:true,
	//tabs_on_name:true,
	root_classes:[],
	child_classes:[],
	//name_node:"h3",
	//toolbar_brand:true
    },
    elements:{
	objects:{
	    name:"FITS images",
	    type:"object_editor",
	    ui_opts:{
		root_classes:[ "col-md-12" ],
		fa_icon:"folder"
	    },
	    elements:{}
	},
	drawing:{
	    name:"Views",
	    ui_opts:{
		child_view_type:"divider",
		root_classes:[  ],
		child_classes:[  ],
		icon:"/icons/xd1/stars.jpg",
		render_name:false
	    },
	    elements:{
		views:{ name:"GL Views",
					    ui_opts:{ child_view_type:"tabbed",
						      render_name:false,
						      root_classes:[ "col-md-4 col-xs-12 scrolling" ] },
					    elements:{} },
				    screen:{ ui_opts:{ root_classes:[ "col-md-8" ],
						       child_classes:[  ],
						       item_classes:[  ] } } } },
	       demo:{ name:"Multiband demos",
		      subtitle:"Loads images from different wavelength bands in multiple color layers of the same display.",
		      type:"demo_multilayer",
		      ui_opts:{ root_classes:[ "container-fluid" ],
				child_classes:[ "row" ],
				name_classes:[  ],
				name_node:"h2",
				icon:"/icons/xd1/multi-layer.svg" },
		      elements:{ cnx:{ ui_opts:{ label:true,
						 root_classes:[ "container" ],
						 sliding:true,
						 slided:false },
				       name:"Websocket",
				       tip:"Websocket connexion to a sadira server",
				       type:"socket" },
				 demos:{ name:"Choose an image set :",
					 ui_opts:{ child_classes:[ "action_box vertical" ],
						   root_classes:[ "container" ] },
					 elements:{ catseye:{ name:"The Cat's Eye nebula (old HST data), 4 filters.",
							      type:"action",
							      ni:4,
							      demo_name:"catseye",
							      ui_opts:{ root_classes:[  ],
									item_classes:[ "btn btn-info btn-lg btn-block" ] } },
						    loiano:{ name:"Star field taken from Loiano observatory, 4 filters.",
							     type:"action",
							     ni:4,
							     demo_name:"loiano",
							     ui_opts:{ item_classes:[ "btn btn-info btn-lg btn-block" ] } },
						    M42:{ name:"Orion nebula as seen by Hubble, in red and infrared (2 filters).",
							  type:"action",
							  ni:2,
							  demo_name:"M42",
							  ui_opts:{ item_classes:[ "btn btn-info btn-lg btn-block" ] } } } } } },
	       about:{ type:"html",
		       url:"/XD-1/about.html",
		       ui_opts:{ name_node:"h1",
				 name_classes:[  ],
				 root_classes:[ "container-fluid" ],
				 item_classes:[ "container" ],
				 icon:"/icons/xd1/discovery1_small.png" },
		       name:"About...",
		       subtitle:"A multi-document, multi-layer FITS image viewer." } },
    key:"xd1",
    widget_builder:function (ok, fail){
	var xd=this;
	
	console.log("Hello xd1 constructor on node " + xd.xdone_node );
	
	//xd.ui_root.removeChild(xd.ui_name);
	
	var server_root=xd.server_root;
	var xdone_node=xd.xdone_node;

	//    var bar_node  = cc("header", xd.xdone_node); bar_node.id="gfx_bar"; 
	//    var gfx_node=cc("div",xdone_node); gfx_node.id="gfx";


	//for(var p in xd.elements ) console.log("xdp = " + p);
	var mwl_demo=xd.get('demo');

	var user_objects=xd.elements.objects;
	var drawing_widget=xd.elements.drawing.elements.screen;

	drawing_widget.ui_root.style.overflow="hidden";

	user_objects.xd=xd;

	var drawing_node=cc("div", drawing_widget.ui_root);
	drawing_node.add_class("drawing_node");
	//drawing_widget.ui_root.

	
	

	
	
	xd.listen("view_update", function(){
	    //console.log("XD1 view update !");
	});
	
	//    console.log("drawing node is " + drawing_node);
	mwl_demo.xd=xd;

	/*
	  xd.ui_childs.divider.listen("drag", function(){
	  this.update();
	  });
	*/

	if(è(xd.elements.drawing.ui_childs.divider))
	    xd.elements.drawing.ui_childs.divider.listen("drag_end", function(){
		xd.gl_views.forEach(function(v){
		    v.fullscreen(false);
		});
	    });
	
	
	var views=xd.elements.drawing.elements.views;
	
	xd.gl_views=[];
	xd.selected_view=null;
	
	xd.select_view=function(v){
	    if(xd.selected_view!=null){
		xd.selected_view.glscreen.ui.style.display="none";
	    }
	    xd.selected_view=v;
	    xd.selected_view.glscreen.ui.style.display="block";
	}

	views.listen("element_selected", function(e){
	    //console.log("Selected !! " + e.name);
	    xd.select_view(e);
	});
	
	
	xd.create_view=function(cb, opts){
	    create_widget("gl_multilayer").then(function(glm){
	    
	    
		//glm.parent=views;
		//var glmui = create_ui({}, glm);
		
		glm.set_drawing_node(drawing_node);
		
		glm.listen("gl_ready", function(){
		    
		    var iv=setInterval(function(){
			var w=drawing_widget.ui_root.clientWidth;
			//console.log("W=" + drawing_widget.ui_root.clientWidth);
			if(w>0){
			    
			    glm.trigger("view_update");
			    if(è(xd.elements.drawing.ui_childs.divider))
				xd.elements.drawing.ui_childs.divider.update();
			    clearInterval(iv);
			}
			//drawing_node.style.height=drawing_widget.ui_root.clientWidth+"px";
		    }, 200);
		    
		    
		    
		    cb(null,glm);
		});
		
		
		if(è(opts))
		    if(è(opts.name))
			glm.set_title(opts.name);
		
		
		var i=0; var vn=0;
		
		while( typeof views.elements["IV"+vn] != 'undefined'){
		    //console.log("Exists : " + views.elements["IV"+vn]);
		    vn++;
		    
		}
		
		views.elements["IV"+vn]=glm;
		views.add_child(glm);
		xd.gl_views.push(glm);
		
		xd.select_view(glm);
	    
	    });
	}
	
	xd.create_image_view=function(image, cb, opts){

	    xd.create_view(function(error, glm){
		if(error!=null) return cb(error);
		glm.create_layer(image).then(function(l){


		    
		    //glm.set_title(image.name);
		    cb(null,glm);
		}).catch(function(f){
		    cb(f);
		});

	    }, opts);

	}

	ok();
	
	//d.update();

	//console.log("Adding xdroot :  " + xd.ui_root);
	//bar_node.appendChild(xd.ui_root);
	//return xd.ui_root;
    }
})
