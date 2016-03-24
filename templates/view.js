({
    key:"view",
    name : "Doc view",
    ui_opts : { fa_icon : 'file'},
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
			    //root_classes : ["pull-right"]
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
	    view.wait("Loading document ....");
	    //view.message("Loading doc OPTS=" + JSON.stringify(opts));
	    get_document(opts, function(err, doc_data){
		loading=false;
		view.wait(false);
		if(err){
		    
		    view.error( "<strong>While getting document</strong>" + err);
		    return cb(err);
		}
		//view.message(JSON.stringify(doc_data), {title : "Doc data received"});
		if(doc_data.length===0){
		    view.set_subtitle("No document found " + JSON.stringify(opts));
		    return;
		}
		    
		view.doc_data=doc_data[0];
		view.show_doc(cb);
	    });
	}
    
	this.show_doc=function(cb){
	    //view.message(JSON.stringify(view.doc_data));
	    view.wait("Preparing document ....");
	    
	    if(view.doc_data.ui_opts===undefined)
		view.doc_data.ui_opts={};

	    //view.doc_data.ui_opts.close=view.ui_opts.close;
	    view.doc_data.ui_opts.name_node='a';
	    view.doc_data.ui_opts.name_classes='navbar-brand';
	    
	    create_object_from_data(view.doc_data).then(function(docw){
		
		view.docw=docw;
		view.ui_root.appendChild(docw.ui_root);
		view.wait(false);
		
		view.integrate_widget(docw);
		
		if(cb!==undefined)
		    return cb();

		//view.setup_tools();
	    }).catch(function(e){
		console.log("Error show doc: " + dump_error(e));
		view.message("<strong>Building object template:</strong> " + view.doc_data.type + dump_error(e), { type : "danger"});
		cb(e);
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
