({ key:"url",
   widget_builder:function (ok, fail){
       
      var url=this;
      
      //console.log("building URL " + url.name + " : " + url.value);
      var ui;
      var ui_opts=url.ui_opts;
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
    switch (ui_opts.type){

    case "short":
	ui=url.ui=ce("a");
	//ui.className="value";
	url.set_value=function(nv){
	    if(typeof nv !='undefined')
		url.value=nv;
	    if(typeof url.value !=='undefined'){
		ui.href=url.value;
		ui.innerHTML="<span class='fa fa-external-link'> </span>" + url.value;
	    }
	}
	break;
    case "edit": 

	if(url.download){

	    var download_type = è(url.download_type) ? url.download_type : "text";
	    
	    var edit_tpl={ 
		elements : {
		    url : { type : "string", name : "URL", default_value : "http://", ui_opts: {type : "edit"}},
		    //nbytes : { type : "mem", name : "Received " },
		    download : { type : "action", name : "Download"}
		}
	    };
	    
	    
	    create_ui({},edit_tpl);
	    
	    var url_str=edit_tpl.elements.url;

	    url_str.ui.type="url";
	    
	    ui=url.ui=edit_tpl.ui_root;
	    
	    url.set_value=function(nv){
		url_str.set_value(nv);
	    }
	    url.set_default_value=function(){
		url_str.set_default_value();
	    }

	    new_event(url,"download_ready");
	    new_event(url,"download_error");

	    var download=edit_tpl.elements.download;
	    var dmon=new proc_monitor();
	    edit_tpl.ui_root.appendChild(dmon.ui);
	    
	    download.listen("click", function(){
		dmon.wait("Starting download...");
		

		function download_complete(error, data){
		    if(error!=null){
			dmon.error(error);
			url.trigger("download_error", error);
		    }else{
			dmon.done("complete L=" + data.length);
			url.trigger("download_ready", data);
		    }
		};

		var q=edit_tpl.elements.url.value;
		var opts={ 
		    progress : function(evt) { //evt.total ? -> add Content-Length header server-side!!
			dmon.message(format_byte_number(evt.loaded) + " received");
		    } 
		};
		
		switch(download_type){
		case "text":
		    xhr_query(q, download_complete,opts);
		    break;
		case "json":
		    json_query(q, download_complete,opts);
		    break;
		case "bson":
		    bson_query(q, download_complete,opts);
		    break;
		case "binary":
		    opts.type="arraybuffer";
		    xhr_query(q, download_complete, opts);
		    break;
		default:
		    break;

		};
	    });
	    
	}else{
	    ui=url.ui=ce("input");
	    ui.type="url";
	    ui.className="form-control";
	}
	
	break;
    default: 
	throw "Unknown UI type ";
    }

    config_common_input(url);

    
       ok(url.ui);
} })
