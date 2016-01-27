({
  key:"db_mongo",
  name:"MongoDB Database",
  ui_opts:{ icon:"/sadira/icons/brands/logo-mongodb.png" },
  elements:{
    name:{ type:"string",
	   name:"Database key",
	   ui_opts:{ label:true } },
    browser:{
      type:"data_nav",
      ui_opts:{
	root_classes:[ "col-md-5" ],
	child_classes:[ "container-fluid" ],
	render_name:false },
      elements:{}
    },
    selected_object_cnt:{
      ui_opts:{
	root_classes:[ "col-md-7" ],
	child_classes:[ "container-fluid" ]
      },
      elements:{ selected_object:{ type:"view" } } }
  },
  widget_builder:function (ok, fail){
    //this.wait("Waiting for the One...");
    
    var db_b=this;
    var dbb=this.get('browser');
    var selobj=db_b.get("selected_object");
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
	    
	    tb_body.listen('select_row', function(row){
	    	dbb.message('select row data ID ' + JSON.stringify(row.data[0]));
		selobj.load_doc({
		    id : row.data[0],
		    db : db_b.val('name'),
		    collection : "collections"
		}, function(error){
		});
	    });
	    
    db_b.listen('data_loaded', function(){
      //db_b.message(db_b.name + " : Loaded data");
      get_collections();
    });
    ok();
  }

})
