var SRZ=require('../html/js/serializer.js');

dialog_handlers.sadira = {
    session : {
	get_gui : function (dlg, status_cb){
	    
	    dlg.log("In handler!!");

	    status_cb();
	    console.log("Sending widget config ");
	    
	    dlg.send_datagram({ type: "page_widget", widget_name : "main_widget"}, null, function(error){
		if(error) dump_error(error);
	    });

	    
	    dlg.srz_request=function(dgram, result_cb){
		
		dlg.log("Redefining srz_request");

		var sz=dgram.header.sz;
		var b=new Buffer(sz);
		var sr=new SRZ.srz_mem(b);
	
		sr.on_done=function(){
		    console.log("OK, received nbytes=" +sr.data.length);
		    var s=0;
		    for(var i=0;i<1000;i++)
			s+=sr.data.readFloatLE(4*i);
		    console.log("TESTSUM="+s);

		    
		    var srep=new SRZ.srz_mem(sr.data);
		    
		    srep.on_done=function(){
			console.log("Reply  finished!");
			dlg.close();
		    };
		    
		    dlg.srz_initiate(srep, function(error){
			
		    });

		}

		result_cb(null, sr);
	    }
	    
	    
	    
	    //reply( "page_widget", { widget_name : "restricted" } );
	}
    }
}
