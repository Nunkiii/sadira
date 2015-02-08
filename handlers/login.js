var passport = require('passport');
var local_strategy = require('passport-local').Strategy;
var facebook_strategy = require('passport-facebook').Strategy;
var google_strategy = require('passport-google-oauth').OAuth2Strategy;


//var SamlStrategy = require('passport-saml' ).Strategy;
//var flash    = require('connect-flash');

var crypto=require('crypto');

//var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
//var session      = require('express-session');


var schemas = require('../js/base_schemas');
var users=schemas.users;


exports.isAuthenticated = passport.authenticate('basic', { session : false });

exports.init=function(pkg,sad){

    var app=sad.app;
  
    //app.set('view engine', 'ejs'); // set up ejs for templating
    // required for passport
    
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    //app.use(flash()); // use connect-flash for flash messages stored in session

    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
	done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
	users.findById(id, function(err, user) {
	    done(err, user);
	});
    });

    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    
    passport.use('local-signup',
		 new local_strategy({
		     // by default, local strategy uses username and password, we will override with email
		     usernameField : 'email',
		     passwordField : 'hashpass',
		     passReqToCallback : true // allows us to pass back the entire request to the callback
		 },function(req, email, hashpass, done) {
		     
		     // asynchronous
		     // User.findOne wont fire unless data is sent back
		     process.nextTick(function() {
			 
			 // find a user whose email is the same as the forms email
			 // we are checking to see if the user trying to login already exists
			 console.log("Begin signup  process for " + email);
			 
			 users.findOne({ 'local.email' :  email }, function(err, user) {
			     //users.findOne({}, function(err, user) {
			     // if there are any errors, return the error
			     if (err){
				 console.log("Error looking up user: " + err);
				 return done(err);
			     }
			     // check to see if theres already a user with that email
			     if (user) {
				 console.log("Email already taken " + email);
				 return done(null, false, 'That email address is already registered.');
			     } else {
				 // if there is no user with that email
				 // create the user
				 console.log("Begin signup  process... create user");
				 
				 var new_user = new users();
				 
				 // set the user's local credentials
				 new_user.local.email    = email;
				 new_user.local.hashpass = hashpass;
			     
				 // save the user
				 new_user.save(function(err) {
				     if (err)
					 throw err;
				     
				     return done(null, new_user, " Gllllleeee");
				 });
			     }
			     
			 });
			 
		     });
		     
		 }));
    
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new local_strategy({
	// by default, local strategy uses username and password, we will override with email
	usernameField : 'email',
	passwordField : 'hashpass',
	passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function(req, email, hashpass, done) { // callback with email and password from our form
	
	console.log("Login init for " + email + " pass " + hashpass);
	// find a user whose email is the same as the forms email
	// we are checking to see if the user trying to login already exists
	users.findOne({ 'local.email' :  email }, function(err, user) {
	    //users.findOne({}, function(err, user) {
	    // if there are any errors, return the error before anything else
	    if (err){
		console.log("Error looking for user " + err);
		return done(err);
	    }
	    console.log("---> User is " + JSON.stringify(user));
	    // if no user is found, return the message
	    if (!user)
		return done(null, null, "User not found !");
	    
	    // if the user is found but the password is wrong
	    user.check_password(hashpass, function(error, match){

		if(error)
		    return done(error);
		console.log("checkpass match = " + match);
		if(match)
		    return done(null, user, "Yeah!Login!!");
		
		return done(null, null, "Oops! Wrong password");
		

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
    app.post('/login', function(req, res, next) {
	passport.authenticate('local-login', function(err, user, info) {
	    if (err) { return next(err); }
	    if (!user) {
		return res.json({error : "Login failed !"});
	    }

	    //console.log("Got user " + JSON.stringify(user) + " login ... type is " + typeof(req.logIn) );
	    
	    req.logIn(user, function(err) {
		if (err) { return next(err); }
		var ejsd={}; sad.set_user_data(req,ejsd);
		return res.json(ejsd);
	    });
	})(req, res, next);
    });


    // 	app.post('/login', function(req, res, next){
    // 	passport.authenticate('local-login',function(err, user, info){
    // 	    if(err) {
    // 		console.log("auth error " + err);
    // 		return next(err);
    // 	    }
    // 	    if(user==null) {
    // 		console.log(info);
    // 		return res.json({ error : info});
    // 	    }
    // 	    console.log("user found !! : " + JSON.stringify(user));
	    
    // 	    req.logIn(user, function(err){
    // 		if(err) {
    // 		    console.log("login error " + err);
    // 		    return next(err);
    // 		}
    // 		res.json({ error : null, user : user} );
    // 	    });
    // 	})(req,res,next)
    // });
    // successRedirect : '/profile', // redirect to the secure profile section
    // failureRedirect : '/login', // redirect back to the signup page if there is an error
    // failureFlash : true // allow flash messages
    
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
    
    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new facebook_strategy({
	
	// pull in our app id and secret from our auth.js file
	clientID        : pkg.opts.facebookAuth.clientID,
	clientSecret    : pkg.opts.facebookAuth.clientSecret,
	callbackURL     : pkg.opts.facebookAuth.callbackURL
	
    },function(token, refreshToken, profile, done) {     // facebook will send back the token and profile
	
	// asynchronous
	process.nextTick(function() {
	    
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
    
    console.log("Passport initialized ");
    

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
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

function login( req, res, next){

    var query = get_bson_parameters(req);
    var login_com=query.com;
    switch(login_com){
    case "init":
	break;
    default:
	break;
    };

    console.log("--> Login : " + JSON.stringify(query));
    
    reply_json(res, { login : "OK"}, function(error){
	if(error!=null){ return console.log("Error sending login reply " + error);}
	console.log("Sent reply OK");
    });
    
    next();
}
