({
    name:"λ calibration",
    intro:"<p>The webcam CCD records the spectra as a 2D image. The spectrograph should be constructed to assure that the color direction of the spectrum image is projected parallel to a CCD direction to simplify image processing. Along that direction, each pixel correspond to a different physical colour, hence a different light's wavelength.</p><p>To be able to associate a pixel index with a physical wavelength, a <em>calibration spectrum</em> must be used to identify the pixel-space position of a certain number of spectral features whose wavelength is known, and use these points to build a model, in this case a polynomial function, to interpolate the colour for every pixel position.</p>",
    subtitle:"From pixel scale to physical wavelength",
    ui_opts:{
	intro_title:"Wavelength calibration",
	root_classes:[ "container-fluid" ]
    },
    elements:{
	calib_func:{
	    type:"polynomial",
	    name:"Polynomial model",
	    intro:"<p><strong class='text-danger big'><it class='fa fa-exclamation-triangle'></it> - Save your fit result</strong><p> When you are satisfied with the fitted parameters, don't forget to save your model by clicking the <it class='fa fa-save text-success'></it> button </p></p>",
	    elements:{
		pdeg:{
		    ui_opts:{
			type:"edit",
			intro_title:"Choose the degree of the model polynomial function",
			intro_stick:true
		    },
		    intro:"" }
	    },
	    ui_opts:{
		root_classes:[ "col-sm-6" ],
		child_classes:[ "container-fluid" ],
		intro_stick:true,
		save:"Polynomials"
	    }
	},
	specsel:{
	    name:"Select spectrum and fit",
	    type:"object_loader",
	    intro:"The selected spectrum should contain at least as many identified features as the polynome degree + 1.",
	    collection:"spectra",
	    ui_opts:{
		intro_stick:true,
		intro_title:"Choose a spectrum",
		item_classes:[ "big_vertical_margin" ],
		root_classes:[ "col-sm-6" ],
		child_classes:[ "container-fluid vertical_margin" ] },
	    elements:{
		name:{ ui_opts:{ root_classes:[ "container-fluid big_vertical_margin" ] } },
		exec:{
		    type:"action",
		    name:"Fit datapoints",
		    ui_opts:{
			fa_icon:"cogs",
			wrap:true,
			wrap_classes:"text-center",
			root_classes:[ "well container-fluid" ],
			item_classes:[ "btn btn-primary" ]
		    }
		},
		view:{
		    name:"Fit plot",
		    type:"vector",
		    ui_opts:{
			fa_icon:"trophy",
			enable_range:false,
			enable_selection:false,
			root_classes:[ " container-fluid" ],
			child_classes:[ "container-fluid" ] },
		    elements:{
			fit_eq:{ name:"Equation: ",
				 type:"string",
				 default_value:"No equation",
				 ui_opts:{
				     label:true,
				     root_classes:[ "col-sm-12" ]
				 }
			       }
		    }
		}
	    }
	}
    },
    widget_builder:function (ok, fail){

	    var wlc=this;

	    var pdeg=wlc.get('pdeg');
	    var exec=wlc.get('exec');
	    var fit_eq=wlc.get('fit_eq');
	    var fit_params=wlc.get('params');
	    var calib_func=wlc.get('calib_func');
	    var control=wlc.get('control');
	    var view=wlc.get('view');
	    //var exec_box=wlc.get('exec_box');
	    
	    var fit_points=[];

	    function get_fit_points(spectrum){
		fit_points=[];
		
		var fl=spectrum.get('feature_list');
		    
		for (var fi in fl.elements){
		    var f=fl.elements[fi];
		    fit_points.push([f.val('pixel'),f.val('wl')]);
		}
		return fit_points;
	    }
	    
	    exec.disable();
	    view.hide(true);
	    
	    wlc.get('specsel').listen('load_doc', function(doc){
		spectrum=create_widget('spectrum');
		doc.store_deserialize({ object : spectrum });
		get_fit_points(spectrum);
		//this.message("Loaded spectrum [" + spectrum.name + "]", { type : 'success', title : 'Done', last : 2000});
		
		if(pdeg.value<fit_points.length){
		    this.elements.name.message("Spectrum has " + fit_points.length + " features.", { type : 'success', title : "Ok"});
		    
		    exec.disable(false);
		}else{
		    this.elements.name.message("Not enough features,  Need at least " + (pdeg.value*1.0+1) , { type : 'danger', title : fit_points.length + " features", last : 4000});
		    exec.disable();
		}
		
	    });
	    
	    // wlc.set_sv=function(sv){
	    // 	this.sv=sv;
	    // }
	    
	    // //exec_box.disable();
	    // //view.disable();

	    // wlc.calib_func=function(x){
	    // 	return calib_func.func(x);
	    // }
	    
	    exec.listen('click', function(){
		
		exec.parent.message("Fitting pdeg=" + pdeg.value);
		
		var result = regression('polynomial', fit_points, pdeg.value*1.0);
		console.log("Fit result : " + JSON.stringify(result), { wait : true});
		
		exec.parent.message("Fitting done " , { title : 'Done', type : 'success'});
		
		calib_func.elements.params.set_value(result.equation);
		
		fit_eq.set_value(result.string);
		
		// if(fit_params.ui_childs !== undefined){
		//     if(fit_params.ui_childs.div!==undefined)
		// 	fit_params.ui_childs.div.innerHTML="";
		// }
		// fit_params.elements={};
		view.hide(false);
		
		if(view.value===undefined){
		    var pp=view.add_plot_points(fit_points, { stroke : "#ee2020", stroke_width : "1px", label : "Data points"});
		    var pf=view.add_plot_func(calib_func.func ,{ label : "Fit func", stroke : "#3030dd", stroke_width : "1px"});
		}

		view.redraw();
		
		
		// for(var i=0;i<fitp.length;i++){
		//     var fpui=create_widget({ name : 'x<sup>'+i+'</sup>', type : "double", value : fitp[i]} );
		//     fpui.fit_id=i;
		//     fit_params.add_child(fpui);
		//     fpui.listen('change', function(v){ fitp[this.fit_id]=v; pf.redraw(); } )
	// }
		
		
	    });
	    
	    fit_params.listen('change',function(){
		//console.log("FP changed ! " + this.value);
		view.redraw();
	    });
	    
	    // fit.listen("data_loaded", function(){
	    // 	console.log("FIT PLOAD !!! " + this.name) ;
		
	// });
	
	ok();
    },
    key:"wlc"
})
