({ name:"LV TEST",
  elements:{ lv:{ name:"LabVec Test : ",
      type:"labelled_vector",
      ui_opts:{ editable:true,
        label:true },
      label_prefix:"X" } },
  widget_builder:function (uio, lvt){
	    var lv=lvt.get('lv');
	    lv.listen('change', function(){
		lvt.debug("LV changed : " + JSON.stringify(this.value));
	    });

	    lv.set_value([3,4,5]);
	},
  key:"lvtest" })