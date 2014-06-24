var nodejs=false;
if (typeof module !== 'undefined' && module.exports) nodejs=true; //Checking if we are in Node

var SRZ_MEM_SIZE_MAX=67108864; // 64Mb 16777216; //16Mb
var SRZ_MEM_CHUNK_SIZE=1024; //1kb

var srz_base=function(){}

if(nodejs)
    srz_base.prototype.size=function(dgram){
	return (this.data==null)? 0:this.data.length;
    };
else
    srz_base.prototype.size=function(dgram){
	return  (this.data==null)? 0:this.data.byteLength;
    };

srz_base.prototype.on_accept=function(){}
srz_base.prototype.on_done=function(){}
srz_base.prototype.on_chunk=function(dgram){}
srz_base.prototype.on_error=function(error){}

srz_base.prototype.log=function(m){console.log("SRZ["+this.oid +"]:"+m);}

var srz_mem=function(buf){
    if(typeof buf != 'undefined'){
	this.initialize(buf);
    }
    else
	this.data=null;
}

srz_mem.prototype=new srz_base;
srz_mem.prototype.constructor=srz_mem;

srz_mem.prototype.initialize=function(buf, chunk_size){
    this.data=buf;
    this.cnkid=0;
    var sz_data= this.size();
//  console.log("INIT sz= " + sz_data + " max " + SRZ_MEM_SIZE_MAX); 
    if(typeof sz_data=='undefined') throw "Cannot find sz_data in srz_mem serializer config!";
  
    if(sz_data>SRZ_MEM_SIZE_MAX) throw "Object size too large : " + sz_data + " > " +  SRZ_MEM_SIZE_MAX;
    this.sz_data=sz_data;
    this.chunk_size= typeof chunk_size == 'undefined' ? SRZ_MEM_CHUNK_SIZE : chunk_size;
    this.log("srz_mem ready: bytes " + this.sz_data + " chunk size " + this.chunk_size  );
}

srz_mem.prototype.store_chunk=function(dgram){
    var wpos=dgram.header.cnkid*this.chunk_size;
    
    nodejs? dgram.data.copy(this.data, wpos) :
	memcpy(this.data, dgram.data, wpos, 0, dgram.data.byteLength);
    
    //this.log("store @" + wpos + "/" + this.sz_data, " total written = " + (wpos+dgram.data_size()));
    
    if(wpos+dgram.data_size()==this.sz_data){
	this.on_done();
	return false;
    }

    this.on_chunk(dgram);
    return true;
};

srz_mem.prototype.write_chunk=function(dgram){

    dgram.header.cnkid=this.cnkid;
    var pos=this.cnkid*this.chunk_size;
    if(pos>=this.sz_data){
	this.on_done();
	return false;
    }

    //var v=0;for(var i=0;i<1000000;i++)v+=i;

    var sz_buf = pos< this.sz_data-this.chunk_size ? this.chunk_size : this.sz_data-pos;
    
    //this.log("write @"+pos+"/"+this.sz_data+", bufsize= " + sz_buf);
    dgram.data= this.data.slice(pos,pos+sz_buf); // new Buffer(sz_buf); this.data.copy(buf,0,pos,pos+sz_buf);
    this.on_chunk(dgram);
    this.cnkid++;
    //this.log("write @"+pos+", bufsize= " + sz_buf + " OK!");
    //console.log("slice done datagram datalength : " + dgram.data_size());
    return true;
}

if(nodejs){
    exports.srz_mem=srz_mem;
    //srz_gridfs=srz_gridfs; 
}
