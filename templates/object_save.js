({
    name:"Save to webstorage",
    ui_opts:{
	root_classes:[ "panel panel-success container-fluid" ],
	child_classes:[ "container-fluid vertical_margin" ],
	fa_icon:"save"
    },
    elements:{
	name:{
	    type:"dropdown_input",
	    ui_opts:{ root_classes:[ "col-xs-12" ] },
	    elements:{
		save_b:{
		    type:"action",
		    name:"Save",
		    ui_opts:{
			item_classes:[ "btn btn-success" ],
			root_classes:[ "input-group-btn" ],
			fa_icon:"save"
		    }
		}
	    },
	    widget_builder:function (ok, fail){
		var dd=this;
		var ddb=this.get('dropdown');
		ddb.set_button_label("Save as");
		
		var collection=dd.parent.collection;
		
		dd.populate=function(){
		    sadira.storage.collection(collection, function(error, cln){
			if(error)return; // dd.parent.message(error, { type : 'danger', title : 'Storage error'});
			cln.store_deserialize();
			var doc_list=cln.get('docs');
			var item_list=[];
			var tosel;
			for(var d in doc_list.elements){
			    var doc=doc_list.elements[d];
			    var item={ label : doc.name, value : doc.val('id') };
			    // if(saved_doc !== undefined) if(saved_doc.name==doc.name) tosel=item;
			    item_list.push(item);
			}
			dd.set_items(item_list);
			//if(tosel!==undefined) dd.select(tosel);
		    });
		};
		dd.populate();
		ok();
	    }
	}
    },
    widget_builder:function (ok, fail){

	console.log("OS build");
	
	var sui=this;
	var name=this.get('name');
	var collection=this.collection;
	
	this.set_subtitle(collection);
	
	new_event(this,'save_doc');
	
	this.get('save_b').listen('click', function(){

	    if(name.value===undefined || name.value===""){
		return sui.message("Please provide a valid name for your new document", { type : 'danger', title : 'Storage error', last : 4000});
	    }

	    sadira.storage.collection(collection, { create : true}, function(error, cln){
		if(error)return sui.message(error, { type : 'danger', title : 'Storage error'});
		
		cln.document( { name : name.value, create : true}, function(status, doc){
		    if(status.error)return sui.message(status.error, { type : 'danger', title : 'Storage error'});
		    function really_save(){
			sui.trigger('save_doc', doc);
		    }
		    if(status.existed){
			var yn=create_widget({
			    type : 'yesno',
			    name : "Overwrite existing " + name.value + ' ?',
			    depth : sui.depth+1,
				ui_opts : { labels : ['Overwrite', 'Cancel'] }
			});
			set_modal(yn,sui.ui_childs.div);
			yn.listen('accept', function (accept){
			    console.log("Accepted ? " + accept);
			    if(accept){
				really_save();
			    }
			    
			    yn.trigger('close');
			});
		    }else
			really_save();
		    
		    
		});
		
		
	    });
	    
	    console.log("Saving..!!!!");
	});
	ok();
    },
    key:"object_save"
})
