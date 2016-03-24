({ ui_opts:{ root_classes:[ "media" ],
    child_view_type:"root" },
  elements:{ left:{ ui_opts:{ root_classes:[ "media-left" ],
        child_view_type:"root" } },
    content:{ ui_opts:{ root_classes:[ "media-content" ],
        child_view_type:"root" } } },
  key:"media",
  widget_builder:function (ok, fail){ ok(); } })