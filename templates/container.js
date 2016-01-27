({ name:"Container",
  child_type:undefined,
  ui_opts:{ child_view_type:"dummy",
    max_objects:20 },
  widget_builder:function (ui_opts, browse){
	    var div = ce('div'); div.className='list-group';
	    
	    this.listen('add_child', function(c){

		console.log("Building CONTAINER ! " + this.name);
	    });
	    this.listen('remove_child', function(){
		
	    });

	    return div;
	},
  key:"container" })