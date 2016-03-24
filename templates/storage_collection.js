({
    ui_opts:{ fa_icon:"folder-o" },
    name:"Invalid collection name",
    elements:{
	id:{
	    name:"Local storage key",
	    type:"string",
	    ui_opts:{ label:true }
	},
	docs:{
	    name:"Documents",
	    type:"container",
	    child_type:"storage_doc"
	}
    },
    widget_builder:function (ok, fail){
	var cln=this;
	var docs=cln.get('docs');
	new_event(this,'changed');
	
	cln.store_serialize=function(){
	    storage_serialize(cln.val('id'), cln.get('docs'));
	}
	
	cln.store_deserialize=function(){
	    storage_deserialize(cln.val('id'), { object :  cln.get('docs') });
	}
	
	cln.get_document=function(opts){
	    
	    for(var d in docs.elements){
		var doc=docs.elements[d];
		if(opts.id !== undefined){
		    if(doc.val('id')==opts.id)
			return doc;
		}
		if(opts.name !== undefined){
		    if(doc.name==opts.name)
			    return doc;
		}
	    }
	    return undefined;
	}
	
	cln.document=function(opts, cb){
	    
	    var ex_doc = this.get_document(opts);
	    
	    if(ex_doc!==undefined) {
		cb({ existed : true}, ex_doc);
		return;
	    }else
		if(opts.create===true){
		var dtpl={ type: "storage_doc" };
		    if(opts.name!==undefined) dtpl.name=opts.name;
		    
		    create_widget(dtpl,docs).then(function(doc){
			var docid=Math.random().toString(36).substring(2);
			doc.set('id',docid);
			docs.add_child(doc,docid);
			cln.store_serialize();
			cb({ existed : false}, doc);
			cln.trigger('changed');
		    });
		}else
		    cb({ error : "No such doc, and no create option flag"});
	};
	
	cln.delete_document=function(opts){
	    var todel_doc=cln.get_document(opts);
	    if(todel_doc===undefined)
		throw Error("Collection ["+cln.name+"] : Cannot delete doc : unknown doc identified by ["+JSON.stringify(opts)+"]");
	    var save_location=todel_doc.val('id');
	    
	    localStorage.removeItem(save_location);
	    docs.remove_child(save_location);
	    cln.store_serialize();
	    };
	
	if(cln.val('id')!==undefined)
	    cln.store_deserialize();

	ok();
    },
    key:"storage_collection"
})
