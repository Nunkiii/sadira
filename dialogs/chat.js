/*Pierre Sprimont, CNR/INAF, Bologna, 2015 */

var DLG = require("../www/js/dialog");

var redis_cnx;
var redis_pubcnx;

exports.init=function(pkg, app){
    
    app.log("Chat module slave: init...");
    app.dialog("demo.chat", demo_chat);

    
    
    var redis = require("redis");
    
    redis_cnx = redis.createClient({detect_buffers: true});
    redis_pubcnx = redis.createClient({detect_buffers: true});

    DLG.new_event(redis_cnx, "chat_event");
    
    redis_cnx.on("subscribe", function (channel, count) {
	app.log("redis: subscribed to channel ["+channel+"]");
	
	//client2.publish("a nice channel", "I am sending a message.");

    });

    redis_cnx.on("message", function (channel, message) {
	app.log("redis message : channel " + channel + ": " + message);
	this.trigger("chat_event", message);
	//client1.unsubscribe();
	//client1.end();
	
    });
    
    redis_cnx.subscribe("chat:info");
}

var master_chat;

exports.init_master=function(pkg, app){
    app.log("Chat module master: creating master of the chat !");
    master_chat = new chat_engine(app);

    var redis = require("redis");
    redis_cnx = redis.createClient({detect_buffers: true});
    redis_cnx.flushdb();
    
}


function demo_chat (dlg, status_cb){

    var uid;
    var nick;
    var user_ip;
    
    dlg.cnx.listen("closed", function(cr){
	console.log("Chat : socket connexion closed " + cr);
    });

    var chat_events={};

    function listen_chat_event(chanel, what, event_cb){
	var ename=chanel+"_"+what;
	DLG.new_event(chat_events, ename);
	chat_events.listen(ename,event_cb);
    }
    
    var chat_msg_handler=function(message){
	console.log("Chat event :  " + message);
	dlg.send_datagram({ type : "chat_message", data : { what: "server_info", info : JSON.parse(message) } });
    }

    dlg.listen("connect", function (dgram){

	//for(var p in dlg.cnx.request) console.log("cnxpr " + p);
	//redis_pubcnx.publish("chat", "Client connected ! "+dlg.cnx.request.remoteAddress );
	
	redis_cnx.listen("chat_event", chat_msg_handler);
	
	uid=Math.random().toString(36).substring(2);
	nick="ChatUser_"+uid;
	user_ip=dlg.cnx.request.remoteAddress;
	redis_pubcnx.hmset("chat:user:"+uid, "nick", nick, "ip", user_ip );
	redis_pubcnx.lpush("chat:users",uid);

	redis_pubcnx.publish("chat:info",JSON.stringify({ what : "user_connect", uid : uid, nick : nick, ip : user_ip  }) );

	var user_room = function(rid){
	    this.rid=rid;
	    this.listen=function(chanel, what){
		
	    }
	}
	
	dlg.listen("chat_message", function(dgram){

	    var head=dgram.header;

	    console.log("Chat : received client message ["+JSON.stringify(head)+"]");
	    
	    switch(head.chatcom){
	    case "set_nickname" :
		nick=head.nick;
		redis_pubcnx.hset("chat:user:"+chat_uid, "nick", nick);
		redis_pubcnx.publish("chat:info",JSON.stringify({ what : "user_nickchange", uid : uid, nick : nick}) );
		break;
	    case "enter_room":
		var rid=head.rid;
		redis_pubcnx.exists("chat:room:"+rid, function(error, result){
		    if(error!=null){
			console.log("Error getting room : " + error);
			return;
		    }

		    if(result===0){
			console.log("No such room : " + rid);
			return;
		    }
		    
		    console.log("Got room " + rid  + "["+JSON.stringify(result)+"]");
		    redis_pubcnx.lpush("chat:room:"+rid+":users", uid);
		    redis_pubcnx.publish("chat:room:"+rid,JSON.stringify({ what : "user_enter", uid : uid, nick : nick}) );
		});
		break;
	    case "leave_room":
		break;
	    case "list_rooms" :
		redis_pubcnx.llen("chat:rooms", function(error, result){
		    console.log("Nrooms = " + result);
		    
		    redis_pubcnx.lrange("chat:rooms", 0, result, function(error, results){
			if(error!=null){
			    console.log("lrange error " + error);
			    return;
			}
			var nrooms=results.length;
			var rooms=[];
			console.log("list rooms : " + nrooms + " replies:");
			
			results.forEach(function (rid, i) {

			    redis_pubcnx.hgetall("chat:room:"+rid, function (error, room){
				
				console.log("   Room  " + i + ": " + JSON.stringify(room));
				rooms.push(room);
				if(i==nrooms-1){
 				    dlg.send_datagram({ type : "chat_message", data : { what: "room_list", rooms : rooms} });
				}
			    });
			    
			    
			});
		    });
		});
		break;
	    case "list_users" :
		break;
	    case "create_room" :
		var rid=Math.random().toString(36).substring(2);
		redis_pubcnx.hmset("chat:room:"+rid, "name", head.name, "title", head.title, "id", rid);
		redis_pubcnx.lpush("chat:rooms",rid);
		
		redis_pubcnx.publish("chat:info",JSON.stringify({ what : "room_created", rid : rid, name : head.name, title : head.title}) );
		break;
	    case "delete_room" :
		break;
	    default: break;
		
	    };
	    
	});
	

	return;
	
	dlg.mgr.sadira.connect_interprocess_service("chat", function(error, ips){

	    if(error!=null)
		return console.log("bug: error connecting chat ips : " + error);

	    ips.listen("connected", function (data) {
		console.log("Chat IPS client connected");
	    });
	    
	    ips.listen("disconnected", function (data) {
		console.log("Chat IPS client disconnected");
	    });
	    
	    ips.listen("message", function (data) {
		console.log("Routing chat IPS message ! " + JSON.stringify(data));
		dlg.send_datagram({ type : "chat_message", data : data},null, function(error){
		    if(error){
			console.log("error sending chat message : " + error);
		    }
		    
		});
	    });
	    
	    dlg.listen("chat_message", function (dgram){
		ips.send("route",dgram.header, function(){});
	    });
	    
	});
	
    });
    
    dlg.listen("disconnect", function (dgram){
	console.log("dialog disconnect");
	if(è(chat_uid)){
	    redis_cnx.unlisten("chat_event", chat_msg_handler);
	    redis_pubcnx.publish("chat", JSON.stringify({ what : "user_disconnect", uid : chat_uid }) );

	    redis_pubcnx.lrem("chatusers",1,chat_uid);
	    redis_pubcnx.del("chatuser:"+chat_uid);
	}

    });
    
    
    status_cb();

    
}





var chat_room = function(title){
    var r=this;
    
    this.id = Math.random().toString(36).substring(2);
    this.title = ù(title) ? ("Room "+ this.id) : title;
    this.history = [];
    this.users = {};
    
    this.user_join=function(u){
	this.users[u.id]=u;
    };
    this.user_leave=function(uid){
	delete this.users[uid];
    }
    
    this.broadcast=function(meta){
	for(var u in r.users){
	    r.users[u].dlg.send_datagram({type: meta.type, meta : meta},null,function(error){
		if(error){
		    console.log("Error sending datagram to user " + this.users[u].nick + " : " + error);
		}
	    });
	}
    };
};


var chat_engine = function (sad) {
    
    var ce=this;

    ce.rooms = {};
    ce.users = {};
    
	
    ce.create_room=function(meta){
	var newroom = new chat_room(meta.title);
	ce.rooms[newroom.id]=newroom;
	return newroom;
    };
    
    ce.get_user=function(meta){
	if(!è(meta.user_id)) return null;
	var u=ce.users[meta.user_id];
	return è(u) ? u : null; 
    };
    
    ce.get_room=function(meta){
	if(!è(meta.room_id)) return null;
	var u=ce.rooms[meta.room_id];
	return è(u) ? u : null; 
    };
    
	
	
    ce.message=function(meta){
	if(è(meta.dest_user_id)){
	    var u=ce.users[meta.dest_user_id];
	    if(!è(u)) throw "No such user " + meta.dest_user_id;
	    u.dlg.send_datagram({type: meta.type, meta : meta},null,function(error){
		if(error){
		    console.log("Error sending datagram to user " + this.users[u].nick + " : " + error);
		}
	    });
	    return;
	}
	
	if(è(meta.dest_room_id)){
	    var r=ce.rooms[meta.dest_room_id];
	    r.broadcast(meta);
	    return;
	}
	
	if(è(meta.dest_system)){
	    ce.broadcast(meta);
	    return;
	}
	
    };
    
    sad.register_interprocess_service("chat", function(error, ipc){

	if(error){
	    console.log("Error registering chat IPC : " + error);
	    return;
	}

	console.log("Registered chat IPC");

	ce.broadcast=function(meta){
	    for(var u in ipc.peers){
		ipc.peers[u].send(meta);
		// ce.users[u].dlg.send_datagram({type: meta.type, meta : meta},null,function(error){
		//     if(error){
		// 	console.log("Error sending datagram to user " + this.users[u].nick + " : " + error);
		//     }
		// });
	    }
	};

	function list_rooms(client){
	    var rooms={};
	    for (var r in ce.rooms){
		rooms[r]={title : ce.rooms[r].title, nusers : Object.size(ce.rooms[r].users)};
	    }
	    client.send({ what: "room_list", rooms : rooms } );
	}
	
	ce.create_room({ title : "Market place" });
	
	ipc.listen("connect", function (client){
	    console.log("Master chat : client connected "+ JSON.stringify(client));

	    client.nick="ChatUser_"+client.id;
	    
	    client.listen("message", function(data){

		var chatcom=data.chatcom;
		
		console.log("Chat : received client message ["+JSON.stringify(data)+"]");
		
		switch(chatcom){
		case "set_nickname" :
		    client.nick=data.nick;
		    console.log("Setting nickname : " + client.nick);
		    client.send({ what: "set_nickname", txt : client.nick});
		    break;
		case "enter_room":
		    var r=master_chat.get_room(dgram.header);
		    if(r==null){
			console.log("error no such room " + hd.room_id);
			return;
		    }		    
		    r.user_join(usr);		    
		    break;
		case "leave_room":
		    var r=master_chat.get_room(dgram.header);
		    if(r===null){
			console.log("error no such room " + hd.room_id);
			return;
		    }
		    
		    r.user_leave(usr.id);
		    
		    break;
		case "list_rooms" :
		    var rooms=[];
		    for (var r in master_chat.rooms) {
			rooms.push({ id : master_chat.rooms[r].id, title : master_chat.rooms[r].title }); 
		    }
		    break;
		case "list_users" :
		    var users=[];
		    function list_users(ulist){
			for(var u in ulist) 
			    users.push({ id : ulist[u].id, nick : ulist[u].nick});
			dlg.send_datagram("user_list", users, null, function(error){});
		    }
		    var r=master_chat.get_room(dgram.header);
		    
		    list_users(r === null ? master_chat.users : r.users);
		    
		    break;
		case "create_room" :
		    master_chat.create_room(dgram.header);
		    break;
		case "delete_room" :
		    break;
		    
		default: break;
		    
		};
	    });

	    client.send({ what: "info", txt : "Your client is connected!"});
	    client.send({ what: "set_nickname", txt : client.nick});
	    list_rooms(client);
	});
	    
	ipc.listen("disconnect", function (client){
	    console.log("Master chat : client disconnected "+ JSON.stringify(client));
	});
	
    });
    
};


