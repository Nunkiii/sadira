({
    key:"view",
    name : "Doc view",
    //ui_opts : { fa_icon : 'file'},
    usi : {
	elements : {
	    toolbar : {
		name : "View TB",
		type : 'toolbar',
		//name : view.docw.name === undefined ? "Unnamed document" : view.docw.name,
		//subtitle : view.docw.subtitle,
		//ui_opts : { fa_icon :view.docw.ui_opts.fa_icon, icon : view.docw.ui_opts.icon },
		ui_opts : { root_classes : ["bg-faded"], fa_icon : "file"},
		elements : {
		    //x : { type : "double", name : "XXX", value : 32},
		    tbs : {
			type : "toolbar_section",
			ui_opts : {
			    root_classes : ["pull-right"]
			},
			elements : {
			    doc_tools : {
				name : "Doc view tools", //view.docw.type + "...",
				type : "dropdown",
				ui_opts : { type : "toolbar"},
				items : [
				    { label : "Edit", fa_icon : "edit" },
				    { label : "Delete", fa_icon : "close" }
				]
			    }
			},
			widget_builder : function(ok,fail) { this.ui_root.add_class('navbar-right'); ok(); }
		    }
		}
	    }
	}
    },
    
    widget_builder:function (ok, fail){

	var view=this;
	var doc_content=cc('div', view.ui_root);
	var loading=false;


	this.load_doc=function(opts, cb){
	    if(loading) return;
	    loading=true;
	    view.clear();
	    view.wait("Loading ...");
	    //view.message("Loading doc OPTS=" + JSON.stringify(opts));
	    get_document(opts, function(err, doc_data){
		loading=false;
		view.wait(false);
		if(err) return view.error( "<strong>While getting document</strong>" + err);
		//view.message(JSON.stringify(doc_data), {title : "Doc data received"});
		if(doc_data.length===0){
		    view.warning("No document found " + JSON.stringify(opts));
		    return;
		}
		    
		view.doc_data=doc_data[0];
		view.show_doc();
	    });
	}
    
	this.show_doc=function(){
	    //view.message(JSON.stringify(view.doc_data));
	    
	    create_object_from_data(view.doc_data).then(function(docw){
		view.docw=docw;

		//if(docw.ui_name!==undefined)
		  //  docw.ui_root.removeChild(docw.ui_name);

		view.ui_root.replaceChild(docw.ui_root, doc_content);
		doc_content=docw.ui_root;
		
		var tb=view.get("toolbar");
		//console.log("LOC " + document.location + " TB " + this.usi.elements.toolbar.ui_root);
		if(tb===undefined){
		    view.error("No toolbar !");
		}else{
		    if(tb.ui_opts===undefined) tb.ui_opts={};
		    if(docw.ui_opts!==undefined){
			tb.ui_opts.fa_icon=docw.ui_opts.fa_icon;
			tb.ui_opts.icon=docw.ui_opts.icon;
			//view.message("Changinf icon to " + JSON.stringify( tb.ui_opts));
			tb.rebuild_name();//setup_icon();
		    }
		    tb.set_title(docw.name, docw.type);
		    
		}

		//view.setup_tools();
	    }).catch(function(e){
		console.log("Error show doc: " + dump_error(e));
		view.message("<strong>Building object template:</strong> " + view.doc_data.type + dump_error(e), { type : "danger"})
	    });
	}
	
	
	// this.setup_tools=function(){
	//     create_widget(tb).then(function(tbw){
	// 	view.docw.ui_root.prependChild(tbw.ui_root);
	//     });
	// }
	
	this.clear=function(){
	    doc_content.innerHTML="";
	}

	ok();
    },

})
