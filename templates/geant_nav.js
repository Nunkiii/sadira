({
    name:"Sym nav",
    subtitle:"geant4 sym data view",
    ui_opts:{
	fa_icon : "globe",
	//name_classes:[ "vertical_margin" ],
	child_view_type:"tabbed"
    },
    elements:{
	source:{ type:"data_source" },
	browser:{ type:"data_nav", name : "Data browser" },
	particles:{ name:"Particles 3D",
		    ui_opts:{ root_classes:"container-fluid",
			      item_bottom:true,
			      item_classes:"container-fluid" },
		    elements:{ toolbar:{ ui_opts:{},
					 elements:{ enable:{ type:"bool",
							     ui_opts:{ type:"edit",
								       label:true },
							     name:" Enable " } } } },
		    widget_builder:function (ok, fail){
			var particles=this;
			
			
			var nav=this.parent.get('browser');
			var filters=nav.get('filters');
		    var enable=particles.get("enable");
		    
		    filters.listen('update',function(f){
			particles.set_data(nav.dimensions[f.column].top(Infinity));
		    });
		    
		    var scene = new THREE.Scene();
		    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
		    
		    var renderer = new THREE.WebGLRenderer();
		    renderer.setSize( window.innerWidth/2, window.innerHeight/2 );

		    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		    var cube = new THREE.Mesh( geometry, material );

		    var in_material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		    });

		    var out_material = new THREE.LineBasicMaterial({
			color: 0xff0000
		    });
		    
		    
		    
		    this.set_data=function(data){
			//console.log("Set data ... " + JSON.stringify(data[0]));
			
			for( var i = scene.children.length - 1; i >= 0; i--) {
			    obj = scene.children[i];
			    scene.remove(obj);
			}
			
			//lnp.vertices=[];
			data.forEach(function(d, i){
			    if(i>200) return;
			    var lnp = new THREE.Geometry();
			    var line = new THREE.Line(lnp, in_material);
			    lnp.vertices.push(new THREE.Vector3(0, 0, 0));
			    lnp.vertices.push(new THREE.Vector3(d[5], d[6], d[7]));
			    scene.add( line );

			    lnp = new THREE.Geometry();
			    line = new THREE.Line(lnp, out_material);
			    lnp.vertices.push(new THREE.Vector3(0, 0, 0));
			    lnp.vertices.push(new THREE.Vector3(d[8], d[9], d[10]));
			    scene.add( line );
			    

			});
			
			render();
		    }
		    
		    
		    //lnp.vertices.push(new THREE.Vector3(-10, -10, -10));
		    //lnp.vertices.push(new THREE.Vector3(0, 10, 0));
		    //lnp.vertices.push(new THREE.Vector3(10, 10, 10));
		    
		    //scene.add( cube );
		    
		    
		    camera.position.z = 10;
		    
		    var render = function () {
			if(enable.value===true){
			    requestAnimationFrame( render );
			    
			    //scene.rotation.x += 0.001;
			    scene.rotation.y += 0.001;
			    //scene.rotation.z += 0.01;
			    
			    renderer.render(scene, camera);
			}
		    };

		    enable.listen('change', function(on){
			if(on)
			    render();
			
		    });
		    
		    

	  ok(renderer.domElement);
	  
      }
	      }
	   },
   widget_builder:function (ok, fail){
       
       var nav=this.get('browser');
       var source=this.get('source');
       nav.set_data_source(source);
       var binsize=1;
	    
	    nav.listen('crossfilter_ready', function(){

		nav.add_dimension(
		    {
			column : 'EVT_ID',
			name : "Event ID",
			//plot : "pie",
			group_func : function(d) {
			    return d;//Math.floor(d/binsize)*binsize;
			},
			filter_func : function(d) {
			    return true; //d>0;
			},
		    });

		
		nav.add_dimension(
		    {
			column : 'PARTICLE_ID',
			name : "Particle type",
			plot : "pie",
			group_func : function(d) {
			    return d;//Math.floor(d/binsize)*binsize;
			},
			filter_func : function(d) {
			    return true; //d>0;
			},
		    });

		nav.add_dimension(
		    {
			column : 'VOLUME_ID',
			name : "Volume type",
			plot : "pie",
			group_func : function(d) {
			    return d;//Math.floor(d/binsize)*binsize;
			},
			filter_func : function(d) {
			    return true;
			},
			
		    });

		
		nav.add_dimension(
		    {
			column : 'E_DEP',
			name : "Deposited energy",
			plot : "vector",
			group_func : function(d) {
			    return Math.floor(d/binsize)*binsize;
			},
			//filter_func : function(d) {
			    //console.log("Filter d=" + d);
			    //return d>0;
			//},
			//y_range : [0,12000]
			
		    });

		
		// nav.add_dimension(
		//     {
		// 	column : 'X_ENT', name : "X Ent",
		// 	group_func : function(d) {
		// 	    return Math.floor(d/30)*30;
		// 	},
		// 	//y_range : [0,100]
			
		//     }
		// );

		// 		nav.add_dimension(
		//     {
		// 	column : 'Y_ENT', name : "Y Ent",
		// 	group_func : function(d) {
		// 	    return Math.floor(d/30)*30;
		// 	},
		// 	//y_range : [0,100]
			
		//     }
		// );

		// 		nav.add_dimension(
		//     {
		// 	column : 'Z_ENT', name : "Z Ent",
		// 	group_func : function(d) {
		// 	    return Math.floor(d/30)*30;
		// 	},
		// 	//y_range : [0,100]
			
		//     }
		// );

		
		nav.add_dimension(
		    {
			column : 'E_KIN_ENT', name : "Input Energy",
			plot : "vector",
			group_func : function(d) {
			    return Math.floor(d/.5)*.5;
			},
			//y_range : [0,50000]

		    }
		);
		
		nav.add_dimension(
		    {
			column : 'E_KIN_EXIT', name : "Output Energy",
			plot : "vector",
			group_func : function(d) {
			    return Math.floor(d/.5)*.5;
			},
			//y_range : [0,50000]

		    }
		);


	    });

       ok();
   },
  key:"geant_nav" })
