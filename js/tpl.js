/*
  Sadira system templates
*/

var crypto = require('crypto');

module.exports={

    test : {
	elements : {
	    do : {type : "double"},
	    re : {type : "double"},
	    mi : {type : "double"},
	    fa : {type : "double"},
	    sol : {type : "double"},
	    la : {type : "double"},
	    si : {type : "double"},
	}
    },

    group_data : {
	name : "User groups",
	name : "Groups",
	subtitle : "User groups the user belongs to",
	object_builder : function (gd){
	    gd.add_group=function(gname){
		
	    };
	    //sadira.mongo.find1({ type:'group', value
	}
	
    },

    api_provider : {
	object_builder : function (aprov){
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
	}
    },
    
    api : {
	object_builder : function (){
	    console.log("api object_builder ...");
	    var api=this;
	    this.handle_api=function(h){
		console.log("Handling API !!");
		api.api_handler=h;
	    }
	}
    },

    setup : {
	name : "setup",
	type : "api_provider",
	elements : {
	    
	    config_toolbars : {
		type : "api",
		object_builder : function(){
		    this.handle_api( function(req, res){
			sad.mongo.find_group(gname, function(err, group){
			});
		    });
		}
		
	    }
	}
    },

    session : {

	name : "session",
	type : "api_provider",

	elements : {
	    info : {
		type : "api",
		object_builder : function(){
		    console.log("Session info build");
		    this.handle_api( function(req, res){
			
			if(req.user===undefined){
			    return res.json({user : "none"});
			}
			var uobj=create_object_from_data(req.user);
			//console.log("Session info request " + JSON.stringify(req.user));
			var uname=uobj.get_login_name!==undefined ? uobj.get_login_name() : "Invalid user";
			return res.json( { user : uname, id : uobj.id() });
		    });
		}
		
	    },
	    get_toolbar_items : {
		type : 'api',
		object_builder : function(){
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
		    
		    
		}
	    }
	}
	
    },
    
    db : {

	name : "dbcom",
	type : "api_provider",
	
	elements : {
	    
	    get : {
		
		type : "api",
		object_builder : function(){
		    this.handle_api( function(req, res){
			
			var inp=get_json_parameters(req);
			var coll=inp["collection"];

			
			if(coll===undefined) coll="collections";
			
			console.log("Looking for collection " + coll);
			var uobj=create_object_from_data(req.user);
			req.sad.mongo.sys.find({ collection : coll, user : uobj}, function(err, colls){
			    
			    if(err)
				return res.json({error : err});
			    
			    colls.forEach(function(d){
				delete d.db;
			    });
			    
			    return res.json(colls);
			});
		    });
		    
		}
	    	
	    }
	    
	}
    },
    
    template_object : {

	name : "My Template Object",
	subtitle : "A Sadira/tk object template",
	intro : "Description of object functionality here.",

	db : {
	    grants : [['g','everybody','r'],['g','admin','w']],
	    collection : "templates"
	},
	elements : {
	    name :{
		name : "Template key",
		//intro : "<p>The template <i>nickname</i>, should be written in <pre><code> type='';</code></pre> declarations in client widgets.</p><p>No   Space  , No camelCase Please, but <strong>do what you want</strong> finally</p>",
		type : "string",
		holder_value: "Write template key name here... ",
		ui_opts : {
		    type : "edit"
		}
	    },
	    code : {
		name : "Template source code",
		type : 'code'
	    }
	}
    },

    user_home : {
	apis : {
	    get_toolbar : function(req, res){
		return res.json({ hello : "world"});
	    }
	},
	object_builder : function (uhome, app){
	    
	}
    },
    
    colormap : {

	object_builder : function (cmap, app){

	    cmap.register_collection=function(){
		var c={
		    type : "db_collection",
		    db : {
			grants : [['g','everybody','r'],['g','admin','w']],
			collection : "collections"
		    },
		    elements : {
			name : { value : "colormap"},
			template : { value : "api_provider"},
		    }
		};
		
		var col=create_object(c, function (e){
		    app.mongo.write_doc(c, function(err, doc){
			if(err) app.log("Error " + err);
		    });
		    
		});

	    }
	    
	    //console.log("Building colormap...");
	    cmap.load_json=function(file){
	// return;
	// 	var cmo=create_object("db");
	// 	cmo.name="X";
	// 	cmo.collection("colormaps");
	// 	cmo.save();
		
	// 	cmo=create_object("string");
	// 	cmo.name="X";
	// 	cmo.collection("colormaps");
	// 	cmo.save();
		
		// 	return;
		
		var fs=require('fs');
		fs.readFile(file,'utf8', function (err, data) {
		    if (err) throw err;
		    var jdata=JSON.parse(data);
		    var cmaps=jdata.doc.ColorMap;
		    
		    cmaps.forEach(function(cm){
			var cmo=create_object("colormap");
			//cmo.collection("colormaps");
			cmo.name=cm['@name'];
			cmo.value=[];
			cm.Point.forEach(function(cmp){
			    cmo.value.push([cmp['@r'],cmp['@g'],cmp['@b'],cmp['@o'],cmp['@x']]);
			});
			cmo.save();
			
			console.log(JSON.stringify(cmo));
		    });
		    
		    
		});
		
	    }
	    
	}
	
    }
    
    
}



