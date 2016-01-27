({ name:"Stored document",
  ui_opts:{ fa_icon:"file" },
  elements:{ date:{ name:"Creation date",
      type:"date",
      ui_opts:{ label:true } },
    tpl:{ name:"Template",
      type:"string",
      value:"",
      ui_opts:{ label:true } },
    id:{ name:"Ws ID",
      type:"string",
      ui_opts:{ label:true } } },
  widget_builder:function (){
	    var doc=this;
	    doc.set('date', new Date());
	    var doc_ui=ce('div');
	    doc.store_serialize=function(object, opts){

		if(opts===undefined) opts={};
		if(object.type!==undefined)
		    doc.set('tpl', object.type);

		storage_serialize(doc.val('id'), object);
	    };
	    
	    doc.store_deserialize=function(opts){
		//console.log("DOC DESER : id " + doc.val('id'));
		//console.log("DOC obj " + opts.object.name);
		return storage_deserialize(doc.val('id'), opts);
	    };

	    
	    doc.add_bbox_item(create_widget({
		name : 'View', type : 'action', ui_opts : { item_classes : 'btn btn-primary btn-sm', fa_icon : 'view' },
		widget_builder : function(){
		    this.listen('click', function(){
			var doc_object=doc.store_deserialize();
			doc_ui.appendChild(doc_object.ui_root);
		    });
		}
		
	    }),'load');
	    
	    doc.add_bbox_item(create_widget({
		name : 'Delete', type : 'action', ui_opts : { item_classes : 'btn btn-danger btn-sm', fa_icon : 'delete' },
		widget_builder : function(){
		    this.listen('click', function(){
			var yn=create_widget({
			    type : 'yesno',
			    name : "Really delete document " + doc.name + ' from local storage ?',
			    depth : doc.depth+1,
			    ui_opts : { labels : ['Delete', 'Cancel'] }
			});
			set_modal(yn,doc.ui_childs.div);
			yn.listen('accept', function (accept){
			    if(accept){
				doc.parent.parent.delete_document({ id : doc.val('id')});
				doc.parent.parent.message('Deleted ' + doc.val('id'));
			    }
			    
			    yn.trigger('close');
			});
			
		    });
		}
		
	    }),'delete');
					    

	    return doc_ui;
	    
	},
  key:"storage_doc" })