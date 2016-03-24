({
    key : "spectro_capture",
    name:"Video",
    intro:"<p>Click the floppy icon <span class='fa fa-save text-success'> </span> to save the video parameters of your spectrograph in your browser's webstorage.</p> <p>Your configuration will be restored automatically when you visit the page again</p>",
    ui_opts:{
	intro_title:"Save your setup",
	root_classes:[ "col-md-5 col-xs-12" ],
	child_classes:[ "container-fluid" ],
	child_view_type:"tabbed",
	fa_icon:"camera",
	default_child:"none",
	toolbar_brand:true,
	save:"Video setup"
    },
    toolbar:{
	ui_opts:{ toolbar_classes:[ "navbar navbar-default" ] }
    },
    elements:{
	video:{
	    name:"Device",
	    subtitle:"Setup your webcam device",
	    intro:"<strong>Warning</strong><ul><li>On some browser this function is not available and the choice of device can only be made interactively at browser prompt when starting capture.</li><li>Resolution selection is only available on few browsers</li></ul>",
	    ui_opts:{ root_classes:[ "" ],
		      child_classes:[ "col-sm-offset-3 col-sm-6 list-group col-md-12 col-md-offset-0" ],
		      fa_icon:"camera-retro" },
	    elements:{
		device:{
		    ui_opts:{ name_classes:[ "col-xs-6 control-label" ],
			      name_node:"strong",
			      wrap:true,
			      wrap_classes:[ "col-xs-6 input-group" ],
			      root_classes:[ "col-xs-12 form-group list-group-item vertical_margin" ],
			      fa_icon:"camera-retro",
			      type:"edit" },
		    name:"Camera device",
		    type:"combo" },
		resolution:{
		    name:"Resolution",
		    ui_opts:{ name_node:"strong",
			      name_classes:[ "col-xs-6 control-label" ],
			      wrap:true,
			      wrap_classes:[ "col-xs-6 input-group" ],
			      root_classes:[ "col-xs-12 form-group list-group-item" ],
			      fa_icon:"qrcode",
			      type:"edit" },
		    type:"combo",
		    options:[ "VGA",
			      "HD" ]
		}
	    }
	},
	processing:{
	    name:"Processing",
	    subtitle:"Set the image processing pipeline options",
	    ui_opts:{ root_classes:[ "" ],
		      child_classes:[ "list-group" ],
		      fa_icon:"th",
		      intro_stick:true,
		      child_view_type:"div"
		    },
	    elements:{
		integrate:{
		    name:"Average frames",
		    ui_opts:{ root_classes:[ "list-group-item vertical_margin col-xs-12" ],
			      child_classes:[ "row" ],
			      fa_icon:"plus" },
		    intro:"<p>Sum up frames to reduce noise</p>",
		    elements:{
			enable:{
			    name:"Enable",
			    ui_opts:{ name_node:"strong",
				      wrap:true,
				      wrap_classes:[ "input-group col-xs-6" ],
				      root_classes:[ "col-sm-6 col-xs-12" ],
				      name_classes:[ "col-sm-6 col-xs-6" ],
				      type:"edit" },
			    type:"bool",
			    value:false },
			nframes:{ type:"double",
				  name:"N. images",
				  ui_opts:{ type:"edit",
					    name_node:"strong",
					    wrap:true,
					    wrap_classes:[ "input-group col-xs-6" ],
					    root_classes:[ "vertical_margin col-sm-6 col-xs-12" ],
					    name_classes:[ "col-xs-6" ] },
				  step:1,
				  value:5,
				  min:2,
				  max:100 } } },
		sampling:{
		    name:"Buffer sampling rate (Hz)",
		    intro:"<p>Setting this to a value higher than the actual camera sampling rate is not usefull and consumes CPU.</p>",
		    type:"double",
		    min:0.1,
		    max:50,
		    step:1,
		    default_value:2,
		    ui_opts:{
			wrap:true,
			name_node:"strong",
			wrap_classes:[ "input-group col-xs-6" ],
			name_classes:[ "col-xs-6" ],
			root_classes:[ "list-group-item col-xs-12" ],
			fa_icon:"dashboard",
			type:"edit"
		    }
		}
	    }
	},
	box:{
	    name:"Geometry",
	    intro:"Setup the orientation and dimensions of the spectrum area within the image",
	    ui_opts:{
		fa_icon:"retweet",
		name_classes:[ "title_margin" ]
	    },
	    elements:{
		dir:{
		    name:"Wavelength direction",
		    intro:"<p>Set the wavelength direction depending on your spectro design. Default is vertical, along the Y direction.</p>",
		    type:"combo",
		    options:[ { label:"Vertical",
				value:0 },
			      { label:"Horizontal",
				value:1 } ],
		    ui_opts:{ name_classes:[ "col-xs-6" ],
			      root_classes:[ "list-group-item col-xs-12" ],
			      wrap:true,
			      wrap_classes:[ "input-group col-xs-6" ],
			      type:"edit",
			      fa_icon:"exchange" },
		    default_value:0 },
		region:{
		    name:"Spectrum box",
		    intro:"<strong>Adjust the spectrum box coordinates</strong><p> (x,y) is the top left pixel corner</p><p>The box can also be resized interactively by resizing the box rectangle overlayed on the camera view window.</p>",
		    ui_opts:{ root_classes:[ "list-group-item col-xs-12 vertical_margin" ],
			      name_classes:[ "col-xs-8" ],
			      child_classes:[ "col-xs-12 form-inline" ],
			      fa_icon:"crop" },
		    elements:{
			pos:{
			    ui_opts:{
				root_classes:[ "container-fluid" ],
				child_classes:[ "row" ]
			    },
			    elements:{
				x:{
				    name:"x",
				    type:"double",
				    default_value:300,
				    step:1,
				    min:0,
				    ui_opts:{ type:"edit",
					      name_node:"strong",
					      wrap:true,
					      wrap_classes:[ "col-xs-8 input-group" ],
					      root_classes:[ "col-xs-6 " ],
					      name_classes:[ "col-xs-4" ],
					      item_classes:[ "input-sm" ] } },
				y:{
				    name:"y",
				    type:"double",
				    default_value:50,
				    step:1,
				    min:0,
				    ui_opts:{ type:"edit",
					      wrap:true,
					      wrap_classes:[ "col-xs-8 input-group" ],
					      name_node:"strong",
					      root_classes:[ "col-xs-6" ],
					      name_classes:[ "col-xs-4" ],
					      item_classes:[ "input-sm" ] }
				}
			    }
			},
			dims:{
			    ui_opts:{ root_classes:[ "col-sm-12 vertical_margin" ],
				      child_classes:[ "row" ] },
			    elements:{
				w:{
				    name:"width",
				    type:"double",
				    default_value:30,
				    step:1,
				    min:1,
				    ui_opts:{ type:"edit",
					      wrap:true,
					      wrap_classes:[ "col-xs-8 input-group" ],
					      name_node:"strong",
					      root_classes:[ "col-xs-6 " ],
					      name_classes:[ "col-xs-4" ],
					      item_classes:[ "input-sm" ] } },
				h:{
				    name:"height",
				    type:"double",
				    default_value:300,
				    step:1,
				    min:1,
				    ui_opts:{ type:"edit",
					      wrap:true,
					      wrap_classes:[ "col-xs-8 input-group" ],
					      name_node:"strong",
					      root_classes:[ "col-xs-6 " ],
					      name_classes:[ "col-xs-4" ],
					      item_classes:[ "input-sm" ] } } } } } } } },
	camview:{
	    ui_opts:{
		in_root:true,
		fa_icon:"play"
	    },
	    elements:{
		butts:{
		    name:"Start/Stop capture",
		    intro:"<p>You might be prompted to accept webcam capture from your browser</p>",
		    ui_opts:{ intro_title:"Start/stop capturing frames from the webcam and computing one-dimensional spectrum",
			      fa_icon:"play",
			      root_classes:[ "container-fluid vertical_margin" ],
			      child_classes:[ "btn-group" ],
			      label:true },
		    elements:{
			start:{
			    name:"",
			    type:"action",
			    ui_opts:{ fa_icon:"play",
				      item_classes:[ "btn btn-primary" ] }
			},
			stop:{
			    name:"",
			    type:"action",
			    ui_opts:{ fa_icon:"stop",
				      item_classes:[ "btn btn-default" ]
				    }
			}
		    }
		},
		camwindow:{
		    ui_opts:{ root_classes:[ "camwindow " ] }
		}
	    },
	    widget_builder:function (ok, fail){
		console.log("Camview build....");
		ok();
		
	    }
	}
    },
    widget_builder:function (ok, fail){
	console.log("Done building left....");
	ok();
	
    }
    
 
})
