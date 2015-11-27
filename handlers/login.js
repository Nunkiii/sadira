var local_strategy = require('passport-local').Strategy;
var facebook_strategy = require('passport-facebook').Strategy;
var google_strategy = require('passport-google-oauth').OAuth2Strategy;

//var SamlStrategy = require('passport-saml' ).Strategy;

var crypto=require('crypto');

exports.init=function(pkg, sad, cb){


    var mongo=sad.mongo.sys;
    var app=sad.app;
    var passport=sad.passport;
    
    console.log("Register login serialize funcs...");
    
    passport.serializeUser(function(user, done) {
	console.log("Serialize USER ! " + user.db.id);
	done(null, user.db.id);
    });

    passport.deserializeUser(function(id, done) {
	//console.log("Deserialize USER ID " + id);
	mongo.find1({ type : "users", id : id},
		    //done

		    function(err, user) {
			
			if(err){
			    console.log("Error looking up user " + err);
			    done(err);
			}
			
			if(user!==undefined)
			    done(err, user);
			else{
			    console.log("User not found ! " + id);
	//done("User (id + "+id+") not found !");
			    done("pass",undefined);
			}
		    }
		    
		   );
    });
    
    // =========================================================================
    // LOCAL SIGNUP =============================================================
    // =========================================================================
    
    passport.use('local-signup',
		 new local_strategy({
		     usernameField : 'email',
		     passwordField : 'hashpass',
		     passReqToCallback : true // allows us to pass back the entire request to the callback
		 },function(req, email, hashpass, done) {
		     // asynchronous
		     // User.findOne wont fire unless data is sent back
		     process.nextTick(function() {
			 
			 // find a user whose email is the same as the forms email
			 // we are checking to see if the user trying to login already exists
			 //console.log("Begin signup  process for " + email);
			 
			 sad.find_user(email, function(err, user) {
			     if (err){
				 console.log("Error looking up user: " + err);
				 return done(err);
			     }
			     if (user) {
				 console.log("Identity already taken " + email);
				 return done(null, false, 'That email address is already registered.');
			     } else {
				 //console.log("Begin signup  process... create user HASPASS = ["+hashpass+"]");
				 var new_user = create_object("user");
				 
				 var access=create_object("local_access")
				     .set('email',email)
				     .set_password(hashpass);

				 new_user.db.collection="users";
				 new_user.get("credentials").add('local',access);

				 new_user.save( function(err, r) {
				     if (err) return done(err);
				     return done(null, new_user);
				 });
			     }
			     
			 });
			 
		     });
		     
		 }));
    
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================

    passport.use('local-login', new local_strategy({
	usernameField : 'email',
	passwordField : 'hashpass',
	passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, hashpass, done) { // callback with email and password from our form
	
	//console.log("Login init for " + email + " pass " + hashpass);

	sad.find_user(email,function(err, user) {
	    if (err){
		console.log("Error looking for user " + err);
		return done(err);
	    }
	    if (user===undefined || user===null)
		return done(null, false, "User not found !");
	    
	    var user_object=create_object_from_data(user);
	    //console.log("---> User is " + JSON.stringify(user));
	    var loca=user_object.get('local');
	    //for(var p in loca) console.log("P G " + p);
	    
	    loca.check_password(hashpass, function(error, match){
		    if(error)
			return done(null, false, "checkpass error : "+error );
		    
		    if(match){
			console.log("checkpass match = " + match + " YEAHHH !!!!");    
			return done(null, user, "Yeah!Login!!");
		    }
		    
		//console.log("checkpass match = " + match + " NOOOOOOOooooooo !!!!");    
		    return done(null, false, "Oops! Wrong password");
		    
		});
	});
	
    }));

    /*
    passport.use(new SamlStrategy({
	path: '/login/shib',
	entryPoint: 'https://nilde3.bo.cnr.it:60443/nilde-unstable/master/Shibboleth.sso/WAYF/IDEM',
	issuer: 'passport-saml'
    }, function(profile, done) {
	
	
	console.log("Auth user profile " + JSON.stringify(profile));

	// findByEmail(profile.email, function(err, user) {
	//     if (err) {
	// 	return done(err);
	//     }
	var user = { name : "toto"};
	return done(null, user);
//	});
    }));

    */

    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
	    return next();

	// if they aren't redirect them to the home page
	console.log("User not logged in -> redirect hp");
	res.redirect('/');
    }
    
    app.get('/shiblogin',function(req,res,next){
	console.log("Yeahhh");
	res.redirect("/widget/xd1");
    });

    // app.get('/shiblogin',
    // 	    passport.authenticate('saml', 
    // 				  { failureRedirect: '/shibfail', failureFlash: true }),
    // 	    function(req, res) {
    // 		res.redirect('/shibok');
    // 	    }
    // 	   );
    
    app.get("/shibfail",
	    function(req,res,next){
	console.log("SHIB FAIL!");
    });

    app.get("/shibok", function(req,res,next){
	console.log("SHIB OK!");
    });
    
    app.post("/login/shib", function(req,res,next){
	
	passport.authenticate('saml', 
			      { failureRedirect: '/', failureFlash: false }),
	function(req, res) {
	    res.redirect('/');
	}

	console.log("Shibbo callback !!! ");
	
    });

    app.post('/signup', function(req, res, next) {
	passport.authenticate('local-signup', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) {
		return res.json({error : "Signup failed : " + info});
	    }
	    
	    return res.json({user : user});
	})(req, res, next);
    });

    
    // app.post('/signup', passport.authenticate('local-signup'),
    // 	     function(req, res){
    // 		 console.log("Signup success !");
    // 	     });
    // {successRedirect : '/profile', // redirect to the secure profile section
    // failureRedirect : '/signup', // redirect back to the signup page if there is an error
    // failureFlash : true // allow flash messages
    
    // process the login form

    app.post('/logiiiiin', function(req, res, next) {
	console.log("Hellloooo!");
	return res.json({error : "Login failed ! TESTING"});
    });


    console.log("Log post");
    app.post('/login', function(req, res, next) {
	
	passport.authenticate('local-login', {session : true}, function(err,user,info) {
	    
	    if (err) {
		console.log("Login failed err = " + err);
		return res.json({error : "Login failed !" + err});
		//return next(err);
	    }
	    
	    //req.user=user;
	    
	    if (!user) {
		console.log("Login failed NO USER err = " + JSON.stringify(info));
		return res.json({error : "Login failed !" + JSON.stringify(info)});
	    }
	    
	    console.log("Got user " + JSON.stringify(req.user) + " login ... type is " + typeof(req.logIn) );
	    
	    req.logIn(user, function(err) {
		console.log("User login!!");
	     	if (err) {
		    return res.json({error : "Login failed !" + err});
		    //return next(err);
		}
		// 	//var ejsd={}; sad.set_user_data(req,ejsd);
		var uobj=create_object_from_data(user);
	     	res.json({ user : { id : user._id, login_name : uobj.get_login_name()} });
		res.end();
	    });
	    
	})(req, res, next);
    });

    // app.post('/login', passport.authenticate('local-login'), function(req, res, next){
	
    // 	//console.log("user found !!??? : " + JSON.stringify(req.user));
    // 	res.json( { user : req.user });
    // 	//res.redirect("/");
	
    // });
    
    app.get('/user', isLoggedIn, function(req, res) {
	var ejsd={user : req.user}; sad.set_user_data(req,ejsd);
	res.render('user.ejs', ejsd);
    });
    
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
	req.logout();
	return res.json({info : "Logout success"});
	//res.redirect('/');
    });

/*    
    sad.app.get('/protected', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
	    if (err) {
		console.log("Error auth " + err);
		return next(err)
	    }
	    if (!user) {
		console.log("Error auth : no user ");
		return next("No user");//res.redirect('/signin')
	    }
	    //res.redirect('/account');
	    console.log("Go the user accound !");
	})(req, res, next);
    });
  */  
    //sad.post('/login',passport.authenticate('local'));
    // sad.post('/login', function(req,res,next){
    //     console.log("Login called After....");
    // });

    
    if(pkg.opts!==undefined) {
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================


    if(pkg.opts.facebookAuth !== undefined){
    sad.common_header_data.facebook=pkg.opts.facebookAuth;


    passport.use(new facebook_strategy({
	
	// pull in our app id and secret from our auth.js file
	clientID        : pkg.opts.facebookAuth.clientID,
	clientSecret    : pkg.opts.facebookAuth.clientSecret,
	callbackURL     : pkg.opts.facebookAuth.callbackURL
	
    },function(token, refreshToken, profile, done) {     // facebook will send back the token and profile
	
	// asynchronous
	process.nextTick(function() {
	    
	    return null("Facebook login not available now!");
	    // find the user in the database based on their facebook id
	    users.findOne({ 'facebook.id' : profile.id }, function(err, user) {
		
		// if there is an error, stop everything and return that
		// ie an error connecting to the database
		if (err)
		    return done(err);
		
		// if the user is found, then log them in
		if (user) {
		    return done(null, user); // user found, return that user
		} else {
		    // if there is no user found with that facebook id, create them
		    var newUser            = new users();
		    
		    // set all of the facebook information in our user model
		    newUser.facebook.id    = profile.id; // set the users facebook id
		    newUser.facebook.token = token; // we will save the token that facebook provides to the user
		    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
		    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
		    
		    // save our user to the database
		    newUser.save(function(err) {
			if (err)
			    throw err;
			
			// if successful, return the new user
			console.log("New facebook user added : " + JSON.stringify(profile));
			return done(null, newUser);
		    });
		}
		
	    });
	});
	
    }));

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    
    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
	    passport.authenticate('facebook', {
		successRedirect : '/user',
		failureRedirect : '/'
	    }));
    
    //console.log("Passport initialized ");
    
    }
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================

    if(pkg.opts.googleAuth !== undefined){
	
    sad.common_header_data.google=pkg.opts.googleAuth;
    
    passport.use(new google_strategy({
	
	clientID        : pkg.opts.googleAuth.clientID,
	clientSecret    : pkg.opts.googleAuth.clientSecret,
	callbackURL     : pkg.opts.googleAuth.callbackURL,
	
    },function(token, refreshToken, profile, done) {
	
	
	// make the code asynchronous
	// User.findOne won't fire until we have all our data back from Google
	process.nextTick(function() {
	    
					    // try to find the user based on their google id
	    users.findOne({ 'google.id' : profile.id }, function(err, user) {
		if (err)
		    return done(err);
		
		if (user) {
		    // if a user is found, log them in
		    return done(null, user);
		} else {
		    // if the user isnt in our database, create a new user
		    var newUser          = new users();
		    
		    // set all of the relevant information
		    newUser.google.id    = profile.id;
		    newUser.google.token = token;
		    newUser.google.name  = profile.displayName;
		    newUser.google.email = profile.emails[0].value; // pull the first email
		    
		    // save the user
		    newUser.save(function(err) {
			if (err)
			    throw err;
			return done(null, newUser);
		    });
		}
	    });
	});
	
    }));
    

    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
	    passport.authenticate('google', {
		successRedirect : '/user',
		failureRedirect : '/'
	    }));

    }
    //passport.authenticate('local-login'),



    
    //app.use(express.session({ secret: 'keyboard cat' }));
    
//    app.use(cookieParser()); // read cookies
//    app.use(bodyParser()); // get information from html forms

    

    }

    
    cb(null);

}

