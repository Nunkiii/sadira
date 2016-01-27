({
    key:"button",
    ui_opts:{
	root_node: "button",
	type: "default"
    },
    widget_builder:function (ok, fail){
	var b=this;
	new_event(this,'click');
	var but=this.but=this.ui_root; //ce('button');
	var opts=this.ui_opts;
	but.setAttribute('type', 'button');

	var type='';
	
	if(opts.type!==undefined) type='btn-'+opts.type+(opts.outline===true?'-outline':'');
	if(opts.size!==undefined) type+='btn-'+opts.size;
	
	but.add_class('btn '+type);
	    
	if(opts.name!==undefined)
	    but.innerHTML=opts.name;
	
	if(opts.fa_icon!==undefined)
	    but.innerHTML= '<i class="fa fa-'+opts.fa_icon + '"></i> '+but.innerHTML;
	    
	but.addEventListener('click',function(){b.trigger('click'); });
	ok();
    }

})
