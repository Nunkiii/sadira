({ name:"setup",
  type:"api_provider",
  elements:{ config_toolbars:{ type:"api",
      object_builder:function (){
		    this.handle_api( function(req, res){
			sad.mongo.find_group(gname, function(err, group){
			});
		    });
		} } },
  key:"setup" })