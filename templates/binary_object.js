({ name:"Binary object",
  elements:{ size:{ ui_opts:{ label:true },
      name:"Size",
      type:"bytesize",
      value:0 } },
  key:"binary_object",
  widget_builder:function (ok, fail){ ok(); } })