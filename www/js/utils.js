var nodejs= typeof module !== 'undefined' && typeof GLOBAL !== 'undefined'; //Checking if we are in Node

function S(tpl, sname){
    if(tpl.strings===undefined) return 'No strings ( so no ' + sname + ')';
    if(tpl.strings[sname]===undefined) return 'Unknown string ' + sname;
    //console.log("Setting text to " + tpl.strings[sname] );
    return tpl.strings[sname];
}


function add_classes(classes, class_node){
    
    if(!class_node || !classes) return;
    if(typeof classes == 'string')
	class_node.className+=" "+classes;
    else
	for(var c=0;c<classes.length;c++)
	    class_node.className+=" "+classes[c];
}



function get_ico_string(tpl){
    if(è(tpl.ui_opts)){
	if(è(tpl.ui_opts.icon)){
	    var s='<img src="'+tpl.ui_opts.icon+'" class="ico" ';
	    if(è(tpl.ui_opts.icon_size))
		s+='style="width:'+tpl.ui_opts.icon_size+'"';
	    s+=">"
	    //console.log("Got icon " + tpl.ui_opts.icon);
	    return s;
	}
    }
    return undefined;
}

function get_icon(opts){
    
    var ico;
    
    if( opts.char_icon !==undefined){
	ico=ce('span');
	ico.className="text-primary";
	ico.innerHTML=opts.char_icon;
	if(è(opts.icon_size))
	    ico.style.fontSize=opts.icon_size;

	return ico;
    }
  
    if( opts.fa_icon !==undefined){
	ico=ce('span');
	ico.className="text-primary fa fa-"+opts.fa_icon;
	return ico;
    }
    
    if(è(opts.icon)){
	ico= ce("img");
	ico.src=opts.icon;
	ico.className="ico";
	if(è(opts.icon_size))
	    ico.style.width=opts.icon_size;
	return ico;
    }
    
    return ico;
}


function get_ico(tpl){
    
    var ico;
    
    if(è(tpl.ui_opts)){
	ico=get_icon(tpl.ui_opts);
	if(ico!==undefined) return ico;
    }
    if(è(tmaster.icons)){
	if(typeof tmaster.icons[tpl.type] != 'undefined'){
	    ico= ce("img");
	    ico.src=tmaster.icons[tpl.type];
	    ico.className="ico";
	}else
	    if(typeof tpl.template_name!='undefined' && typeof tmaster.icons[tpl.template_name] != 'undefined'){
		ico= ce("img");
		ico.src=tmaster.icons[tpl.template_name];
		ico.className="ico";
	    }
    }
    
    return ico;
}



//Make a "true" copy of an object as the = in js returns only a reference (pointer).
//This is stupid?

function clone_obj(obj) {
    
    if(obj == null || typeof(obj) != 'object' || obj.nodeName !== undefined)
        return obj;
    //console.log("clone begin cons=" + obj.constructor + " type " + typeof(obj) + " name " + obj.nodeName);
    //var temp = obj.constructor(); // changed
    var temp = (obj instanceof Array) ? [] : {};
    
    for(var key in obj)
	if (obj.hasOwnProperty(key)){
	    //console.log("cloning key " + key);
	    temp[key] = clone_obj(obj[key]);
	}
    return temp;
    

    //   var new_obj = (o instanceof Array) ? [] : {};
    
    //    for (i in o) {
    // //    if (i == 'clone') continue; //?
    //     if (o[i] && typeof o[i] == "object") {
    //       new_obj[i] = clone_obj(o[i]);//.hyperclone();
    //     } else 
    //     new_obj[i] = o[i];
    //   } 
    
    //   return new_obj;
}

function format_byte_number(v){
    var u=["","k","M","G","T"];
    var id=0,idmax=4;
    var val=v, unit='byte';
    while(val>=1024 && id<idmax){
	val=val/1024.0;
	id++;
    };
    val=Math.floor(val*100)/100.0;
    if(val>1) unit+="s";
    return  val+ " " +u[id]+unit;
};

function b64ToUint6 (nChr) {

    return nChr > 64 && nChr < 91 ?
	nChr - 65
        : nChr > 96 && nChr < 123 ?
	nChr - 71
        : nChr > 47 && nChr < 58 ?
	nChr + 4
        : nChr === 43 ?
	62
        : nChr === 47 ?
	63
        :
	0;

}

function base64DecToArr (sBase64, nBlocksSize) {

    var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
	nMod4 = nInIdx & 3;
	nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
	if (nMod4 === 3 || nInLen - nInIdx === 1) {
	    for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
		taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
	    }
	    nUint24 = 0;

	}
    }

    return taBytes;
}



//Display JSON avoiding the circular objects.

function jstringify(object, n){ 
    
    //console.log('JS' );
    
    var cache=[];
    var nn=5;
    if(n) nn=n;
    
    return JSON.stringify(object,function(key, value) {
	if(value===undefined){
	    console.log("!!!Undefined value for " + key);
	    return;
	}
	if (value.nodeName !== undefined )  return;
	if (typeof value === 'object' && value !== null) {
	    if (cache.indexOf(value) !== -1) {
		// Circular reference found, discard key
		return;
	    }
	    //console.log('JSS ' + cache.length );
	    // Store value in our collection
	    cache.push(value);
	}
	
	return value;
    } , nn );
    
    
    cache = null; // Enable garbage collection
}

function is_function(o) {
    var getType = {};
    return o && getType.toString.call(o) == '[object Function]';
}


if(nodejs){
    GLOBAL.is_function=is_function;
    GLOBAL.clone_obj=clone_obj;
    GLOBAL.jstringify=jstringify;
}else{
    
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
	
	if(!this.has_class(class_name)){
	    if(this.className=="") this.className=class_name; else
		this.className +=' '+class_name;
	}
    };

    window.has_class=function(cls, cstring) {
	return (' ' + cstring + ' ').indexOf(' ' + cls + ' ') > -1;
    }

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
		xhr.addEventListener("progress", function(e) {
		    opts.progress({m: 'Loading', v : e.loaded, e : e});
		}, false);
	    }
	    
	}
	
	xhr.upload.addEventListener("error", function(ev){
	    result_cb("XHTTP Error upload["+query+"]: " + xhr.statusText);
	}, false);
	
	xhr.addEventListener("error", function(ev){
	    result_cb("XHTTP Error ["+query+"] : [" + xhr.statusText.toString() + "] ev: " + ev);
	}, false);
	
	xhr.addEventListener("load", function(ev){
	    
	    //console.log("Response Type [" + xhr.responseType + "] status ["+xhr.status+"] : " + xhr.statusText );

	    if(xhr.status==200){

		// if(xhr.responseType=='arraybuffer'){
		// 	console.log("Received Binary bytes "+ xhr.response.byteLength);
		// }else
		// 	console.log("Received Text length "+ xhr.responseText.length);

		result_cb(null, (xhr.responseType=='arraybuffer') ?  xhr.response :  xhr.responseText);
	    }
	    else
		result_cb("XHTTP Bad status " + xhr.status+ " ["+query+"] : " + xhr.statusText,null);
	},false);

	try{
	    //console.log("xhr query ["+query+"]");
	    

	    xhr.open(method, query, true);

	    if(method=="POST"){
		var post_data="";
		if(è(opts.post_data)) post_data=opts.post_data;
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//xhr.setRequestHeader("Content-length", post_data.length);
		//xhr.setRequestHeader("Connection", "close");
		xhr.send(post_data);
	    }
	    else
		xhr.send();
	}
	catch (e){
	    result_cb("XHTTP Exception :" + e.toString());
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
		
		if(typeof opts.progress != 'undefined'){
		    opts.progress({ m : "<i class='fa fa-spinner fa-spin text-warning'></i> Parsing JSON", v : 0.0 });
		}
		
		setTimeout(function(){
		    //console.log("DATA IN ["+text_data+"]");
		    try{
			data=JSON.parse(text_data);
			if(typeof opts.progress != 'undefined'){
			    opts.progress({ m : "<i class='fa fa-check text-success'></i> Parsing JSON done", v : 100.0 });
			}
		    }
		    catch (e){
			return result_cb("JSON parse error : " + dump_error(e) );
		    }
		    result_cb(null,data);

		}, 200);
		
		/*
		  if(data.error){
		  return result_cb("json_query: Server reported error : " + data.error);
		  }
		*/
		
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

    function ab2b64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
            binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
    }


    var request = function (opts){

	if(è(opts.cmd)) opts.url=opts.cmd;
	
	if(ù(opts.url)) throw "No API command given";
	
	if(ù(opts.data_mode)) opts.data_mode="json";
	if(ù(opts.query_mode)) opts.query_mode="json";
	if(ù(opts.host)) opts.host="";
	if(ù(opts.key)) opts.key="req";
	if(ù(opts.method)) opts.method="GET";

	
	this.build_url_string_json=function(){
	    this.url_string=opts.host+opts.url;
	    if(è(opts.args))
		this.url_string+="?"+opts.key+"="+encodeURIComponent(JSON.stringify(opts.args));
	    return this.url_string;
	}

	this.build_url_string_bson=function(){

	    this.url_string=opts.host+opts.url;

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
	    //console.log("Executing request " +this.url_string);
	    switch(opts.data_mode){
	    case "json" : 
		json_query(this.url_string,cb,opts);
		break;
	    case "bson" : 
		bson_query(this.url_string,cb,opts);
		break;
	    case "dgm":
		opts.type="arraybuffer"; //forcing binary mode
		xhr_query(this.url_string,function(error, data){
		    if(error!=null) return cb(error);
		    try{
			var dgm= new datagram();
			dgm.deserialize(data);
		    }
		    catch (e){
			return cb("Error deserializing datagram : " + e);
		    }
		    cb(null,dgm);
		},opts);
		break;
	    default: 
		xhr_query(this.url_string,cb,opts);
		break;
		
	    };
	}
	return this;
    };

    function download_url(url, callback) {

	xhr_query(url,callback);
	
	// var request = new XMLHttpRequest;  
	// request.open('GET', url, true);
	
	// request.onreadystatechange = function() {
	// 	if (request.readyState == 4 && request.status==200) {
	// 	    callback(null,request.responseText);
	// 	}
	// };
	
	// try{
	// 	request.send(null);
	// }
	// catch (e){
	// 	callback("download_url error : " + e);
	// }
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

    //var hostname="";

    function get_ws_server_address(){
	return  (document.location.protocol == "https:" ? "wss:":"ws:") + "//" + location.host;
    }
    function get_server_address(){
	return  document.location.protocol + "//" + location.host;

	// if(hostname=="")hostname=location.host;

	// if(document.location.protocol == "http:")
	// 	return "http://"+hostname+"/"+sadira_prefix;
	// else
	// 	return "https://"+hostname+"/"+sadira_prefix;
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

	function wheel(e) {
	    preventDefault(e);
	}

	window.disable_scroll=function() {
	    if (window.addEventListener) {
		window.addEventListener('DOMMouseScroll', wheel, false);
	    }
	    window.onmousewheel = document.onmousewheel = wheel;
	    //document.onkeydown = keydown;
	}

	window.enable_scroll=function() {
	    if (window.removeEventListener) {
		window.removeEventListener('DOMMouseScroll', wheel, false);
	    }
	    window.onmousewheel = document.onmousewheel /*= document.onkeydown*/ = null;
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

	function preventDefault(e) {
	    e = e || window.event;
	    if (e.preventDefault)
		e.preventDefault();
	    e.returnValue = false;
	}
	
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
		    preventDefault: preventDefault(originalEvent)
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
    
    
    var proc_monitor=function(){
	var ui=this.ui=ce("div"); ui.className="proc_monitor";
	var info_icon, wait_icon, progress;
	var message;

	info_icon=cc("img",ui,true);
	info_icon.className="info_icon disabled";
	wait_icon=cc("div",ui,true);
	wait_icon.className="wait_icon disabled";
	xhr_query("/sadira/icons/loading-spinning-bubbles.svg", function(error, svgtext){
	    if(error===null)
		wait_icon.innerHTML=svgtext ;
	})
	this.waiting=false;
	
	message=cc("div",ui);
	message.className="action_message";
	
	this.message=function(msg){
	    message.innerHTML=msg;
	};
	
	this.error=function(message){
	    this.stop_waiting();
	    info_icon.src="/sadira/icons/Error_icon.svg";
	    info_icon.remove_class("disabled");
	    if(è(message)) 
		this.message(message);
	};
	
	this.done=function(m){

	    this.stop_waiting();
	    info_icon.src="/sadira/icons/Approve_icon.svg";
	    info_icon.remove_class("disabled");
	    if(è(m)) 
		this.message(m);
	};

	this.progress=function(frac,m){
	    this.stop_waiting();
	    if(ù(progress)){
		progress={};
		ui.prependChild(template_ui_builders.progress({},progress));
	    }
	    progress.set_value(frac*100);
	    if(è(m)) 
		this.message(m);
	}

	this.stop_waiting=function(){
	    if(!this.waiting)return;
	    wait_icon.add_class("disabled");
	    this.waiting=false;
	}
	this.wait=function(m){
	    if(this.waiting)return;
	    info_icon.add_class("disabled");
	    this.waiting=true;
	    console.log("Waiting .... ");
	    wait_icon.remove_class("disabled");
	    
	    if(è(m)) 
		this.message(m);
	    
	};
	
	return this;
    }


    function get_document(opts, cb){
	
	var r=new request({ cmd : '/api/dbcom/get', args : { db : { name : opts.db, collection : opts.collection }, id : opts.id, fields : opts.fields, path : opts.path } });
	
	r.execute(function(err, data){
	    if(err)return cb(err);
	    if(data.error) return cb("server error : " +data.error);
	    cb(null,data);
	});
    }
    
}

function get_margins(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("margin-left"))+parseFloat(s.getPropertyValue("margin-right"));
    h=parseFloat(s.getPropertyValue("margin-top"))+parseFloat(s.getPropertyValue("margin-bottom"));
    return {w: w, h: h};
    
}

function get_paddings(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("padding-left"))+parseFloat(s.getPropertyValue("padding-right"));
    h=parseFloat(s.getPropertyValue("padding-top"))+parseFloat(s.getPropertyValue("padding-bottom"));
    return {w: w, h: h};
    
}

function get_borders(s){
    var w=0,h=0;
    w=parseFloat(s.getPropertyValue("border-left-width"))+parseFloat(s.getPropertyValue("border-right-width"));
    h=parseFloat(s.getPropertyValue("border-top-width"))+parseFloat(s.getPropertyValue("border-bottom-width"));
    return {w: w, h: h};
}


function get_overflow(wg){
    var s=window.getComputedStyle(wg,null);
    var m=get_margins(s);
    var p=get_paddings(s);
    var b=get_borders(s);
    var o={w: m.w+b.w+p.w, h: m.h+b.h+p.h, sty : s, m : m, p : p, b : b};
    //console.log("overflow " + JSON.stringify(o,null,2));
    return o;
}


function divider(cnt, frac, or, heightf){

    var ho=ù(or)? false : or;
    if(ù(frac)) frac=50.0;

    var div=this;

    new_event(this,"drag_start");
    new_event(this,"drag_end");
    new_event(this,"drag");
    
    var mouseconf=false;

    this.set_orientation=function(or){
	ho=or;
	//this.update();
    }
	var HH;

    this.update=function() {

	if(HH===undefined)HH=cnt.clientHeight; //parseFloat(divnoded.sty.height)+divnoded.h
	//if(ù(ho)) throw("No direction !") ; //ho=false;
	var htop=heightf();

	//console.log("HH is " + HH);
	
	if(isNaN(htop) ){
	    console.log("Nan value for htop !");
	    return;
	}

	var head=document.body.querySelector("header");
	var foot=document.body.querySelector("footer");

	var wh=window.innerHeight+"px";	
	var hstring="calc( "+wh;
	if(è(head)){
	    var hs=window.getComputedStyle(head,null);
	    hstring+=" - "+ hs.height;
	}
	//console.log("Head height " + JSON.stringify(hs,null,5));
	if(è(foot)){
	    var fs=window.getComputedStyle(foot,null);
	    hstring+=" - "+ fs.height;
	}

	hstring+=" - " + htop +"px - 20px )";
	//console.log("Head height " + hs.height + "footer height " + fs.height + " window " + wh + " htop " + htop);
	//console.log("Setting height to ["+hstring+"]");

	
	hstring="400px";

	var l=this.left, r=this.right;
	var divnode = this.divnode;
	
	if(ho){
	    //divnode.style.height="3px";
	    //divnode.style.width = "100%";
	}else{
	    //divnode.style.height = "calc(100% - 1em)";
	    //divnode.style.top = "0px";
	    //divnode.style.width="3px";
	}
	

	var cntd=get_overflow(cnt);
	var leftd=get_overflow(l);
	var rightd=get_overflow(r);
	var divnoded=get_overflow(divnode);
	
	//var sty=document.defaultView.getComputedStyle(cnt);
	

	// parseFloat(cntd.sty.paddingTop)+parseFloat(cntd.sty.paddingBottom)+
	//     parseFloat(cntd.sty.marginTop)+parseFloat(cntd.sty.marginBottom)
	//     : parseFloat(cntd.sty.paddingLeft)+parseFloat(cntd.sty.paddingRight)+
	//     parseFloat(cntd.sty.marginRight)+parseFloat(cntd.sty.marginLeft);
	//var cnth=parseFloat(sty.height);
	//	var divh=sty.height;
	
	
	//sty=document.defaultView.getComputedStyle(l);

	//var ml=ho?get_margins(leftd.sty).h:get_margins(leftd.sty).w;

	//var divh=get_inner_dim(leftd.sty,ho);
	//console.log("Container : w=" + w + " mtot = " + ml );//+ " sty =  " + JSON.stringify(sty));
	//console.log("Left : w=" + sty.width + " mtot = " + ml + " clientw=" + this.left.clientWidth);

	//var mr=ho?get_margins(rightd.sty).h:get_margins(rightd.sty).w;

	//console.log("Right : w=" + sty.width + " mtot = " + mr + " clientw=" + this.right.clientWidth);
	//sty=document.defaultView.getComputedStyle(divnode);
	
	
	//if(ho) wp-=0;
	//console.log("Width tot margins : " + (leftd.w+cntd.w) + " divp="+divp + " nrl " + mrl + " divw " + divw);

	//var cntpad=ho? cntd.m.h+cntd.b.h : cntd.m.w+cntd.b.w;
	var cntpad=ho? cntd.p.h : cntd.p.w; 

	var wreal=ho?parseFloat(cntd.sty.height):parseFloat(cntd.sty.width);
	// var wreal=ho?
	//     cnt.clientHeight
	//     :cnt.clientWidth;
	//var w=wreal-cntpad;

	

 	var divw=ho?
	    parseFloat(divnoded.sty.height)+divnoded.h
	    :parseFloat(divnoded.sty.width)+divnoded.w;
	//var wp=wreal-mr-ml-divw;
	
	var wp= ho ? HH : wreal-cntpad-divw;
	
	if(ho){
	    var wl=(frac/100.0*wp);//-leftd.h; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp);//-rightd.h; //-cntd.w;
	}else{
	    var wl=(frac/100.0*wp);//-leftd.w; //-cntd.w;
	    var wr=((1.0-frac/100.0)*wp);//-rightd.w; //-cntd.w;
	}

	//console.log("Wcont = " + wreal + " padd " + cntpad + " divw " + divw + " -> " + wp + " WL=" + wl + " WR="+wr + " WSUM=" + (wl+wr) );
	//console.log("HO [[" + ho +"]] wl=" + wl + " wr=" + wr + " wt=" + (wl+wr) + " wl+wr+marg="+ (wl+wr+mr+ml)+" wcnt= " + w);
	l.style.flex = "0 1 "+wl + 'px';
	r.style.flex = "0 1 "+wr + 'px';
	

	//console.log("HO= "+ho+" frac "+frac+" divw=" + divw + "  wp=" + wp + " mr="+ mr + " ml " + ml +" wcnt= " + w);

	if(!mouseconf){

	    mouseconf=true;
	    //console.log("Creating drag events");
	    divnode.addEventListener('mousedown', function(e) {


		e.preventDefault();
		var last = ho? e.pageY : e.pageX;
		//console.log("DRAG BEGIN " + last);
		
		document.documentElement.add_class('dragging');
		document.documentElement.addEventListener('mousemove', on_move, true);
		document.documentElement.addEventListener('mouseup', on_up, true);
		
		div.trigger("drag_start");
		
		function on_move(e) {
		    
		    e.preventDefault();
		    e.stopPropagation();

		    var pos=(ho ? e.pageY : e.pageX);
		    var delta = pos - last;
		    last = pos;
		    //delta -= last;

		    var sty=document.defaultView.getComputedStyle(cnt);
		    var ma=get_margins(sty);
		    
		    var m=ho? ma.h:ma.w; //(sty.marginBottom+sty.marginTop) : (sty.marginLeft+sty.marginRight);
		    var sz=ho? sty.height : sty.width;
		    frac += delta /  (parseFloat(sz)-m) * 100;
		    //console.log("delta="+delta + " m= " + m + " dim " + sty.width + " frac " + frac);		    
		    div.trigger("drag");
		    div.update(ho);
		    
		}
		
		function on_up(e) {
		    e.preventDefault();
		    e.stopPropagation();
		    document.documentElement.remove_class('dragging');
		    //document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
		    document.documentElement.removeEventListener('mousemove', on_move, true);
		    document.documentElement.removeEventListener('mouseup', on_up, true);
		    //console.log("Done move..."); 
		    div.trigger("drag_end");
		}
		
	    }, false);
	}
    }

}

