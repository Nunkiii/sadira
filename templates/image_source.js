({ subtitle:"Select a FITS image file on your local filesystem",
  name:"FITS file",
  type:"local_file",
  ui_opts:{ label:true,
    editable:false,
    sliding:false,
    slided:false,
    type:"edit",
    root_classes:[ "col-md-5" ],
    child_classes:[ "row" ] },
  key:"image_source",
  widget_builder:function (ok, fail){ ok(); } })