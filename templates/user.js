({
    name:"User information",
    ui_opts:{ child_view_type:"div",
	      root_classes:[ "container-fluid" ],
	      fa_icon:"user"
	    },
    elements:{
	nick:{
	    name:"Nickname",
	    ui_opts:{ editable:true,
		      root_classes:[ "form form-inline form-group-lg" ],
		      name_node:"label" },
	    type:"string",
	    holder_value:"Enter a nickname"
	},
	
	default_email:{
	    name:"Default email account",
	    type:"email"
	},
	credentials:{
	    name:"Account credentials",
	    db:{ perm:{ r:"admin" } }
	},
	groups:{ ui_opts:{ child_view_type:"pills" },
		 name:"Groups",
		 db:{ perm:{ w:"admin" } } }
    },
    
    object_builder:function (ok,fail){
	console.log("USER constructor !");
	var user=this;
	user.get_login_name=function(){
	    var cred;
	    cred= user.get("local");
	    if(cred!==undefined){
		var un=cred.val('username');
		if(un!==undefined) return un;
		var un=cred.val('email');
		if(un!==undefined) return un;
	    }
	    
	    return "Unknown";
	}
	ok();
    },
    key:"user"
})
