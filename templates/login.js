({
    key:"login",
    name:"Log into Sadira",
    intro:"<p>Enter your username/email and password :</p>",
    ui_opts:{
	name_node:"h3",
	fa_icon:"sign-in",
	root_classes:[ "container-fluid card nomargin nopadding" ],
	name_classes:[ "card-header" ],
	child_node_type:"form",
	child_classes:[ "col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2 form-horizontal" ],
	intro_stick:true
    },
    elements:{
	user:{ type:"string",
	       name:"",
	       holder_value:"username or e-mail",
	       ui_opts:{ type:"edit",
			 root_classes:[ "input-group vertical_margin" ],
			 label:true,
			 fa_icon:"user",
			 label_node:"span",
			 name_classes:[ "input-group-addon" ] } },
	password:{ name:"",
		   type:"password",
		   ui_opts:{ type:"edit",
			     root_classes:[ "input-group vertical_margin" ],
			     label:true,
			     fa_icon:"key",
			     label_node:"span",
			     name_classes:[ "input-group-addon" ] },
		   holder_value:"password" },
	login:{
	    name:"Log in !",
	    type:"action",
	    ui_opts:{ root_classes:[ "vertical_margin" ],
		      wrap:true,
		      wrap_classes:[ "input-group-btn text-right" ],
		      item_classes:[ "btn btn-success" ] } }
    },
    widget_builder:function (ok, fail){
	var login=this;
	
	///////////////////////////////////////////////////////////////
	//User Login/Logout stuff
	
	var user_tpl=login.get('user');
	var pw_tpl=login.get('password');
	var login_tpl=login.get('login');
	//var status_tpl=login.elements.status;
	//var fb_login=login.elements.fb_login;
	
	user_tpl.ui.focus();
	//pw_tpl.pui.add_class("input-sm");
	var user_name="", user_password="";
	var mode;
	
	
	login_tpl.parnode=login_tpl.item_ui.parentNode;
	
	if(ù(login.user_id))login.user_id="";
	//console.log("LOGIN : " + login.user_id);
	
	function check(){
	    login_tpl.disable(user_name==""||user_password=="");
	}
	
	function login_mode(){
	    mode="login";
	    user_tpl.ui_root.remove_class("has-error");
	    login_tpl.set_title("Log in");
	    login_tpl.disable(false);

	    //login_tpl.set_title("Log In !");
	    
	    //status_tpl.ui.style.display="none";
	    //login.intro_div.className="text-muted";
	    //login.intro_div.innerHTML = "<p>Enter your username and password to log into Sadira</p>";
	    show_input(true);
	    
	    login_tpl.parnode.appendChild(login_tpl.item_ui);
	
	    check();
	}
	
	function register_mode(){
	    mode="register";
	    //login_tpl.ui_root.style.display="none";
	    //status_tpl.ui.style.display="";
	    //user_tpl.ui_root.style.display="none";
	    //pw_tpl.ui_root.style.display="none";

	}
	
	function show_input(show){
	    if(show){
		user_tpl.ui_name.style.display="";
		user_tpl.item_ui.style.display="";
		pw_tpl.ui_name.style.display="";
		pw_tpl.pui.style.display="";
		pw_tpl.lui.style.display="";
		
		return;
	    }
	    //user_tpl.ui_root.style.border="2px solid green";
	    
	    
	    user_tpl.ui_name.style.display="none";
	    user_tpl.item_ui.style.display="none";
	    pw_tpl.ui_name.style.display="none";
	    pw_tpl.pui.style.display="none";
	    pw_tpl.lui.style.display="none";

	    
	}
	
	function error_mode(err){
	    //console.log("Error mode!!!");
	    mode="error";
	    
	    show_input(false);
	    //status_tpl.ui_root.style.display="";
	    user_tpl.ui_root.remove_class("has-success");
	    user_tpl.ui_root.add_class("has-error");
	    //status_tpl.ui.add_class("label-danger");
	    //status_tpl.set_value(err);
	    login_tpl.ui_root.style.display="";
	    //login.intro_div.className="alert alert-danger";
	    login.error("<strong>Login error :</strong>" + err );
	    //login.intro_div.innerHTML = '<div class="col-xs-10"><p>+ "</p></div>";
	    
	    //login.intro_div.appendChild(login_tpl.item_ui);
	    login_tpl.set_title( "Retry !");
	    login_tpl.disable(false);
	}
	
	function success_mode(info){
	    
	    mode="success";
	    show_input(false);
	    
	    //login.set_title("Logged in as " + login.user_id);
	    login.message("You are logged in as <strong>" + window.sadira.user.id + " </strong>",
				 {
				     type : "success",
				     last : 2000,
				     onclose : function(done){
					 login.trigger("close");
					 done();
				     }
				 });
	    
	    //login.intro_div.appendChild(login_tpl.item_ui);
	    //login_tpl.set_title("Logout");
	    
	}
	
	user_tpl.ui.addEventListener("keydown",function(e){
	    if(e.keyCode == 13){
		user_name=this.value;
		check();
		pw_tpl.pui.focus();
		return false;
	    }
	}, false);
	
	pw_tpl.pui.addEventListener("keydown",function(e){
	    if(e.keyCode == 13){
		user_password=this.value;
		check();
		login_tpl.trigger('click');
		return false;
	    }
	}, false);
	
	
	user_tpl.ui.addEventListener("input", function(v){
	    user_name=this.value;
	    check();
	});
	
	pw_tpl.pui.addEventListener("input", function(v){
	    user_password=this.value;
	    check();
	    //login.ui_opts.fa_icon="paw";
	    //login.setup_icon();
	    
	});
	
	//var hh=new sjcl.hash.sha256();
	//hh.update("123");
	//var hhh=hh.finalize();
	//var hp=ab2b64(hh);
	//var hp = sjcl.codec.base64.fromBits(hhh);  
	//console.log("HH ["+hh+"] HP["+hp+"]");
	
	
	login_tpl.listen("click",function(){
	    console.log("Login clicked ! " + mode);
	    // switch(mode){
	    
	    // case "login" :
	    
	    //register_mode();

	    login_tpl.disable();
	    
	    var hp=sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(user_password));
	    
	    user_password="*";
	    pw_tpl.pui.value="";
	    console.log("Login " + user_name + " hpw " + hp + " ...");
	    
	    var post_data = "email="+encodeURIComponent(user_name)+"&hashpass="+encodeURIComponent(hp);
	    //var post_data=encodeURIComponent("email="+user_name+"&hashpass="+user_password);
	    var rqinit    = new request({ cmd : "/login", query_mode : "bson", method : "POST", post_data : post_data});
	    
	    rqinit.execute(function(error, res){
		
		
		if(error){
		    console.log("Error login " + error);
		    login_tpl.disable(false);
		    return error_mode(error);
		}
		
		console.log("Received this " + JSON.stringify(res));
		
		if(è(res.error)){
		    login_tpl.disable(false);
		    return error_mode(res.error);
		}
		
		login.user_id=res.user.login_name;
		window.sadira.user = { id : login.user_id};
		window.sadira.trigger('user_login', window.sadira.user);
		
		
		success_mode();

		
		// var server_key=res.key;
		// var client_key = new Uint8Array(32);
		// window.crypto.getRandomValues(buf);
		// var hash=CryptoJS.HmacSHA256("Message", "Secret Passphrase");
		// var hash=CryptoJS.SHA1(user_name+user_password);
		// console.log("["+user_name+"]["+user_password+"]");
		// var qr=new request({ cmd : "/login", query_mode : "bson", args : { hash : hash.toString()}    });
		// qr.execute(function(error, res){
		    // 	console.log("Received  " + JSON.stringify(res));
		// });
	    });
	    // 	break;
	    // case "error":
	    // 	login_mode();
	    // case "success":
	    // 	var rq=new request({ cmd : "/logout"});
	    // 	rq.execute(function(error, res){
	    // 	    if(error){
	    // 		console.log("Error logout : " + error);
	    // 		return;
	    // 	    }
		    
	    // 	    if(è(res.error))
	    // 		return error_mode(res.error);
	    // 	    else{
	    // 		window.sadira.user={};
	    // 		window.sadira.trigger('user_logout');
	    // 	    }
		    
	    // 	    //login_mode();
	    // 	});
	    // 	break;
	    // default:
	    // 	break;
	    // 	//query_login("what=login&u="+user_name+"&p="+user_password,result_cb);
	    // };
	});

//	window.sadira.listen('user_login', function(user){success_mode();});
//	window.sadira.listen('user_logout', function(user){ login_mode();} );
	
	if(window.sadira.user!==undefined){
	    if(window.sadira.user.id!=="everybody")
		success_mode();
	    else login_mode();
	}
	
	// if(login.user_id===""){
	// 	login_mode();
	// }else{
	// 	success_mode(login.user_id);
	// }
	/*
	  window.FB.getLoginStatus(function(response) {
	  if (response.status === 'connected') {
	  // the user is logged in and has authenticated your
	  // app, and response.authResponse supplies
	  // the user's ID, a valid access token, a signed
	  // request, and the time the access token 
	  // and signed request each expire
	  console.log("Facebook user connected " + JSON.stringify(response));
	  var uid = response.authResponse.userID;
	  var accessToken = response.authResponse.accessToken;
	  } else if (response.status === 'not_authorized') {
	  console.log("Facebook user connected and not authorized ! " + JSON.stringify(response));
	  // the user is logged in to Facebook, 
	  // but has not authenticated your app
	  } else {
	  console.log("Facebook user NOT connected " + JSON.stringify(response));
	  // the user isn't logged in to Facebook.
	  }
	  });

	  fb_login.listen("click", function(){

	  window.FB.login(function(response) {
	  if (response.authResponse) {
	  console.log('Welcome!  Fetching your information.... ');
	  FB.api('/me', function(response) {
	  console.log('Good to see you, ' + response.name + '.');
	  });
	  } else {
	  console.log('User cancelled login or did not fully authorize.');
	  }
	  });

	  });
	  
	  window.FB.Event.subscribe('auth.authResponseChange', function(response) {
	  
	  if (response.status === 'connected') {
	  console.log("Authchange : Facebook user connected " + JSON.stringify(response));	    
	  } 
	  else {
	  console.log("Authchange : User disconnected fron FB!");
	  
	  }
	  
	  });
	*/

	ok();
    }
})
