
exports.init=function(){
    console.log("Client creating dispatcher...");

    
}


exports.init_master=function(){
    console.log("Master creating master chat !");
    var master_chat = new chat_engine;
    
}




var chat_engine = function () {

    var ce=this;

    this.rooms = {};
    this.users = {};

    this.create_user=function(dlg, meta){

	var user = function(){
	    this.id = Math.random().toString(36).substring(2);
	    this.dlg=dlg;
	    this.nick = è(meta.nickname) ? ("Chatter " + this.id) : meta.nickname;
//	    this.new_room_message=function(meta){};
//	    this.new_server_message=function(meta){};
	};

	var newuser = new user;
	ce.users[newuser.id]=newuser;
	return newuser;
    }

    this.kill_user=function(meta){

    };


    this.create_room=function(meta){
	var room = function(){
	    var r=this;

	    this.id = Math.random().toString(36).substring(2);
	    this.title = ù(meta.title) ? ("Room "+ this.id) : meta.title;
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
	
	var newroom = new room;
	
	ce.rooms[newroom.id]=newroom;
	return newroom;
    };

    this.get_user=function(meta){
	if(!è(meta.user_id)) return null;
	var u=ce.users[meta.user_id];
	return è(u) ? u : null; 
    };

    this.get_room=function(meta){
	if(!è(meta.room_id)) return null;
	var u=ce.rooms[meta.room_id];
	return è(u) ? u : null; 
    };
    
    this.broadcast=function(meta){
	for(var u in ce.users){
	    ce.users[u].dlg.send_datagram({type: meta.type, meta : meta},null,function(error){
		if(error){
		    console.log("Error sending datagram to user " + this.users[u].nick + " : " + error);
		}
	    });
	}
    };


    this.message=function(meta){
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
    
    this.create_room({ title : "Market place" });
};

dialog_handlers.demo = {
    
    chat : function (dlg, status_cb){
	
	var usr;

	dlg.cnx.listen("closed", function(cr){
	    console.log("Chat : connexion closed " + cr);
	});

	dlg.listen("connect", function (dgram){
	    
	    if(è(master_chat)){
		usr=master_chat.create_user(dlg, dgram.header);
	    
		console.log("Connect : " + JSON.stringify(usr.id));
	    }else
		console.log("bug: no masterchat");
	});
	
	dlg.listen("disconnect", function (dgram){

	});
	
	dlg.listen("message", function (dgram){
	    master_chat.message(dgram.header);
	});

	dlg.listen("nickchange", function (dgram){

	});

	dlg.listen("enter_room", function (dgram){
	    var r=master_chat.get_room(dgram.header);
	    if(r==null){
		console.log("error no such room " + hd.room_id);
		return;
	    }
	    
	    r.user_join(usr);
 
	});

	dlg.listen("leave_room", function (dgram){
	    var r=master_chat.get_room(dgram.header);
	    if(r===null){
		console.log("error no such room " + hd.room_id);
		return;
	    }
	    
	    r.user_leave(usr.id);
	});

	dlg.listen("room_list", function (dgram){
	    var rooms=[];
	    for (var r in master_chat.rooms) {
		rooms.push({ id : master_chat.rooms[r].id, title : master_chat.rooms[r].title }); 
	    }
	    dlg.send_datagram("room_list", rooms, null, function(error){});
	});

	dlg.listen("user_list", function (dgram){
	    var users=[];
	    function list_users(ulist){
		for(var u in ulist) 
		    users.push({ id : ulist[u].id, nick : ulist[u].nick});
		dlg.send_datagram("user_list", users, null, function(error){});
	    }
	    var r=master_chat.get_room(dgram.header);

	    list_users(r === null ? master_chat.users : r.users);
	});
	

	dlg.listen("kill_room", function (dgram){

	});

	dlg.listen("create_room", function (dgram){
	    master_chat.create_room(dgram.header);
	});

	status_cb();
    }
    
};


