({
    name:"Browser storage",
    ui_opts:{
	child_view_type:"div",
	fa_icon:"database"
    },
    elements:{
	collections:{
	    name:"Collections",
	    type:"container",
	    child_type:"storage_collection",
	    ui_opts:{
		root_classes:"container-fluid"
	    }
	}
    },
    widget_builder: function (ok, fail){
	
	var storage=this;
	var collections=storage.get('collections');
	
	storage.store_serialize=function(){
	    storage_serialize('storage',collections);
	}
	
	storage.store_deserialize=function(){
	    storage_deserialize('storage',{ object : collections });
	}
	
	storage.get_collection=function(cname){
	    for (var c in collections.elements){
		var cln=collections.elements[c];
		if(cln.name == cname){
			return cln;
		}
	    }
	    return undefined;
	}
	
	storage.create_collection=function(collection_name, opts_in, cb_in){
	    var cb, opts;
	    if (cb_in===undefined){
		cb = opts_in;
		opts={};
	    }else{
		opts=opts_in;
		cb=cb_in;
	    }
	    
	    if(storage.get_collection(collection_name)!==undefined)
		cb('Collection '+ collection_name + " already exist !");
	    else{
		var ctpl={ type: "storage_collection", name : collection_name, child_type : opts.child_type};
		create_widget(ctpl,collections).then(function(cln){
		    cln.set('id',Math.random().toString(36).substring(2));
		    collections.add_child(cln);
		    storage.store_serialize();
		    cb(null, cln);
		});
	    }
	    //cln.set('id',Math.random().toString(36).substring(2));
	}
	
	storage.collection=function(collection_name, opts_in, cb_in){
	    var cb, opts;
	    if (cb_in===undefined){
		cb = opts_in;
		opts={};
	    }else{
		    opts=opts_in;
		cb=cb_in;
	    }
	    
	    var cln=storage.get_collection(collection_name);
	    
	    if(cln !== undefined)
		cb(null, cln);
	    else{
		if(opts.create===true){
		    storage.create_collection(collection_name, opts, cb);
		    return;
		}else
		    cb("No such collection " + collection_name + " and no create option set!");
	    }
	}
	
	create_widget({ type : 'button_box' }).then(function(bbox){
	    
	    create_widget({
		type : 'button',
		ui_opts : { name : 'Clear', type : 'danger'},
		widget_builder : function(ok, fail){
		    this.listen('click', function(){
			create_widget({
			    type : 'yesno',
			    name : "Please confirm you want to clear all this application data from your browser storage.",
			    depth : storage.depth+1,
							 ui_opts : { labels : ['Clear browser data', 'Cancel'] }
			}).then(function(yn){
			    set_modal(yn,storage.ui_childs.div);
			    yn.listen('accept', function (accept){
				//console.log("Accepted ? " + accept);
				
				if(accept){
				    storage.message('clearing local storage...');
				    localStorage.clear();
				    storage.message('clearing local storage done', { type : 'success', title : 'Clearing local storage'});
				}
			    
				yn.trigger('close');
			    });
			});
			
		    });
		    ok();
		}
	    }).then(function(but){
		bbox.add_button(but);
		ok();
	    });

	    storage.store_deserialize();
	    storage.ui_root.appendChild(bbox.ui_root);

	    
	});
	

	//return bbox.ui_root;
    },
    key:"storage"
})
