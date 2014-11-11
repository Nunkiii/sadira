function ce(n){
  return document.createElement(n);
}

function cc(n, parent, prep){
  return prep ? parent.prependChild(document.createElement(n)) : parent.appendChild(document.createElement(n));
}

// Array Remove 

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    if (this.length != array.length)
        return false;

    for (var i = 0; i < this.length; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].compare(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}


/*
Object.prototype.getName = function() { 
    var funcNameRegex = /function (.{1,})\(/;
    var results = (funcNameRegex).exec((this).constructor.toString());
    return (results && results.length > 1) ? results[1] : "";
};
*/

var nameFromToStringRegex = /^function\s?([^\s(]*)/;

/**
 * Gets the classname of an object or function if it can.  Otherwise returns the provided default.
 *
 * Getting the name of a function is not a standard feature, so while this will work in many
 * cases, it should not be relied upon except for informational messages (e.g. logging and Error
 * messages).
 *
 * @private
 */

function class_name(object, defaultName) {
    var result = "";
    if (typeof object === 'function') {
        result = object.name || object.toString().match(nameFromToStringRegex)[1];
    } else if (typeof object.constructor === 'function') {
        result = class_name(object.constructor, defaultName);
    }
    return result || defaultName;
}

//Adding class setting helpers to all dom objects

HTMLElement.prototype.remove_class = function(class_name) {
    this.className =this.className.replace(new RegExp("(?:^|\\s)"+class_name+"(?!\\S)","g"), '' );
};

HTMLElement.prototype.add_class = function(class_name) {
    if(!this.has_class(class_name))
	this.className +=' '+class_name;
};

HTMLElement.prototype.has_class=function(cls) {
    return (' ' + this.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

HTMLElement.prototype.prependChild = function(child) { return this.insertBefore(child, this.firstChild); };

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function create_std_button(button_name, callback){
    var b=document.createElement('button'); b.className="std_button";b.innerHTML=button_name;
    b.addEventListener("click", function(ev){
	callback(ev,b);
    });
    return b;
}



//Make a "true" copy of an object as the = in js returns only a reference (pointer).
//This is stupid?

function clone_obj(obj) {
     if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj)
        temp[key] = clone_obj(obj[key]);
    return temp;
  

  var new_obj = (o instanceof Array) ? [] : {};
  
  for (i in o) {
//    if (i == 'clone') continue; //?
    if (o[i] && typeof o[i] == "object") {
      new_obj[i] = clone_obj(o[i]);//.hyperclone();
    } else 
    new_obj[i] = o[i];
  } 
  
  return new_obj;
}

//Display JSON avoiding the circular objects.

function jstringify(object, n){ 
    
    //console.log('JS' );
    
    var cache=[];
    var nn=5;
    if(n) nn=n;
    
    return JSON.stringify(object,function(key, value) {
	if (typeof value.nodeName != 'undefined' )  return;
	if (typeof value === 'object' && value !== null) {
	    if (cache.indexOf(value) !== -1) {
		// Circular reference found, discard key
		return;
	    }
	    // Store value in our collection
	    cache.push(value);
	}
	//console.log('JS END' );
	return value;
    } , nn );
    
    
    cache = null; // Enable garbage collection
}

function capitalise_first_letter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function is_ascii(str) {
    return /^[\x00-\x7F]*$/.test(str);
}

////////////////////////////////////////////////////////////////////////////
//
// Generic AJAX GET call for ASCII data. 

function xhr_query(query, result_cb, opts){

    var xhr = new XMLHttpRequest();    
    var method="GET";
    
    if ("withCredentials" in xhr) {
	// Check if the XMLHttpRequest object has a "withCredentials" property.
	// "withCredentials" only exists on XMLHTTPRequest2 objects.
    } else if (typeof XDomainRequest != "undefined") {
	// Otherwise, check if XDomainRequest.
	// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
	xhr = new XDomainRequest();
    } else {
	console.log("CORS not supported by your browser! Request could fail...")
	//return null;
    }
    
    if(è(opts)){
	
	if(typeof opts.method!='undefined')
	    method = opts.method; 
	
	if(typeof opts.type!='undefined')
	    xhr.responseType = opts.type; //"arraybuffer"
	
	if(typeof opts.progress != 'undefined'){
	    //console.log("XHR Add progresss ");
	    xhr.addEventListener("progress", opts.progress, false);
	}
	
    }
    
    xhr.upload.addEventListener("error", function(ev){
	result_cb("Error ajax upload : " + xhr.statusText);
    }, false);
    
    xhr.addEventListener("error", function(ev){
	result_cb("Error download  (" + xhr.statusText + ")");
    }, false);
    
    xhr.addEventListener("load", function(ev){
	
	//console.log("Response Type [" + xhr.responseType + "] status ["+xhr.status+"] : " + xhr.statusText );

	if(xhr.status==200){
	    /*
	    if(xhr.responseType=='arraybuffer'){
		console.log("Received bytes "+ xhr.response.byteLength);
	    }else
		console.log("Received txt "+ xhr.responseText);
	    */
	    result_cb(null, (xhr.responseType=='arraybuffer') ?  xhr.response :  xhr.responseText);
	}
	else
	    result_cb("XHTTP Error :" + xhr.statusText,null);
    },false);

    try{
	xhr.open(method, query, true);
	xhr.send();
    }
    catch (e){
	result_cb("XHTTP Error :" + e.toString());
    }

    return xhr;
}

////////////////////////////////////////////////////////////////////////////
//AJAX request, parsing the result as JSON.

function json_query(query, result_cb, opts){

    xhr_query(query,function(error, text_data){
	if(error) 
	    return result_cb(error);
	else{
	    var data;

	    try{
		//console.log("DATA IN ["+text_data+"]");
		data=JSON.parse(text_data);
	    }
	    catch (e){
		return result_cb("json_query: JSON parse error " + e);
	    }

	    /*
	    if(data.error){
		return result_cb("json_query: Server reported error : " + data.error);
	    }
	    */
	    result_cb(null,data);
	}
    }, opts);
}

////////////////////////////////////////////////////////////////////////////
//AJAX request, parsing the result as JSON.

function bson_query(query, result_cb, opts){
    opts.type="arraybuffer";

    xhr_query(query,function(error, qdata){
	if(error) 
	    return result_cb(error);
	else{
	    var data;

	    try{
		//console.log("DATA IN ["+text_data+"]");
		data=BSON.deserialize(qdata);
	    }
	    catch (e){
		return result_cb("json_query: JSON parse error " + e);
	    }

	    /*
	    if(data.error){
		return result_cb("json_query: Server reported error : " + data.error);
	    }
	    */
	    result_cb(null,data);
	}
    }, opts);
}


var request = function (opts){
    //this.opts=opts;

    if(ù(opts.cmd)) throw "No API command given";

    if(ù(opts.mode)) opts.data_mode="json";
    if(ù(opts.query_mode)) opts.query_mode="json";
    if(ù(opts.host)) opts.host="";
    if(ù(opts.key)) opts.key="req";


    function ab2b64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
    }
    
    this.build_url_string_json=function(){
	this.url_string=opts.host+opts.cmd;
	if(è(opts.args))
	    this.url_string+="?"+opts.key+"="+encodeURIComponent(JSON.stringify(opts.args));
	return this.url_string;
    }

    this.build_url_string_bson=function(){

	this.url_string=opts.host+opts.cmd;

	if(è(opts.args)){
	    var bs=BSON.serialize(opts.args);
	    var b64=ab2b64(bs);
	    console.log("Encoded : BSON length = " + bs.byteLength +" b64 Length= " + b64.length);
	    this.url_string+="?"+opts.key+"="+encodeURIComponent(b64);
	}

	return this.url_string;
    }

    this.execute=function(cb){
	opts.query_mode==="json" ? this.build_url_string_json() : this.build_url_string_bson();
	//console.log("XHR QUERY");
	switch(opts.data_mode){
	case "json" : 
	    json_query(this.url_string,cb,opts.xhr);
	    break;
	default: 
	    xhr_query(this.url_string,cb,opts.xhr);
	    break;
	    
	};
    }
  return this;
};



function download_url(url, callback) {
    var request = new XMLHttpRequest;  
    request.open('GET', url, true);
    
    request.onreadystatechange = function() {
	if (request.readyState == 4 && request.status==200) {
	    callback(null,request.responseText);
	}
    };
    
    try{
	request.send(null);
    }
    catch (e){
	callback("download_url error : " + e);
    }
}

// function download_url_sync(url) {
//     var request = new XMLHttpRequest;  //We don't want to support IE*
//     // window.ActiveXObject ? 
//     // new ActiveXObject('Microsoft.XMLHTTP') : 

//     request.open('GET', url, false);
//     request.send(null);
               
//     if (request.readyState == 4 && request.status==200) {
//         return request.responseText;
//     }
//     return request.statusText;
// }

function create_action_menu(base_node){
    
    menu_node=document.createElement("ul");
    menu_node.className="action_list";
    base_node.appendChild(menu_node);
    
    menu_node.create_action = function ( action_name, click_callback){
	action_node=document.createElement("li");
	a_node=document.createElement("a");
	//	a_node.className="action";
	a_node.innerHTML=action_name;
	a_node.onclick=click_callback;
	this.appendChild(action_node);
	action_node.appendChild(a_node);
	return a_node;
    }
    return menu_node;
}




//Returns the current server address

var hostname="";

function get_server_address(){
    if(hostname=="")hostname=location.host;

    if(document.location.protocol == "http:")
	return "http://"+hostname+"/"+sadira_prefix;
    else
	return "https://"+hostname+"/"+sadira_prefix;
}



function require_javascript(script_src, ready_function){
  require_script(script_src, ready_function);
}

// This function loads the javascript file located at script_src url. After successful loading of the script,
// the ready_function callback is triggered.


function require_script(script_src, ready_function, mime_type){
    var head = document.getElementsByTagName('head')[0];
    var scripts = head.getElementsByTagName('script');
    
    for(var s=0;s<scripts.length;s++)
	if(scripts[s].src == script_src){ //The script  is already loaded
	    ready_function(null,{});
	    return;
	}
    
    console.log("Script "+ script_src + " not found, loading...") ;
    
    new_script = document.createElement('script');
    new_script.type = (typeof mime_type=='undefined') ? 'text/javascript' : mime_type;
    new_script.charset = 'utf-8';
    
    
    new_script.addEventListener("onload", function() {
	console.log("Got the script : " + new_script.innerHTML);
	ready_function(null,new_script);
    }, false);

    new_script.src = script_src;
    
    
    document.getElementsByTagName('head')[0].appendChild(new_script);
    
}


// This function loads the javascript file located at the main server's script_path path. After successful loading of the script,
// the ready_function callback will be called.


function require_our_javascript(script_path, ready_function){

    var script_src=get_server_address()+script_path;

    // console.log('script url is ' + script_src);

    // if(document.location.protocol == "http:")
    // 	script_src ="http://"+location.host+"/"+script_path;
    // else
    // 	script_src ="https://"+location.host+"/"+script_path;
    
    require_javascript(script_src, ready_function);

}


// This function loads the javascript file corresponding to a widget given by its widget_name. After successful loading of the script,
// the ready_function callback will be called.
//
// To avoid loading useless widget javascript code in the browser, this function should be called each time
// a new widget type is used.


function require_widget(widget_name, ready_function){
    //console.log("require widget " + widget_name);
    var script_path = "/js/widgets/" + widget_name + ".js";
    require_our_javascript(script_path, function(){
	

	eval(widget_name).prototype.widget_name=widget_name;
	//console.log("Updating prototype for " + widget_name + " done WN = " + eval(widget_name).prototype.widget_name );
	ready_function();
    });    
}

/*
window.addEventListener("message", receiveMessage, false);
function receiveMessage(event){
    console.log("Received WIN EVENT : " + JSON.stringify(event.data));
    // if (event.origin !== "http://example.org:8080")
    //     return;
    event.source.postMessage("Yes i got it....", event.origin);
}

window.transfer_widget = function( w){
    console.log("Transfert ! "+ w);
}
*/


//Returns a dom object present in this widget's HTML dom structure based on a selector.

function select(node, selector){
    var tmp_objects=node.querySelectorAll(selector);
    for(var i=0;i<tmp_objects.length;i++) 
	if(tmp_objects[i].dataset)
	    return tmp_objects[i];
    return null;
}

//Returns all dom object present in this widget's HTML dom structure based on a selector.

function select_all(node, selector){
    return node.querySelectorAll(selector);
}

// creates a global "addWheelListener" method
// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
(function(window,document) {

    var prefix = "", _addEventListener, onwheel, support;

    // detect event model
    if ( window.addEventListener ) {
        _addEventListener = "addEventListener";
    } else {
        _addEventListener = "attachEvent";
        prefix = "on";
    }

    // detect available wheel event
    support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
    document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
    "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

    window.addWheelListener = function( elem, callback, useCapture ) {
        _addWheelListener( elem, support, callback, useCapture );

        // handle MozMousePixelScroll in older Firefox
        if( support == "DOMMouseScroll" ) {
            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
        }
    };

    function _addWheelListener( elem, eventName, callback, useCapture ) {
        elem[ _addEventListener ]( prefix + eventName, support == "wheel" ? callback : function( originalEvent ) {
            !originalEvent && ( originalEvent = window.event );

            // create a normalized event object
            var event = {
                // keep a ref to the original event object
                originalEvent: originalEvent,
                target: originalEvent.target || originalEvent.srcElement,
                type: "wheel",
                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
                deltaX: 0,
                delatZ: 0,
                preventDefault: function() {
                    originalEvent.preventDefault ?
                        originalEvent.preventDefault() :
                        originalEvent.returnValue = false;
                }
            };
            
            // calculate deltaY (and deltaX) according to the event
            if ( support == "mousewheel" ) {
                event.deltaY = - 1/40 * originalEvent.wheelDelta;
                // Webkit also support wheelDeltaX
                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
            } else {
                event.deltaY = originalEvent.detail;
            }

            // it's time to fire the callback
            return callback( event );

        }, useCapture || false );
    }
    
})(window,document);



var dump_error =function (err) {
    var rs="";
    if (typeof err === 'object') {
	if (err.message) {
	    rs='\nMessage: ' + err.message;
	}
	if (err.stack) {
	    rs+='\nStacktrace:';
	    rs+='====================';
	    rs+=err.stack;
	}
    } else {
	rs= err;
    }
    return rs;
}

function css(selector, property, value) {
    for (var i=0; i<document.styleSheets.length;i++) {//Loop through all styles
        //Try add rule
        try { document.styleSheets[i].insertRule(selector+ ' {'+property+':'+value+'}', document.styleSheets[i].cssRules.length);
            } catch(err) {try { document.styleSheets[i].addRule(selector, property+':'+value);} catch(err) {}}//IE
    }
}

