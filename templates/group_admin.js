({ name:"Group administration",
  ui_opts:{ fa_icon:"group",
    root_classes:[ "container-fluid" ] },
  elements:{ browse:{ name:"Group list",
      type:"db_browser",
      ui_opts:{ collection:"Groups" } } },
  key:"group_admin" })