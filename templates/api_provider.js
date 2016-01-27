({ object_builder:function (ok, fail){

  ok();
//  console.log("API PROV BUILDER!");
	    /*
	    aprov.register_route=function(sad){
		console.log(aprov.name + " : registering route");
		sad.app.all('/api/'+aprov.name+'/:api_name', function(req, res, next) {
		    console.log("route called " + req.params.api_name);
		    var api=aprov.get(req.params.api_name);
		    if(api===undefined)
			return res.json({ error : aprov.name + " : unknown api : " + req.params.api_name });
		    
		    return api.api_handler(req, res, next);
		});
	    }
	    */
	},
key:"api_provider" })
