({
    key:"user_group",
    name:"User Group",
    ui_opts:{ fa_icon:"group" },
    elements:{
	description:{ type:"html",
		      name:"Description",
		      subtitle:"",
		      ui_opts:{} }
    },
    widget_builder:function (ok, fail){
	var ug=this;
	this.listen('data_loaded', function(){
	    //ug.set_title(this.val('name'), this.val('description'));
	});
	ok();
	
	//this.message("who are my childs..." + JSON.stringify(this.elements));
    },
    object_builder:function (ok,fail){
	var group=this;
	
	//group.listen('server_data',function(data){});
	
	group.handle_request({ name : 'add_user', perm : new perm( { x : { g : "admin" }} ) }, function( rq_data, rq_cb){
	    var gp=g.db.perm();
	    var gu=u.db.perm();
      
	});
	ok();
    }
    
})
