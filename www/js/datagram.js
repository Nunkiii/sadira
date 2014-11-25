è=function(x){ return ((typeof x !== 'undefined') && x!==null);}
ù=function(x){ return (typeof x === 'undefined');}

var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

if(nodejs){
    var bson = require("./community/bson");
    var srz=require("./serializer");
    GLOBAL.è=è;
    GLOBAL.ù=ù;
}else{

    /*
      memcpy equivalent for ArrayBuffers.
      
    */
    function memcpy(dst, src, dstOffset,  srcOffset, length) {
	var dstU8 = new Uint8Array(dst, dstOffset, length);
	var srcU8 = new Uint8Array(src, srcOffset, length);
	dstU8.set(srcU8);
    };
    /*
    function memcpy(aTarget, aSource, aTargetOffset, aSourceOffset, aLength) {
	
	aTargetOffset = typeof aTargetOffset === 'undefined' ? 0 : aTargetOffset;
	aSourceOffset = typeof aSourceOffset === 'undefined' ? 0 : aSourceOffset;
	aLength = typeof aLength === 'undefined' ? aSource.byteLength : aLength;
	
	//console.log('Copy at offset ' + aTargetOffset);
	
	var view = new Uint8Array(aTarget, aTargetOffset);
	view.set(new Uint8Array(aSource, aSourceOffset, aLength));
    }*/
}

var BSON=bson().BSON;


var datagram=function (header, data){
    this.data=null;
    this.header=null;
    if(typeof header != 'undefined')this.set_header(header);
    if(typeof data != 'undefined')this.set_data(data);
}


datagram.prototype.set_header = function(header){
    this.header=header;
}

datagram.prototype.set_data = function(data){
    this.data=data;
}

datagram.prototype.data_size = function(){
    if(this.data==null) return 0;
    return nodejs ? this.data.length : this.data.byteLength;
}

datagram.prototype.size = function(){
    if(this.buffer==null) return 0;
    return nodejs ? this.buffer.length : this.buffer.byteLength;
}


if(nodejs){
    datagram.prototype.send = function(cnx, status_cb){
	
	try{
	    
	    if(this.buffer==null){

		this.serialize();
	    }
	    
	    //console.log('DGRAM: sending data : nbytes= ' + this.size() + " data payload : " + this.data_size());
	    cnx.sendBytes( this.buffer);
	    //console.log("SOK");
	    if(typeof status_cb!=='undefined')
		status_cb(null);
	}
	catch (e){
	    if(typeof status_cb!=='undefined')
		status_cb(e);
	    else
		console.log("send exception " + e);
	}
    }
}
else{
    datagram.prototype.send = function(cnx, status_cb){
	try{
	    if(cnx.readyState!=1){
		throw "Cannot send message : socket is disconnected !";
	    }
	    if(this.buffer==null)
		this.serialize();
	    //console.log('DGRAM: sending data : nbytes= ' + this.size() + " data payload : " + this.data_size());
	    cnx.send(this.buffer);
	    if(typeof status_cb!=='undefined')
		status_cb(null);
	}
	catch (e){
	    if(typeof status_cb!=='undefined')
		status_cb(e);
	    else
		console.log("send exception " + e);

	}
    }
}

datagram.prototype.serialize = function(){ 

    var sz_header, sz_data, sz_total, sz_skip=12, pad_header=0, pad_data=0, data_start;
    
    /* 
       Padding is still neeeded to align the two internal buffers (header and data) on 32 bits boundaries (-> "bug" of javascript ArrayBuffer !)    

       Byte data format of a message datagram : 
       
       Number of bytes : [    4         4         4      sz_header    pad_header     sz_data      pad_data ]
       Content         : [sz_header data_start sz_data {header data} {header pad} {data payload} {data pad}]

    */

    if(this.header == null){
	throw "cannot serialize datagram : header is null";
    }

    if(this.data == null) sz_data=0; else {
	sz_data=this.data_size(); //data.length;
	pad_data=4-sz_data%4;

	//console.log("datagram data size " + sz_data + " padding " + pad_data);
    }


    var bson_header=BSON.serialize(this.header, false, true, false);



    //console.log('append object size=' + bso.byteLength);
    
    sz_header=nodejs? bson_header.length : bson_header.byteLength;
    pad_header=4-sz_header%4;
    //2 integers at beginning : sz_header, sz_data followed by header data then binary data (as an ArrayBuffer)

    pad_header=0;
    pad_data=0;

    data_start=sz_skip+sz_header+pad_header;
    sz_total=sz_header+sz_data+sz_skip+pad_header+pad_data; 
    
    //console.log("WRITE sz_header "+ sz_header + " data start = " + data_start + " datasize "+ sz_data + " totalbytes=" + sz_total );

    if( nodejs){
	this.buffer= new Buffer(sz_total) 
	
	this.buffer.writeInt32LE(sz_header, 0);
	this.buffer.writeInt32LE(data_start, 4);
	this.buffer.writeInt32LE(sz_data, 8);
	
	bson_header.copy(this.buffer, 12, 0, sz_header);

	
	if(this.data!=null){
	    //if(typeof this.data == 'Buffer')
	    this.data.copy(this.buffer, data_start);
	    // else
	    // 	memcpy(this.buffer, this.data, data_start);
	}

    }else{

	this.buffer=  new ArrayBuffer(sz_total);
	var ints= new Uint32Array(this.buffer, 0, 3); 

	ints[0]=sz_header;
	ints[1]=data_start;
	ints[2]=sz_data;
	
	//function memcpy(aTarget, aSource, aTargetOffset, aSourceOffset, aLength) {
	memcpy(this.buffer, bson_header, 12, 0, sz_header);
	
	/*
	console.log("Testing BSON header is ["+JSON.stringify(this.header)+"]");
	var testb=new ArrayBuffer(sz_header);
	memcpy(testb, this.buffer, 0, 12, sz_header);
	var bsdata = new Uint8Array(testb, 0, sz_header);
	console.log("Deserialize BSON ...");
	var hdr=BSON.deserialize(bsdata); 
	console.log("CHECK BSON " + JSON.stringify(hdr)) ;
	*/

	if(this.data!=null)
	    memcpy(this.buffer, this.data, data_start);

    }


    //done serializing the message datagram

    //console.log('DGRAM: done serialize : nbytes= ' + this.size() + " data payload : " + this.data_size());
    //console.log('DGRAM serialized header : ' + JSON.stringify(this.header));
}

datagram.prototype.deserialize = function(buffer){

    var sz_header, sz_data, data_start;
    var bson_header;

    if(nodejs){
	sz_header = buffer.readInt32LE(0);
	data_start = buffer.readInt32LE(4);
	sz_data = buffer.readInt32LE(8);
	bson_header=new Buffer(sz_header);
	this.data=new Buffer(sz_data);
	
	buffer.copy(bson_header,0,12,sz_header+12);
	buffer.copy(this.data,0,data_start,data_start+sz_data);
    }else{
	var ints = new Uint32Array(buffer, 0, 3);
	sz_header = ints[0];
	data_start= ints[1]; 
	sz_data = ints[2];
	//bson_header=new ArrayBuffer(sz_header);
	this.data=new ArrayBuffer(sz_data);
	
	//function memcpy(aTarget, aSource, aTargetOffset, aSourceOffset, aLength) {
	//console.log("Readiing BSON header("+sz_header+") check "+(sz_header+12+sz_data) + " == " + buffer.byteLength);
	
	//memcpy(bson_header,this.buffer,0, 12, sz_header );

	bson_header = new Uint8Array(buffer,12, sz_header );
	//bson_header = new Uint8Array(sz_header);
	//bson_header.set(buffer,12);
	
	//console.log("BSHL = " + bson_header.length + " BL " + bson_header.byteLength);
	memcpy(this.data,buffer, 0, data_start, sz_data);
	
    }

    //console.log('DGRAM: deserialize binary data done : nbytes= ' + this.size() + " data payload : " + this.data_size());
    //now finally restoring header JS.
    //console.log("DGRAM BSON deserialize header...");
    this.header=BSON.deserialize(bson_header);
    //console.log('DGRAM deserialize header : ' + JSON.stringify(this.header));

}

datagram.prototype.get_configuration = function() {
    if(this.header==null) throw "No header set !";
    if(this.header.cfg=='undefined') throw "No config set !";
    
    return this.header.cfg;
};

datagram.prototype.set_configuration = function(cfg) {
};

if(nodejs){
    exports.datagram=datagram;
}
