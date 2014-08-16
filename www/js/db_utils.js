////////////////////////////////////////////////////////////////////////////
// GRBSpec, web-2.0 framework
// Author : Pierre Sprimont <sprimont@email.ru>, May 2014. 
//
// Database queries helper functions and editable <table> construction helpers.
//
////////////////////////////////////////////////////////////////////////////


function console_write_error(txt){
    document.getElementById("console").innerHTML+='<span class="error_message">'+txt+'</span>';
}

function console_write_info(txt){
    document.getElementById("console").innerHTML+='<span class="info_message">'+txt+'</span>';
}


// Global variable containing logged in user information.

var user={name:"Web visitor", level: -1};

////////////////////////////////////////////////////////////////////////////
//Functions related to login/logout of the user

var orig_login_color;
function query_login(what, result_cb){
    
    var login=document.getElementById("login");

    json_query("access.php?"+what, function(error, resp){
	if(error){
	    login.innerHTML="Error!";
	    //console.log("Error json_query " + error);
/*
	    setTimeout(function(){
		query_login("what=check");
	    }, 2000);
*/	    
	    if(result_cb)result_cb(error);
	    else
		write_console_error(error);

	}else{
	    login.style.color=orig_login_color;
	    if(resp.found){
		user.name=resp.author.USERREALNAME;
		user.level=resp.author.ID_AUTHOR;
		login.innerHTML=user.name + " (access level "+user.level+ ")";
		
	    }else{
		login.innerHTML=user.name;
		user.name="Web visitor";
		user.level=-1;
		login.innerHTML=user.name;
		//login.style.color="red";
	    }
	    if(result_cb)result_cb(null,"OK");
	}
    });
}

///////////////////////////////////////////////////////////////
//User Login/Logout stuff

function setup_login(result_cb){
    
    var login=document.getElementById("login");
    var in_logout=false;

    orig_login_color=login.style.color;
    
    login.onclick=function(){

	if(user.level!=-1){
	    
	    if(in_logout){
		if(confirm("Are you sure you want to logout ?")){
		    query_login("what=logout",result_cb);
		}else{
		    query_login("what=check",result_cb);
		}
		
		return;
	    }
	    
	    login.innerHTML="Logout ?";
	    login.className="login_clickable";
	    in_logout=true;
	    return;
	}

	login.innerHTML="";
	login.style.color=orig_login_color;

	var input_caption=document.createElement('div');
	var input_box=document.createElement('input');

	input_caption.innerHTML="Login : ";
	input_caption.className='login_input_caption';
	input_box.className='login_input_box';
	
	login.appendChild(input_caption);
	login.appendChild(input_box);

	input_box.focus();

	var user_name="", user_password="";
	
	input_box.onkeydown = function(e) {
	    
	    if (e.keyCode === 13) { //return key pressed
		
		if(user_name==""){
		    user_name=hex_md5(input_box.value);
		    input_box.value="";
		    input_caption.innerHTML="Password : ";
		    input_box.type="password";
		}else{
		    //console.log("Setting user password...");
		    user_password=hex_md5(input_box.value);
		    input_box.value="";
		    input_caption.innerHTML="Registering...";
		    input_box.style.display='none';
		    console.log("["+user_name+"]["+user_password+"]");
		    query_login("what=login&u="+user_name+"&p="+user_password,result_cb);
		}
	    }
	};
    }

    login.innerHTML="Checking login status...";
    query_login("what=check", result_cb);
    
}

//Sends a generic query to the servers, parameters are given in the JS array "params". 
//"what" refers to the DB action to be performed server side.
//The parameters are sent along with the url generically in the order they are given in the params array.
//The callback function returns two values, eventual error or null if none, in the latter case, the second parameter
//returns the result as a JavaScript object parsed from the returned ASCII string.

function server_query(what, params, result_cb, json){

  
  var xhr = new XMLHttpRequest();

    xhr.onload = function() {
	try{
	    //console.log("response is " + xhr.responseText);
	    var resp=JSON.parse(xhr.responseText);
	    if(resp.error)
		throw("Server error  : " + resp.error);
	}
	catch(e){
	    return result_cb("Parse error : " + e + "");
	}

	result_cb(null,resp);
    };
    
    var uri="query.php?what="+what;
    if(typeof json!='undefined' && json==true) uri+="&json=1"
    for(var p=0;p<params.length;p++) uri+="&p"+p+"="+params[p];
    //console.log("sending uri["+uri+"]");
    xhr.open("GET", uri,true);
    xhr.send();
}

//This configures an HTML element to be editable and performs the DB action required.
//All parameters are given as HTML tag property attributes.

function setup_editable_stuff(el){
    
    //console.log("setting edit for " + el.tagName);
    
    function kp_handler(ev){

	ev = ev || window.event;
	var code = ev.which || ev.keyCode;

	if (code == 13) { // Return key pressed
	    
	    var what=el.getAttribute('data-what'); //The action to be performed server side
	    var orig=el.getAttribute('data-orig'); //The original data (to restore the value in case of mistake/error)
	    var type=el.getAttribute('data-type'); //Type of the data, used for data consistency checking as well as input type property.

	    var params=[],last_p=0;

	    while (el.hasAttribute("data-p"+last_p) ){
		console.log("Got parameter " + last_p);
		params[last_p]=el.getAttribute("data-p"+last_p);
		last_p++;
	    }
	    
	    //var lineid=el.getAttribute('data-lineid');
	    //console.log("Info " + lineid + " w= " + what );
	    
	    //console.log("Enter pressed. Original data is " + el.getAttribute('data-orig'));
	    var value=el.innerHTML;
	    if(value!=orig){
		if(type=="num" || type=="number"){
		    value = +el.innerHTML;
		    if(isNaN(value) || !isFinite(value) ){
			alert("You didn't enter a valid numerical value!");
			el.innerHTML=orig;
			return;
		    }
		}
		if(confirm("Are you sure you want to modify this ?\n(was "+orig+" -> New value : " + value + ")")){
		    params[last_p]=value;
		    server_query(what, params, function(error, ok){
			if(error!=null){
			    alert(error);
			    el.innerHTML=orig;
			}else{
			    alert("Database changed!");
			    //setup_line_catalog();
			    //setup_line_names();
			}
		    });
		}else{
		    el.innerHTML=orig;
		}
		
		if (typeof ev.preventDefault != "undefined") {
		    ev.preventDefault();
		} else {
		    ev.returnValue = false;
		}
	    }
	}
    }
    
    if (typeof el.addEventListener != "undefined") {
	el.addEventListener("keypress", kp_handler, false);
	//el.addEventListener("keydown", kp_handler, false);
	//console.log("attached event listeneer");
    } else if (typeof el.attachEvent != "undefined") {
	el.attachEvent("onkeypress", kp_handler);

    }
    
}

//Creates a special <td> cell to delete a DB row.

function create_delete_cell(tr,action,params,delete_level, on_done_func){
    
    if(user.level>=delete_level){
	var td=document.createElement('td');tr.appendChild(td); td.innerHTML="☠"; td.className="tddel";
	td.style.textAlign="center";
	td.onclick=function(){
	    if(confirm("WARNING: Really delete that object  ? ")){
		server_query(action, params, function(error, ok){
		    if(error!=null){
			alert(error);
		    }else{
			alert("Object deleted!");
			on_done_func();
		    }
		});
	    }
	}
    }
}

//Fills up the table header.

function create_table_head(t, columns, delete_level){
    var tr=document.createElement('tr');t.appendChild(tr);
    for(var c=0;c<columns.length;c++){
	var td=document.createElement('th');tr.appendChild(td); td.innerHTML=columns[c];
    }
    if(user.level>=delete_level){
	var td=document.createElement('th');tr.appendChild(td); td.innerHTML="Delete";
    }
}

//Creates an editable <td> cell.

function create_editable_cell(tr, what, level, value, type, params){

    var td=document.createElement('td');
    tr.appendChild(td); 
    td.innerHTML=value;
    
    if(user.level>=level){
	td.className="editable_stuff";
	td.setAttribute("data-what",what);
	td.setAttribute("data-orig",value);
	td.setAttribute("data-type",type);
	td.setAttribute("contentEditable",true);
	
	for(var p=0;p<params.length;p++){
	    td.setAttribute("data-p"+p,params[p]);
	}
	
	setup_editable_stuff(td);	
    }

}

//Creates a box for entering a new row in a DB table.

function setup_new_object(div, object, callback){
    
    var ol=+object.level,ul=+user.level;
    if(ul < ol){
	return;
    }
    var idiv=document.createElement("div"); idiv.className="new_object"; div.appendChild(idiv);
    var np=object.inputs.length;

    var s=document.createElement("span");s.innerHTML="<strong>Add new "+object.name + "</strong><br/>"; idiv.appendChild(s);

    var pdiv=document.createElement("div"); pdiv.className="new_object_params"; idiv.appendChild(pdiv);
    var inps=[];
    for(var p=0;p<np;p++){
	var ptag=document.createElement("span"); ptag.innerHTML=object.inputs[p].name+": ";pdiv.appendChild(ptag);
	inps[p]=document.createElement("input"); 
	inps[p].type=object.inputs[p].type; 
	pdiv.appendChild(inps[p]);
    }
    //var br=document.createElement("br"); idiv.appendChild(br);
    var b=document.createElement("button"); idiv.appendChild(b);b.innerHTML="Submit"; b.style.float="right"; b.style.marginTop="0.5em";
    var br=document.createElement("br"); idiv.appendChild(br);
    var status=document.createElement("span"); idiv.appendChild(status);

    
    b.onclick=function(){
	var pvals=[];
	for(var p=0;p<np;p++){
	    if(inps[p].type=="password")
		pvals[p]=hex_md5(inps[p].value);
	    else
		pvals[p]=inps[p].value;
	}
	status.innerHTML="Submitting your data to server...";
	
	server_query(object.what, pvals, function (error, ok){
	    if(error!=null){
		status.innerHTML=error;
		status.style.color="red";
	    }else{
		status.innerHTML="New object added !";
		callback(); 
	    }
	    
	});
    }
}
