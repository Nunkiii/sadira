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
	widget_builder : function(ui_opts, data_source){
	    
	    new_event(data_source, 'data_loaded');
	    
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
		    data_source.trigger("data_loaded", data);
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
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["row vertical_margin"],
	    fa_icon : "table"
	},
	elements : {
	    body : {
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
			name : "Page navigation ",
			ui_opts : {
			    root_classes : ["panel panel-primary"],
			    name_classes : ["panel-heading"],
			    child_classes : ["container-fluid vertical_margin vertical_padding"],
			    item_classes : ["container-fluid big_vertical_margin"],
			    name_node : 'div'
			    //label : true
			    //in_root : 'prepend'
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
		widget_builder : function(ui_opts, tb_body){
		    // var car=ce('div'); car.className='carousel slide';car.setAttribute("data-ride", "carousel");car.setAttribute("data-interval", false); car.id='car0'
		    // //var car_ind=cc('ol',car); car_ind.className='carousel-indicator';
		    // var car_in=tb_body.car_in=cc('div',car); car_in.className='carousel-inner'; car_in.setAttribute("role", "listbox");
		    // var cac=tb_body.lefta=cc('a',car); cac.className='left carousel-control'; cac.setAttribute("role", "button"); cac.setAttribute("data-slide", "prev");
		    // cac.setAttribute("href", "#car0");
		    // var cs=cc('span',cac); cs.className="glyphicon glyphicon-chevron-left";cs.setAttribute("aria-hidden", "true");

		    // var cac=tb_body.righta=cc('a',car); cac.className='right carousel-control'; cac.setAttribute("role", "button"); cac.setAttribute("data-slide", "next");
		    // cac.setAttribute("href", "#car0");
		    // var cs=cc('span',cac); cs.className="glyphicon glyphicon-chevron-right";cs.setAttribute("aria-hidden", "true");
		    
		    var car=ce('div'); car.className='';
		    
		    var tbl_buf=tb_body.tbl_buf=[];

		    var page_size=tb_body.get('page_size');
		    var page_select=tb_body.get('page_select');
		    var nav=tb_body.get('nav');
		    var slider=tb_body.get('slider');
		    
		    new_event(tb_body, 'column_sort');

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
			    tb_body.npages=Math.floor(tb_body.data.length*1.0/page_size.value);
			tb_body.display_page(0);
			tb_body.update_slider();
		    });
		    page_select.listen('change',function(v){
			tb_body.display_page(v-1);
		    });
		    
		    tb_body.set_data =function(data, page_start){
			if(page_start===undefined) page_start=0;
			tb_body.npages=Math.floor(data.length*1.0/page_size.value);
			tb_body.data=data;
			tb_body.display_page(page_start);
			tb_body.update_slider();
		    };

		    tb_body.move =function(dir){
			var n;
			tbl_buf[tb_body.center_id].item.style.display="none";
			if(dir==='left'){
			    tb_body.page++;
			    //console.log("Going LEFT p=" + tb_body.page);
			    tb_body.center_id= tb_body.center_id === 2 ? 0 : tb_body.center_id+1;
			    n= tb_body.center_id === 2 ? 0 : tb_body.center_id+1;
			    tb_body.fill_data(tbl_buf[n],tb_body.data,(tb_body.page+1)*page_size.value);
			}else{
			    //if(tb_body.page-1==0) return;
			    tb_body.page--;
			    //console.log("Going RIGHT p=" + tb_body.page);
			    tb_body.center_id= tb_body.center_id === 0 ? 2 : tb_body.center_id-1;
			    n= tb_body.center_id === 0 ? 2 : tb_body.center_id-1;
			    if(tb_body.page>0)
				tb_body.fill_data(tbl_buf[n],tb_body.data,(tb_body.page-1)*page_size.value);
			}
			tbl_buf[tb_body.center_id].item.style.display="";
			
			tb_body.update_page_title();
			tb_body.update_slider();
		    };

		    tb_body.update_slider =function(){
			slider.set_parameters(0,tb_body.npages-1,1);
			slider.set_value(tb_body.page);
		    }
		    
		    tb_body.update_page_title =function(){
			nav.set_title("Page " + (tb_body.page*1.0+1) + "/" + tb_body.npages );
			page_select.set_value(tb_body.page+1);
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
			tb_body.fill_data(tbl_buf[1], tb_body.data, page_id*page_size.value);
			tbl_buf[0].item.style.display="none";
			tbl_buf[1].item.style.display="";
			tbl_buf[2].item.style.display="none";
			tb_body.center_id=1;
			
			if(page_id>0)

			    tb_body.fill_data(tbl_buf[0], tb_body.data, (page_id-1)*page_size.value);
			if(page_id<tb_body.data.length-1)
			    tb_body.fill_data(tbl_buf[2], tb_body.data, (page_id+1)*page_size.value);

			tb_body.center_id=1;
			tb_body.update_page_title();
		    };

		    
		    tb_body.fill_data =function(ti, data, start){
			var tl=ti.rows.length;
			if(tl===0) return;
			var nc=ti.rows[0].length;
			var imax=start+tl > data.length ? data.length-start : tl;
			
			//console.log("Fill " + tl + ", " + nc);
			for(var i=0;i<tl;i++){
			    for(var c=0;c<nc;c++) ti.rows[i][c].innerHTML="";
			}

			for(var i=0;i<imax;i++){
			    //ti.rows[i][0].innerHTML='<strong>'+(start+i)+'</strong>';
			    for(var c=0;c<nc;c++){
				ti.rows[i][c].innerHTML=
				    data[start+i][c];
			    }
			}
		    };
		    
		    tb_body.create_tables=function(data_head){
			if(data_head===undefined) data_head=tb_body.head;
			else tb_body.head=data_head;
			
			//if(opts===undefined) opts={ n_rows : 20 };
			//tb_body.opts=opts;
			var nc=0;
			for(var c in data_head) nc++;
			car.innerHTML="";
			var ntbl=3;
			tbl_buf=[];

			var head_trnode=cc('div',car); head_trnode.className='row vertical_padding vertical_margin';
			for(var cname in data_head){
			    var th=cc('div',head_trnode);
			    th.className="col-xs-2  nopadding";
			    var bg=cc('div',th); bg.className='btn-group table_head_cell'; bg.style.width='100%';
			    var up=cc('it',bg); up.className="btn btn-info btn-xs fa fa-caret-up col-sm-2 col-xs-12";
			    var tit=cc('span',bg); tit.className='btn btn-default btn-xs col-sm-8 col-xs-12';
			    var down=cc('it',bg); down.className="btn btn-info btn-xs fa fa-caret-down col-sm-2 col-xs-12";
			    tit.innerHTML=cname;

			    up['data-col']=cname;
			    down['data-col']=cname;

			    up.addEventListener('click',function(){
				tb_body.trigger("column_sort", { col : this['data-col'], dir : 'up'} );
			    });
			    down.addEventListener('click',function(){
				tb_body.trigger("column_sort", { col : this['data-col'], dir : 'down'} );
			    });
			    
			}

			var car_items=tb_body.car_items=cc('div',car);
			car_items.style.position='relative';
			
			
			for(var t=0;t<ntbl;t++){
			    //console.log("Create " + t);
			    var tbl_item={};
			    var item=tbl_item.item=cc('div',car_items);
			    //item.className="container-fluid";
			    //var table=tbl_item.table=cc('table', item);
			    item.className="row";
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
				var row=[];
				var tr=cc('div',item); tr.className='table_row';
				
				for(var c=0;c<nc;c++){
				    var cell=cc('div',tr); cell.className='col-xs-2 table_cell';
				    
				    row.push(cell);
				}
				tbl_item.rows.push(row);
			    }
			    tbl_buf.push(tbl_item);
			    
			    
			}
			tbl_buf[1].item.add_class("active");
			
			//tb_body.hide(false);
			//tb_body.set_data(data.data);
			//tb_body.display_page(0);
			

			//$(car).carousel({interval : 1000});
			
			
			// $(car).bind("slid.bs.carousel", function(){
			// 	console.log("carrrr slid " );
			// });


		    }

		    return car;
		}
	    }
	},

	widget_builder : function(ui_opts, table){
	}

	
    },
    
    data_nav : {
	name : "Data browser",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    fa_icon : "database",
	    child_view_type : "tabbed"
	    //child_classes : ["row"]
	},
	//toolbar : {},
	elements : {
	    data_source : {
		type : 'data_source'
	    },
	    table : {
		type : 'table',
		elements : {
		}
	    },
	    filters : {
		name : "Filtering",
		ui_opts: {
		    child_classes : ["row"]
		},
		elements : {},
		widget_builder : function (ui_opts, filters){
		    
		    var nav = filters.get_parent();
		    var table = nav.get('table');
		    var tbody = table.get('body');
		    filters.views=[];
		    
		    filters.create=function(f){
			var vec_view_tpl={
			    type : 'vector',
			    ui_opts : {
				fa_icon : 'bar-chart',
				root_classes : ["col-sm-6"],
				enable_selection : true,
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
			
			var vec_view=create_widget(vec_view_tpl, filters);
			
			var grd=nav.groups[f.column].all(); //top(Infinity);

			function update(){
			    tbody.set_data(nav.dimensions[f.column].top(Infinity));
			    filters.set_subtitle( nav.all.value()+"/"+nav.data.data.length);
			    table.set_subtitle( nav.all.value()+"/"+nav.data.data.length);
			}
			
			vec_view.listen("selection_change", function(sel){
			    nav.dimensions[f.column].filterRange(sel);
			    filters.views.forEach(function(fv){
				if(fv.name!==f.name){
				    fv.config_range();
				}
			    });
			    update();
			});

			vec_view.get('reset').listen('click', function(){
			    nav.dimensions[f.column].filterAll();
			    filters.views.forEach(function(fv){
				fv.config_range();
			    });
			    update();
			});
			filters.views.push(vec_view)
			//console.log("GRD " + JSON.stringify(grd));
			vec_view.y_range= f.y_range; //===undefined ? [0, 10] : f.y_range;
			vec_view.add_plot_points(grd, {x_id : 'key', y_id : 'value', label : f.name } );
			//vec_view.
			vec_view.set_title(f.name, f.column);
			filters.ui_childs.add_child(vec_view);
			
		    };
		}
	    }
	    
	},
	widget_builder : function (ui_opts, data_nav){
	    var data_source=data_nav.get('data_source');
	    var table=data_nav.get('table');
	    var tbody=table.get('body');
	    var filters = data_nav.get("filters");

	    data_nav.dimensions=[];
	    data_nav.groups=[];
	    
	    new_event(data_nav, 'crossfilter_ready');
	    var default_dim;
	    
	    data_nav.init_crossfilter=function(data){
		
		var filter=data_nav.filter=crossfilter(data.data);
		var all = data_nav.all=filter.groupAll();
		
		//d3.selectAll("#total").text(filter.size());
		table.set_subtitle(filter.size());
		data_nav.trigger("crossfilter_ready");
	    }

	    data_nav.add_dimension=function(opts){
		var cn=opts.column;
		var ci=0;
		for(var c in this.data.head){ if(cn===c) break; ci++; }
		console.log("CNAV ::: cn="+cn + " ci = " + ci);
		data_nav.dimensions[cn]=this.filter.dimension(function(d) { return d[ci]; });
		if(opts.filter_func!==undefined)
		    data_nav.dimensions[cn].filterFunction(opts.filter_func);

		if(opts.group_func!==undefined){
		    data_nav.groups[cn] = data_nav.dimensions[cn].group(opts.group_func);
		    filters.create(opts);
		}
		
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
	    
	    data_source.listen("data_loaded", function(data){
		//data.data=data.data.slice(0,5000);
		data_nav.data=data;
		tbody.create_tables(data.head);
		data_nav.init_crossfilter(data);
	    });
	}
    },
    
    
    geant_nav : {
	name : "Sym nav",
	subtitle : "geant4 sym data view",
	type : "data_nav",
	ui_opts : {
	    name_classes : ["vertical_margin"],
	},
	widget_builder : function (o, nav){

	    var binsize=1;
	    
	    nav.listen('crossfilter_ready', function(){
		
		nav.add_dimension(
		    {
			column : 'E_DEP',
			name : "Deposited energy",
			group_func : function(d) {
			    return Math.floor(d/binsize)*binsize;
			},
			filter_func : function(d) {
			    //console.log("Filter d=" + d);
			    return true; //d>0;
			},
			//y_range : [0,12000]
			
		    });
		
		nav.add_dimension(
		    {
			column : 'Z_ENT', name : "Z Ent",
			group_func : function(d) {
			    return Math.floor(d/30)*30;
			},
			//y_range : [0,100]
			
		    }
		);

		
		nav.add_dimension(
		    {
			column : 'E_KIN_ENT', name : "Input Energy",
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

(function(){
    sadira.listen("ready",function(){
	tmaster.add_templates(view_templates);
    });
})();
