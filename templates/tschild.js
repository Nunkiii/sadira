({ name:"Child of child",
  ui_opts:{ fa_icon:"leaf" },
  type:"tchild",
  elements:{ subtotochild:{ name:"XSubchild",
      type:"string",
      value:"Toto3" },
    act:{ name:"Change lv",
      type:"action",
      ui_opts:{ item_classes:[ "btn btn-xs btn-warning" ] },
      widget_builder:function (ui_opts, act){
		    act.listen('click', function(){ this.lv.set_value([7,8,9,10,11]) });
		} } },
  widget_builder:function (ui_opts, sspec){
	    sspec.debug("Sub-Child constructor !");
	    sspec.get('act').lv=sspec.get('lv');
	},
  key:"tschild" })