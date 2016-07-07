({
  ui_opts:{ label:true },
  name:"Sky coordinates",
  type:"labelled_vector",
  value_labels:[ "Ra",
		 "Dec" ],
  value:[ 0,
	  0 ],
  key:"sky_coords",
  widget_builder:function (ok, fail){
    ok();
  }
})
