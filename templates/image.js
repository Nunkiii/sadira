({
    name:"No data loaded",
    type:"binary_object",
    ui_opts:{
	child_view_type:"div",
	close:true,
	render_name:true,
	child_classes:[ "container-fluid" ],
	root_classes:[ "container-fluid" ],
	icon:"/icons/mat_float.svg"
    },
    ext_scripts : ["/js/community/fits.js"],
    events:[ "image_ready" ],
    elements:{

	source:{
	    subtitle:"Select a FITS image file on your local filesystem :",
	    name:"FITS file",
	    type:"local_file",
	    ui_opts:{
		editable:false,
		type:"edit",
		root_classes:[ "col-md-12" ],
		child_classes:[ "inline" ]
	    }
	},
	keys:{
	    name:"Metadata",
	    type:"text",
	    elements:{},
	    ui_opts:{
		sliding:true,
		slided:false,
		label:true,
		root_classes:[ "col-md-12" ]
	    }
	},
	dims:{
	    type:"image_dimensions",
	    ui_opts:{
		sliding:false,
		slided:false,
		root_classes:[ "col-md-6" ],
		child_classes:[ "inline" ]
	    },
	},
	bounds:{
	    type:"labelled_vector",
	    name:"Data value bounds",
	    value:[ 0,
		    0 ],
	    value_labels:[ "Min",
			   "Max" ],
	    min:"-100000",
	    max:"100000",
	    ui_opts:{ editable:false,
		      sliding:false,
		      sliding_dir:"h",
		      slided:false,
		      label:true,
		      root_classes:[ "col-md-6" ],
		      child_classes:[ "inline" ] } },
	view:{ name:"Display",
	       ui_opts:{ sliding:false,
			 slided:false,
			 bar:false,
			 root_classes:[ "container-fluid" ],
			 child_classes:[ "container-fluid" ] },
	       elements:{ new_display:{ type:"action",
					name:"View in a new display",
					ui_opts:{ button_node:"span",
						  item_classes:[ "btn btn-info btn-xs" ] } },
			  add_to_display:{ type:"action",
					   name:"Select existing display",
					   ui_opts:{ button_node:"span",
						     item_classes:[ "btn btn-info btn-xs" ] } },
			  display_list:{ name:"Select display:",
					 type:"combo",
					 ui_opts:{ type:"edit",
						   item_classes:[ "" ] } },
			  add:{ type:"action",
				name:"Add layer in selected display",
				ui_opts:{ button_node:"span",
					  item_classes:[ "btn btn-info btn-xs" ] } } } } },
    widget_builder:function (ok, fail){
	var image=this;
	
	console.log("Image constructor ! " + image.name );
	
	var bin_size=image.elements.size;
	var dims=image.elements.dims;
	var bounds=image.elements.bounds;
	var meta=image.elements.keys;
	var fits_file=image.elements.source;//.elements.local_fits;
	//var gloria=image.elements.source.elements.gloria;
	var view=image.elements.view.elements;
	
	var new_display=view.new_display;
	var display_list=view.display_list;
	var add_to_display=view.add_to_display;
	var add=view.add;
	
	var dlist=[];
	
	
	var views;
	if(è(image.xd))
	    views=image.xd.elements.drawing.elements.views;
	
	add_to_display.listen("click", function(){
	    var opts=[];
	    dlist=[];
	    for( var v in views.elements){
		dlist.push(v); opts.push(v + " : " + views.elements[v].name );
	    };
	    
	    display_list.set_options(dlist);
	    
	});
	
	
	new_display.listen("click", function(){
	    
	    image.xd.create_image_view(image, function(error, glm){
		glm.set_title(image.name + " display");
	    });
	});
	
	add.listen("click", function(){
	    //console.log("Selected : " + display_list.ui.selectedIndex);
	    var vn=dlist[display_list.ui.selectedIndex];
	    var glm=views.elements[vn];
	    glm.create_layer(image);
	    image.xd.select_view(glm);
	});
	
	/*	
		gloria.listen("image_data", function(dgm){
		image.setup_dgram_image(dgm.header,dgm.data);
		image.set_title("GloriaImage ID " + dgm.header.gloria.autoID );
		});
	*/

	image.update_extent=function(){
	    var extent = [1e20,-1e20];
	    for (var i=0;i<image.fvp.length;i++){
		var v=image.fvp[i];
		if(v>extent[1])extent[1]=v;
		if(v<extent[0])extent[0]=v;
	    }
	    bounds.set_value(extent);
	}
	
	image.copy_image=function(image_source){
	    
	    if(typeof image_source.fvp.length != 'undefined'){
		
		var length=image_source.fvp.length;
		var blength=length*4;
		
		var fvp = image.fvp=new Float32Array(length);
		for (var i=0;i<length;i++)
		    fvp[i]=image_source.fvp[i];
		image.update_extent();
		
		dims.set_value(image_source.elements.dims.value);
		// Get the minimum and maximum pixels
		//image.set_title(header.name);
		bin_size.set_value(blength);
		
		
		image.trigger("image_ready",image);
	    }
	    
	}
	
	image.load_fits_data=function(data_source){

	    image.message("Loading fit data from " + data_source);
	    
	    var FITS = astro.FITS;
	    var fits = new FITS(data_source, function(){
		// Get the first header-dataunit containing a dataunit
		var hdu = this.getHDU();
		// Get the first header
		var header = hdu.header;
		// Read a card from the header
		var bitpix = header.get('BITPIX');
		// Get the dataunit object
		var dataunit = hdu.data;
		
		//console.log("FITS OK "+ JSON.stringify(header.cards, null, 5));
		
		meta.set_value(JSON.stringify(eval(header.cards), null, 5));
		
		var opts={ dataunit : dataunit };
		
		// Get pixels representing the image and pass callback with options
		dataunit.getFrame(0, function(arr, opts){// Get dataunit, width, and height from options
		    var dataunit = opts.dataunit;
		    var w= dataunit.width;
		    var h= dataunit.height;
		    
		    dims.set_value([w,h]);
		    // Get the minimum and maximum pixels
		    var extent = dataunit.getExtent(arr);
		    
		    image.set_title(fits_file.value.name);
		    //console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
		    
		    bin_size.set_value(fits_file.size);
		    
		    bounds.set_value(extent);
		    console.log("Frame read : D=("+dims.value[0]+","+dims.value[1]+")  externt " + extent[0] + "," + extent[1] + " wh="+w+","+h);
		    //image_info.innerHTML="Dims : ("+image.width+", "+image.height+")";
		    
		    image.fvp=arr;
		    bounds.set_value(extent);
		    image.trigger("image_ready",image);
		    
		}, opts);
	    });
	}
	
	fits_file.listen('change',function(evt){
	    var file = evt.target.files[0]; // FileList object
	    image.load_fits_data(file);
	});
	
	image.setup_dgram_image=function(header, fvpin){
	    
	    //console.log("Setup dgram image size " + header.sz);
	    var fvp;
	    
	    //if(header.name) this.name=header.name;
	    
	    //	if(header.colormap)
	    //	    cmap.set_value(header.colormap);
	    
	    if(fvpin.length){
		fvp=fvpin;
		//     length=fvp.length;
	    }else{
		fvp =  new Float32Array(fvpin);
		//     length = fvp.byteLength;
	    }
	    image.set_title(header.name);
	    image.fvp=fvp;
	    dims.set_value([header.width,header.height]);
	    image.update_extent();
	    
	    //bin_size.set_value(header.sz);
	    
	    //console.log("FF set_value is " + typeof(fits_file.elements.dims.set_value) );
	    meta.set_value(JSON.stringify(header, null, 5));
	    image.trigger("image_ready",image);
	}
	
	ok();
    },
    key:"image"
})
