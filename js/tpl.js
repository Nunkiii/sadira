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
	tpl_desc : "All info for an internally administered user.",
	name : "Local credentials",
	elements : {
	    email: {
		type: "email",
		holder_value : "Any valid email adress? ..."
	    },
	    hashpass: {
		type: "password"
	    },
	    salt: {
		type: "string",
		name: "Password salt"
	    },
	    username: {
		type: "string"
	    }
	},
	object_builder : function(la){
	    la.check_password=function(clear_password, cb) {
		var hash=la.elements.hashpass.value;
		var salt=la.elements.salt.value; 
		
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
		try{
		    var h=crypto.createHash('sha256');
		    var salt=crypto.randomBytes(32);//.toString('base64');
		    
		    h.update(salt);
		    h.update(clear_password,'utf-8');
		    
		    la.elements.hashpass.value=h.digest('base64'),
		    la.elements.hashpass.value=salt.toString('base64')
		}
		catch(e){
		    cb("crypto error " + e);
		}
		
	    };
	}
    },
    
    user : {
	type : "user",
	name : "User information",
	elements : {
	    credentials : {
		name : "Account credentials",
		elements : {}
	    },
	    groups : {
		name : "Groups",
		subtitle : "User groups the user is member",
		type : "group_data"
	    }
	},
	object_builder : function(user){

	}
    },
    user_group : {
	name : "A User group",
	elements : {
	    group_name : {
		name : "Group name", subtitle : "String identifier for the group", type : "string"
	    },
	    description : {
		type : "html",
		name : "Description", subtitle : ""
	    }
	},
	object_builder : function(group){
	    group.listen('server_data',function(data){
	    });
	}
    },
    
    group_data : {
	name : "User groups",
	value: [],
	object_builder : function (gd){
	    gd.add_group=function(gname){};
	    //sadira.mongo.find1({ type:'group', value
	}
	
    },

    

    le_template_del_template : {

	name : "Template [unknown]",
	type : "template",
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
    }
}



