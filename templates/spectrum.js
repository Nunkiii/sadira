({ name:"Spectrum",
  ui_opts:{ icon:"/apps/minispectro/ico/minispectro.svg",
    show_cursor:true,
    name_edit:true,
    child_view_type:"tabbed",
    toolbar_brand:true,
    default_child:"none" },
  toolbar:{ ui_opts:{ toolbar_classes:[ "navbar navbar-default" ] } },
  elements:{ keys:{ name:"Meta-data",
      ui_opts:{ root_classes:[ "container-fluid panel panel-default" ],
        child_classes:[ "container-fluid" ],
        fa_icon:"list" },
      elements:{ target:{ type:"string",
          name:"Target",
          holder_value:"Spectrum light source",
          ui_opts:{ label:true,
            editable:true,
            edited:false } },
        date_obs:{ name:"Observation time",
          type:"date",
          ui_opts:{ label:true,
            editable:true } } } },
    lines:{ name:"Spectral features",
      intro:"<strong>Emission or absorption line</strong><p>First parameter is the physical wavelength of the feature, in Å. The second parameter, is the pixel space position of the same feature.</p>",
      ui_opts:{ fa_icon:"magnet",
        child_view_type:"tabbed",
        child_node_type:"form",
        default_child:"none" },
      toolbar:{ ui_opts:{ toolbar_classes:[ "navbar-default" ] } },
      elements:{ new_line:{ name:"Hg line",
          intro:"<p>Add a mercury emission line from the list of strong emission lines :</p>",
          ui_opts:{ fa_icon:"plus",
            root_classes:[ "container-fluid col-xs-12" ],
            child_node_type:"form",
            child_classes:[ "form-horizontal col-xs-12 vertical_margin" ] },
          elements:{ select_line:{ ui_opts:{ root_classes:[ "input-group" ],
                name_classes:[ "input-group-addon" ],
                name_node:"div",
                type:"edit" },
              name:"Select emission line",
              type:"combo" },
            add_line:{ name:"Add feature",
              type:"action",
              ui_opts:{ root_element:"select_line",
                wrap:true,
                wrap_classes:[ "input-group-btn" ],
                item_classes:[ "btn btn-info" ],
                fa_icon:"plus" } } } },
        new_custom_line:{ name:"Custom feature",
          intro:"<ul><li>Edit feature's name.</li><li> Setup the wavelength in Å and eventually the pixel position of the new spectral feature, pixel position can also be changed by dragging the feature line in the spectrum's plot.</li> <li>Click 'Add feature' button to add the feature to the list</li></ul>",
          ui_opts:{ fa_icon:"plus",
            root_classes:[ "container-fluid" ],
            child_node_type:"form",
            child_classes:[ "form-inline container-fluid col-md-offset-1 col-md-10" ] },
          elements:{ custom_feature:{ ui_opts:{ name_classes:[ "text-left" ],
                type:"edit",
                name_edit:true },
              name:"A spectrum feature ...",
              type:"spectrum_feature",
              elements:{ add_custom_feature:{ name:"Add feature",
                  type:"action",
                  ui_opts:{ root_classes:"inline",
                    wrap:true,
                    wrap_classes:[ "text-right" ],
                    item_classes:[ "btn btn-info" ],
                    fa_icon:"plus" } } } } } },
        feature_list:{ name:"Spectral features list",
          ui_opts:{ child_view_type:"table",
            fa_icon:"reorder" } } } },
    calib:{ name:"Calibration",
      ui_opts:{ root_classes:[ "col-xs-12" ],
        child_classes:[ "container-fluid" ],
        fa_icon:"dashboard" },
      elements:{ calib_enable:{ name:"λ calibration",
          type:"bool",
          value:false,
          ui_opts:{ label:true,
            type:"edit",
            root_classes:"vertical_margin full_padding" } },
        calib_func:{ type:"polynomial",
          ui_opts:{ save:"Polynomials",
            root_classes:"panel panel-default vertical_margin full_padding" },
		     widget_builder:function (ok, fail){
			 ok();
			 //status.disable();
		     } } } },
	     view:{ name:"Spectrum plot",
		    type:"vector",
		    ui_opts:{ in_root:"append",
        cursor_shape:"vertical",
        show_cursor:true,
        enable_selection:false,
        enable_range:false,
        render_name:false,
        root_classes:[ "vertical_margin" ] } } },
   widget_builder:function (ok, fail){

       var hg_lines = [
	   [    400,      2052.828,          "Hg II"], 
	   [    400,      2262.223,          "Hg II"], 
	   [    1000,     2536.517,          "Hg I" ], 
	   [    400,      2847.675,          "Hg II"], 
	   [    250,      2967.280,          "Hg I" ], 
	   [    600,      3650.153,          "Hg I"], 
	   [    1000,     3983.931,          "Hg II"], 
	   [    400,      4046.563,          "Hg I" ], 
	   [    1000,     4358.328,          "Hg I"], 
	   [    500,     5460.735,           "Hg I"], 
	   [    200,     5677.105,           "Hg II"], 
	   [    250,     6149.475,           "Hg II"], 
	   [    250,    7944.555,            "Hg II"], 
	   [    200,    10139.76,            "Hg I"]
       ]; 
       
       var  spectrum=this;
       console.log("spectrum widget_builder : Building spectrum : " + spectrum.name);

	    //    console.log("spectrum ui_builders : Building spectrum : " + spectrum.name);
	    //template_ui_builders.vector(ui_opts, spectrum);
	    var view=spectrum.get('view');
	    var calib_func=spectrum.get('calib_func');
	    var calib_enable=spectrum.get('calib_enable');
	    
	    var select_line=spectrum.get('select_line');
	    var add_line=spectrum.get('add_line');
	    var flist=spectrum.get('feature_list');
	    var new_line=spectrum.get('new_line');
	    var lines=spectrum.get('lines');
	    
	    var add_custom_feature=spectrum.get('add_custom_feature');
	    var calib_params=calib_func.get('params');


	    view.get('btns').add_child(calib_enable, 'calib_enable');
	    calib_enable.ui_root.add_class('inline');

	    view.hide(true);
	   
	    //calib_enable.set_title("λ calibration");

	    // vec.serialize=function(){
	    // 	var v=[];
	    // 	vec.value.forEach(function(p){
	    // 	    v.push({ data : p.data, args: p.args, opts: p.opts}  );
	    // 	});
	    // 	return v;
	    // }
	    
	    spectrum.deserialize=function(v){
	    	//console.log("Spectrum deserialize " + JSON.stringify(v));
		flist.clear_childs();
		spectrum.value=v;
		
	    	spectrum.update_plot(v);
	    }
	    
	    calib_enable.listen('change', function(){
		console.log("Calib enable set to " + calib_enable.value);
		spectrum.update_plot();
	    });

	    
	    
	    spectrum.update_plot=function(spec_data_in){

		if(spec_data_in!==undefined)
		    spectrum.value=spec_data_in;

		var spec_data=spectrum.value;
		if(spec_data===undefined) return;

		view.value=view.plots=[];
		view.get('lines').clear_childs(); //lines.elements={};
		
		view.plots=[];
		var pr,pg,pb,pt;
		view.ylabel="Intensity (ADU)";
		
		if(calib_enable.value===true){

		    for(var f in flist.elements) flist.elements[f].plot_type='wl';
		    
		    pr=view.add_plot(spec_data.r,calib_func.func);
		    pg=view.add_plot(spec_data.g,calib_func.func);
		    pb=view.add_plot(spec_data.b,calib_func.func);
		    pt=view.add_plot(spec_data.t,calib_func.func);

		    view.xlabel="Wavelength (Calibrated, Å)";

		    if(view.ui_opts.show_cursor===true){
			view.cursor.value_labels=['λ (Å)','I (ADU)'];
			view.cursor.rebuild();
		    }
		}else{
		    for(var f in flist.elements) flist.elements[f].plot_type='pixel';
		    
		    pr=view.add_plot_linear(spec_data.r,0,1);
		    pg=view.add_plot_linear(spec_data.g,0,1);
		    pb=view.add_plot_linear(spec_data.b,0,1);
		    pt=view.add_plot_linear(spec_data.t,0,1);

		    view.xlabel="Wavelength (Uncalibrated, pixels)";
		    if(view.ui_opts.show_cursor === true){
			view.cursor.value_labels=['Pixel','I (ADU)'];
			view.cursor.rebuild();
		    }
		}
		//
		pr.set_opts({ stroke : "#ff0000", stroke_width : ".5px", label : "Red"});
		pg.set_opts({ stroke : "#10ee05", stroke_width : ".5px", label : "Green"});
		pb.set_opts({ stroke : "#0202ee", stroke_width : ".5px", label : "Blue"});
		pt.set_opts({ stroke : "#6020cc", stroke_width : "1px", label : "Mean"});

		view.config_range();
		view.hide(false);
	    }
	    
	    
	    calib_params.listen('change', function() { spectrum.update_plot();});

	    
	    select_line.options=[];
	    hg_lines.forEach( function( line, i ){
		
		select_line.options.push( { value : i, label : line[2] + " : " + line[1] + " Å" });
		//line[0]
	    });


	    // console.log("prop in " + select_line.name);
	    // for(var p in select_line)
	    // 	console.log("prop " + p);
	    
	    select_line.set_options();
	    
	    //line_table.value=[];
	    
	    function check_line(l){
		
		for(var f in flist.elements){
		    
		    if(flist.elements[f].val('wl')==l){
			lines.debug("The wavelength " + l + " is already in the table !");
			return false;
		    }
		}
		return true;
	    }
	    
	    add_line.listen('click', function(){
		var sel_line=select_line.ui.value;
		
		var ion=hg_lines[sel_line][2];
		var lambda=hg_lines[sel_line][1];
		
		console.log("Selected line : " + JSON.stringify(sel_line));
		
		if(check_line(lambda)){
		    var fe=create_widget('spectrum_feature', flist);
		    fe.set('wl',lambda);
		    fe.set_title(ion + ", "+lambda+ 'Å');
		    flist.add_child(fe);
		    
		    //line_table.value.push([ion, lambda, 0.0] );
		    //line_table.redraw();
		    view.redraw();
		}
	    });
	    
	    add_custom_feature.listen('click', function(){
		var specfec=spectrum.get('custom_feature');
		
		var lambda=specfec.val('wl');
		
		if(check_line(lambda)){
		    
		    var fe=create_widget('spectrum_feature', flist);
		    fe.set('wl',lambda);
		    fe.set('pixel',specfec.val('pixel'));
		    fe.set_title(specfec.name);
		    flist.add_child(fe);
		    
		    //line_table.value.push([ion, lambda, 0.0] );
		    //line_table.redraw();
		    view.redraw();
		}
	    });
	    
	    
	    
	    view.listen('redraw',function(context){
		var i=0;
		for(var fe in flist.elements ){
		    var feature=flist.elements[fe];
		    feature.draw(context, view);
		}
	    });
	    
      ok();
  },
   key:"spectrum" })
