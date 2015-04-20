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
    
    local_access : {
	// tpl_desc : "All info for an internally administered user.",
	// name : "Local credentials",
	// elements : {
	//     email: {
	// 	type: "email",
	// 	holder_value : "Any valid email adress? ..."
	//     },
	//     hashpass: {
	// 	type: "password"
	//     },
	//     salt: {
	// 	type: "string",
	// 	name: "Password salt"
	//     },
	//     username: {
	// 	type: "string"
	//     }
	// },
	object_builder : function(la){

	    la.create_password=function(clear_password, cb) {}

	    la.check_password=function(clear_password, cb) {
		var hash=la.val('hashpass');
		var salt=la.val('salt');
		
		console.log("check passwd ["+clear_password+"]["+salt+"]");
		var h=crypto.createHash('sha256');
		
		h.update(salt,'base64');
		h.update(clear_password,'utf-8');
		
		
		var true_hash=h.digest('base64');
		var match=(true_hash==hash) ? true:false;
		
		console.log("Compare DB=["+true_hash+"] AND ["+hash+"] match = " + match);
		
		cb(null,match);
		
	    };
	    
	    
	    la.set_password=function(clear_password){
		var h=crypto.createHash('sha256');
		var salt=crypto.randomBytes(32);//.toString('base64');
		
		h.update(salt);
		h.update(clear_password,'utf-8');
		
		la.set('hashpass',h.digest('base64'))
		    .set('salt',salt.toString('base64'));
		
		return la;
	    };
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
	object_builder : function (api){
	    
	}
    },
    
    db : {
	name : "dbcom",
	type : "api_provider",
	elements : {
	    collection_list : {
		type : "api",
		api_handler : function (req, res){
		    var inp=get_json_parameters(req);
		    var coll=inp["collection"];
		    if(coll===undefined) coll="collections";
		    console.log("Looking for collection " + coll);
		    req.sad.mongo.find({ collection : coll, user : req.user}, function(err, colls){
			if(err)
			    return res.json({error : "Mongo error " + err});
			colls.forEach(function(d){
			    delete d.db;
			});
			
			return res.json(colls);
		    } );
		}
	    }
	    
	}
	
    },

    le_template_del_template : {

	name : "Template",
	subtitle : "Sadira/tk template",
	elements : {
	    name :{
		name : "Template name",
		intro : "<p>The template <i>nickname</i>, should be written in <pre><code> type='';</code></pre> declarations in client widgets.</p><p>No   Space  , No camelCase Please, but <strong>do what you want</strong> finally</p>",
		type : "string",
		holder_value: "Write template nickname here ",
		ui_opts : {
		    type : "edit"
		}
	    },
	    version :{
		name : "Version",
		type : "labelled_vector",
		default_value : [0,0,0],
	    },
	    user :{
		type : "user",
		db : {
		    populate : true
		},
		ui_opts : {
		    item_root : true
		} 
	    },
	    description:{
		name : "Description",
		subtitle : "Template usage and features",
		type : "html"
	    },
	    code : {
		name : "Source code",
		elements : {
		    template_code : {
			name : "Template code",
			intro : "<h4>Template EcmaScript code</h4> <p>This is the template code....</p>",
			type : "code",
			default_value : "{}"
		    },
		    widget_builder_code : {
			name : "Template builder code",
			intro : "<strong>Template GUI builder code</strong> <p>This is the widget builder code....</p>",
			type : "code",
			default_value : "function(ui_opts,tpl){}"
		    },
		    server_builder_code : {
			name : "Template server-side builder code",
			type : "code",
			default_value : "function(tpl){}"
		    }
		}
	    }
	}
    },

    colormap : {

	object_builder : function (cmap, app){


	    
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



