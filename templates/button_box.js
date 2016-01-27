({ ui_opts:{ button_size:undefined },
  widget_builder:function (){
	    var div=this.ui_root;
	    div.add_class("btn-group");
	    if(this.ui_opts.button_size !== undefined) div.className+='btn-group-'+this.ui_opts.button_size;
	    div.setAttribute('role','group');
	    
	    this.add_button=function(but){
		div.appendChild(but.ui_root);
		return this;
	    }
	},
  key:"button_box" })