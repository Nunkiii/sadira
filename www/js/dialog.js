// Sadira astro-web framework - PG Sprimont <fullmoon@swing.be> (2013) - INAF/IASF Bologna, Italy.
// Do what you want with this file.

/*

  Messages handle the data transfer between browser and node in a versatile way.

  Messages transiting trough the network are cutted in chunks called datagrams here.
  Datagrams can either travel on TCP-IP packets (websockets) or UDP packets (WebRTC). 
  
  There are 3 basic datagram types. These should be able to handle any kind of info : 

  Initiation datagrams
  Termination datagrams
  stream datagrams

  Note that in theory it won't work between different endiannes systems without upgrading the code below


*/

var nodejs= (typeof module !== 'undefined' && module.exports)? true:false; //Checking if we are in Node

var DGM={};

if(nodejs){
    DGM=require("./datagram.js");
}else{
    DGM.datagram=datagram;
}


/**
 * Permission class. 
 * @class perm
 */

var perm=function(pi){
    var p=this;
    if(pi!==undefined){
	['r','w','x'].forEach(function(m){
	    if(pi[m]!==undefined) p[m]=pi[m];
	});
    }
}

if(nodejs)
  GLOBAL.perm=perm;

perm.prototype.toString=function(){
  var s=''; var p=this;
  ['r','w','x'].forEach(function(m){
    var ks=p[m];
    if(ks!==undefined){
      s+= "[Mode " + m + " : ";
	    for(var t in ks){
	var kt=ks[t];
	s+=" for " + t + "[";
	for(var tid=0;tid<kt.length;tid++){
	  s+="id:"+ kt[tid]+",";
		}
		s+="], ";
	    }
	    s+="], ";
	}
    });
    return s;
}

perm.prototype.check=function(user, mode){

    
    var ks=this[mode];
    
    if(ks===undefined){
	//console.log("Permission ["+ this + "] : No such mode [" + mode + "] default policy is Forbid ! User=" + user.get_login_name());
	return false;
    }
    //console.log("PERM checking mode  " + mode + " perm = " + JSON.stringify(ks));
    if(user===undefined || user===null){
	return false;
    }

    //console.log("Permission ["+ this + "] : checking mode [" + mode + "]  User=" + user.get_login_name() );
    //console.log("Permission " + this + " : checking user " + JSON.stringify(user, null, 5));
    //console.log("Permission " + this + " : checking user " + user.name + " nick " + user.val('nick'));

    
    if(ks.u!==undefined){
	var uid=user.id();
	for(var i=0;i<ks.u.length;i++){
	    //console.log("Check obj user " + ks.u[i] + " with user " + uid);
	    if(ks.u[i]==uid) return true;
	}
    }

    if(ks.g!==undefined){
	if(user.elements===undefined) return false;
	if(user.elements.groups===undefined) return false;
	
	var ugrp=user.elements.groups.elements;
	
	if(ugrp!==undefined) 
	    for(var g in ugrp){
		for(var i=0;i<ks.g.length;i++){
		    //console.log("Check requested group [" + ks.g[i] + "] with user group [" + g+"]");
		    if(ks.g[i]==g){
			//console.log("YYYYYYYYEEEESS. Done");
			return true;
		    }else{
			
		    }
		}
	    }
    }
    
    //console.log("NOOOOOOOOO. "+ user.get_login_name() +" is Not allowed.");
    return false;
}

perm.prototype.grant=function(gr){
    var p=this;
    ['r','w','x'].forEach(function(m){
	//console.log("checking ["+m+"] grant " + JSON.stringify(gr));
	if(gr[m]!==undefined){
	    var ks=p[m];
	    if(ks===undefined)
		ks=p[m]={}; // g : [], u : [] };
	    ['g','u'].forEach(function(t){
		var a=gr[m][t];
		if(a!==undefined){
		    if(ks[t]===undefined) ks[t]=[];
		    for(var tid=0;tid<a.length;tid++){
			//console.log("Granting mode " + m + " for " + t + " id: " + a[tid] );
			ks[t].push(a[tid]);
		    }
		}
		
	    });
	}
    });
}


var dialog = function (header, mgr){

    this.header=null;

    if(typeof header != 'undefined')this.set_header(header);
    if(typeof mgr != 'undefined')this.mgr=mgr;

    //console.log("creating dialog " + JSON.stringify(header));
}

dialog.prototype.log = function(msg){
    if(typeof this.header.id!='undefined')
	console.log("DLG["+this.header.id+"]: "+msg);
    else
	console.log("DLG[UNDEF]: "+msg);
}

dialog.prototype.send_error = function(error_msg){
    this.send_datagram({type: 'error', message : error_msg },null,function(error){
    });
}
dialog.prototype.send_info = function(info_msg){
    this.send_datagram({type: 'info', message : info_msg },null,function(error){
    });
}

dialog.prototype.set_header = function(header){
    this.header=header;
}

dialog.prototype.add_serializer=function(srz){
    this.serializers[srz.oid]=srz;

//    for(var s in this.serializers){this.log("srz list after add: "+JSON.stringify(this.serializers[s].oid)); }
}


dialog.prototype.get_serializer=function(oid){
  //  for(var s in this.serializers){console.log("srz ID : "+this.serializers[s].oid); }
    return this.serializers[oid];
}


dialog.prototype.srz_request=function(dgram, result_cb){
    console.log("NO SERIALIZATION SETUP ON THIS DIALOG!");
    result_cb("No serialization setup");
}


dialog.prototype.srz_initiate=function(srz, status_cb){

    srz.oid=Math.random().toString(36).substring(2);
    srz_setup(this);
    this.serializers[srz.oid]=srz;
    var srz_head={type: 'srz', cmd: 'req', oid: srz.oid, sz : srz.size() };
    if(typeof srz.header!=='undefined')
	for(var h in srz.header) srz_head[h]=srz.header[h];
    this.send_datagram(srz_head,null,function(error){
	status_cb(error);
    });
}

srz_setup=function(dlg){
    if(typeof dlg.serializers!=='undefined') return;
//    var dlg=this;

    dlg.serializers={};
//    dlg.log("srz setup !");

    dlg.listen('srz', function(dgram){

	var srcmd=dgram.header.cmd;

	if(srcmd=='req'){

	    var status_head={type: 'srz', cmd: 'req_reply'};

	    try{
		
		var oid=dgram.header.oid; 
		if(typeof oid=='undefined') 
		    throw "No serializer oid received!!";
		status_head.oid=oid;
		
		//console.log("SRZ request ID=" + oid + " func is " + typeof dlg.srz_request);
		
		dlg.srz_request(dgram, function(error, srz){
		    //console.log("Ok here... srz = " + typeof srz);
		    
		    if(error!=null){ 
			status_head.status=false; status_head.error_message= error;
		    }
		    else{
			//console.log("Ok got serializer...");
			srz.oid=oid;
			status_head.status=true;
			dlg.add_serializer(srz);
		    }
		    dlg.send_datagram(status_head,null,function(error){});
		});

		
	    }
	    catch (e) {
		status_head.status=false; status_head.error_message= dump_error(e);
		dlg.send_datagram(status_head,null,function(error){});
	    }
	    
	    
	}
	else
	    if(srcmd=='req_reply'){
		
		var oid=dgram.header.oid;
		if(typeof oid=='undefined') throw "No serializer oid received!!";
		
		var srz=dlg.get_serializer(oid);
		
		
		if(dgram.header.status==true){

		    
		    srz.on_accept();
		    var chunk_dgram, ready=true;

		    
		    while (1){
			
			chunk_dgram=new DGM.datagram({type: 'srz', cmd: 'cnk', oid: oid});
			
			if(! srz.write_chunk(chunk_dgram) ){
			    //console.log("last chunk written");
			    delete dlg.serializers[oid];
			    break;
			}
			
			//console.log("DG3");			
			dlg.send(chunk_dgram, function(error){
			    if(error) throw "error send chunk " + error;

			    //console.log("DG4OK");
			    delete chunk_dgram;
			    // else
			    // 	console.log("chunk written ok");
			});
		    }	
		    
		}
		else{
		    console.log("dgram header status is not true " + dgram.header.error_message);
		    srz.on_error(dgram.header.error_message);
		}
	    }
	else
	    if(srcmd=='cnk'){ //data chunk
		var oid=dgram.header.oid;
		if(typeof oid=='undefined') throw "No serializer object id received!!";
		var srz=dlg.serializers[oid];
		//console.log("received chunk..");
		
		if(!srz.store_chunk(dgram)){
		    delete dlg.serializers[oid];
		}
		
	    }
		

    });
    
}

dialog.prototype.close=function(m){
    var hd={type: 'close'};
    if(typeof m=='undefined'){ hd.status=true; } else { hd.status=false; hd.error_message=m;} 
    this.send_datagram(hd,null,function(error){});
    if(typeof this.mgr!='undefined') 
	this.mgr.delete_dialog(this);
}


dialog.prototype.connect = function(result_cb){ //Initiate connexion. 
    var dlg=this;
    //console.log("DIALOG connect : header = ["+JSON.stringify(this.header)+"]");

    this.listen('hshk',function(dgram){
	if(!dgram.header.status){
	    dlg.log("handshake failed on peer : "+dgram.header.error_message);
	    result_cb(dgram.header.error_message);
	}else result_cb(null,dgram);
    });
    var init_head={type:'init'};
    for(var he in this.header) init_head[he]=this.header[he];
    this.send_datagram(init_head, null, function(error){
	if(error)
	    result_cb(error);
    });
    
}

dialog.prototype.read_chunk = function(dgram){

    //console.log("Dialog " + this.header.id + " reading chunk " + JSON.stringify(dgram.header));
    var dgr_type=dgram.header.type;
    
    if(typeof dgr_type=='undefined') 
	throw "Datagram type not given on header!";

    if(dgr_type=='srz') srz_setup(this);

    var listeners=this.listeners[dgr_type];
    if(typeof listeners=='undefined'){
	throw "No listener for " + dgr_type; 
    }
    
    for(var l=0;l<listeners.length;l++){
	this.listeners[dgr_type][l](dgram);
    }

    if(typeof dgram.header.close != 'undefined'){
	if (dgram.header.close == true){
	    if(typeof this.mgr!='undefined')
		this.mgr.delete_dialog(this);
	}
    }
}

dialog.prototype.send=function(dgr,status_func){
    dgr.header.id=this.header.id;
    dgr.send(this.cnx, status_func);
}


dialog.prototype.send_datagram=function(header, data, status_func){

    //for(var he in this.header) if(this.header.hasOwnProperty(he)) header[he]=this.header[he];
				  
    var dgr=new DGM.datagram(header, data);
    this.send(dgr,status_func);

    if(typeof dgr.header.close!= 'undefined')
	if(dgr.header.close==true){
	    if(typeof this.mgr!== 'undefined')
	    this.mgr.delete_dialog(this);
	}
}

//dialog.prototype.listeners=[];

dialog.prototype.listen=function(type, callback){
    if(typeof this.listeners=='undefined')this.listeners={};
    if(typeof this.listeners[type]=='undefined') this.listeners[type]=[];
    this.listeners[type].push(callback);
}


var dialog_manager = function(cnx, sad){
    this.dialogs={};
    this.cnx=cnx;
    this.sadira=sad;
}


dialog_manager.prototype.delete_dialogs=function(dlg){
    for (var d in this.dialogs){
	this.dialogs[d].send_datagram({type : "disconnect"});
	delete this.dialogs[d];
    }
}

dialog_manager.prototype.delete_dialog=function(dlg){
    
    
    console.log("!Delete dialog "+JSON.stringify(dlg.header));

    var d=this.dialogs[dlg.header.id];

    if(ù(d)) throw "No such dialog " + dlg.header.id ;
    
    d.send_datagram({type : "disconnect"});
    delete d;

    //var nd=0;for(var d in this.dialogs){ nd++; console.log("D"+nd+":"+JSON.stringify(this.dialogs[d].header));} 
}

dialog_manager.prototype.create_dialog=function(dlg_header){
    var dlg = new dialog(dlg_header,this);
    dlg.cnx=this.cnx;
    dlg.header.id=Math.random().toString(36).substring(2);
    this.dialogs[dlg.header.id]=dlg;
    //dlg.log("Created from manager");
    return dlg;
}


dialog_manager.prototype.process_datagram=function(dgram){
    
    var dmgr=this;
    var header=dgram.header;
    if(typeof header=='undefined') throw "datagram has no header!";
    
    var type=header.type;
    var dlgid=header.id;
    
    if(typeof type=='undefined')throw "No header type "; 
    if(typeof dlgid=='undefined') throw "No dialog ID in message header!";
	
    //console.log("DMGR received DGRAM type ["+type+"]for DLG["+dlgid+"]");
    //console.log("Header:" + JSON.stringify(header) );
    
    if(type=="init"){ // First chunk of a new dialog -> Initialization of a new dialog object

	var hshk_head={type:'hshk'};
	var dlg = new dialog(header,this);
	dlg.cnx=this.cnx;
	
	try{
	    var hndl_name=header.handler;
	    if(typeof hndl_name=='undefined')throw "No handler defined on init datagram "; 
	    
	    var hndl=eval("dmgr.sadira.dialog_handlers."+hndl_name+".__api");

	    if(ù(hndl))throw "No handler found for ["+hndl_name+"]"; 
	    
	    hndl(dlg, function(error, hhead, hdata){

		var hshk_data=null;

		if(typeof error!= 'undefined' && error!=null){ 

		    hshk_head.status=false;
		    hshk_head.close=true;
		    hshk_head.error_message=error;
		    //throw "Handshake error : " +error;
		    dlg.log("Eval handler [" + hndl_name + "] error : " + error);
	    
		}else{

		    hshk_head.status=true;
		    //dlg.log("Eval handler [" + hndl_name + "] OK ");

		    if(typeof hhead != 'undefined') for (var hh in hhead) hshk_head[hh]=hhead[hh];
		    if(typeof hdata != 'undefined') hshk_data=hdata;
		}
		
		dlg.send_datagram(hshk_head, hshk_data, function(error){

		    if(error){
			dlg.log("Error sending datagram : " + dump_error(error));
		    }else
			dmgr.dialogs[dlgid]=dlg; //Attaching the new dialog to the active hash 
		    
		} );
		
	    });
	}
	catch(e){
	    hshk_head.status=false;
	    hshk_head.close=true;
	    hshk_head.error_message=e+"";
	    dlg.log("Dialog failed " + dump_error(e));
	    dlg.send_datagram(hshk_head, null, function(error){} );
	    delete dlg;
	}

	return;
	    
    }

    var dlg=this.dialogs[dlgid]; 

    if(typeof dlg!='undefined'){ //Found the dialog
	if(type=="close"){ // force close of dialog)
	    if(!header.status) dlg.log("Closed by peer with error : " + header.error_message);
	    this.delete_dialog(dlg);
	}else
	    dlg.read_chunk(dgram); //Passing the handling of the datagram to it
    }else
	throw "Cannot find dialog with id " + dlgid;
    
    
}


function clear_events(tpl_item){
    if(è(tpl_item.event_callbacks)){

	for(var e in tpl_item.event_callbacks){
	    var cbs=tpl_item.event_callbacks[e];
	    for(var c=0;c>0&&c<cbs.length;c++){
		if(!cbs[c].persist){
		    //console.log("clearing event " + e + " : "  + c+ " L="+cbs.length);
		    cbs.splice(c,1); c--;
		    //console.log("cleared event " + e + " : "  + c + " L="+cbs.length);
		}
	    }
	}
    }
}

function new_event(tpl_item, event_name){

    if(typeof tpl_item.event_callbacks==='undefined'){
	tpl_item.event_callbacks=[];

	tpl_item.listen=function(event_name, cb, persist){
	    if(ù(persist)) persist=false;
	    var cbn=tpl_item.event_callbacks[event_name];
	    
	    if(cbn===undefined) {
		cbn=tpl_item.event_callbacks[event_name]=[]; //throw "No such event " + event_name ;
	    }
	    
	    for(var c=0;c<cbn.length;c++){
		if(cb===cbn[c]){
		    console.log("That function is already listenning to !" + event_name);
		    return undefined;
		}
	    };
	    cb.persist=persist;
	    cbn.push(cb);
	    if(tpl_item.name=="Parameters")
		console.log(tpl_item.name + " : new listener for ["+event_name+"] persist " + persist + " N= " + cbn.length);
	    return this;
	};

	tpl_item.unlisten=function(event_name, cb){
	    var cbn=tpl_item.event_callbacks[event_name];
	    if(typeof cbn=='undefined') 
		throw "unlisten: no such event " + event_name ;
	    for( var c=0;c<cbn.length;c++) {
		if(cbn[c]==cb){
		    //console.log("Found CB to be removed..");
		    cbn.splice(c,1);//remove(c);
		    return tpl_item;
		}
	    }
	    throw "unlisten: callback not found " ;
	    return undefined;
	}
	
	tpl_item.trigger=function(event_name, data,data2){
	    var cbs=tpl_item.event_callbacks[event_name];
	    if(typeof cbs=='undefined')
		cbs=tpl_item.event_callbacks[event_name]=[]; //throw "No such event " + event_name ;
		
	    // if(event_name=="data_loaded") 
	    // 	console.log(tpl_item.name + " : trigger event [" + event_name +"] to " + cbs.length +" listeners");
	    
	    cbs.forEach(function(cb){
		cb.call(tpl_item,data,data2);
	    });
	    return tpl_item;
	};

	tpl_item.has_event=function(event_name){
	    return è(tpl_item.event_callbacks[event_name]);
	}
    }
    
    
    if(tpl_item.event_callbacks[event_name]===undefined){
	tpl_item.event_callbacks[event_name]=[];
	
	// if(tpl_item.name=="Parameters"){
	//     //console.log("Creating callback for event ["+event_name+"] on " + tpl_item.name  );
	//     //for (var e in tpl_item.event_callbacks) console.log("     -->Event " + e + " NL=" + tpl_item.event_callbacks[e].length );
	// }

	
  }
    

}


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
	if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

if(nodejs){
    exports.dialog=dialog;
    exports.dialog_manager=dialog_manager;
    GLOBAL.new_event=new_event;
}
