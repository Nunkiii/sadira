({
    name:"SBIG camera controller",
    ui_opts:{ child_view_type:"div",
    	      child_classes:[ "row" ],
    	      root_classes:[ "container-fluid" ],
    	      icon:"/icons/nunki/sbig.svg",
	      
    	      render_name:false
    	    },

    elements:{
	// actions:{
	//     ui_opts:{ child_classes:[ "btn-group" ] },
	//     elements:{}
	// },
	control_panel:{
	    name:"SBIG camera",
	    subtitle:"control panel",
	    ui_opts:{
		child_view_type:"tabbed",
		root_classes:[ "col-md-5" ],
		child_classes:["container-fluid"],
		tab_scroll_height:"58vh",
		
		
		icon:"/icons/nunki/sbig.svg",
		//name_node:"h4"
	    },

	    
	    
	    elements:{

		
		main:{
		    name:"Start/Stop",
		    ui_opts:{
			root_classes:[ "container-fluid" ],
			child_classes:[ "container-fluid" ],
			fa_icon : "power-off"
			//render_name:false,
			//child_view_type:"pills"
		    },
		    elements:{
			cam_switch:{
			    type:"message_handler",
			    name:"Driver switch",
			    subtitle:"Initialize/Release the SBIG camera driver.",
			    intro:"<p>The camera driver is a native C++ Node.js addon running on a Sadira Node.js server physically connected to a SBIG camera.</p> <p>Driver should be unloaded before physically unplugging the camera, failing to do so makes the driver to crash and sadira processes need to be restarted.</p>",
			    ui_opts:{ root_classes:[ "container-fluid" ] }
			},
			server:{
			    name:"Camera websocket server url",
			    subtitle:"Nodejs sadira websocket server on camera host",
			    intro:"<p>Address of a Sadira Node.js server participating in the same cluster as at least one SBIG camera server</p><p>Usually, default setting (connecting to the same server as the one serving you these pages) is what you want.</p>",
			    type:"socket",
			    ui_opts:{
				root_classes:[ "container-fluid" ]
			    },
			    widget_builder : function(ok, fail){
				this.get("url").set_value(get_ws_server_address()+"/ws");
				ok();
			    }
			    
			}
		    }
		},


		exposure:{
		    name:"Exposure",
		    ui_opts:{
			//render_name:false,
			child_view_type : "tabbed",
			fa_icon : "photo"
			
		    },
		    elements:{
			setup:{
			    name:"Settings",
			    subtitle:"Set exposure parameters",
			    type:"expo_setup",
			    ui_opts:{
				sliding:true,
				//child_classes:[ "row" ],
				root_classes:["container-fluid"],
				fa_icon:"adjust",
				
				save:true
			    },

			    elements:{

				
				params:{
				    ui_opts:{
					child_classes: [ "col-xs-12 form-inline"],
					root_classes: []
				    },
				    elements:{
					exptime:{
					    name:"Exposure time (s)",
					    type:"double",
					    default_value:0.008,
					    min:0,
					    max:10000,
					    step:0.5,
					    ui_opts:{
						type:"edit",
						name_node:"strong",
						wrap:true,
						wrap_classes:[ "col-xs-6 input-group" ],
						root_classes:[ "col-xs-12 vertical_margin" ],
						name_classes:[ "col-xs-6" ],
						item_classes:[ "input-sm" ]
					    } 
					},
					nexpo:{
					    name:"Number of expos",
					    type:"double",
					    default_value:1,
					    min:1,
					    max:1024,
					    step:1,
					    ui_opts:{
						type:"edit",
						name_node:"strong",
						wrap:true,
						wrap_classes:[ "col-xs-6 input-group" ],
						root_classes:[ "col-xs-12 vertical_margin" ],
						name_classes:[ "col-xs-6" ],
						item_classes:[ "input-sm" ]
					    }
					},
					binning:{
					    name:"Binning",
					    type:"combo",
					    options:[ "1X" ],
					    default_value:"1X",
					    ui_opts:{
						type:"edit",
						name_node:"strong",
						wrap:true,
						wrap_classes:[ "col-xs-6 input-group" ],
						root_classes:[ "col-xs-12 vertical_margin" ],
						name_classes:[ "col-xs-6" ],
						item_classes:[ "input-sm" ]
					    }
					},
					subframe:{
					    name:"Sub frame",
					    intro:"Set the coordinates of the subframe for readout. Zero dimension means all frame.",
					    type:"rectangle",
					    ui_opts:{
						type:"edit",
						name_node:"strong",
						root_classes:[ "col-xs-12 " ],
						name_classes:[ "col-xs-12" ],
						child_classes:[ "row" ],
						
					    }
					}
				    }
				},
				mhd:{
				    type:"message_handler"
				}
			    }
			},
			exposure:{
			    name:"Image acquisition",
			    ui_opts:{
				root_classes:[ "container-fluid" ],
				child_classes:[ "row" ],
				fa_icon:"camera"
			    },
			    elements:{
				mhd:{
				    type:"message_handler"
				},
				expo_progress:{
				    name:"Getting photons",
				    type:"progress",
				    ui_opts:{
					type:"edit",
					name_node:"strong",
					wrap:true,
					wrap_classes:[ "col-xs-9 input-group" ],
					root_classes:[ "col-xs-12 " ],
					name_classes:[ "col-xs-3" ],
					item_classes:[ "input-sm" ]
				    }
				},
				grab_progress:{
				    name:"Fetching data",
				    type:"progress",
				    ui_opts:{
					type:"edit",
					name_node:"strong",
					wrap:true,
					wrap_classes:[ "col-xs-9 input-group" ],
					root_classes:[ "col-xs-12 " ],
					name_classes:[ "col-xs-3" ],
					item_classes:[ "input-sm" ]
				    }
				},
				data_progress:{
				    name:"Download image",
				    type:"progress",
				    ui_opts:{
					type:"edit",
					name_node:"strong",
					wrap:true,
					wrap_classes:[ "col-xs-9 input-group" ],
					root_classes:[ "col-xs-12 " ],
					name_classes:[ "col-xs-3" ],
					item_classes:[ "input-sm" ]
				    }
				}
			    }
			},
			last_image:{
			    name:"No data",
			    type:"image",
			    widget_builder : function(ok, fail){
				this.get("source").hide();
				this.get("view").hide();
				ok();
			    }
			}
		    }
		},


		cooling:{
		    name:"Cooling",
		    ui_opts : {
			fa_icon : "diamond"
		    },
		    elements:{
			temp:{
			    name:"CCD temperature",
			    value:0,
			    type:"double"
			},
			ambient_temp:{
			    name:"Ambient temperature",
			    value:0,
			    type:"double" },
			pow:{
			    name:"Cooling power",
			    value:0,
			    type:"double"
			},
			enable:{
			    name:"Enable cooling",
			    value:false,
			    type:"bool",
			    ui_opts:{ type:"edit" }
			},
			setpoint:{
			    name:"Temperature setpoint",
			    value:0,
			    type:"double",
			    ui_opts:{ type:"edit" }
			}
		    }
		},
		glm:{
		    name:"Display",
		    type:"gl_multilayer",
		    server_root:"XD-1/",
		    ui_opts:{
			child_view_type:"tabbed"
		    }
		}
	    }
	},
	glwidget:{
	    ui_opts:{
		root_classes:[ "col-md-7" ]
	    },
	    elements:{
		screen:{}
	    }
	}
    },
    
    key:"sbig_control",

    widget_builder:function (ok, fail){
	
	var sbig=this;
	var ui_opts=sbig.ui_opts;
	var glwidget=sbig.elements.glwidget;
	var control_panel=sbig.elements.control_panel.elements;
	
	var glm = control_panel.glm;
	var screen = glwidget.elements.screen;
	
	//    var actions=sbig.elements.actions.elements;
	
    
	
	var drawing_node=cc("div", screen.ui_root);
	drawing_node.add_class("drawing_node");
	glm.set_drawing_node(drawing_node);
	
	var main=control_panel.main.elements;
	var cooling=control_panel.cooling.elements;    
	var expo_base=control_panel.exposure.elements;
	
	
	var expo_params=expo_base.setup.elements.params;
	var expo=expo_base.exposure.elements;
	var expo_mhd=expo_base.setup.elements.mhd;
	
	var doexpo_mhd=expo_base.exposure.elements.mhd;
	
	//var exptime=expo_setup.exptime;
	//var nexpo=expo_setup.nexpo;
	//var binning=expo_setup.binning;
	
	
	var cam_mhd=main.cam_switch;
	
	var expo_status=expo.expo_status;
	var start_exposure=expo.start_exposure;
	
	var last_image=expo_base.last_image;
	var expo_progress=expo_base.exposure.elements.expo_progress;
	var grab_progress=expo_base.exposure.elements.grab_progress;
	var data_progress=expo_base.exposure.elements.data_progress;    
	
	//var start_camera=cam_sw.start_camera;
	//var cam_status=cam_sw.status;
	var server=main.server;
	var messages=server.elements.messages;
	
	var enable_cooling=cooling.enable;
	var cooling_setpoint=cooling.setpoint;
	var temp=cooling.temp;
	var ambient_temp=cooling.ambient_temp;
	var pow=cooling.pow;
	
	var temp_max_points=300;
	var temp_data=[];

	var sadira=server; 
	
	//server.elements.url.set_value("ws://localhost");
	
	var cam_online=false;
	var cam_expo=false;
	
	cam_mhd.set_btn(cam_online?"Stop camera":"Start camera",cam_online?"stop":"play").set_btn(false);
	doexpo_mhd.set_btn(cam_expo?"Stop exposure":"Start exposure",cam_online?"stop":"play").set_btn(false);
	expo_mhd.set_btn("Send expo parameters","play").set_btn(false);
	
	expo_mhd.set_status({type : "info", content : "ready"});
	
	var expo_size={};
	var gl_layer;
	
	//console.log("CONSSYTSGTRST CONNECT !");
	
	server.connect(
	    function(error){
		
		if(error){
		    cam_mhd.message(error, {type : "danger"});
		    fail(error);
		    return;
		}

		server.listen("socket_error", function(error){
		    cam_mhd.message(error, {type : "danger"});
		});
		
		server.listen("socket_connect", function(){
		    
		    var d= sadira.dialogs.create_dialog({
			handler : "nunki.sbig"
		    });
		    
		    d.listen("message", function(dgram){
			//console.log("Got message msg!" + JSON.stringify(dgram.header));
			var m=dgram.header.data;

			switch(m.id){
			    
			case "init" :
			    
			    if(è(m.online))
				cam_online=m.online;
			    
			    switch(m.type){
			    case "success":
			    case "error":
			    case "warning":
				//for (var e in cam_mhd) console.log("cam " + e);
				cam_mhd.set_btn(cam_online?"Stop camera":"Start camera",cam_online?"stop":"play").set_btn(true);
				
				// if(cam_online){
				// 	start_camera.ui_opts.fa_icon="stop";
				// 	start_camera.set_title("Stop camera");
				// }else{
				// 	start_camera.ui_opts.fa_icon="play";
				// 	start_camera.set_title("Start camera");
				// }
				// start_camera.disable(false);
				break;
			    case "info":
				cam_mhd.set_btn(false);
				//start_camera.disable(true);
				break;
			    default: break;
			    };
			    cam_mhd.set_status(m);
			    break;
			    
			case "expo_params" :
			    switch(m.type){
			    case "success":
				expo_mhd.set_btn(true);
				break;
			    case "error":
				expo_mhd.set_btn(true);
				break;
			    case "info":
				break;
			    default: break;
			    };
			    expo_mhd.set_status(m);
			    
			    break;
			    
			case "expo_proc" :
			    switch(m.type){
			    case "success":
				doexpo_mhd.set_status(m);
				doexpo_mhd.set_btn(true);
				break;
			    case "error":
				doexpo_mhd.set_status(m);
				doexpo_mhd.set_btn(true);
				break;
			    case "info":
				doexpo_mhd.set_status(m);
				break;
			    case "expo_size":
				expo_size=JSON.parse(m.content);
				break;
			    case "grab_progress":
				grab_progress.set_value(m.content);
				break;
			    case "expo_progress":
				expo_progress.set_value(m.content);
				break;
			    default:
				doexpo_mhd.set_status(m);
				break;
			    };
			    
			    
			    break;
			    
			default :
			    cam_mhd.set_status(m);
			    //cam_status.set_alert(m); break;
			}
			
		    });
		    
		
		    
		    
		    d.connect(function(error, init_dgram){
			if(error){
			    cam_mhd.message( "Error during dialog handshake on server : " + error ,{type : "danger"});
			    
			    //fail(error);
			    return;
			}
			
			//cam_mhd.message("SBIG Dialog handshake OK",{type : "success"});
			
			//expo_base.setup.listen("rebuild", function(type){
			//	if(type!=="edit") return;
			
		    
			//
			
			//});
			
			function get_dgm(){return {type : "sbig_request", request_type : cam_online? "shutdown" : "init"};}
			function get_expo_dgm(){return {type : "sbig_request", request_type : cam_expo? "stop_expo" : "start_expo"};}		    
			
			
			cam_mhd.start(d,get_dgm(),function(){
			    cam_mhd.dgm=get_dgm();
			});
			
			expo_mhd.start(d, null, function(){
			    //console.log("Expo data is : " + JSON.stringify(expo_data));
			    expo_mhd.dgm= {type : "sbig_request", request_type : "set_expo_params", data : get_template_data(expo_params)};
			});
			
			doexpo_mhd.start(d, null, function(){
			    doexpo_mhd.dgm=get_expo_dgm();
			    //console.log("Expo data is : " + JSON.stringify(expo_data));
			});
			
			d.srz_request=function(dgram, result_cb){
			    
			    //console.log("SRZ Request !");
			    
			    var sz=dgram.header.sz;
			    //var w=dgram.header.width;
			    //var h=dgram.header.height;
			    
			    //console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>");
			    data_progress.set_title("Downloading "+dgram.header.name+" : "+ format_byte_number(sz));
			    
			    var b=new ArrayBuffer(sz);
			    //var fvp = new Float32Array(b);
			    //console.log("AB: N= "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
			    var sr=new srz_mem(b);
			    
			    
			    sr.on_chunk=function(dgram){
				data_progress.set_value(Math.ceil(100*( ((dgram.header.cnkid+1)*sr.chunk_size)/sr.sz_data)));
				//console.log("Fetching data : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %");
			    }
			    sr.on_done=function(){
				data_progress.set_value(100.0);
				
				console.log("GoT image data !!!l= " + b.length + " bl= " + b.byteLength + " type " + typeof b);
				var fvp = new Float32Array(b);
				last_image.setup_dgram_image(
				    {
					name : dgram.header.name,
					sz : dgram.header.sz,
					width: expo_size.w,
					height: expo_size.h
				    }, fvp
				);
				
				if(gl_layer===undefined)
				    glm.create_layer(last_image).then(function(layer){
					gl_layer=layer;
				    });
				else{
				    gl_layer.setup_image(last_image);
				}
				
				/*
				  var l;
				  l=xd1_display.create_layer(img);
				  if(dgram.header.colormap)
				  l.cmap.set_value(dgram.header.colormap);
				*/
				
				
			    };
			    
			    result_cb(null, sr);
			    //console.log("srz request completed");
			}
			
		    }); 
		    
		});
		
	    });

	ok();

	return;
	
	start_camera.listen("click", function(){
	    
	    d.listen("expo_progress", function(dgram){
		//console.log("EXPO Head" + JSON.stringify(dgram.header));
		expo_progress.set_value(dgram.header.value*1.0);
	    });
	    
	    d.listen("grab_progress", function(dgram){
		//console.log("GRAB Head" + JSON.stringify(dgram.header));
		grab_progress.set_value(dgram.header.value*1.0);
	    });
	    
	    
	    var iv;

	    d.listen("cooling_info", function(dgram){
		var temp_info = dgram.header.cooling_info;
		temp_data.push(temp_info);
		if(temp_data.length>temp_max_points)
		    temp_data.splice(0,1);
		temp.set_value(temp_info.ccd_temp);
		ambient_temp.set_value(temp_info.ambient_temp);
		pow.set_value(temp_info.cooling_power);
		//messages.append(JSON.stringify(temp_info,null,3));
		//console.log("Cooling info " + JSON.stringify(temp_info));
		//draw_ccd_temperature();
	    });
	    
	    d.listen("cam_status", function(dgram){
		var m=dgram.header.status;
		
		messages.append(JSON.stringify(m,null,5));
		
		if(m.ready) {
		    
		    start_exposure.listen("click",function(){
			d.send_datagram({ type : "start_expo", exptime : exptime.value, nexpo : nexpo.value },null,function(error){} );
		    });
		    
		    iv=setInterval(function(){

			d.send_datagram({ type : "get_cooling_info"},null,function(error){} );
			
			//console.log("NS= "+ ns +" Cam temperature = " + JSON.stringify(cam.get_temp()));
			//clearInterval(iv);
			
			
		    }, 1000);
		    
		    enable_cooling.listen("change", function(enabled){
			var setpoint=temp_setpoint.value; 
			console.log("Setting temp ["+enabled+"] setpoint " + setpoint);
			d.send_datagram({ type : "set_cooling", enabled : enabled*1.0, setpoint: setpoint},null,function(error){} );
			
		    });
		    
		    
		}
		if(m.info) {
		    
		}
		if(m.error){
		}
		
	    });
	    
	    d.lay_id=this.id;
	    
	    d.srz_request=function(dgram,  calb){
		
		console.log("SRZ req called...");
		
		var w=lay.width = dgram.header.width;
		var h=lay.height =dgram.header.height;
		
		var sz=dgram.header.sz;
		
		console.log("Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h);
		camera_status.innerHTML+="Ready to receive "+sz +" bytes. Image ["+dgram.header.name+"] size will be : " + w + ", " + h + "<br/>";
	    
		setup_bbig(w,h);
	    
		// if(bbig==null){
		
		// 	sz=dgram.header.sz;
		// 	w=
		// 	h=
		
		// 	bbig=new ArrayBuffer(4*sz);
		// 	fv = new Float32Array(bbig);
		// 	for(var i=0;i<fv.length/4;i++){
		// 	    fv[4*i]=0.0;
		// 	    fv[4*i+1]=0.0;
		// 	    fv[4*i+2]=0.0;
		// 	    fv[4*i+3]=1.0;
		// 	}
		// }
		
		status.innerHTML+=dgram.header.name;
		
		console.log("X");
		var b=new ArrayBuffer(sz);
		console.log("X");
		var fvp = new Float32Array(b);
		//console.log("AB: = "+ fv.length +" =? "+sz/4+" first elms : " + fv[0] + ", " + fv[1] );
		var sr=new srz_mem(b);
		
		lay.arr=fvp;
		sr.lay_id=d.lay_id;
		
		console.log("X");
		
		sr.on_chunk=function(dgram){
		    //console.log("Fetching data chunk...");
		    
		    p_fetch.value=(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)));
		    
		    //status.innerHTML="Fetching data for " + dgram.header.name +
	    	    //" : "+(Math.floor(100*( (dgram.header.cnkid*sr.chunk_size)/sr.sz_data)))+" %";
		}
		
		console.log("XXX w,h = " + w + ", " + h);
		
		sr.on_done=function(){
		    
		    console.log("Fetch image done !");
		    p_fetch.value=100.0;
		    var lid=lay.id;
		    var fv=xd.fv;
		    var min=1e20,max=-1e20;
		    
		    var rangeLocation = gl.getUniformLocation(xd.program, "u_layer_range");
		    
		    xd.p_layer_range[2*lid]=lay.width/xd.w;
		    xd.p_layer_range[2*lid+1]=lay.height/xd.h;
		    
		    gl.uniform2fv(rangeLocation, xd.p_layer_range);
		    var fv=xd.fv;
		    console.log("Filling texture ("+xd.w+","+xd.h+") with image ("+w +","+h+")"  );
		    
		    for(var i=0;i<h;i++){
			for(var j=0;j<w;j++){
			    var v=fvp[i*w+j]*1.0;
			    fv[4*(i*xd.w+j)+lid]=1.0*v;
			    if(v>max)max=v; else if(v<min)min=v;
			}
		    }
		    
		    console.log("Setting up layer data...");
		    lay.ext=[min,max];
		    setup_layer_data();
		    
		};
		console.log("XXX");
		console.log("calling cb");
		calb(null, sr);
		console.log("calling cb done");
	    };
	    
	});
	
	
    }
})
