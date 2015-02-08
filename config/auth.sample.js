// config/auth.js

module.exports = {

    'facebookAuth' : {
	'clientID'      : 'abc123', 
	'clientSecret'  : 'abc123', 
	'callbackURL'   : 'https://server.com/callback'
    },
    
    'twitterAuth' : {
	'consumerKey'       : 'your-consumer-key-here',
	'consumerSecret'    : 'your-client-secret-here',
	'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },
    
    'googleAuth' : {
	'clientID'      : 'your-secret-clientID-here',
	'clientSecret'  : 'your-client-secret-here',
	'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }
    
};
