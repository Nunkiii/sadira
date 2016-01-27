({ name:"Object load",
  ui_opts:{ root_classes:[ "panel panel-info container-fluid vertical_padding" ],
    child_classes:[ "row" ],
    fa_icon:"download" },
  elements:{ name:{ type:"dropdown_input",
      ui_opts:{ root_classes:[ "col-xs-12" ],
        label:true,
        item_classes:[ "" ] },
      elements:{ load_b:{ type:"action",
          name:"Load",
          ui_opts:{ root_classes:"input-group-btn",
            item_classes:"btn btn-info",
            fa_icon:"load" },
          widget_builder:function (){
			    
			} } },
      widget_builder:function (){
		    var dd=this;
		    var ddb=this.get('dropdown');
		    var load_b=this.get('load_b');
		    
		    ddb.set_button_label("Loading ...");

		    new_event(dd.parent,'load_doc');
		    
		    var collection = dd.parent.collection;
		    dd.parent.set_subtitle(collection);
		    
		    dd.populate=function(){
			sadira.storage.collection(collection,{create : true}, function(error, cln){
			    if(error){
				ddb.set_button_label(error);
				return; // dd.parent.message(error, { type : 'danger', title : 'Storage error'});
			    }
			    cln.store_deserialize();
			    ddb.set_button_label(collection);
			    var doc_list=cln.get('docs');
			    var item_list=[];
			    
			    for(var d in doc_list.elements){
				var doc=doc_list.elements[d];
				var item={ label : doc.name, value : doc.val('id'), doc : doc };
				
				// if(saved_doc !== undefined)
				//     if(saved_doc.name==doc.name) tosel=item;
				item_list.push(item);
				
			    }
			    dd.set_items(item_list);

			    cln.listen('changed', function(){
				dd.populate();
			    });
			    
			    if(item_list.length===0){
				dd.elements.input.disable();
				//dd.elements.input.ui_root.setAttribute('disabled',true);
				dd.elements.dropdown.disable(); 
				load_b.disable();
				dd.message('Collection '+dd.parent.collection +' is empty !', { type : 'warning', title : 'Nothing yet'});
			    }else{
				dd.elements.input.disable(false);
				dd.elements.dropdown.disable(false);
				load_b.disable(false);
				dd.message('Ok', { last : 1000});
			    }
			    //if(tosel!==undefined) dd.select(tosel);
			    
			    load_b.listen('click', function(){
				dd.parent.trigger('load_doc',ddb.selected.doc);
			    });
			    
			});
		    };
		    dd.populate();
		} } },
  key:"object_loader" })