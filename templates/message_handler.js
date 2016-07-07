({
    ui_opts:{
	root_classes:[ "container-fluid" ],
	child_classes:[ "form-group input-group" ] },
    elements:{
	btn:{ name:"Apply changes",
	      type:"action",
	      ui_opts:{ button_node:"span",
			item_classes:[ "btn btn-info " ],
			//fa_icon:"play",
			root_classes:[ "input-group-btn" ] } },
	status:{
	    //name:"status : ",
	    type:"string",
	    ui_opts:{ item_classes:[ "input-group-addon full" ],
		      text_node:"span",
		      label:true,
		      item_root:true
		    }
	}
    },
    key:"message_handler",
    
    widget_builder:function (ok, fail){
	
	
	var mhd=this;
	var btn=mhd.elements.btn;
	var status=mhd.elements.status;
	
	mhd.set_btn=function(title, icon){
	    if(typeof title ==="boolean"){
		btn.disable(!title); return mhd;
	    }
	    
	    if(è(icon))btn.ui_opts.fa_icon=icon;
	    if(è(title))btn.set_title(title); else btn.set_title("");
	    return mhd;
	}
	
	mhd.set_status=function(m){
	    //console.log("Set status : " + JSON.stringify(m) );
	    status.set_alert(m); return mhd;
	}
	
	mhd.start=function(dialog, dgm, pre_handler){
	    mhd.dgm=dgm;
	    console.log("MHD START btn = " + btn.name);
	    btn.disable(false);
	    btn.listen("click",function(){
		
		
		btn.disable();
		if(è(pre_handler))pre_handler();
		console.log("MHD CLICK " +JSON.stringify(mhd.dgm));
	    
		status.set_alert({ type :"info", content : "Sending datagram..."+JSON.stringify(mhd.dgm) + " dialog " + dialog});
		dialog.send_datagram(mhd.dgm,null,function(error){
		    if(error){
			status.set_alert({ type:"error", content : error});
			btn.disable(false);
		    }else
			status.set_alert({ type :"info", content : "datagaram sent..."});
		});
	    });
	};

	ok();
    }
})
