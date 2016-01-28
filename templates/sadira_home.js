({
    key:"sadira_home",
    subtitle:"INAF/IASF-Bologna — <i>Astro-web-software </i>",
    name:"Sadira",
    type:"html",
    url:"/welcome.html",
    ui_opts:{
	item_classes : ["container-fluid"],
	icon:"/icons/iasfbo.png"
    },

    // toolbar:{
    // 	sadira_tools:{ elements:{ demos:{ name:"Demos",
    // 					  elements:{ xd1:{ name:"XD-1",
    // 							   type:"xd1",
    // 							   link:true },
    // 						     minispectro:{ name:"Minispectro",
    // 								   type:"videocap",
    // 								   link:true } } },
    // 				  toolkit:{ name:"Web Toolkit",
    // 					    elements:{ demo:{ name:"Toolkit sandbox",
    // 							      type:"ui_demo" },
    // 						       tuto:{ name:"Sadira Toolkit tutorial",
    // 							      type:"stk_tutorial" },
    // 						       tlist:{ name:"Templates",
    // 								     type:"dbtemplates" } } },
    // 				  database:{ name:"Dev",
    // 					     elements:{ browser:{ name:"Database browser",
    // 								  type:"db_browser" },
    // 							sock_mgr:{ type:"socket_manager" },
    // 							      nunki:{ type:"nunki",
    // 								      link:true } } } } } },
    elements:{
	deps:{
	    name:"Software deps",
	    type:"soft_links",
	    ui_opts:{
		item_classes:[ "container-fluid" ],
		name_node:"h2"
	    }
	}
    }
})
