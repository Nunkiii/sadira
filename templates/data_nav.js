({
    name:"Data browse",
    ui_opts:{ root_classes:[ "container-fluid" ],
	      fa_icon:"database" },
    elements:{
	filters:{ name:"Cross Filter",
		  ui_opts:{ child_classes:[ "row" ] },
		  elements:{},
		  widget_builder:function (ok, fail){
		      
		      new_event(this, 'update');
		      var filters=this;
		      var nav = filters.get_parent();
		      var tbody = nav.get('table');
		      //var tbody = table.get('body');
		      //var particles=this.parent.get('particles');
		      filters.views=[];

		      filters.hide();
		      
		      filters.create=function(f){

			  if(f.plot === undefined) return;

			  filters.hide(false);
			  var view_tpl;
			  
			  if(f.plot === "pie"){
			      view_tpl={
				  
				  type : "pie_chart",
				  ui_opts : {
				      fa_icon : 'pie-chart',
				      root_classes : ["col-sm-6"],
				      
				  },

			      };

			  }else if(f.plot === "vector"){
			      view_tpl={
				  type : 'vector',
				  ui_opts : {
				      fa_icon : 'bar-chart',
				      root_classes : ["col-sm-4"],
				      enable_selection : true,
				      yscale : 'log'
				  },
				  elements : {
				      btns : {
					  elements : {
					      reset : {
						  type : 'action',
						  name : 'Reset',
						  ui_opts : { item_classes : ["btn btn-xs btn-primary"]}
					      } 
					  }
				      }
				  }
			      };
			  }
			  
			  // var pie_view=create_widget(pie_tpl, filters);
			  // pie_view.set_title(f.name, f.column);
			  // filters.ui_childs.add_child(pie_view);
			  // return;
			  var grd=nav.groups[f.column].all(); //top(Infinity);
			  
			  function update(){
			      tbody.set_data(nav.dimensions[f.column].top(Infinity));
			      filters.set_subtitle( nav.all.value()+"/"+nav.data.data.length);
			      //table.set_subtitle( nav.all.value()+"/"+nav.data.data.length);

			      filters.trigger('update', f);
			      
			  }
			  
			  if(view_tpl!==undefined){
			      
			      var view=create_widget(view_tpl, filters);
			      filters.views.push(view)

			      view.set_title(f.name, f.column);
			      filters.ui_childs.add_child(view);

			      view.column=f.column;
			      
			      if(f.plot === "pie"){
				  view.set_data(nav.groups[f.column].top(Infinity));
			      }
			      
			      
			      if(f.plot === "vector"){
				  view.get('lines').hide();
				  view.listen("selection_change", function(sel){
				      nav.dimensions[f.column].filterRange(sel);
				      filters.views.forEach(function(fv){
					  if(fv.name!==f.name){
					      if(fv.type==='vector')
						  fv.config_range();
					      else if(fv.type==='pie_chart'){
						  fv.set_data(nav.groups[fv.column].top(Infinity));
					      }
					  }
				      });
				      
				      update();
				  });
				  
				  view.get('reset').listen('click', function(){
				      nav.dimensions[f.column].filterAll();
				      filters.views.forEach(function(fv){
					  if(fv.type==='vector')
					      fv.config_range();
				      });
				      update();
				  });
				  
				  //console.log("GRD " + JSON.stringify(grd));
				  view.y_range= f.y_range; //===undefined ? [0, 10] : f.y_range;
				  view.add_plot_points(grd, {x_id : 'key', y_id : 'value', label : f.name } );
				  //vec_view.
			      }

			      

			  }
			  
		      };

		      ok();
		  }
		},
	table:{
	    type:"table",
	    elements:{}
	}
    },
    widget_builder:function (ok,fail){
	var data_nav=this;
	var data_source;//=data_nav.get('data_source');
	var tbody=data_nav.get('table');
	//var tbody=table.get('body');
	var filters = data_nav.get("filters");
	
	data_nav.dimensions=[];
	data_nav.groups=[];
	
	new_event(data_nav, 'crossfilter_ready');
	var default_dim;

	data_nav.set_data_source=function(ds){
	    data_source=ds;
	    
	    data_source.listen("new_data", function(data){
		//data.data=data.data.slice(0,5000);
		//console.log("DATA LOADED !!!! " + JSON.stringify(data));
		var dataf=[];
		data.data.forEach(function(d){
		    if(d[4]*1.0>1e-5) dataf.push(d);
		});
		//data.data=dataf;
		data_nav.data=data;
		//delete default_dim;
		default_dim=undefined;

		
		if(data.head!==undefined){
		    tbody.create_tables(data.head);
		    //if(data.data!==undefined)
		    tbody.set_data(data.data);
		    
		    data_nav.init_crossfilter(data);
		    tbody.display_page(0);
		    tbody.update_slider();
		}
	    });
	    
	}
	
	
	data_nav.init_crossfilter=function(data){
	    if(data_nav.filter!==undefined) delete data_nav.filter;
	    var filter=data_nav.filter=crossfilter(data.data);
	    var all = data_nav.all=filter.groupAll();
	    
	    //data_nav.set_title("Data nav",filter.size());
	    tbody.set_subtitle(filter.size());
	    data_nav.trigger("crossfilter_ready");
	}

	data_nav.add_dimension=function(opts){
	    var cn=opts.column;
	    var c=0;
	    for(c=0;c<this.data.head.length;c++){ if(this.data.head[c].path===cn) break; }
	    //console.log("CNAV ::: cn="+cn + " ci = " + ci);
	    data_nav.dimensions[cn]=this.filter.dimension(function(d) { return d[c]; });
	    if(opts.filter_func!==undefined)
		data_nav.dimensions[cn].filterFunction(opts.filter_func);

	    if(opts.group_func!==undefined){
		data_nav.groups[cn] = data_nav.dimensions[cn].group(opts.group_func);
		filters.create(opts);
	    }
	    tbody.setup_sort(cn);
	    if(default_dim===undefined){
		default_dim=cn;
		tbody.set_data(data_nav.dimensions[default_dim].bottom(Infinity));
	    }
	}
	
	tbody.listen('column_sort', function(e){
	    if(data_nav.dimensions[e.col]!==undefined){
		console.log("column sort " + JSON.stringify(e));
		
		//data_nav.parent.set_title("<span class='fa fa-cog fa-spin text-warning'></span> Sorting data on " + e.col + " ... ");
		
		if(e.dir==='up')
		    tbody.set_data(data_nav.dimensions[e.col].top(Infinity));
		else
		    tbody.set_data(data_nav.dimensions[e.col].bottom(Infinity));
	    }
	});
	ok();
    },
    key:"data_nav" })
