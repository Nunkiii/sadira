({
    name:"dbcom",
    type:"api_provider",
    elements:{
	list:{ type:"api",
	       
	       object_builder:function (ok, fail){
		   //console.log(" -------------------- ||||||||||||||||  DB LIST CONSTRUCTOR");
		   
		   this.handle_api( function(req, res){
		       
		       if(req.user===undefined)
			   return res.json({error : "BUG dbcom/get : no user !"});

		       var inp=get_json_parameters(req);
		       
		       console.log("LIST " + JSON.stringify(inp));
		       
		       var coll="collections";
		       var dbname='sys';
		       
		       var dbn=inp["db"];

		       if(dbn!==undefined){
			   if(dbn.name!==undefined)
			       dbname=dbn.name;
			   if(dbn.collection!==undefined)
			       coll=dbn.collection;
		       }
		       
		       
		       console.log("LIST Looking for collection " + coll + " in DB " + dbname);
		       var fields = [ {path : "_id"},{ path : "name"} ];
		       
		       var opts= { collection : coll , fields : fields };

		       if(req.sad.mongo[dbname]===undefined){
			   return res.json({error : "No such database " + dbname});
		       }
		       
		       req.sad.mongo[dbname].find(opts, function(err, colls){
			    
			   if(err)
			       return res.json({error : err});
			   //console.log(JSON.stringify(colls));
			   var output=[];
			   for(var c=0;c<colls.length;c++){
			       var ov=[];
			       for(var v in fields)
				   ov.push(colls[c][fields[v].path]);
			       output.push(ov);
			   }
			    
			   return res.json( { head : opts.fields, data : output });
		       });
		   });
		   ok();
	       }
	     },
	get:{ type:"api",
	      object_builder:function (ok, fail){
		  this.handle_api( function(req, res){

		      if(req.user===undefined)
			  return res.json({error : "BUG dbcom/get : no user !"});
		      
		      var inp=get_json_parameters(req);
		      
		      this.log("API GET request = " + JSON.stringify(inp));
		      
		      var coll="collections";
		      var dbname='sys';
		      var dbn=inp["db"];
		      
		      if(dbn!==undefined){
			  if(dbn.name!==undefined)
			      dbname=dbn.name;
			  if(dbn.collection!==undefined)
			      coll=dbn.collection;
		      }
		      
		      if(typeof(dbname)!=='string') 
			  return res.json({error : "dbname is not a string ! (you sent " + JSON.stringify(dbname)+")"});
		      
		      this.log("Looking for collection " + coll + " in database " + dbname + " dbn " + typeof(dbname));
		      
		      
		      var opts= { collection : coll };
		      if(inp.id!==undefined) opts.id=inp.id;
		      if(inp.path !==undefined) opts.path=inp.path;
		      if(inp.fields !==undefined) opts.path=inp.fields;
		      
		      create_object_from_data(req.user).then(function(us){
			  opts.user=us;
			  req.sad.mongo[dbname].find(opts, function(err, colls){
			      
			      if(err)
				  res.json({error : err});
			      else{
				  
				  console.log("Found " + colls.length + " documents in ["+dbname+"/"+opts.collection+"]!");
				  res.json(colls);
			      }
			  });
		      }).catch(function(e){ res.json({error : e})});
		      
		  });
		  
		  ok();
	      }
	    }
    },
    key:"db"
})
