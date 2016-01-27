({ name:"Data source",
  intro:"<p>Download a big JSON file</p>",
  ui_opts:{ root_classes:[ "container-fluid" ],
    child_classes:[ "row" ],
    fa_icon:"download",
    intro_stick:true },
  elements:{ status:{ ui_opts:{ root_classes:[ "col-sm-12" ],
        item_classes:[ "big_vertical_margin" ],
        child_classes:[ "row" ] },
      name:"Data setup",
      type:"progress" },
    c:{ ui_opts:{ root_classes:[ "col-sm-12" ] },
      elements:{ dl:{ type:"action",
          name:"Download",
          ui_opts:{ root_classes:[ "col-xs-3 " ],
            button_node:"span",
            item_classes:[ "btn btn-success btn-sm" ] } },
        cn:{ ui_opts:{ root_classes:[ "col-xs-offset-3 col-sm-3 col-xs-6 panel panel-default" ] },
          elements:{ size:{ name:"Size : ",
              ui_opts:{ root_classes:[ "col-xs-12" ],
                label:true },
              type:"bytesize" },
            n_rows:{ name:"Rows :",
              type:"double",
              value:0,
              ui_opts:{ label:true,
                root_classes:[ "col-xs-12 form-inline" ] } } } } } } },
  widget_builder:function (){
	    
	    var data_source=this;
	    new_event(data_source, 'new_data');
	    
	    var status=data_source.get('status');
	    var size=data_source.get('size');
	    var dl=data_source.get('dl');
	    var n_rows=data_source.get('n_rows');
	    
	    dl.listen('click',function(){
		data_source.download();
	    });
	    
	    data_source.download=function(opts,cb){

		if(data_source.data!==undefined)
		    delete data_source.data;
		
		status.subtitle="<span class='fa fa-spinner fa-spin text-warning'></span> Downloading ... ";
		status.set_title();
		status.set_value(0.0);
		//status.hide(false);
		dl.disable(true);
		
		if(cb===undefined) {
		    cb=opts; opts={query : '/geant4/data.big.json'};
		}
		if(cb===undefined) cb = function(er){
		    if (er) data_source.error("Error loading data_source " + er);
		};
		console.log("Data source download....");
		
		json_query(opts.query, function(er, data){
		    if(er){
			dl.disable(false);
			return cb(er, data);
		    }
		    status.set_value(100);
		    data_source.data=data;
		    //status.hide(true);

		    status.item_ui.style.display="none";
		    dl.hide(true);
		    dl.disable(false);
		    n_rows.set_value(data.data.length);
		    data_source.trigger("new_data", data);
		}, {
		    progress :  function(e){
			if(e.e!==undefined){
			    if (e.e.lengthComputable) {
				var prc = Math.floor(100.0*e.e.loaded / e.e.total);
				size.set_value(e.e.loaded);
				status.set_value(prc);
			    }
			}else{
			    status.subtitle=e.m;
			    status.set_title();
			    status.set_value(e.v);
			}
			
		    }
		});
	    }
	},
  key:"data_source" })