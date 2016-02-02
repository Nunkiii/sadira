({
    key:"logout",
    name:"Log out",
    intro:"Unknown login status",
    strings:{ intro1:"confirm you want to disconnect from the Sadira network.",
	      intro2:"You are not logged in.",
	      intro3:"You are curently logged in as " },
    ui_opts:{ fa_icon:"sign-out",
	      intro_stick:true,
	      root_classes:[ "container-fluid" ] },
    elements:{ logout_but:{ name:"Log me out !",
			    type:"action",
			    ui_opts:{ root_classes:[ "text-center" ],
				      item_classes:[ "btn btn-danger btn-lg" ] } } },
    widget_builder:function (ok, fail){
	var logout=this;

	var b=logout.get('logout_but');
	function enable_logout(){
	    logout.set_intro_text( '<p>'+ S(logout, 'intro3')+' <strong>'+window.sadira.user.id +'</strong>,' + S(logout,'intro1') + '</p>');
	    b.disable(false);
	}
	function disable_logout(){
	    b.hide();
	    
	    logout.message(S(logout,'intro2'), { last : 2000, onclose : function(done){
		logout.trigger("close");
		done();
	    }});
	}
	
	b.listen('click',function(){
	    var rq=new request({ cmd : "/logout"});
	    rq.execute(function(error, res){
		if(error){
		    logout.debug("Error logout : " + error);
		    return;
		}
		
		if(è(res.error))
		    logout.debug(res.error);
		else{
		    delete window.sadira.user;
		    window.sadira.trigger('user_logout');
		}
	    });
	    
	});
	
	window.sadira.listen('user_login', function(user){enable_logout();});
	window.sadira.listen('user_logout', function(user){
	    //console.log("Disable logout !");
	    disable_logout();
	} );
	
	window.sadira.user ? enable_logout() : disable_logout();

	ok();
    }
    
})
