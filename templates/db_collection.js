({
    key:"db_collection",
    name:"Object collection",
    ui_opts:{
	fa_icon:"reorder",
	mini_elm:"description"
    },
    elements:{
	// name:{
	//     name:"Collection name",
	//     type:"string",
	//     holder_value:"Enter name here",
	//     ui_opts:{ label:true } },
	template:{ name:"Collection template",
		   type:"string",
		   ui_opts:{ label:true } },
	db:{ name:"Database",
	     ui_opts:{ label:true } },
	// 	       },
	// usi : {
	  browser:{ type:"data_nav",
		    ui_opts:{ fa_icon:"doc",
			      root_classes:[ "col-md-3" ],
			      child_classes:[ "container-fluid" ] } },
	  selected_object_cnt:{ ui_opts:{ root_classes:[ "col-md-9" ],
					  child_classes:[ "container-fluid" ] },
				elements:{ selected_object:{ type:"view" } } }
	  
      },
    widget_builder:function (ok, fail){
	  //this.wait("Waiting for the One...");
	  
	  var db_b=this;
	  var dbb=this.get('browser');
	  var selobj=db_b.get("selected_object");
	  var tb_body=dbb.get("table");
	  
	  dbb.set_data_source(this);
	//this.get('table').set_title("Documents");
	
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
	
	
	function get_documents(){
	    var col_name=db_b.name;
	    var dbname="sys";//db_b.val('name');
	    
	    //db_b.message("Loading dbname " + dbname + " collection " + col_name);
	    var rq_data={ cmd : '/api/dbcom/list', args : { db : { name : dbname, collection : col_name} } };
	    var r=new request(rq_data);
	    //db_b.message("Loading collections..." + JSON.stringify(rq_data));
	    
	    //   return;
	    r.execute(function(err, col_data){
		dbb.wait(false);
		if(err){
		    dbb.message(dump_error(err), { type : 'danger', title : 'Error query'});
		    return;
		}
		if(col_data.error !==undefined){
		    dbb.message(col_data.error, { type : 'danger', title : 'Error query'});
		    return;
		}
		console.log("Got DATA " + JSON.stringify(col_data) + " L= " + col_data.data.length);
		//chooser.collection_data=result;
		if(col_data.data.length>0){
		    col_data.head[0].show=false;
		    db_b.trigger("new_data", col_data);
		    
		}else{
		    db_b.set_subtitle("No documents");
		    tb_body.hide();
		}
		
	    });
	    
	}
	
	tb_body.listen('select_row', function(row){
	    //dbb.message('select row data ID ' + JSON.stringify(row.data[0]));
	    
	    var docinfo={
		db : "sys",
		collection : db_b.name,
		id : row.data[0],
	    };
	    
	    var u=get_server_address()+"/widget/view?"+encodeURIComponent(JSON.stringify(docinfo));
	    //sadira.change_root_widget(selobj,u);
	    selobj.load_doc(docinfo, function(error){
	    });
	});
  
	  this.listen('data_loaded', function(d){
	      //db_b.message("Data loaded " + JSON.stringify(d));
	      get_documents();
	  });

	ok();
      }
      
})
