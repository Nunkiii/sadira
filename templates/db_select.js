({
    key:"db_select",
    name:"Select database ",
    type:"dropdown",
    widget_builder:function (ok, fail){
	var db_select=this;
	
	console.log("SELECT DB BUILD///");
	
	//db_select.hide();
	
	new_event(db_select, 'database_selected');
	new_event(db_select, 'error');
	
	db_select.listen('select',function(e){
	    //console.log("DB changed to " + e.name + " : " + e.els.name.value) ;
	    this.selected_db=e;
	    this.trigger("database_selected", e);
	});
	
	db_select.get_databases=function(cb){
	    var dr=new request({ cmd : '/api/dbcom/get', args : { db : { collection : "mongo_databases" } }});
	    db_select.wait("DB Loading...");
	    dr.execute(function(err, db_data){
		db_select.wait(false);
		if(err){
		    db_select.trigger('error', error);
		    db_select.button.hide(true);

		    //chooser.message(dump_error(err), { type : 'danger', title : 'Error query'});
		    //db_select.hide();
		    return cb(err);
		}
		
		if(db_data.error!== undefined){
		    //db_select.message(db_data.error, { type : 'warning', title : 'Ooops!'});
		    //db_select.hide();
		    db_select.trigger('error', db_data.error);
		    db_select.button.hide(true);

		    return cb(db_data.error);
		}
		
		db_data.forEach(function(d){
		    d.label = d.name;
		});
		
		db_select.set_items(db_data);
		//
	    });
	}
	
	console.log("DONE SELECT DB BUILD///");
	ok();
	
    }

})
