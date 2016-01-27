({ name:"Create a new account",
  intro:"<p>You can create a local sadira account or use one of the supported platforms providing your authentication for us.</p><p><strong>Choose a login method : </p></strong>",
  ui_opts:{ child_view_type:"pills",
    root_classes:[ "container-fluid" ],
    name_node:"h2",
    child_classes:[ "container-fluid" ],
    intro_stick:true,
    fa_icon:"key" },
  elements:{ local:{ name:"Local account",
      subtitle:"Create a new account locally.",
      intro:"<strong><p>Fill up the email and password fields to create your new user account.</p></strong><p><ul><li> Enter a valid email adress, it will be used to identify you.</li><li> You'll can configure a username later in your user page if you wish.</li><li> The password will be checked for basic strength.</li></ul></p>",
      ui_opts:{ fa_icon:"leaf",
        root_classes:[ "container-fluid" ],
        child_classes:[ "container-fluid" ],
        intro_stick:true },
      elements:{ data:{ ui_opts:{ child_node_type:"form",
            child_classes:[ "form-horizontal container-fluid" ],
            root_classes:[ "container-fluid" ] },
          elements:{ email:{ name:"Email address",
              type:"string",
              holder_value:"name@example.org",
              ui_opts:{ type:"edit",
                root_classes:[ "form-group" ],
                label:true,
                name_classes:[ "control-label col-sm-offset-1 col-sm-3" ],
                wrap:true,
                wrap_classes:[ "col-sm-4" ] } },
            password:{ name:"New password",
              type:"password",
              ui_opts:{ type:"edit",
                root_classes:[ "form-group" ],
                label:true,
                wrap:true,
                name_classes:[ "control-label col-sm-offset-1 col-sm-3" ],
                wrap_classes:[ "col-sm-4" ] } },
            password_repeat:{ name:"Enter password again",
              type:"password",
              ui_opts:{ type:"edit",
                root_classes:[ "form-group" ],
                label:true,
                wrap:true,
                name_classes:[ "control-label col-sm-offset-1 col-sm-3" ],
                wrap_classes:[ "col-sm-4" ] } } } },
        action_panel:{ ui_opts:{ root_classes:[ "col-md-12" ],
            child_classes:[  ] },
          elements:{ signup:{ name:"Create new account",
              type:"action",
              ui_opts:{ item_classes:[ "btn btn-primary btn-lg" ],
                root_classes:[ "text-center" ] } },
            status:{ type:"html",
              value:"<p><strong>Congrats!</strong> You just created your account. Welcome.</p>",
              ui_opts:{ root_classes:[ "col-md-6" ],
                item_classes:[ "alert alert-info" ] } } } } } },
    shib:{ name:"IDEM signup",
      subtitle:"Signup using your IDEM-GARR account",
      ui_opts:{ fa_icon:"institution" },
      elements:{ signup:{ name:"Signup !",
          type:"action" } } },
    fb:{ name:"Facebook",
      subtitle:"Signup using your Facebook account",
      ui_opts:{ fa_icon:"facebook-official" },
      elements:{ signup:{ name:"Signup !",
          type:"action",
          link:"/auth/facebook" } } },
    google:{ name:"Google",
      subtitle:"Signup using your Google account",
      ui_opts:{ name_node:"h3",
        fa_icon:"google-plus" },
      elements:{ signup:{ name:"Signup !",
          type:"action",
          link:"/auth/google",
          ui_opts:{ fa_icon:"google-plus" } } } } },
  key:"signup",
  widget_builder:function (){
    var signup=this;
    var local=signup.elements.local; 
    var shib=signup.elements.shib; 

    var data=local.elements.data; 

    var email=data.elements.email;
    var pw=data.elements.password;
    var pwr=data.elements.password_repeat;

    //var signup_act=local.elements.signup;
    var signup_status=local.elements.action_panel.elements.status;
    var signup_act=local.elements.action_panel.elements.signup;

    signup_status.ui_root.style.display="none";
    
    var shib_signup=shib.elements.signup;

    shib_signup.listen("click", function(){
	
	console.log("Trying login shib");
	
	var rqinit=new request({ cmd : "/shiblogin", data_mode : "", method : "GET"});
	
	rqinit.execute(function(error, res){
	    if(error){
		console.log("Error rqinit " + error);
		return;
	    }
	    
	    console.log("signup Reply : " + JSON.stringify(res));
	    
	});

    });

    var config={
	allowPassphrases       : true,
	maxLength              : 128,
	minLength              : 8,
	minPhraseLength        : 20,
	minOptionalTestsToPass : 3,
    };
    
    if(è(signup.owasp_config)) for(var c in config_in) config[c]=signup.owasp_config[c];
    owaspPasswordStrengthTest.config(config); 

    /*
    var email_status = {
	type : "status",
	value : "blue",
	value_labels : { blue : "who knows", green : "valid", red : "invalid"},
	ui_opts : {item_classes : ["col-sm-2","control-label"]}
    };
    var pw_status = {
	type : "status",
	value : "red",
	value_labels : { green : "good", red : "not acceptable"},
	ui_opts : {item_classes : ["col-sm-2"]}
    };
    var pwr_status = {
	type : "status",
	value : "red",
	value_labels : { green : "match", red : "dont't match"},
	ui_opts : {item_classes : ["col-sm-2"]}
    };
    create_ui({}, email_status, signup.depth+1);
    create_ui({}, pw_status,signup.depth+1);
    create_ui({}, pwr_status,signup.depth+1);
    
    email.ui_root.appendChild(email_status.ui);
    pw.ui_root.appendChild(pw_status.ui);
    pwr.ui_root.appendChild(pwr_status.ui);

    */
    
    signup_act.ui.setAttribute("disabled",true); //add_class("masked");
    
    var fail_row=cc("div",pw.ui_root); fail_row.className="row";
    var pw_fail_reasons=cc("ul",fail_row);
    pw_fail_reasons.className="alert alert-danger list-unstyled col-sm-12 vertical_margin";
    pw_fail_reasons.setAttribute("role","alert");
    pw_fail_reasons.style.display="none";
//    pw_fail_reasons.style.float="right";
    
    function check_everything_good(){
	if (email.status
		&& pw.status
		&& pwr.status
	   ){
	    signup_act.ui.removeAttribute("disabled");
	}else
	    signup_act.ui.setAttribute("disabled",true);
    }

    pw.status=false;	
    pwr.status=false;
    email.status=false;
    
    function set_status(o,st){
	o.status=st;
	if(st){
	    o.ui_root.add_class("has-success");
	    o.ui_root.remove_class("has-error");
	}else{
	    o.ui_root.add_class("has-error");
	    o.ui_root.remove_class("has-success");
	}
    }
    pw.pui.addEventListener("input", function(){
	
	pwr.set_value("");
	//pwr_status.set_value("red");
	var owasp_result = owaspPasswordStrengthTest.test(this.value);
	pw_fail_reasons.innerHTML="";
	if(owasp_result.strong){
	    set_status(pw,true);
	    pw_fail_reasons.style.display="none";
	}else{
	    set_status(pw,false);
	    pw_fail_reasons.style.display="";
	    for(var es=0;es<owasp_result.errors.length;es++){
		cc("li",pw_fail_reasons).innerHTML='<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> '+" "+
		    owasp_result.errors[es];
	    }
	    
	    //console.log("Password too weak : " + JSON.stringify(owasp_result, null, 5));
	    
	}

	check_everything_good();
	
    });

    function validate_email(email) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
    } 

    email.ui.addEventListener("input", function(){
	if(validate_email(this.value)){
	    set_status(email,true);
	}
	else
	    set_status(email,false);

	check_everything_good();
	
    });

    pwr.pui.addEventListener("input", function(){
	if(this.value===pw.pui.value){
	    set_status(pwr,true);
	}
	else
	    set_status(pwr,false);

	check_everything_good();

    });

    function display_error_status(title, text){
	signup_status.ui_root.style.display="";
	signup_status.ui.className="alert alert-danger";
	signup_status.ui.innerHTML="<strong>"+title+"</strong><p>"+text+"</p>";
    }
    
    function display_info_status(title, text){
	signup_status.ui_root.style.display="";
	signup_status.set_title("Success !"); 
	signup_status.ui.className="alert alert-info alert-lg";
	signup_status.ui.innerHTML="<strong>"+title+"</strong><p>"+text+"</p>";
	
	data.ui_root.style.display="none";
	signup_act.ui_root.style.display="none";
    }

    signup_act.listen("click", function(){
	var hp=sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(pw.pui.value));
	console.log("HASH PW is = ["+ hp + "]");
	
	var post_data="email="+encodeURIComponent(email.ui.value)+"&hashpass="+encodeURIComponent(hp);
	
	var rqinit=new request({ cmd : "/signup", data_mode : "json", method : "POST", post_data : post_data});
	
	rqinit.execute(function(error, res){

	    if(error)return display_error_status("HTTP request error :", error);

	    console.log("signup Reply : " + JSON.stringify(res));

	    if(è(res.error)){
		return display_error_status("Signup error : ", res.error);
	    }

	    return display_info_status("Welcome ! ", " <p>Your account was successfully created on this server.</p><p> You can now login with your credentials.</p>");
	    
	});
    });
	    
    //return ui;
} })