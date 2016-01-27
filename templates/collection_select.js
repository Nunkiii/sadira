({ name:"Select collection ",
  type:"dropdown",
  widget_builder:function (){
	    
	    var col_select=this;
	    col_select.hide();

	    new_event(this, 'collection_selected');
	    new_event(this, 'error');

	    col_select.listen('select',function(e){
		this.trigger("collection_selected", e);
		this.selected_collection=e;
	    });

	    this.get_collections=function(db_name, cb){
		var r=new request({ cmd : '/api/dbcom/get', args : { db : { name : db_name} } });
		
		r.execute(function(err, col_data){
		    
		    if(err){
			col_select.message(dump_error(err), { type : 'danger', title : 'Error query'});
			return;
		    }
		    
		    //chooser.collection_data=result;
		    if(col_data.length>0){
			
			col_data.forEach(function(d){ d.label = d.name});
			col_select.set_items(col_data);
			
			cb(true);
			col_select.hide(false);
			
		    }else{
			col_select.set_title("No collection available");
			col_select.disable();
			cb(true);
		    }
		    
		});
	    }
	    
	},
  key:"collection_select" })