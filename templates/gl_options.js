({ name:"Viewer options",
  ui_opts:{ root_classes:[ "col-md-12" ],
    child_view_type:"div",
    render_name:true,
    subtitle:"Set display options",
    child_classes:[ "container-fluid form form-horizontal" ] },
  elements:{ image_axes:{ name:"Show image axes",
      type:"bool",
      default_value:false,
      ui_opts:{ type:"edit",
        label:true,
        root_classes:[ "form-group" ] } },
    x_plot:{ name:"Show X plot",
      type:"bool",
      default_value:false,
      ui_opts:{ type:"edit",
        label:true,
        root_classes:[  ] } },
    y_plot:{ name:"Show Y plot",
      type:"bool",
      default_value:false,
      ui_opts:{ type:"edit",
        label:true,
        root_classes:[  ] } },
    interp_cmap:{ name:"Interpolate colormap",
      type:"bool",
      default_value:true,
      ui_opts:{ type:"edit",
        label:true,
        root_classes:[  ] } } },
  key:"gl_options",
  widget_builder:function (ok, fail){ ok(); } })