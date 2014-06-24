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

var dialog = function (header, mgr){

    this.header=null;

    if(typeof header != 'undefined')this.set_header(header);
    if(typeof mgr != 'undefined')this.mgr=mgr;

    console.log("creating dialog " + JSON.stringify(header));
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
    for(var s in this.serializers){this.log("srz list after add: "+JSON.stringify(this.serializers[s].oid)); }
}


dialog.prototype.get_serializer=function(oid){
    for(var s in this.serializers){console.log("srz ID : "+this.serializers[s].oid); }
    return this.serializers[oid];
}


dialog.prototype.srz_request=function(dgram, result_cb){
    console.log("NO SERIALIZATION SETUP ON THIS DIALOG!");
    result_cb("No serialization setup");
}


dialog.prototype.srz_initiate=function(srz, status_cb){
    console.log("Z");
    srz.oid=Math.random().toString(36).substring(2);
    console.log("Z");
    srz_setup(this);
    console.log("Z");
    this.serializers[srz.oid]=srz;
    console.log("Z");
    var srz_head={type: 'srz', cmd: 'req', oid: srz.oid, sz : srz.size() };
    console.log("Z");
    if(typeof srz.header!='undefined')
	for(var h in srz.header) srz_head[h]=srz.header[h];
    console.log("Z");
    this.send_datagram(srz_head,null,function(error){
	    console.log("Zweeee  " + error);
    });
        console.log("Z");
}

srz_setup=function(dlg){
    if(typeof dlg.serializers!='undefined') return;
//    var dlg=this;

    dlg.serializers={};
    dlg.log("srz setup !");

    dlg.listen('srz', function(dgram){

	var srcmd=dgram.header.cmd;

	if(srcmd=='req'){

	    var status_head={type: 'srz', cmd: 'req_reply'};

	    try{
		
		var oid=dgram.header.oid; 
		if(typeof oid=='undefined') 
		    throw "No serializer oid received!!";
		status_head.oid=oid;
		
		console.log("SRZ request ID=" + oid );
		
		dlg.srz_request(dgram, function(error, srz){
		    console.log("Ok here...");
		    
		    if(error!=null){ 
			status_head.status=false; status_head.error_message= error;
		    }
		    else{
			console.log("Ok got serializer...");
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
		console.log("request reply !");
		var oid=dgram.header.oid;
		if(typeof oid=='undefined') throw "No serializer oid received!!";
		
		var srz=dlg.get_serializer(oid);
		
		if(dgram.header.status==true){
		    
		    srz.on_accept();
		    var chunk_dgram, ready=true;

		    while (1){
			//console.log("DG");
			chunk_dgram=new DGM.datagram({type: 'srz', cmd: 'cnk', oid: oid});
			//console.log("DG2");
			if(! srz.write_chunk(chunk_dgram) ){
			    console.log("last chunk written");
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
		else
		    srz.on_error(dgram.header.error_message);
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


dialog.prototype.connect = function(result_cb){ //Initiate connexion. In result will be given the dialog object.
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
	    if(typeof this.mgr!= 'undefined')
	    this.mgr.delete_dialog(this);
	}
}

//dialog.prototype.listeners=[];

dialog.prototype.listen=function(type, callback){
    if(typeof this.listeners=='undefined')this.listeners={};
    if(typeof this.listeners[type]=='undefined') this.listeners[type]=[];
    this.listeners[type].push(callback);
}


var dialog_manager = function(cnx){
    this.dialogs={};
    this.cnx=cnx;
}


dialog_manager.prototype.delete_dialog=function(dlg){
    
    
    //console.log("!D[]"+JSON.stringify(dlg.header)+", remains :\n");

    delete this.dialogs[dlg.header.id];

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
    var dlg,header=dgram.header;
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
	    var hndl=eval('dialog_handlers.'+hndl_name);
	    
	    if(typeof hndl=='undefined')throw "No handler found for init datagram handler ["+hndl_name+"]"; 
	    
	    
	    
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
		    dlg.log("Eval handler [" + hndl_name + "] OK ");
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
	    dlg.log("Init exception " + dump_error(e));
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

if(nodejs){
    exports.dialog=dialog;
    exports.dialog_manager=dialog_manager;
}