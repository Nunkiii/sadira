({
  widget_builder:function (ok, fail){
    var tpl_item=this;
    var ui_opts=this.ui_opts===undefined?{}:this.ui_opts;
    var ui=ce("div");
    ui_opts.type=ui_opts.type ? ui_opts.type : "short";
    
	    //ui.className="html_content";
    
    tpl_item.set_value=function(nv){
      if(typeof nv !='undefined')
		    tpl_item.value=nv;

		
		//if(tpl_item.item_ui !== undefined) ui=tpl_item.item_ui; else return;
		
		ui.innerHTML=tpl_item.value;
		if(è(ui_opts.highlight_source))
		    if(ui_opts.highlight_source) hljs.highlightBlock(ui);
	    }
	    
	    
	    
	    if(ui_opts.type==="edit"){
		ui.setAttribute("contentEditable", true);
		//tpl_item.set_value("<pre><code>"+tpl_item.value+"</code></pre>");
	    }
	    
	    if(tpl_item.url){
		download_url(tpl_item.url,function(error, html_content){
		    if(error){
			tpl_item.debug("Error downloading html content : "  + error);
		    }else{
			tpl_item.set_value(html_content);
		    }
		});
	    }else
		tpl_item.set_value();
	    
  ok(ui);
	},
  key:"html" })
