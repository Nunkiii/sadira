({
  name:"Data table",
  ui_opts:{
    root_classes:[ "container-fluid" ],
    child_classes:[ "row vertical_margin vertical_padding" ],
    item_classes:[ "big_vertical_margin" ] },
  elements:{ nav:{ ui_opts:{ child_classes:[ "container-fluid vertical_margin vertical_padding" ],
			     item_classes:[ "container-fluid big_vertical_margin" ],
        in_root:"prepend" },
		   elements:{ opts:{ name:"Config",
				     ui_opts:{ root_classes:[ "container-fluid" ],
					       child_classes:[ "container-fluid panel panel-info vertical_padding vertical_margin" ],
					       name_node:"div",
					       sliding:true,
					       slided:false,
					       label:true },
				     elements:{ page_size:{ ui_opts:{ label:true,
								      type:"edit",
								      item_classes:[ "input-sm form-inline inline" ] },
							    name:"Page size ",
							    type:"double",
							    min:5,
							    max:200,
							    step:1,
							    value:10 } } },
			      page_nav:{ ui_opts:{ root_classes:[ "col-sm-4 col-xs-12" ],
						   
            child_classes:[ "row" ] },
          elements:{ left_nav:{ type:"action",
              name:"<span class='fa fa-chevron-left'></span>",
              ui_opts:{ item_classes:[ "btn btn-primary" ],
                root_classes:[ "col-xs-3" ] } },
            page_select:{ ui_opts:{ label:true,
                type:"edit",
                root_classes:[ "col-xs-6" ],
                item_classes:[ "input-sm" ] },
              type:"double",
              min:0,
              max:200,
              step:1,
              value:0 },
            right_nav:{ type:"action",
              name:"<span class='fa fa-chevron-right'></span>",
              ui_opts:{ root_classes:[ "col-xs-3 text-right" ],
                item_classes:[ "btn btn-primary" ] } } } },
        slider:{ type:"double",
          min:0,
          max:100,
          step:2,
          ui_opts:{ label:true,
            input_type:"range",
            type:"edit",
            root_classes:[ "col-sm-8 col-xs-12 vertical_margin" ],
            item_classes:[ "input-sm" ] } } } } },

   widget_builder:function (ok, fail){
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

  ok(car);
		},
  key:"table" })
