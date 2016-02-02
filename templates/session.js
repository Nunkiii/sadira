({
    name:"session",
    type:"api_provider",
    elements:{
	info:{ type:"api",
	       object_builder:function (ok,fail){
		   console.log("Session info build");
		   this.handle_api( function(req, res){
		       
		       if(req.user===undefined){
			   return res.json({user : "none"});
		       }
		       //var uobj=create_object_from_data(req.user);
		       //console.log("Session info request " + JSON.stringify(req.user));
		       return res.json( { user : req.user.get_login_name(), id : req.user.id() });
		   });
		   ok();
	       } },
	get_toolbar_items:{
	    type:"api",
	    object_builder:function (ok,fail){
		this.handle_api( function(req, res){
		    if(req.user===undefined)
			return res.json([]);
		    var ugroups=req.user.els.groups.els;
		    var tb_tools=[];
		    var ng=0;for (var gid in ugroups)ng++;
		    for (var gid in ugroups){
			req.sad.mongo.find1({ collection : 'Groups', id : gid}, function(err, group){
			    if(err!==null)
				return res.json({error : err});
			    tb_tools.push({id : gid, name : group.name});
			    ng--;
			    if(ng==0)
				return res.json(tb_tools);
			});
			
		    }
		});
		
		ok();
	    }
	}
    },
    key:"session"
})
