({ name:"Tbase",
  elements:{ toto:{ name:"Xbase1",
      type:"string",
      value:"Toto" },
    toto2:{ name:"Xbase2",
      type:"color",
      value:"#1213aa" } },
  ui_opts:{ fa_icon:"cogs",
    root_classes:[ "container-fluid" ] },
  widget_builder:function (){
	    sspec.debug("Base constructor !");
	},
  key:"tbase" })