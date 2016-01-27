var view_templates = {

    data_source : {
	name : "Data source",
	intro : "<p>Download a big JSON file</p>",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["row"],
	    fa_icon : "download",
	    intro_stick : true
	    //child_classes : ["container-fluid"],
	    //name_classes : ["col-sm-2"],
	},
	elements : {
	    status : {
		ui_opts : {
		    root_classes : ["col-sm-12"],
		    item_classes : ["big_vertical_margin"],
		    child_classes : ["row"],
		},
		name : 'Data setup',
		type : 'progress'
	    },
	    c : {
		ui_opts : {
		    root_classes : ["col-sm-12"]
		},
		
		elements : {
		    dl : {
			type : 'action',
			name : 'Download',
			ui_opts : {
			    //wrap: true,
			    root_classes : ["col-xs-3 "],
			    //in_root : 'prepend',
			    //root_classes : ["col-sm-12"],
			    button_node : 'span',
			    item_classes : ["btn btn-success btn-sm"]
			}
		    },
		    cn : {
			ui_opts : {
			    root_classes : ["col-xs-offset-3 col-sm-3 col-xs-6 panel panel-default"]
			},
			elements : {
			    size : {
				name : "Size : ",
				ui_opts : {
				    root_classes : ["col-xs-12"],
				    label : true
				},
				type : 'bytesize',
			    },
			    n_rows : {
				name : "Rows :",
				type : 'double',
				value: 0,
				
				ui_opts : {
				    label: true,
				    //type : 'edit',
				    root_classes : ["col-xs-12 form-inline"],
				    //name_classes : ["col-sm-7"],
				}
				
			    }
			}
		    }
		    
		}
	    }
	    
	},
	widget_builder : function(){
	    
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
	}
    },
    
    table : {
	name : "Data table",
	// ui_opts : {
	//     root_classes : ["container-fluid"],
	//     child_classes : ["row vertical_margin"],
	//     fa_icon : "table"
	// },
	// elements : {
	//     body : {
		//name : "No data...",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["row vertical_margin vertical_padding"],
	    item_classes : ["big_vertical_margin"],
	    //child_view_type : ""
	},
	//toolbar : {},
	elements : {
	    nav : {
		//name : "Page navigation ",
		ui_opts : {
		    //root_classes : ["panel panel-primary"],
		    //name_classes : ["panel-heading"],
		    child_classes : ["container-fluid vertical_margin vertical_padding"],
		    item_classes : ["container-fluid big_vertical_margin"],
		    //name_node : 'div',
		    //label : true
		    in_root : 'prepend'
		},
		elements : {
		    opts : {
			name : "Config",
			ui_opts : {
			    root_classes : ["container-fluid"],
			    //name_classes : ["panel-heading"],
			    child_classes : ["container-fluid panel panel-info vertical_padding vertical_margin"],
			    name_node : "div",
			    //render_name : false,
			    sliding : true,
			    slided : false,
			    label : true
			},
			elements : {
			    page_size : {
				ui_opts : {
				    label : true,
				    type : 'edit',
				    //root_classes : ["col-sm-3"],
				    item_classes : ["input-sm form-inline inline"]
				},
				name : "Page size ",
				type : 'double', min : 5, max : 200, step : 1, value : 10
			    },
			}
		    },
		    
		    page_nav : {
			ui_opts : {
			    root_classes : ["col-sm-4 col-xs-12"],
			    child_classes : ["row"],
			},
			elements : {
			    left_nav : {
				type : "action",
				name : "<span class='fa fa-chevron-left'></span>",
				ui_opts : {
				    item_classes : ['btn btn-primary'],// 
				    root_classes : ["col-xs-3"],
				    //root_classes : ["btn btn-primary"],
				    //button_node : 'span'
				}
			    },
			    page_select : {
				ui_opts : {
				    label : true, type : 'edit',
				    root_classes : ["col-xs-6"],
				    //item_classes : ["btn "],
				    item_classes : ["input-sm"]
				},
				//name : "Page size ",
					type : 'double', min : 0, max : 200, step : 1, value : 0
			    },
			    right_nav : {
				type : "action",
				name : "<span class='fa fa-chevron-right'></span>",
				ui_opts : {
				    root_classes : ["col-xs-3 text-right"],
				    item_classes : ["btn btn-primary"],
				    //root_classes : ["btn btn-primary"],
				    //button_node : 'span'
				}
			    }
			}
		    },
		    
		    slider : {
			//name : "Browse pages",
			type : 'double',
			min : 0,
			max: 100,
			step: 2,
			ui_opts : {
			    label : true,
			    input_type : 'range', type : 'edit',
			    root_classes : ["col-sm-8 col-xs-12 vertical_margin"],
			    item_classes : ["input-sm"],
			}
		    }
		}
	    }
	},
	widget_builder : function(){
	    // var car=ce('div'); car.className='carousel slide';car.setAttribute("data-ride", "carousel");car.setAttribute("data-interval", false); car.id='car0'
	    // //var car_ind=cc('ol',car); car_ind.className='carousel-indicator';
	    // var car_in=tb_body.car_in=cc('div',car); car_in.className='carousel-inner'; car_in.setAttribute("role", "listbox");
	    // var cac=tb_body.lefta=cc('a',car); cac.className='left carousel-control'; cac.setAttribute("role", "button"); cac.setAttribute("data-slide", "prev");
		    // cac.setAttribute("href", "#car0");
	    // var cs=cc('span',cac); cs.className="glyphicon glyphicon-chevron-left";cs.setAttribute("aria-hidden", "true");
	    
	    // var cac=tb_body.righta=cc('a',car); cac.className='right carousel-control'; cac.setAttribute("role", "button"); cac.setAttribute("data-slide", "next");
	    // cac.setAttribute("href", "#car0");
	    
	    // var cs=cc('span',cac); cs.className="glyphicon glyphicon-chevron-right";cs.setAttribute("aria-hidden", "true");
	    
	    
	    var tb_body=this;
	    var car=ce('div'); car.className='table-responsive';
	    
	    //var tbl_buf=tb_body.tbl_buf=[];
	    
	    var page_size=tb_body.get('page_size');
	    var page_select=tb_body.get('page_select');
	    var nav=tb_body.get('nav');
	    var slider=tb_body.get('slider');
	    
	    new_event(tb_body, 'column_sort');
	    new_event(tb_body, 'select_row');
	    
	    //tb_body.hide(true);
	    var lefta=tb_body.get('left_nav');
	    var righta=tb_body.get('right_nav');
	    
	    righta.listen('click',function(){
		//		    $(car).bind("slide.bs.carousel", function(e){
		//console.log("carrrr slided " + JSON.stringify(e) );
		tb_body.move('left');
	    });
	    
	    lefta.listen('click',function(){
		tb_body.move('right');
	    });
	    
	    slider.listen('input',function(v){
		if(tb_body.npages>0){
		    tb_body.display_page(v*1.0);
		}
	    });
	    
	    page_size.listen('change',function(v){
		tb_body.create_tables();
		
		if(tb_body.data!==undefined)
		    tb_body.npages=Math.ceil(tb_body.data.length*1.0/page_size.value);
		tb_body.display_page(0);
		tb_body.update_slider();
	    });
	    page_select.listen('change',function(v){
		tb_body.display_page(v-1);
	    });
	    
	    tb_body.set_data =function(data, page_start){
		//console.log("Tb body set data ! " + data.length);
		if(page_start===undefined) page_start=0;
		tb_body.npages=Math.floor(data.length*1.0/page_size.value);
		if(tb_body.npages !=data.length*1.0/page_size.value) tb_body.npages++;
		tb_body.data=data;
		tb_body.display_page(page_start);
		tb_body.update_slider();
	    };
	    
	    tb_body.move =function(dir){
		var n;
		tb_body.tbl_buf[tb_body.center_id].item.style.display="none";
		if(dir==='left'){
		    tb_body.page++;
		    //console.log("Going LEFT p=" + tb_body.page);
		    tb_body.center_id= tb_body.center_id === 2 ? 0 : tb_body.center_id+1;
		    n= tb_body.center_id === 2 ? 0 : tb_body.center_id+1;
		    tb_body.fill_data(tb_body.tbl_buf[n],tb_body.data,(tb_body.page+1)*page_size.value);
		}else{
		    //if(tb_body.page-1==0) return;
		    tb_body.page--;
		    //console.log("Going RIGHT p=" + tb_body.page);
		    tb_body.center_id= tb_body.center_id === 0 ? 2 : tb_body.center_id-1;
		    n= tb_body.center_id === 0 ? 2 : tb_body.center_id-1;
		    if(tb_body.page>0)
			tb_body.fill_data(tb_body.tbl_buf[n],tb_body.data,(tb_body.page-1)*page_size.value);
		}
		tb_body.tbl_buf[tb_body.center_id].item.style.display="";
		
		tb_body.update_page_title();
		tb_body.update_slider();
	    };
	    
	    tb_body.update_slider =function(){
		slider.set_parameters(0,tb_body.npages-1,1);
		slider.set_value(tb_body.page);
	    }
		    
	    tb_body.update_page_title =function(){
		nav.set_title("Display page " + (tb_body.page*1.0+1) + "/" + tb_body.npages );
		page_select.set_value(tb_body.page+1);
		
		if(tb_body.npages<=1){
		    nav.hide(true);
		    return;
			}
			nav.hide(false);
			if(tb_body.page==0){
			    lefta.disable(true);
			}else
			    lefta.disable(false);
			if(tb_body.page==tb_body.npages-1){
			    righta.disable(true);
			}else
			    righta.disable(false);
		    };
		    
		    tb_body.display_page =function(page_id){
			
			tb_body.page=page_id;
			tb_body.fill_data(tb_body.tbl_buf[1], tb_body.data, page_id*page_size.value);
			tb_body.tbl_buf[0].item.style.display="none";
			tb_body.tbl_buf[1].item.style.display="";
			tb_body.tbl_buf[2].item.style.display="none";
			tb_body.center_id=1;

			//console.log("Table display page " + page_id + " ndata = " + tb_body.data.length);
			if(page_id>0)

			    tb_body.fill_data(tb_body.tbl_buf[0], tb_body.data, (page_id-1)*page_size.value);
			if(page_id<tb_body.data.length-1)
			    tb_body.fill_data(tb_body.tbl_buf[2], tb_body.data, (page_id+1)*page_size.value);

			tb_body.center_id=1;
			tb_body.update_page_title();
		    };

		    tb_body.select_row =function(row){
			tb_body.trigger('select_row', row);
			
		    }
		    
		    tb_body.fill_data =function(ti, data, start){
			var tl=ti.rows.length;
			if(tl===0) return;
			var nc=ti.rows[0].cells.length;
			var imax=start+tl > data.length ? data.length-start : tl;
			
			
			for(var i=0;i<tl;i++){
			     ti.rows[i].tr.style.display="none";
			    for(var c=0;c<nc;c++) ti.rows[i].cells[c].innerHTML="";
			}

			for(var i=0;i<imax;i++){
			    //ti.rows[i][0].innerHTML='<strong>'+(start+i)+'</strong>';
			    ti.rows[i].data=data[start+i];
			    ti.rows[i].tr.style.display="";
			    var ci=0;
			    for(var c=0;c<tb_body.head.length;c++){
				if(tb_body.head[c].show!==false){
				    //console.log("Table Fill Data " + i + ", " + data[start+i][c]);
				    ti.rows[i].cells[ci].innerHTML=data[start+i][c];
				    ci++;
				}
			    }
			}
			//for(var i=imax;i<tl;i++) ti.rows[i].tr.display="none";
		    };
		    
		    var nc=0;
		    
		    tb_body.setup_sort=function(column){
			tb_body.head.forEach(function(dh){
			    if(dh.path===column){
				var bg=cc('div',dh.th); bg.className='btn-group table_head_cell'; bg.style.width='100%';
				var up=cc('it',bg); up.className="btn btn-info btn-sm fa fa-caret-up col-sm-2 col-xs-12";
				var tit=bg.appendChild(dh.tit);//dh.tit=cc('span',bg); tit.className='text-info text-center col-sm-8 col-xs-12';
				var down=cc('it',bg); down.className="btn btn-info btn-sm fa fa-caret-down col-sm-2 col-xs-12";
				up['data-col']=dh.path;
				down['data-col']=dh.path;
				
				up.addEventListener('click',function(){
				    tb_body.trigger("column_sort", { col : this['data-col'], dir : 'up'} );
				});
				down.addEventListener('click',function(){
				    tb_body.trigger("column_sort", { col : this['data-col'], dir : 'down'} );
				});
			    }
			    
			});
		    }
		    
		    tb_body.create_tables=function(data_head){
			//if(nc!==0) return;
			if(data_head===undefined) data_head=tb_body.head;
			else tb_body.head=data_head;
			
			//if(opts===undefined) opts={ n_rows : 20 };
			//tb_body.opts=opts;

			//if(nc!==0){car.innerHTML="Rebuilding...";  return; } else
			car.innerHTML="";
			nc=0;
			data_head.forEach(function(h){ if(h.show!==false) nc++;});
			//nc=data_head.length;
			//for(var c in data_head) nc++;
			
			var ntbl=3;
			tb_body.tbl_buf=[];

			var head_table=cc('table',car); head_table.className='table table-bordered table-hover';
			var thead=cc('thead',head_table); 
			
			var head_trnode=cc('tr',thead); head_trnode.className='vertical_padding vertical_margin';
			data_head.forEach(function(dh){
			    if(dh.show===false) return;
			    var cname=dh.path;
			    var th=dh.th=cc('th',head_trnode);
			    //th.className="col-xs-2  nopadding";
			    var tit=dh.tit=cc('span',th); tit.className='text-info text-center col-sm-8 col-xs-12';
			    tit.innerHTML=cname;
			    
			});
			
			//var car_items=tb_body.car_items=cc('div',car);
			//car_items.style.position='relative';
			//car_items.className="table-responsive";
			
			for(var t=0;t<ntbl;t++){
			    //console.log("Create " + t);
			    var tbl_item={};
			    var item=tbl_item.item=cc('tbody',head_table);
			    item.className="table";
			    //var table=tbl_item.table=cc('table', item);
			    //item.className="row";
			    item.style.display="none";
			    item.style.border='1px solid grey';
			    
			    //table.style.width="80%"; table.style.marginLeft="10%";
			    
			    
			    
			    // var head_node=cc('thead',table);
			    // var head_trnode=cc('tr',head_node);
			    // var body_node=cc('tbody',table);
			    // body_node.style.maxHeight="150px";
			    // body_node.style.overflowY="auto";
			    // // var th=cc('th',head_trnode);
			    // // th.className="col-sm-1";
			    // // th.innerHTML="i";
			    tbl_item.rows=[];
			    
			    for(var r=0;r<page_size.value;r++){
				
				var tr=cc('tr',item); //tr.className='table_row';
				var row={cells : [], tr : tr};
				tr.row=row;
				tr.addEventListener('click', function(){
				    //console.log('row clicked');
				    tb_body.select_row(this.row);
				});
				
				for(var c=0;c<nc;c++){
				    var cell=cc('td',tr); //cell.className='col-xs-2 table_cell';
				    
				    row.cells.push(cell); //cell.innerHTML="X";
				}
				tbl_item.rows.push(row);
			    }
			    tb_body.tbl_buf.push(tbl_item);
			    
			    
			}
			tb_body.tbl_buf[1].item.add_class("active");
			
			//tb_body.hide(false);
			
			//tb_body.display_page(0);
			

			//$(car).carousel({interval : 1000});
			
			
			// $(car).bind("slid.bs.carousel", function(){
			// 	console.log("carrrr slid " );
			// });


		    }

		    return car;
		}
	//     }
	// },

	// widget_builder : function(ui_opts, table){
	// }

	
    },
    
    data_nav : {
	name : "Data browse",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    fa_icon : "database",
	    //child_view_type : "tabbed"
	    //child_classes : ["row"]
	},
	//toolbar : {},
	elements : {
	    filters : {
		name : "Cross Filter",
		ui_opts: {
		    child_classes : ["row"]
		},
		elements : {},
		widget_builder : function (){
		    
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
		}
	    },
	    table : {
		type : 'table',
		elements : {
		}
	    }
	    
	    
	},
	widget_builder : function (){
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
	    
	}
    },

    toolbar : {
	name : 'Toolbar',
	ui_opts : {
	    //fa_icon : 'wrench',
	    root_node : 'nav',
	    root_classes : 'navbar navbar-default',
	    name_node : 'a',
	    name_classes : "navbar-brand",
	    child_classes : ["collapse navbar-collapse"]
	},
	elements : {},
	widget_builder : function(){
	    var cnt=ce('div');cnt.className='container-fluid';
	    this.ui_root.appendChild(cnt);
	    
	    var name_cnt=ce('div');name_cnt.className='navbar-header';
	    cnt.appendChild(name_cnt);
	    
	    var tbid=Math.random().toString(36).substring(2);
	    
	    var but=cc("button",name_cnt); but.className="navbar-toggle collapsed";
	    var sp=cc("span",but); sp.className="sr-only"; sp.innerHTML="Toggle navigation";
	    sp=cc("span",but); sp.className="icon-bar";
	    sp=cc("span",but); sp.className="icon-bar";
	    sp=cc("span",but); sp.className="icon-bar"; 
	    
	    but.setAttribute('data-toggle','collapse');
	    but.setAttribute('data-target','#'+tbid);
	    if(this.ui_name!==undefined)
		name_cnt.appendChild(this.ui_name);
	    if(this.ui_childs.div!==undefined){
		cnt.appendChild(this.ui_childs.div);
		
		this.ui_childs.div.id=tbid;
	    }else console.log(this.name+"("+this.type+"): no ui_childs.div !");
	    this.ui_root.style.zIndex=this.ui_root.style.zIndex+1;
	}
	

    },

    toolbar_section : {
	ui_opts : {
	    root_node : 'ul',
	    root_classes : ["nav navbar-nav"],
	    child_view_type : 'root'
	},
	widget_builder : function() {
	    var p=this.get_parent();
	    if(p.type!=="toolbar"){
		if(p.toolbar !== undefined){
		    this.ui_opts.attach=false;
		    p.toolbar.dnav.prependChild(this.ui_root);
		}
	    }

	}

    },
    
    geant_nav : {
	name : "Sym nav",
	subtitle : "geant4 sym data view",
	//type : "data_nav",
	
	ui_opts : {
	    name_classes : ["vertical_margin"],
	    child_view_type : "tabbed"
	},
	elements : {
	    source : { type : "data_source"},
	    browser : { type : 'data_nav'},
	    particles : {
		name : "Particles 3D",
		ui_opts : { root_classes : "container-fluid", item_bottom : true, item_classes : 'container-fluid'},
		elements : {
		    toolbar : {
			//type : 'toolbar',
			ui_opts : {},
			elements : {
			    enable : {
				type : 'bool',
				ui_opts : { type : 'edit', label : true },
				name : " Enable "
			    }
			}
		    }
		},
		widget_builder : function(){
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
		    
		    

		    return renderer.domElement;

		}
	    }

	},
	widget_builder : function (o, nav){

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
	}
	

    }
};

var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

if(nodejs)
    module.exports=view_templates;
else{
    
    (function(){
	sadira.listen("ready",function(){
	    tmaster.add_templates(view_templates);
	});
    })();
}
