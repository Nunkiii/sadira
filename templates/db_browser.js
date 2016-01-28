({
    key:"db_browser",
    name:"DB manager",
  //type:"view",
    ui_opts:{ //root_classes:[ "container-fluid" ],
	      child_classes:[ "row" ],
	      fa_icon:"database"
	    },
    usi : {
    	elements : { 
    	    toolbar:{
    		type : "toolbar",

		ui_opts : { root_classes : ["bg-faded"]},
    		elements : {
    		    tb:{
			ui_opts : {root_classes : ["pull-right"]},
    			type:"toolbar_section",
    			elements:{
			    db_select:{ type:"db_select",
    					ui_opts:{ type:"toolbar",
    						  fa_icon:"hand-pointer-o" } },
    			    add:{
				type:"dropdown",
    				name:"Create",
    				ui_opts:{ fa_icon:"plus",
    					  type:"toolbar" },
    				items:[ { label:"New MongoDB database",
    					  icon:"/sadira/icons/brands/logo-mongodb.png" },
    					{ label:"New MariaDB database",
    					  icon:"/sadira/icons/brands/mariadb.png" } ],
				usi : { elements : {
				    login : {
					ui_opts : {fa_icon : "paw"},
					name : "Login",
					type : "widget_launcher",
					usi : {
					    launch : {
						type : 'login'
					    }
					}
				    }
				}},

    			    }
    			}
    		    }
    		}
    	    },
	    view : {
		type : "view"
	    }
    	}
    },
    
    // elements:{
    // 	db_select:{ type:"db_select" }
    // },
    
    widget_builder:function (ok, fail){
	console.log("DB_BROWSER BUILD!");
	var browser=this;
	//return ok();
	var db_select=this.get("db_select");
	var view=this.get("view");
	
	console.log("db select is " + db_select.type);
	db_select.listen("error", function(e){
	    browser.message(e, {type : "danger", title : "Db Select"});
	});
       
	db_select.listen("database_selected", function(db){
	    if(!view.ui_root.parentNode)
		browser.ui_root.appendChild(view.ui_root);
	    view.load_doc({ db : db.name, collection : "mongo_databases", id : db._id});
	    
	});
	
	db_select.get_databases(function(error){
	    if(error)browser.message(error,{ type : "danger", title : "Get databases"});
	});
	
	console.log("DONE DB_BROWSER BUILD!");
	ok();
    }

})

