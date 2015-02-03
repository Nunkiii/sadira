var passport = require('passport');
var flash    = require('connect-flash');

var crypto=require('crypto');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');


var schemas = require('../js/base_schemas');
var users=schemas.users;

var local_strategy = require('passport-local').Strategy;

exports.isAuthenticated = passport.authenticate('basic', { session : false });

exports.init=function(pkg,sad){

    var app=sad.app;
    
    //app.set('view engine', 'ejs'); // set up ejs for templating
    // required for passport
    app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    
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
				 return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
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
				     if (err) return done(err);
				     //throw err;
				     return done(null, new_user);
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
	    if (ù(user))
		return done(null, null, "User not found !");
	    
	    // if the user is found but the password is wrong
	    user.check_password(hashpass, function(error, match){
		if(error)
		    return done(error);
		if(match)
		    return done(null, user);
		
		return done(null, null, "Oops! Wrong password");
		

	    });
	    
	    

	});
	
    }));

        
    app.post('/signup', passport.authenticate('local-signup'),
	     function(req, res){
		 console.log("Signup success !");
	     });
    // {successRedirect : '/profile', // redirect to the secure profile section
    // failureRedirect : '/signup', // redirect back to the signup page if there is an error
    // failureFlash : true // allow flash messages
    
    
    // process the login form
    app.post('/login', function(req, res, next){
	passport.authenticate('local-login',function(err, user, info){
	    if(err) {
		console.log("auth error " + err);
		return next(err);
	    }
	    if(user==null) {
		console.log(info);
		return res.json({ error : info});
	    }
	    console.log("user found !! : " + JSON.stringify(user));
	    req.logIn(user, function(err){
		if(err) {
		    console.log("login error " + err);
		    return next(err);
		}
		res.json({ error : null, user : user} );
	    });
	})(req,res,next)
    });
    // successRedirect : '/profile', // redirect to the secure profile section
    // failureRedirect : '/login', // redirect back to the signup page if there is an error
    // failureFlash : true // allow flash messages
    
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
    
    //sad.post('/login',passport.authenticate('local'));
    // sad.post('/login', function(req,res,next){
    //     console.log("Login called After....");
    // });
    
    
    console.log("Passport initialized ");
    
    
    
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
