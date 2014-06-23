// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.

var BSON=bson().BSON;

// Namespace for all widgets

var widget={}; 

// Base widget class. Handles child widgets, addressing, messages.

widget.base = function widget(){
    console.log("widget base construct wname=" +this.widget_name);
    //this.widget_name=null;
    this.parent_widget=null;    
    this.widget_id=null;//widget id
    this.child_widgets=[];
    this.listen_funcs={}; //Inline server message handlers   

    if(typeof arguments.callee !='undefined')
	if(widget.caller != null){
	    //console.log("callee name " + widget.name + " caller " + widget.caller.name);
	    //this.cl_name=widget.name;
	    //this.cll_name=widget.caller.name;
	    //console.log(this.cl_name + " : Caller is " + this.cll_name);
	    //this.widget_name=this.cll_name;
	}
    
}

widget.base.prototype.message={}; //Base of message handling functions   
widget.base.prototype.events={}; //Event handlers
//widget.base.prototype.listen_funcs={}; //Inline server message handlers   
//widget.base.prototype.widget_name="none";

widget.base.prototype.get_widget_name=function(){ return this.widget_name; };

//Returns the child widget index

widget.base.prototype.get_widget_idx = function(child){
    for(var c=0;c<this.child_widgets.length;c++)
	if(this.child_widgets[c]==child) return c;
    
    return null;
}

//Returns the top level DOM object used by this widget
widget.base.prototype.get_dom_object = function(){
    return null;
}
//Returns the parent DOM object to which this widget is curently attached
widget.base.prototype.get_dom_parent = function(){
    return null;
}


//Returns the child widget identified by its widget_id

widget.base.prototype.get_child_widget = function(widget_id, result_cb){
    
//    console.log("Looking for "+widget_id+", we have " + this.child_widgets.length + " childs...");

    for(var c=0;c<this.child_widgets.length;c++){
	if(this.child_widgets[c].widget_id == widget_id){
	    result_cb(null, this.child_widgets[c],c);
	    return;
	}
    }
    result_cb(this.widget_name +" : get_child_widget: impossible to find child " + widget_id);
}

//Returns the child widget identified by its address (Array of parent's widget ids)

widget.base.prototype.get_widget = function(widget_addr, pos, result_cb){

//    console.log("Get widget pos =  " + pos);
    if(typeof widget_addr=='undefined') throw "get_widget: No widget addr !!!";
    
    if(widget_addr.length==0){
	result_cb(null, this, 0);
	return; //main widget
    }
    
    this.get_child_widget(widget_addr[pos], function(error, child_w, child_id){

	if(error!=null){
	    result_cb(error);
	    return;
	}
	
	if(pos==widget_addr.length-1){
//	    console.log("Got IT! " + child_w.widget_name );
	    result_cb(null, child_w, child_id);
	    return;
	}
	
	child_w.get_widget(widget_addr, pos+1, result_cb);
    });
}

//Returns an array containing all child widgets of a given type (widget_name)

widget.base.prototype.get_widgets_byname = function(widget_name){

    var widgets=[];

    for(var c=0;c<this.child_widgets.length;c++){
	if(this.child_widgets[c].widget_name == widget_name){
	    widgets.push(this.child_widgets[c]);
	}
	widgets.concat(this.child_widgets[c].get_widgets_byname(widget_name)); //recursion on the child widgets
    }

    return widgets;
}


widget.base.prototype.get_html_template = function(){
    return "/"+server_prefix+"/"+widget_prefix+"/"+this.widget_name+".html";
}


widget.base.prototype.set_html = function(cb){
    cb("");
}

widget.base.prototype.init = function(error,child){
    cb(null,this);
}

// widget.base.prototype.html = function(ready_cb){
//     ready_cb("");
// }

//Returns the full adress array for this widget. 
//The main widget's address is an empty array.

widget.base.prototype.widget_addr =function(){
    var w=this;
    var addr=[];
    while (w.parent_widget!=null){
	//addr.push(w.widget_id);
	addr.unshift(w.widget_id);
	w=w.parent_widget;
    }
    return addr; //.reverse();
}


//Returns the full adress array for this widget. 
//The main widget's address is an empty array.

widget.base.prototype.widget_depth =function(){
    var d=0;
    for(var w=this,d=0;w.parent_widget!=null;d++,w=w.parent_widget);
    return d; 
}


//Disconnects all the server events this widget was connected to.

widget.base.prototype.disconnect_events=function(){
    var so=this;
    var jso={	
	cmd : 'widget.event_disconnect', 
	widget_addr: so.widget_addr(),
	data : { 
	    widget_addr: so.widget_addr()
	}};
    
    //console.log("Disconnect events: " + JSON.stringify(so.events) );

    for(var e in so.events){
	if(so.events.hasOwnProperty(e)){
	    //console.log("disconnecting event " + so.events[e].event_name);
	    jso.data.event_name=so.events[e].event_name;
	    //if(so.events[e].session) 
	    jso.data.session=so.events[e].session;
	    wsock.send(JSON.stringify(jso));
	}
    };
    so.events={};
}


//Connects this widget to a given server event, the event_cb callback beeing fored when a new event is received.

widget.base.prototype.connect_to_event=function(event_name, event_cb){
    var so=this;

    var jso=JSON.stringify({ 
	cmd : 'widget.event_connect', 
	widget_addr: this.widget_addr(),
	data : { 
	    widget_addr: so.widget_addr(),
	    event_name: event_name,
	    session: false
	} 
    });
    so.events[event_name]={ event_name: event_name, event_cb: event_cb};
    
    //console.log("New event : "+ jso );
    wsock.send(jso);
}


widget.base.prototype.connect_to_session_event=function(event_name, event_cb){

    var so=this;
    var jso=JSON.stringify({ 
	cmd : 'widget.event_connect', 
	widget_addr: so.widget_addr(),
	data : { 
	    widget_addr: this.widget_addr(),
	    event_name: event_name,
	    session: true
	} 
    });
    so.events[event_name]={ event_name: event_name, event_cb: event_cb, session : true};
    
    //console.log("New event : "+ jso );
    wsock.send(jso);
}


widget.base.prototype.message.event=function(message_data, widget, cnx){
    //console.log('Got ' + JSON.stringify(message_data));
    widget.events[message_data.event_name].event_cb(widget, message_data.event_data);
}


widget.base.prototype.merror=function(message_data, opts){
    this.add_log(message_data, {css_class : "browser_error_message"});
}

widget.base.prototype.serror=function(message_data, opts){
    this.add_log(message_data, {css_class : "server_error_message"});
}

widget.base.prototype.minfo=function(message_data, opts){
    this.add_log(message_data, {css_class : "browser_info_message"});
}


widget.base.prototype.add_log=function(message_data, opts){
    var f=this;
    while ( typeof f.widget_extra == 'undefined' && f.parent_widget!=null) f=f.parent_widget;
    
    
    // if ( typeof f.widget_extra == 'undefined')
    // 	return console.log("Widget " + this.widget_name + "("+this.widget_addr()+")"+ JSON.stringify(message_data,null,3));
    
    //console.log("Setting to extra for"+  this.widget_name + "("+this.widget_addr()+")"+"  display on :" + f.widget_name + "("+f.widget_addr()+")"  + " : " + JSON.stringify(message_data,null,3));

    var css_class="error_message";
    var title="server error";
    if(typeof opts != 'undefined'){
	if(typeof opts.css_class != 'undefined'){
	    css_class=opts.css_class;
	    if(opts.css_class=="browser_error_message") title = "browser error ";
	    if(opts.css_class=="browser_info_message") title = "browser info ";
	    if(opts.css_class=="info_message") title = "server info ";
	    if(opts.css_class=="error_message") title = "server error ";
	}
    }
    title += "("+this.widget_name+"): ";
    var msd=document.createElement('div'); msd.className=css_class;
    msd.innerHTML=title + message_data;

    f.widget_extra.appendChild(msd);
    f.widget_extra.scrollTop = f.widget_extra.scrollHeight; //Scrolls the div to bottomx
}


widget.base.prototype.message.error=function(message_data, widget, cnx){
    console.log('Got error ' + JSON.stringify(message_data));
    this.add_log(message_data);
}


/*

widget.base.prototype.send_raw_message=function(msg, response_cb){
    if(wsock.readyState!=1){
	if(response_cb)response_cb({data:{error: "Cannot send message : socket is disconnected !"}});
	return;
    }

    msg.send(wsock);
}



//Sends a message to the server.

widget.base.prototype.config_dialog_header=function(dlg_head){
    dlg_head.widget_name= this.widget_name; 
    dlg_head.widget_addr= this.widget_addr();
}



widget.base.prototype.send=function(handler, message_data, status_cb, response_cb){
    
    window.sadira.dialogs.create_dialog({
	
	handler : cmd_name,
    	widget_msg: context_name,
    	widget_name: this.widget_name, 
    	widget_addr: this.widget_addr(),
    	data : message_data

    }, function (error, dlg){

	if(error){
	    response_cb("Error sending dialog " + error,null);
	    console.log("Error send : " + error);
	}

	else{
	    if(response_cb!='undefined')
		dlg.messages.on_message=response_cb;
	    
	    dlg.connect(function(error, hshk_dgram){
		
		if(error){
		    console.log("Error send dlg connect: " + error);
		}else{
		    
		    console.log("Received handshake datagram header " + JSON.stringify(hshk_dgram.header));
		    status_cb(null, hshk_dgram);
		}
		
	    });
	}
    });
*/ 
    /*    
    if(typeof response_cb !='undefined'){
	var message_id=Math.random().toString(36).substring(2);
	msg.header.id=message_id;
	this.listen_funcs[message_id]=response_cb;
    }
    
    msg.send(wsock);
    

      if(typeof header.data.binary_blocks != 'undefined'){ //Binary blocks detected, sending binary

	    var blocks=header.data.binary_blocks;
	    delete header.data.binary_blocks;
	    //console.log('Append ' + blocks.length + ' binary blocks');
	    var msg = new message(header);
	    for(bb=0;bb<blocks.length;bb++)
		msg.append_binary(blocks[bb].type,blocks[bb].data);

	    msg.send(wsock);	    
	}
	else{ //Transfering as text
	    var json_header = JSON.stringify(header);
	    wsock.send(json_header);
	}
	*/
	    
    // }
    // catch (e){
    // 	if(response_cb)
    // 	    response_cb({data:{error: "Error while sending binary message : "+e}});
    // }
    
//}




widget.base.prototype.create_dialog=function(handler, header, data, status_cb, response_cb, ui_opts){
    var w=this;

    window.sadira.dialogs.create_dialog(header, function (error, dlg){
	
	if(error){
	    response_cb("Error sending dialog " + error,null);
	    console.log("Error send : " + error);
	}
	else{

	    w.config.dialog_header(dlg.header);

	    dlg.header.handler=hndl;
	    dlg.header.data=message_data;
	    
	    if(response_cb!='undefined')
		dlg.messages.on_message=response_cb;

	    dlg.connect(function(error, hshk_dgram){

		if(error){
		    console.log("Error send dlg connect: " + error);
		}else{
		    
		    console.log("Received handshake datagram header " + JSON.stringify(hshk_dgram.header));
		    status_cb(null, hshk_dgram);
		}
		
	    });
	    
	}
    });

}

// //Sends a message to a global server-side handler.
// widget.base.prototype.send_message=function(handler, data, status_cb, response_cb, ui_opts){
//     this.create_dialog=function(handler,{}, data, status_cb, response_cb, ui_opts);
// }

// //Sends a message to the corresponding server-side widget handler.

// widget.base.prototype.send_widget_message=function(message_name, data,status_cb,  response_cb, ui_opts){
//     this.send('widget', message_name, message_data,status_cb,response_cb);    
//     this.create_dialog=function("widget", {widget_msg : message_name }, data, status_cb, response_cb, ui_opts);
// }


widget.base.prototype.server_action=function(handler, ui_template, action_cb, message_data){

    if(typeof message_data == 'undefined'){
	//console.log("No message data !");
	message_data={};
    }
    
    console.log("Parent is " + this.parent_widget.widget_name + " --> my adress is " + this.widget_addr() + " --> OK message_data is " + JSON.stringify(message_data));
    
    var me=this;
    var action_div=document.createElement('div');
    //var status_div=document.createElement('span');
    //status_div.className="action_status";
    var cnt=new sobj();
    cnt.title=ui_template.name;

    this.add_widget(cnt, {where : 'top', notitle : true, buttons : "content-left"}, function(error, container){


	//console.log("Container added " + container.widget_addr());
	//container.childs_div.removeChild(container.tab_nav);
	//delete container.tab_nav;

	var dbo=new db.object;//(ui_template);
	var bok,bcancel;
	
	console.log("Adding child dboo" );
	
	container.add_child(dbo);//, {where: 'top', notitle: true, buttons: "content-left"}, function(error, dbo) {

	    // if(error!=null){
	    // 	console.log("!!Error +  " + error);
	    // 	return;
	    // }
	    
	//container.minfo("DBO added " + dbo.widget_addr());

	dbo.set_tpl_data(ui_template, function (err,or){

	    if(err!=null) return action_cb(err);
	    
	    dbo.create({display: "edit"}, function(dboo){
		
		action_div.appendChild(dbo.odiv);
		
		dbo.dkey.add_class("action");
		
		bok=document.createElement('button'); bok.className="std_button";bok.innerHTML="Execute";
		bcancel=document.createElement('button'); bcancel.className="std_button";bcancel.innerHTML="Cancel";
		var button_bar=document.createElement('div'); button_bar.className="button_bar";
		
		button_bar.appendChild(bok);
		button_bar.appendChild(bcancel);
		
		
		container.widget_content_div.appendChild(action_div);
		container.widget_content_div.appendChild(button_bar);
		
		bcancel.addEventListener("click", function(ev){ me.delete_child_widget(container); });
		
		bok.addEventListener("click", function(ev){
		    dbo.build_content(message_data);
		    bok.add_class("executing");
		    bok.innerHTML="Processing request ...";
		    container.minfo("sending data : " + JSON.stringify(message_data));
		    
		    var dlg_head= message_data;
		    dlg_head.handler=handler;

		    var dlg=sadira.dialogs.create_dialog(dlg_head);
		    
		    dlg.connect(function(error, dgram){
			if(error==null){
			    bok.remove_class("executing");
			    bok.innerHTML="Execute";
			    action_cb(null,dgram.header);
			}else
			    action_cb(error);
			
		    });
		    
		});
		
		
	    });



	});
	
	
    });
    
    //   });
    return cnt;
    
    return function(message){
	console.log("message !" + JSON.stringify(message));
	if(message.enable){

	    me.minfo( "Enable  ! " + message.enable);

	    if(message.enable){
		bok.style.display='none';
	    }else
		bok.style.display='inline-block';
	}



    };
    
}

//Sends a binary message. Called by default when message_data.binary_blocks exists.

// widget.base.prototype.send_binary_message=function(message_name, message_data, response_cb){
    
//     if(wsock.readyState!=1){
// 	if(response_cb)response_cb({error: "Socket disconnected"});
// 	return;
//     }

//     var blocks=message_data.binary_blocks;
//     delete message_data.binary_blocks;
    
//     var message_header = { 
// 	cmd : 'widget.message', 
// 	data : { 
// 	    widget_name: this.widget_name, 
// 	    widget_addr: this.widget_addr(),
// 	    message_name: message_name,
// 	    message_data: message_data
// 	} 
//     };

//     var msg = new message(message_header);
    
//     //console.log('Append ' + blocks.length + ' binary blocks');
    
//     for(bb=0;bb<blocks.length;bb++)
// 	msg.append_binary(blocks[bb].type,blocks[bb].data);

//     msg.send(wsock, response_cb );
    
// }

//Calls cleanup recursively on childs widgets. 

widget.base.prototype.cleanup_deep = function(cb){
    var w=this;
    var n=this.child_widgets.length; 
    
    var nw=n;
    if(nw==0)
	w.cleanup(cb);
    else
	for(var idx=0;idx<n;idx++){
	    var child=w.child_widgets[idx];
	    //console.log("recurse clean child "+ idx +"/"+n + " :" +child.widget_name);
	    child.cleanup_deep(function() {
		nw--;
		//console.log(this.widget_name + " cleanup deep nc="+nw);
		if(nw==0){
		    w.cleanup(cb);
		}
	    } );
	    
	}
}

//This function is called before the widget is deleted from its parent. 
//Callback cb must be called when the cleanup is done.

widget.base.prototype.cleanup = function(cb){
    //console.log(this.widget_name+" default cleanup");
    cb();
}

//Add a new child widget

widget.base.prototype.add_child = function(child_widget){
    //Adding the widget to the list of childs
    this.child_widgets.push(child_widget);

    //Setting the parent widget
    child_widget.parent_widget=this;
    
    //Assigning an ID to the widget
    child_widget.widget_id=Math.random().toString(36).substring(2); 

    return child_widget;

}


//Deletes a child widget identified by its widget id.

widget.base.prototype.delete_child_widget = function(child_widget){
    
    var wid;
    
    if(child_widget instanceof widget.base){
	wid=child_widget.widget_id;
	//console.log("A widget !!");
    }else{
	wid=child_widget; //console.log("An id then !");
    }

    var so=this;
    this.get_child_widget(wid, function(error, child, idx){
	
	if(error !=null) throw error;
	
	child.disconnect_events();
	
	child.cleanup_deep(function(){
	    //console.log(so.widget_name + ' : deep cleanup done for ' + child.widget_name);
	    so.child_widgets.remove(idx);
	    delete child;
	    
	} );
    });
    //    console.log("Child not found ! ");
    
}


widget.base.prototype.get_template = function(tpl_name, result_cb){
    
    db_document_dialog(window.sadira.dialogs.create_dialog({handler : "db.get_template", tpl_name : tpl_name}),
		       {
			   on_doc : function(doc){
			       result_cb(null, doc.json_tpl);
			   }
		       });
    
}
