({ name:"Widget test",
  subtitle:"Sadira toolkit widget sandbox",
  intro:"<p>Write a custom widget by writing its template JavaScript code.</p>",
  ui_opts:{ intro_stick:true,
    root_classes:[ "container-fluid" ] },
  elements:{ source:{ ui_opts:{ root_classes:[ "col-md-6 col-sm-12" ] },
      elements:{ template:{ name:"Template code",
          intro:"Edit your widget's source code",
          type:"code",
          default_value:"(function(){\nreturn {\n\tname : \"Hello\",\n\tsubtitle : \"Hello Sadira/Tk!\",\n\t elements : {\n\t\tbtn : {\n\t\t\ttype : \"action\",\n\t\t\tname : \"Click me !\"\n\t\t},\n\t\ttext : {\n\t\t\tname : \"Result :\",\n\t\t\t type : \"string\"\n\t\t}\n\n} }})(); ",
          ui_opts:{ intro_stick:true,
            save:"sandbox_code",
            root_classes:[ "container-fluid" ] },
          elements:{ widget:{ name:"Choose an existing widget to start with :",
              ui_opts:{ type:"edit",
                label:true,
                in_root:"prepend",
                root_classes:[ "container-fluid" ],
                child_classes:[ "form-group input-group" ] },
              elements:{ tlist:{ type:"template_list",
				 ui_opts:{
				     type:"edit",
				     item_classes:[  ],
				     //text_node:"span",
				     //label:true,
				     //item_root:true
				 } },
			 tpl_set:{ type:"action",
				   name:"Set template in editor",
				   ui_opts:{ button_node:"span",
					     item_classes:[ "btn btn-info " ],
                    fa_icon:"play",
                    root_classes:[ "input-group-btn" ] } } } } } } } },
    compile:{ ui_opts:{ root_classes:[ "col-md-6 col-sm-12" ],
        child_classes:[ "container-fluid" ] },
      elements:{ status:{ ui_opts:{ root_classes:[ "well" ] },
          type:"string",
          name:"JS compile",
          elements:{ build:{ type:"button",
              ui_opts:{ type:[ "primary" ],
                name:"Compile and create widget",
                fa_icon:"cogs" } } } },
        view:{ name:"Your widget",
          ui_opts:{ child_classes:[ "container-fluid panel panel-default" ] } } } } },
  widget_builder:function (ok, fail){
	    var demo=this;
	    var template=demo.get("template");
	    //var builder=demo.get("builder");
	    var build=demo.get("build");
	    var status=demo.get("status");
	    //var build_status=demo.get("build_status");
	    var view=demo.get("view");
	    
	    var tpl_select=demo.get("tlist");
	    var tpl_set=demo.get("tpl_set");
	    
	    view.set_title("No widget to show");
	    
	    tpl_set.listen("click", function(){
		var tpl_name=tpl_select.value;
		this.parent.message("Applying template  " + tpl_name);
		var template_source=tmaster.get_master_template(tpl_name);
		if(template_source !== undefined){
		    var template_string=template_source.toSource();
		    template.set_value(template_string);
		}
	    });
	    
	    function clear_widget(w){
		if(è(w)) demo.update_child(w, "view");
		    
	    }
	    
	    build.listen("click",function(){
		
		try{
		    var template_code_string=template.ace_editor.getValue();
		    status.message(template_code_string,{ type : "info", title : "Compiling " });

		    var template_code=eval(template_code_string);
		    status.message(JSON.stringify(template_code),{ type : "success", title : "JS code compiled "});
		    tmaster.set_template("hello", template_code);
		    create_widget("hello").then(function(w){
			clear_widget(w);
		    }).catch(function(e){
			status.message("<pre>" + dump_error(e)+"</pre>", { type : 'danger', title : "Create widget : "+ e.message});
		    });
		    //status.set_alert({ type : "success", content : "Widget created"});
		}
		catch(e){
		    status.message("<pre>" + dump_error(e)+"</pre>", { type : 'danger', title : "Error compiling JS for template : "+ e.message});
		    //status.set_alert({type: "error", content });
		}

	    });
      ok();
      
	},
  key:"ui_demo" })
