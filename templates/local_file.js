({ name:"Select a file",
  ui_opts:{ fa_icon:"file" },
  widget_builder:function (ui_opts, tpl_item){
	    new_event(tpl_item, 'changed');
	    var sp=ce("span");
	    sp.className="btn btn-default btn-file";
	    var uitext=cc("div",sp);
	    uitext.innerHTML="Browse...";
	    var ui=tpl_item.ui_input=cc("input",sp); 
	    //ui.className="local_file";
	    ui.type="file";
	    
	    ui.addEventListener("change",function(evt){
		tpl_item.value=evt.target.files[0];
		tpl_item.size=evt.target.files[0].size;
		uitext.innerHTML=evt.target.files[0].name;
		tpl_item.trigger('change', evt);
	    });
	    
	    return sp;
	},
  key:"local_file" })