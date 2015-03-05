var chat_templates={
    chat_user : {
	name : "Nickname",
	type : "string",
	ui_opts : {editable : true}
    },
    users : {
	name : "Online Users"
    },
    messages : {
	name : "messages",
	type : "text"
    },
    chat_room : {
	name : "Chat panel",
	elements : {
	    chat_text : {
		name : "Room content",
		type : "text"
	    },
	    chat_input_box : {
		elements : {
		    text : {
			type : "string",
			name : "Enter message :",
			ui_opts : {type : "edit", editable : true}
		    },
		    send : {
			type : "action",
			name : "Send"
		    }
		}
	    }
	}
    },
    chat_window : { 
	name : "Unknown chat session",
	ui_opts : { child_view_type : "divider" },
	elements : {
	    user_list : {
		name : "Online users",
		type : "template",
		template_name : "users"
	    },
	    panel : {
		name : "Chat panel",
		type : "template",
		template_name : "chat_panel"
	    }
	    
	}
    },  
    chat : {
	name : "Sadira chat system",
	type : "chat",
	ui_opts : { child_view_type : "div", root_classes : ["container-fluid"], child_classes : ["container-fluid"] },
	elements : {
      	    server : {
		ui_opts : {label : true, sliding : true, slided : false, root_classes : ["inline"] },
		type : "template",
		template_name : "sadira",
		//type : "sadira",
		name : "Websocket"
	    },
	    
	    user : {
		ui_opts : { editable : true, label : true, root_classes : ["inline"] },
		type : "string",
		name : "Nickname",
		value : "auto"
	
	    },
            connect : {
		name : "Enter chat",
		type : "action",
		ui_opts : { root_classes : ["inline"] }
	    },
	    info : {
		name : "Server info",
		type : "text"
	    },
	    room_list : {
		name : "Available rooms",
		// elements : {
		//     join : {
		// 	type : "action",
		// 	name : "Enter room"
		//     }
		// }
	    },
	    create_room : {
		name : "Create room",
		type : "action",
		ui_opts : {  },
/*		ui_opts : { child_classes : ["hidden"]}, */
		elements : {
		    room_name : {
			type : "string",
			name : "Room name",
			default_value: "Enter your room name",
			ui_opts : {label: true, type : "edit", editable : true }
		    },
		    room_title : {
			type : "string",
			name : "Room title",
			default_value: "Enter a room title here",
			ui_opts : {label : true, type : "edit", editable : true }
		    }
		}
	    },
	    chat_windows : {
		name : "Chat rooms",
		ui_opts : { sliding : false, slided : false,  child_view_type : "tabbed"},
		elements : {}
	    }
	    
	}
    }
};

template_ui_builders.chat=function(ui_opts, chat){

    console.log("Chat constructor");

    var chat_windows = chat.elements.chat_windows;
    var info = chat.elements.info;
    var user = chat.elements.user;
    var room_list=chat.elements.room_list;
    var create_room=chat.elements.create_room;
    var room_name=create_room.elements.room_name;
    var room_title=create_room.elements.room_title;
    //var join=chat.elements.join;

    var room_table=cc("table", room_list.ui_root);
    room_table.className="room_table";
    
    
    var cnx = chat.elements.server;
    cnx.elements.url.set_value(get_ws_server_address());
    
    cnx.listen("socket_connect", function(){

	console.log("Hello chat server connected !");
	
	var chat_dialog= cnx.dialogs.create_dialog({ handler : "demo.chat"});

	user.listen("change",function(nick){
	    chat_dialog.send_datagram({type : "chat_message", chatcom : "set_nickname", nick : nick});
	});
	
	create_room.listen("click",function(){
	    chat_dialog.send_datagram({type : "chat_message", chatcom : "create_room", name : room_name.value, title : room_title.value});
	});

	chat_dialog.listen("chat_message", function(dgram){

	    console.log("Chat message received ! : ["+JSON.stringify(dgram.header)+"]");
	    
	    var d=dgram.header.data;
	    var what=d.what;
	    
	    if(ù(what)){ return console.log("Error chat : what not found");  }

	    switch(what){
	    case "set_nickname" :
		user.set_value(d.txt);
		break;
	    case "message" :
		break;
	    case "server_info" :
		info.append(JSON.stringify(d.info, null, 4));
		break;
	    case "room_list" :
		room_table.innerHTML="";
		
		for ( var r=0; r< d.rooms.length; r++){
		    var room=d.rooms[r] ;
		    
		    var tr=cc("tr",room_table);
		    var td=cc("td",tr);
		    td.innerHTML=room.name;
		    //td=cc("td",tr);
		    //td.innerHTML=room.title;
		    td=cc("td",tr);
		    var join=cc("input",td); join.type="button";
		    join.value="Enter";
		    join.room_id=room.id;
		    join.addEventListener("click", function(){
			console.log("Entering room " + this.room_id);
			chat_dialog.send_datagram({type : "chat_message", chatcom : "enter_room", rid : this.room_id});
		    });
		    
		    // var nr =  tmaster.build_template("chat_room");
		    // var nrui=create_ui({}, nr);
		    // chat_windows.ui_childs.add_child(nr, nrui);
		    // nr.set_title(room.title);
		}
		
		break;
	    default: break;
	    };
	    
	    
	});

	chat_dialog.connect(function (error){
	    chat_dialog.send_datagram({type : "connect"});
	    chat_dialog.send_datagram({type : "chat_message", chatcom : "list_rooms"});
	});

    });

    cnx.listen("socket_close", function(){
	console.log("Chat: socket closed");
    });
    
    cnx.listen("socket_error", function(){
    });

    cnx.connect();
    

};

(function(){
    
    window.addEventListener("load", function(){
	tmaster.add_templates(chat_templates);
    });
    
    console.log("Done load func ....");
})();
