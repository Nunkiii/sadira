({
    name : "Templates;",
    key:"template_list",
    type : "dropdown",
    widget_builder:function (ok, fail){
	var combo=this;
	combo.items=[];
	for(var tn in tmaster.templates){
	    var t=tmaster.templates[tn];
	    var label="";
	    
	    /*
	      var ico=get_ico_string(t);
	      if(è(ico))
	      label+=ico;
	      else
	      if(è(t.ui_opts) && è(t.ui_opts.fa_icon))
	      label+='<span class="fa fa-'+t.ui_opts.fa_icon+'"> </span>';
	    */
	    label+="<span>"+ (è(t.name) ? ("["+tn+"]"+t.name ): tn)+"</span>";
	    combo.items.push({value: tn,label : label});
	    
	    
	}
    combo.setup_list();
    ok();
	//return template_ui_builders.combo(ui_opts, combo);
    }
})
