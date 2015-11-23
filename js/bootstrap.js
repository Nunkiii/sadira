//var crypto=require('./crypto');
var crypto = require('crypto');

function get_console_password(prompt, callback) {

    if (callback === undefined) {
	callback = prompt;
	prompt = undefined;
    }
    if (prompt === undefined) {
	prompt = 'Password: ';
    }
    if (prompt) {
	process.stdout.write(prompt);
    }

    var stdin = process.stdin;
    //stdin.resume();
    stdin.setRawMode(true);
    //stdin.resume();
    stdin.setEncoding('utf8');

    var password = '';

    var  handle_char=function(ch){
	ch = ch + "";

	switch (ch) {
	case "\n":
	case "\r":
	case "\u0004":
	    process.stdout.write('\n');
	    stdin.setRawMode(false);
	    //stdin.pause();
	    stdin.removeListener('data',handle_char);
	    callback(false, password);
	    break;
	case "\u0003":
	    // Ctrl-C
	    stdin.setRawMode(false);
	    stdin.removeListener('data',handle_char);
	    callback(true);
	    break;
	default:
	    process.stdout.write('*');
	    password += ch;
	    break;
	}

    }

    stdin.on('data', handle_char);

}

exports.get_strong_console_password=function(user, cb, config_in){

    var owasp = require('owasp-password-strength-test');

    var config=
	{
	    allowPassphrases       : true,
	    maxLength              : 128,
	    minLength              : 8,
	    minPhraseLength        : 20,
	    minOptionalTestsToPass : 2,
	};
    if(è(config_in)) for(var c in config_in) config[c]=config_in[c];
    owasp.config(config); 

    var strong_password;
    
    var stage0=function(){
	get_console_password("Enter password for user \""+user+"\" :", function(error, data){
	    if(error) return cb(error);
	    console.log("Checking password ["+data+"]");

	    if(data.length==0) {
		cb("God password setup aborted by impatient user");
		return;
	    }
	    
	    var owasp_result = owasp.test(data);
	    
	    if(owasp_result.strong){
		strong_password=data;
		stage1();
	    }else{
		console.log("Password too weak : " + JSON.stringify(owasp_result, null, 5));
		stage0();
	    }
	});
    }
    var stage1=function(){
	get_console_password("Enter password again", function(error, data){
	    if(data !== strong_password){
		console.log("Passwords don't match! Doing it again from start...");
		stage0();
	    }else{
		cb(null, strong_password);
	    }
	});
    }
    
    stage0();
}

    
//     var n=collections.length;
//     collections.forEach(function(c){
// 	var col=create_object(c, function (e){
// 	    mongo.write_doc(col, function(err, doc){
// 		if(err) return close_cb(err); 
// 		n--;
// 		if(n===0) close_cb(null);
// 	    });
	    
// 	});
//     });



