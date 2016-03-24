({
    key:"db_mongo",
    name:"MongoDB Database",
    ui_opts:{ icon:"/icons/brands/logo-mongodb.png" },
    elements:{
	name:{ type:"string",
	       name:"Database key",
	       ui_opts:{ label:true } },
	usi : {
	    elements : {
		browser:{
		    type:"data_nav",
		    ui_opts:{
			//root_classes:[ "col-md-4" ],
			//child_classes:[ "container-fluid" ],
			//render_name:false
		    },
		    elements:{}
		},
		selected_object_cnt:{
		    ui_opts:{
			//root_classes:[ "col-md-8" ],
			//child_classes:[ "container-fluid" ]
		    },
		    //elements:{ selected_object:{ type:"view" } }
		}
	    }}
    },
    widget_builder:function (ok, fail){
	//this.wait("Waiting for the One...");

	var toolbar=this.get_toolbar();
	var db_b=this;
	var dbb=this.get('browser');
	var selobj=db_b.get("selected_object_cnt");
	var tb_body=dbb.get("table");
	
	dbb.set_data_source(this);
	tb_body.set_title("Collections");
	
	dbb.listen('crossfilter_ready', function(){
	    dbb.add_dimension({
		column : 'name', name : "Object name"
	    });
      
	    // dbb.add_dimension(
	    //     {
      // 	column : '_id', name : "Object ID"
	    //     }
	    // );
	});
	
	
	function get_collections(){
	    var dbname=db_b.val('name');
	    //db_b.message("Loading dbname " + dbname);
	    var r=new request({ cmd : '/api/dbcom/list', args : { db : { name : dbname} } });
		dbb.wait("Loading collections...");
	    r.execute(function(err, col_data){
		dbb.wait(false);
		if(err){
		    db_b.message(dump_error(err), { type : 'danger', title : 'Error query'});
		    return;
		}
		
		//chooser.collection_data=result;
		if(col_data.data.length>0){
		    col_data.head[0].show=false;
		    db_b.trigger("new_data", col_data);
		    
		}else{
		    dbb.set_subtitle("No collection available");
		}
	    });
	    
	}


	function clear_object(){
	    if(db_b.sel!==undefined) delete db_b.sel;
	    dbb.ui_root.style.display="";
	}
	function set_object(w){
	    db_b.sel=w;
	    selobj.ui_root.innerHTML="";
	    selobj.ui_root.appendChild(w.ui_root);
	    dbb.ui_root.style.display="none";
	}
	
	tb_body.listen('select_row', function(row){
	    //dbb.message('select row data ID ' + JSON.stringify(row.data[0]));

	    create_widget({ type : "view", ui_opts : {close : true} }).then(function(v){
		
		
		v.listen('close', function(){
		    clear_object();
		});
		
		v.load_doc({
		    id : row.data[0],
		    db : db_b.val('name'),
		    collection : "collections"
		}, function(error){

		    set_object(v);
		    
		});

	    });
	    
	    return;
	    db_b.ui_childs.div.innerHTML="Hello";
	    
	});
	
	db_b.listen('data_loaded', function(){
	    //db_b.message(db_b.name + " : Loaded data");
	    get_collections();
	});
	ok();
    }
    
})
