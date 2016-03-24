({ key:"status",
  widget_builder:function (ok, fail){
    var tpl_item=this;
    var ui=tpl_item.ui=ce("span");ui.add_class("status");
    var flag=cc("span",ui);flag.add_class("flag");
    var txt=cc("span",ui); 

    tpl_item.set_value=function(nv){
	if(typeof nv !='undefined')
	    tpl_item.value=nv; 
	else nv=tpl_item.value;
	
	if(tpl_item.value_labels[nv]!='undefined')
	    txt.innerHTML=tpl_item.value_labels[nv];
	else
	    txt.innerHTML="unknown";
	flag.style.backgroundColor=tpl_item.value;
    }
      tpl_item.set_value();
      ok(ui);
} })
