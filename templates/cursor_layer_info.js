({ name:"Cursor Layer Info",
  ui_opts:{ root_classes:[ "col-xs-12 col-md-6 " ],
    name_classes:[  ],
    child_classes:[ "inline" ],
    label:true },
  elements:{ imgpos:{ type:"labelled_vector",
      name:"",
      value_labels:[ "P<sub>X</sub>",
        "P<sub>Y</sub>" ],
      value:[ 0,
        0 ],
      ui_opts:{ child_classes:[ "inline" ] } },
    pixval:{ name:"I",
      type:"double",
      ui_opts:{ label:true,
        item_classes:[ "inline" ] } } },
  key:"cursor_layer_info",
   widget_builder:function (ok, fail){
       var cli=this;
      //console.log("Building cursor info ....");
      var pxv=cli.elements.pixval;
    var cmdiv=cli.cmdiv=cc("div", pxv.ui_root); cmdiv.className="colormap";
      cmdiv.style.width="100%";
       cmdiv.style.minHeight=".5em";
       ok();
       
      
} })
