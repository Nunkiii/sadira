({
  intro:"All info for an internally administered user.",
  name:"Local credentials",
  ui_opts:{ fa_icon:"leaf" },
  elements:{
    email:{ ui_opts:{ label:true,
		      fa_icon:"envelope" },
	    name:"E-mail",
	    type:"string",
	    holder_value:"Any valid email adress? ..." },
    hashpass:{ ui_opts:{ label:true,
			 fa_icon:"eye-close" },
	       name:"Hashed password",
	       type:"password" },
    salt:{ ui_opts:{ label:true },
	   name:"Password salt",
	   type:"string" },
    username:{ ui_opts:{ label:true },
	       name:"User name",
	       type:"string" }
  },
  object_builder:function (ok,fail){

    //console.log("LOCAL ACCESS BUILDER --------------->");
    
    var la=this;
    la.create_password=function(clear_password, cb) {}
    var crypto = require('crypto');
    la.check_password=function(clear_password, cb) {
      var hash=la.val('hashpass');
      var salt=la.val('salt');
      
      console.log("check passwd ["+clear_password+"]["+salt+"]");
		var h=crypto.createHash('sha256');
		
		h.update(salt,'base64');
		h.update(clear_password,'utf-8');
		
		var true_hash=h.digest('base64');
		var match=(true_hash==hash) ? true:false;
		
		//console.log("Compare DB=["+true_hash+"] AND ["+hash+"] match = " + match);
		
		cb(null,match);
		
	    };
	    
	    
	    la.set_password=function(clear_password){
		var hp=crypto.createHash('sha256');
		hp.update(clear_password);
		
		var h=crypto.createHash('sha256');
		var salt=crypto.randomBytes(32);//.toString('base64');
		
		h.update(salt);
		h.update(hp.digest('base64'),'utf-8');
		
		la.set('hashpass',h.digest('base64'))
		    .set('salt',salt.toString('base64'));

		//console.log("Setting pass to [" + clear_password +"]" + la.val('hashpass'));
		
		return la;
    };
    ok();
	},
  key:"local_access" })
