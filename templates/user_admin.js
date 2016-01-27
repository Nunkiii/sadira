({ name:"User administration",
  ui_opts:{ fa_icon:"user",
    root_classes:[ "container-fluid" ] },
  elements:{ browse:{ name:"User list",
      type:"db_browser",
      ui_opts:{ collection:"Users" } } },
  key:"user_admin" })