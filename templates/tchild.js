({ name:"Tchild",
  type:"tbase",
  elements:{ lv:{ name:"lvtest",
      type:"labelled_vector",
      label_prefix:"P",
      ui_opts:{} } },
  widget_builder:function (){
	    sspec.debug("Child constructor !");
	    sspec.set('lv', [1,2,3,4,5]);
	},
  key:"tchild" })