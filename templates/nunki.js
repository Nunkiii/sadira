({
  name:"Nunki",
    subtitle:"Mobile robotic observatory",
    elements:{
	tab_main : {
	    ui_opts:{
		//root:true,
		child_view_type:"tabbed",
		//child_classes:[ "row" ],
		//root_classes:[ "container-fluid" ],
		//name_node:"h2",
		//tabs_on_name:true
	    },
	    
	    elements : {
		sbig:{
		    type:"sbig_control"
		},
		mount:{
		    type:"mount_control"
		},
		filter_wheel:{
		    name:"Filter wheel",
		    ui_opts:{
			root_classes:[ "container-fluid" ],
			name_node:"h2",
			icon:"/icons/nunki/wheel.svg"
		    }
		}
	    }
	}
    },
    key:"nunki",
    widget_builder:function (ok, fail){

    var nunki=this;
    //console.log("NUNKI Build....");

    var sbig=nunki.elements.sbig;

    ok();
    
    //var lognav=nunki.toolbar.create_navbar("navbar-right");

  /*
  var logw=create_widget("login");
  logw.ui_name.add_class("navbar-link inline");
  logw.ui_root.add_class("inline");
    nunki.toolbar.unav.appendChild(logw.ui_root);
    */
    
  //var browser = nunki.elements.db.elements.browser;
  //browser.glm=glm;
    
} })
