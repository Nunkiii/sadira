({ name:"Select",
  type:"toolbar",
  ui_opts:{},
  elements:{ left:{ type:"toolbar_section",
      elements:{ db_select:{ name:"Select database ",
          type:"dropdown",
          ui_opts:{ type:"toolbar" } },
        col_select:{ name:"Select collection ",
          type:"dropdown",
          ui_opts:{ type:"toolbar" } } } } },
  widget_builder:function (){
	    var chooser=this;
	    //console.log("collection chooser Widget builder for " + this.name);
	    var db_select=chooser.get("db_select");
	    var col_select=chooser.get("col_select");
	    var col_widget;

	    db_select.hide();
	    col_select.hide();

	    new_event(chooser, 'database_selected');
	    new_event(chooser, 'collection_selected');
	    new_event(chooser, 'error');
      
	    db_select.listen('select',function(e){
		//console.log("DB changed to " + e.name + " : " + e.els.name.value) ;
		chooser.selected_db=e;
		chooser.trigger("database_selected", e);
		chooser.get_collections(function(e){

		});

	    });

	    col_select.listen('select',function(e){
		// if(col_widget===undefined){
		//     col_widget=tmaster.create_object_from_data(e);
		//     chooser.update_child(col_widget,'selected');
		// }		
		// else
		//     set_template_data(col_widget,e);
		//col_widget.set_title(chooser.collection_data[e].name , chooser.collection_data[e].els.name.value);

		chooser.trigger("collection_selected", e);
		chooser.selected_collection=e;
		
		//console.log("Chooser changed " + JSON.stringify(e, null, 2));
		

		//col_widget.set_title("Yeeeeooo222");
	    });
	    
	    chooser.get_databases=function(cb){
	    	var dr=new request({ cmd : '/api/dbcom/get', args : { collection : "mongo_databases" }});
		
		dr.execute(function(err, db_data){
		    if(err){
			chooser.message(dump_error(err), { type : 'danger', title : 'Error query'});
			return cb(err);
		    }
		    if(db_data.error!== undefined){
			chooser.parent.message(db_data.error, { type : 'warning', title : 'Ooops!'});
			chooser.hide();
			return cb(db_data.error);
		    }
		    
			
		    db_data.forEach(function(d){
			d.label = d.name;
		    });
		    db_select.set_items(db_data);

		    db_select.hide(false);
		    

		});
	    }
	    
	    chooser.get_collections=function(cb){
		var r=new request({ cmd : '/api/dbcom/get', args : { db : { name : chooser.selected_db.els.name.value} } });
		
		r.execute(function(err, col_data){
		    
		    if(err){
			chooser.message(dump_error(err), { type : 'danger', title : 'Error query'});
			return;
		    }
		    
		    //chooser.collection_data=result;
		    if(col_data.length>0){
			
			col_data.forEach(function(d){ d.label = d.name});
			col_select.set_items(col_data);
			
			cb(true);
			col_select.hide(false);
			
		    }else{
			chooser.set_title("No collection available");
			chooser.disable();
			cb(true);
		    }
		    // chooser.listen("change", function (value) {
		    // 	console.log("changed to " + value);
		    // 	get_collection_objects(chooser.value);
		    // });
		    
		});
	    }
	    
	    // if(chooser.ui_opts.collection===undefined){
	    // 	chooser.get_collection_list(function(ok){
	    // 	    if(ok === true){
	    // 		console.log("Got collections");
	    // 		//get_collection_objects(chooser.value);
	    // 	    }
	    // 	});
	    // }else{
	    // 	chooser.hide(true);
	    // 	//get_collection_objects(ui_opts.collection);
	    // }
	    
	    chooser.get_databases(function(error){
		chooser.trigger('error', error);
	    });
	},
  key:"db_collection_chooser" })