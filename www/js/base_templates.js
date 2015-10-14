var base_templates={

    progress:{
	ui_opts : {
	    //root_classes : ["container-fluid "],
	}
    },
    status:{},
    double:{
	ui_opts:{
	    root_classes : ["inline panel panel-default horizontal_margin small full_padding"]
	}
    },
    labelled_vector:{ serialize_fields : ["value_labels"], serialize_childs : false,  elements : {} },
    local_file:{},
    email : { type : 'string'},
    bytesize:{},
    bool:{},
    string:{},
    text:{},
    password:{},
    date:{},
    url:{},
    image_url:{},
    html:{},
    code:{},
    combo:{ ui_opts : { type : "edit"} },
    template_list:{},
    action:{},
    color:{},
    angle:{},
    expo_setup:{},
    demo_multilayer:{},
    object_editor:{},
    xd1_layer:{},


    button : {
	ui_opts : {
	    root_node : 'button',
	    type : 'default'
	},
	widget_builder : function(){
	    var b=this;
	    new_event(this,'click');
	    var but=this.but=this.ui_root; //ce('button');
	    var opts=this.ui_opts;
	    but.setAttribute('type', 'button');


	    var type='';
	    if(opts.type===undefined)type='btn-default';
	    else{
		//console.log("OTYPE " + typeof opts.type);
		if(typeof opts.type==='object')
		    opts.type.forEach(function(t){type+='btn-'+t+' ';});
		else type='btn-'+opts.type;
	    }
	    but.add_class('btn '+type);
	    if(opts.name!==undefined)
		but.innerHTML=opts.name;

	    if(opts.fa_icon!==undefined)
		but.innerHTML= '<i class="fa fa-'+opts.fa_icon + '"></i> '+but.innerHTML;
	    
	    but.addEventListener('click',function(){b.trigger('click'); });
	    //return but;
	}
    },
    button_box : {
	ui_opts : {
	    button_size : undefined
	},
	widget_builder : function(){
	    var div=this.ui_root;
	    div.add_class("btn-group");
	    if(this.ui_opts.button_size !== undefined) div.className+='btn-group-'+this.ui_opts.button_size;
	    div.setAttribute('role','group');
	    
	    this.add_button=function(but){
		div.appendChild(but.ui_root);
		return this;
	    }
	}
    },
    yesno : {
	name : "Are you sure ?",
	ui_opts : {
	    labels : ['yes','no'], fa_icon : 'question-circle', root_classes : 'well',
	    child_classes : 'text-center big_vertical_margin',
	    name_node : 'h4'
	},
	
	elements : {
	    bbox : { type : 'button_box' }
	},
	widget_builder : function(){
	    new_event(this,'accept');
	    var yn=this, bb=this.get('bbox');
	    var byes=create_widget({ type : 'button', ui_opts : {name : this.ui_opts.labels[0], type : 'success'}});
	    var bno=create_widget({ type : 'button', ui_opts : {name : this.ui_opts.labels[1], type : 'warning'}});

	    byes.listen('click',function(){yn.trigger('accept', true);});
	    bno.listen('click',function(){yn.trigger('accept', false);});
	    bb.add_button(byes);
	    bb.add_button(bno);
	}
    },
    
    input_group : {
	ui_opts : {
	    child_classes : "input-group"
	}
    },
    dropdown : {
	//type : 'button',
	ui_opts : {
	    update_label : true,
	    //_classes : "dropdown"
	},
	widget_builder : function(){
	    var dropdown=this;
	    //this.ui_root.className="dropdown";
	    
	    var b=create_widget({ type : 'button', ui_opts : {  name : this.ui_opts.name, type : this.ui_opts.type} });
	    
	    b.but.add_class('dropdown-toggle');
	    new_event(this,'select');
	    
	    // var but=this.but=cc('button',this.ui_root);
	    // but.setAttribute('type', 'button');
	    // but.className='btn btn-default dropdown-toggle';
	    b.but.setAttribute('data-toggle',"dropdown");
	    b.but.setAttribute('aria-haspopup',true);
	    b.but.setAttribute('aria-expanded',false);
	    
	    var caret=cc('span',b.but); caret.className="caret";

	    this.ui_root.appendChild(b.ui_root);
	    var ul=this.ul=cc('ul',this.ui_root);
	    ul.className='dropdown-menu';

	    this.set_button_label=function(title){
		b.but.innerHTML=title;
		var caret=cc('span',b.but); caret.className="caret";
	    }
	    
	    this.clear=function(){ ul.innerHTML=""; }
	    
	    this.add_item=function(item, id){
		var li=item.li=cc('li', this.ul);
		var a=cc('a',li);
		
		a.innerHTML=item.label;
		li.setAttribute('data-id',id);
		li.addEventListener('click', function(){
			    //select( dd.items(li.getAttribute('data-id')));
		    //dropdown.parent.select(dropdown.parent.items[this.getAttribute('data-id')]);
		    dropdown.select(item);
		});
		
	    }

	    function setup_list(){
		dropdown.clear();
		var id=0;
		
		dropdown.items.forEach(function(item){
		    dropdown.add_item(item, id);
		    id++;
		});
		if(dropdown.items.length>0){
		    b.but.remove_class('disabled');
		    dropdown.select(dropdown.items[0]);
		}else
		    b.but.add_class('disabled');		    
	    }

	    dropdown.select=function(item){
		dropdown.selected=item;
		dropdown.value=item.label;
		dropdown.trigger('select',item);
		if(dropdown.ui_opts.update_label===true){
		    b.but.innerHTML=item.label;
		    var caret=cc('span',b.but); caret.className="caret";
		}
	    }
	    
	    
	    dropdown.set_items=function(list){
		dropdown.items=list;
		setup_list();
	    }
	    
	}
    },
    dropdown_input : {
	type : 'input_group',
	ui_opts : {
	},
	elements : {
	    dropdown : {
		type : 'dropdown',
		ui_opts : {
		    root_classes : "input-group-btn",
		    update_label : false
		}
	    },
	    input : {
		ui_opts : {root_node : 'input'},
		widget_builder : function(){
		    var input_w=this;
		    var input=this.ui_root; //input=ce('input');
		    input.className='form-control';
		    input.addEventListener('input',function(){
			input_w.parent.value=this.value;
		    });
		    
		}
	    }
	},
	widget_builder : function(){
	    var ddi=this;
	    new_event(this, 'change');
	    var dd=this.get('dropdown');
	    var list_input=ddi.get('input');
	    
	    dd.listen('select',function(item){
		
		list_input.ui_root.value=item.label;
		ddi.value=item.label;
	    });
	    ddi.input_value=function(value){
		if(value!==undefined){
		    list_input.ui_root.value=value;
		    ddi.value=value;
		}else
		    return list_input.ui_root.value;
	    }
	    
	    ddi.set_items=dd.set_items;
	    ddi.select=dd.select; 
	}

    },
    
    container : {
	name : "Container",
	child_type : undefined,
	ui_opts : {
	    //display_childs : false,
	    child_view_type : 'dummy',
	    max_objects : 20
	},
	object_builder : function(ui_opts, browse){
	    var div = ce('div'); div.className='list-group';
	    
	    this.listen('add_child', function(c){

		console.log("Building CONTAINER ! " + this.name);
	    });
	    this.listen('remove_child', function(){
		
	    });

	    return div;
	}
    },

    storage : {
	name : "Browser storage",
	
	ui_opts : {
	    
	    child_view_type : 'div',
	    fa_icon : 'database'
	},
	elements : {
	    collections : {
		name : "Collections",
		type : "container",
		child_type : "storage_collection",
		ui_opts : {root_classes : 'container-fluid' }
	    }
	},
	widget_builder : function(){

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
		    var cln=create_widget(ctpl,collections);
		    cln.set('id',Math.random().toString(36).substring(2));
		    collections.add_child(cln);
		    storage.store_serialize();
		    cb(null, cln);
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
	    
	    var bbox = create_widget({ type : 'button_box' });
	    bbox.add_button( create_widget({ type : 'button', ui_opts : { name : 'Clear', type : 'danger'},
					     widget_builder : function(){
						 this.listen('click', function(){
						     var yn=create_widget({
							 type : 'yesno',
							 name : "Please confirm you want to clear all this application data from your browser storage.",
							 depth : storage.depth+1,
							 ui_opts : { labels : ['Clear browser data', 'Cancel'] }
						     });
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
					     }
					   } ));
	    
	    storage.store_deserialize();
	    storage.ui_name.appendChild(bbox.ui_root);
	    //return bbox.ui_root;
	}
    },

    storage_collection : {
	ui_opts : { fa_icon : "folder-o" },
	name : "Invalid collection name",
	elements : {
	    id : { name : "Local storage key", type : 'string' , ui_opts : { label : true }  },
	    docs : {
		name : "Documents",
		type : "container",
		child_type : "storage_doc",
	    }
	},
	widget_builder : function(){
	    var cln=this;
	    var docs=cln.get('docs');

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
		}
		
		if(opts.create===true){
		    var dtpl={ type: "storage_doc" };
		    if(opts.name!==undefined) dtpl.name=opts.name;
		    var doc=create_widget(dtpl,docs);
		    var docid=Math.random().toString(36).substring(2);
		    doc.set('id',docid);
		    docs.add_child(doc,docid);
		    cln.store_serialize();
		    cb({ existed : false}, doc);
		    return;
		}
		
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
	}
    },
    storage_doc : {
	name : "Stored document",
	ui_opts : { fa_icon : "file" },
	elements : {
	    date : { name : "Creation date", type : 'date', ui_opts : { label : true }  },
	    tpl : { name : "Template", type : 'string', value : '' , ui_opts : { label : true }  },
	    id : { name : "Ws ID", type : 'string' , ui_opts : { label : true }  }
	},
	widget_builder : function(){
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
	    
	}
    },
    object_save : {
	
    	name : 'Save to webstorage',
	ui_opts : {
	    root_classes : ["panel panel-success container-fluid"],
	    child_classes : ["container-fluid vertical_margin"],
	    fa_icon : 'save',
	    //name_node : 'h4'
	},
	elements : {
	    name : {
		//name : "Save as :",
		type : "dropdown_input",
		ui_opts : {root_classes :  ["col-xs-12"]},
		elements : {
		    save_b : {
			type : 'action', name : "Save",
			ui_opts : {
			    item_classes : ["btn btn-success"],
			    root_classes :  ["input-group-btn"],
			    fa_icon : "save"
			}
		    }
		    
		},
		widget_builder : function(){
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
		}
	    },
	},
	widget_builder : function(){
	    
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
	}
    },
    object_loader : {
	name : "Object load",
	ui_opts : {
	    root_classes : ["panel panel-info container-fluid vertical_padding"],
	    child_classes : ["row"],
	    fa_icon : 'download',
	    //name_node : 'h4'
	},
	elements : {
	    name : {
		//name : "Select :",
		type : "dropdown_input",
		ui_opts : {
		    root_classes : ["col-xs-12"], label : true,  item_classes : [""],
		    //name_classes : "input-group-addon"
		},
		elements : {
		    load_b : {
			type : 'action',
			name : "Load",
			ui_opts : {
			    root_classes : "input-group-btn",
			    item_classes : "btn btn-info",
			    fa_icon : "load"
			},
			widget_builder : function(){
			    
			}
		    }
						    
		},
		widget_builder : function(){
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
			    
			    if(item_list.length===0){
				dd.elements.input.disable();
				//dd.elements.input.ui_root.setAttribute('disabled',true);
				dd.elements.dropdown.disable(); 
				load_b.disable();
				dd.message('Collection '+dd.parent.collection +' is empty !', { type : 'warning', title : 'Nothing yet'});
			    }
			    //if(tosel!==undefined) dd.select(tosel);
			    
			    load_b.listen('click', function(){
				dd.parent.trigger('load_doc',ddb.selected.doc);
			    });
			    
			});
		    };
		    dd.populate();
		}
		
	    },
	}
    },
    
    browser : {
	ui_opts : {
	    
	},
	widget_builder : function(ui_opts, browser){
	}
    },
    
    error_page : {

	name : "Ooops...",
	subtitle : "an error occured !",
	type : "html",
	ui_opts : {
	    wrap : true, wrap_classes : ["container-fluid"],
	    root_classes : ["container-fluid jumbotron"],
	    item_classes : ["col-sm-offset-1 col-sm-10 alert alert-danger vertical_margin"],
	    icon : "/sadira/icons/hal9000.jpg"
	},
	value : "Error message",
	
    },

    db_collection : {

	name : "Object collection",
	ui_opts : {
	    fa_icon : "reorder",
	    name_elm : "name",
	    mini_elm : "description"
	},
	elements : {

	    description  : {
		type : "string",
		name : "Description",
		default_value : "Description of this collection..."
	    },
	    
	    name : {
		name : "Collection name",
		type : "string",
		holder_value : "Enter name here",
		ui_opts : { label : true}
	    },

	    template : {
		name : "Collection template",
		type : "string",
		ui_opts : { label : true}
	    },
	    
	    dbname : {
		name : "Database name",
		type : "string",
		ui_opts : { label : true}
	    }
	}

	// widget_builder : function(ui_opts, dbc){
	//     dbc.listen("data_loaded", function(){
	// 	dbc.set_title( dbc.val("name"));
	//     })
	// }
	
    },

    user_admin : {
	name : "User administration",
	ui_opts : {
	    fa_icon : "user",
	    root_classes : ["container-fluid"]

	},
	elements : {
	    browse : {
		name : "User list",
		type : "db_browser",
		ui_opts : {
		    collection : 'Users',
		    //fa_icon : "user"
		}
	    }
	    
	}
    },

    group_admin : {
	name : "Group administration",
	ui_opts : {
	    fa_icon : "group",
	    root_classes : ["container-fluid"]
	},

	elements : {
	    browse : {
		name : "Group list",
		type : "db_browser",
		ui_opts : {
		    collection : 'Groups',
		    
		}
		
	    }
	    
	}
    },
    
    user_home : {

	name : "User homepage",
	ui_opts : {
	    child_view_type : "tabbed",
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
	    fa_icon : "home"
	},

	toolbar : {
	    ui_opts : {
		toolbar_classes : [""]
	    },
	    elements : {
		admin : {
		    name : "System admin",
		    groups : ['Admin'],
		    elements : {
			user_adm : {
			    type  : "user_admin",
			},
			group_adm : {
			    type  : "group_admin",
			}
		    }
		    
		}
	    }
	},
	
	elements : {
	    // user_activity : {
	    // 	name : "Last activity"
 
	    account_settings : {

		name : "Account settings",
		elements : {
		    user_data : {type : "user"}
		    
		}
	    }
	},
	
	widget_builder : function(ui_opts, uhome){
	    
	    //uhome.debug("Hello world debug");
	    var test = {
		a : "skjadkjsa",
		f : function(e){ return e*33.0; }
	    };
	    var bs=BSON.serialize(test,true,true,true);
	    var result=BSON.deserialize(bs, {evalFunctions : true});
	    for (var e in result){				  
		console.log("Bson " + e + " type " + typeof(result[e]));
		
	    }
	    console.log("66 =? " + result.f(2.0));

	    
	    
	}
    },
    
    db_browser : {

	name : "Database browser !!!!",
	
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["container-fluid"],
	    fa_icon : "archive"
	},

	elements : {
	    colsel : {
		name : "Select collection",
		
		ui_opts : {
		    type  : "edit",
		    label :  true,
		    root_classes : ["col-sm-12"],
		},
		type : "combo"
	    },
	    cnt : {
		ui_opts : {
		    root_classes : ["container-fluid"],
		    child_classes : ["row"]
		},
		elements : {
		    browser : {
			//name : "Object browser",
			ui_opts : { root_classes : ["col-sm-6"]},
			elements : {
			    list : {
				ui_opts : {
				    root_classes : ["container_fluid"]
				},
				name : "Object list"
			    }
			}
		    }
		    ,
		    object : {
			//name : "Object view",
			ui_opts : {
			    root_classes : ["col-sm-6"],
			    child_classes : ["container-fluid"]
			}
		    }
		}
	    }
	},

	widget_builder : function(ui_opts, dbb){
	    
	    //console.log("DBB start " + dbb.name);

	    var browser = dbb.get('browser');
	    var list = dbb.get('list');
	    var colsel=dbb.get("colsel");
	    var object=dbb.get("object");
	    
	    var tb=cc('table',list.ui_root);
	    
	    tb.className='table table-hover';
	    
	    function get_collection_list(cb){
		var r=new request({ cmd : '/api/dbcom/get'});
		
		r.execute(function(err, result){

		    if(err){
			object.ui_root.innerHTML=err;
			return;
		    }
		    
		    if(result.length>0){
			
			colsel.options=[];
			
			result.forEach(function(d){
			    colsel.options.push({value : d.els.name.value, label : d.els.name.value /*d._id*/});
			    //var w=create_widget(d.type);
			    //set_template_data(w,d);
			    //console.log("D= " + JSON.stringify(d));
			    //object.ui_childs.add_child(w, w.ui_root);
			});
			
			colsel.set_options();
			cb(true);
			
		    }else{
			colsel.set_title("No collection available");
			colsel.disable();
			cb(true);
		    }
		    
		    colsel.listen("change", function (value) {
			console.log("changed to " + value);
			get_collection_objects(colsel.value);
		    });
		
		});
	    }

	    function get_collection_objects(collection_name){

		console.log("Col name : " + collection_name);
		var r=new request({ cmd : '/api/dbcom/get', args : { collection : collection_name} });
		

		r.execute(function(err, result){

		    if(err){
			dbb.debug(err);
			return;
		    }
		    
		    //dbb.debug(JSON.stringify(result,null,5));
		    
		    if(result!==undefined){
			if(result.error !== undefined)
			    return dbb.debug(result.error);

			dbb.debug_clean();
			
			list=create_widget({
			    //name : "Collection <i>" + collection_name + "</i>",
			    ui_opts : {
				root_classes : ["col-sm-12"],
				child_classes : ["container-fluid"],
				//child_view_type : "table"
			    }
			}, browser);
			
			browser.update_child(list,"list");
			
			result.forEach(function(d, i){
			    
			    //dbb.debug( i + " : " + JSON.stringify(d));
			    
			//colsel.options.push({value : d._id, label : d.els.name.value});
			    var w=tmaster.build_template(d.type);
			    if(w.ui_opts === undefined) w.ui_opts={
			    };
			    //if(w.ui_opts.root_classes===undefined)
				w.ui_opts.root_classes=[];
			    //if(w.ui_opts.name_classes===undefined)
			    w.ui_opts.name_classes=[];
			    w.ui_opts.root_classes.push("panel panel-success");
			    w.ui_opts.name_classes.push("panel-heading");
			    w.ui_opts.child_classes=["panel-body"];
			    w.ui_opts.name_node="div";
			    //w.ui_opts.name_node="h3";
			    w.parent=list;
			    //list.debug("List depth = " + list.depth);
			    
			    create_ui({},w, list.depth+1);
			    
			    w.set_title(d.name + " : " + d._id);
			    set_template_data(w,d);
			    w.rebuild_name();
			    //console.log("D= " + JSON.stringify(d));
			    
			    list.ui_childs.add_child(w, w.ui_root);
			    
			    //w.tr.addEventListener("click", function(){
			    w.ui_name.addEventListener("click", function(){
				
				var ww=create_widget(d.type, object);

				set_template_data(ww,d);
				ww.rebuild_name();

				if(object.obj === undefined){
				    object.ui_root.appendChild(ww.ui_root);
				}else
				    object.ui_root.replaceChild(ww.ui_root, object.obj.ui_root);
				
				object.obj=ww;
			    });

			    
			});
		    }
		});
	    }

	    if(ui_opts.collection===undefined){
		get_collection_list(function(ok){
		    if(ok === true){
			console.log("Got collections");
			get_collection_objects(colsel.value);
		    }
		});
	    }else{
		colsel.hide(true);
		get_collection_objects(ui_opts.collection);
	    }
	    
	}
    },

    music_app : {
	name : "StudyMusic",
	subtitle : "Learn music in tempo. Yeah ! ",
	
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_view_type : "tabbed",
	    fa_icon : "leaf"
	},

	toolbar : {
	    elements : {
		file_menu : {
		    name : "Lessons",
		    elements : {
			open : { name : "Lesson1"},
			load : { name : "Lesson2"},
			close : { name : "Lesson3"},
		    }
		}
	    }
	},
	
	elements : {
	    lessons : {
		name : "My lessons",
		subtitle : "Manage your lessons here"
		
	    },

	    time : {
		name : "Time organization",
		subtitle : "Manage your lessons here"
	    },

	    account : {
		name : "User account",
		subtitle : "Setup your user account",
		type : "user"
	    }
	}

    },
    
    
    user : {
	name : "User information",

	ui_opts : {
	    child_view_type : "div",
	    root_classes : ["container-fluid"],
	    fa_icon : "user",
	    name_elm : "username",
	    mini_elm : ""
	},
	elements : {
	    nick : {
		name : "Nickname",
		ui_opts : {
		    editable : true,
		    root_classes : ["form form-inline form-group-lg"],
		    name_node : 'label'
		},
		type : 'string',
		holder_value : 'Enter a nickname'
		
	    },
	    default_email : {
		name : "Default email account",
		type : "email"
	    },
	    credentials : {
		name : "Account credentials",
		db : { perm : { r : 'admin'} }
	    },
	    groups : {
		ui_opts : { child_view_type : "pills"},
		name : "Groups",
		db : { perm : { w : 'admin'} }
	    }
	},
	object_builder : function(user){
	    user.get_login_name=function(){
		var cred;
		cred= user.get("local");
		if(cred!==undefined){
		    var un=cred.val('username');
		    if(un!==undefined) return un;
		    var un=cred.val('email');
		    if(un!==undefined) return un;
		}

		return "Unknown";
	    }
	}
    },
    user_group : {
	name : "User Group",
	ui_opts : {
	    fa_icon : "group",
	    name_elm : "name",
	    mini_elm : "description",
	    //name_node : "h5"
	},
	elements : {
	    name : {
		name : "Group name",
		subtitle : "String identifier for the group",
		type : "string",
		ui_opts : {
		    //label : true
		}
	    },
	    description : {
		type : "html",
		name : "Description",
		subtitle : "",
		ui_opts : {
		    //label : true
		}
	    },
	},
    },
    local_access : {
	tpl_desc : "All info for an internally administered user.",
	name : "Local credentials",
	ui_opts : {
	    fa_icon : "leaf"
	},
	elements : {
	    email: {
		ui_opts : {
		    label : true,
		    fa_icon : "envelope"
		},
		name : "E-mail",
		type: "string",
		holder_value : "Any valid email adress? ..."
	    },
	    hashpass: {
		ui_opts : {
		    label : true,
		    fa_icon : "eye-close"
		},
		name : "Hashed password",
		type: "password"
	    },
	    salt: {
		ui_opts : { label : true },
		name : "Hashed password salt",
		type: "string",
		name: "Password salt"
	    },
	    username: {
		ui_opts : { label : true },
		name : "User name",
		type: "string"
	    }
	}
    },
    facebook_access : {
	name : "Facebook credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    email        : { name : "Email", type : "email"},
	    name         : { name : "Name", type : "string"},
	}
    },
    twitter_access : {
	name : "Twitter credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    displayName  : { name : "Display name", type : "string"},
	    userName     : { name : "User name", type : "string"},
	}
    },
    google_access : {
	name : "Google credentials",
	elements : {
	    id           : { name : "Id", type : "string"},
	    token        : { name : "Token", type : "string"},
	    email        : { name : "Email", type : "email"},
	    name         : { name : "Name", type : "string"},
	}
    },

    socket_manager : {
	name : "Socket manager",
	intro : "Active sockets :",
	container : "socket",
	ui_opts : { intro_stick : true, fa_icon : 'road', root_classes : ["container-fluid"], type : 'edit' },
	elements : {},
    },
    
    socket : {
	name : "Websocket",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    root_node : "form",
	    child_classes : ["form-group input-group"],
	    fa_icon : 'tty'
	},
	elements : {
	    url : {
		name : "Server",
		type : "url",
		ui_opts : {
		    //root_classes : ["input-group"],
		    label_node : "div",
		    root_classes : ["input-group"],
		    name_classes : ["input-group-addon"],
		    type : "edit",
		    label : true,
		    //item_root : true
		},
		default_value : "ws://sadira.iasfbo.inaf.it"
	        //value : "ws://localhost"
		//value : "ws://localhost:9999"
	    },

	    status : {
		//name : "Status",
		ui_opts : {
		    //root_classes : ["input-group-addon"],
		    //name_classes : [],
		    item_classes : ["input-group-addon"],
		    root_element : 'url'
		},
		type : "status",
		value : "blue",
		value_labels : { blue : "disconnected", green : "connected", red : "error"}
	    },
	    connect : {
		ui_opts : {
		    //root_classes : ["input-group-btn"],
		    //button_node : "span",
		    fa_icon : "link",

		    wrap : true,
		    wrap_classes : ["input-group-btn"],
		    item_classes : ["btn btn-info"],

		    
		    name_classes : [],
		    
		    root_element : 'url'
		    //item_root : true
		},
		type: "action",
		name : "connect"
	    },

	    messages : {
		ui_opts : {
		    sliding : true, slided : false,
		    root_classes : [],
		    name_classes : [],
		    item_classes : [],  
		    label : true,
		    in_root : "append"
		},
		name : "Info",
		type : "text"
	    }
	} 
    },

    sadira_panel : {
	name : "<strong>Sadira</strong>",
	subtitle : "control panel",
	ui_opts : {
	    sliding: true, slided : false, sliding_dir : 'h',
	    sliding_animate: true,
	    name_node : "h4",
	    //root_classes : ["sadira_panel"]
	},
	elements : {
	    login : { type : 'login' }
	}

    },

  
    login : {
	name : "Log into Sadira",
	intro : "<p>Enter your username and password to log into Sadira</p>",
	ui_opts : {
	    //sliding: true, slided : true,
	    //label : true, //label_node : "a",
	    //sliding_animate : true,
	    //sliding_dir : "h",
	    //root_node : "li",
	    name_node : "h2",
	    fa_icon : "sign-in",
	    root_classes : ["container-fluid"],
	    child_node_type : "form",
	    //child_classes : ["form form-inline text-center input-lg"],
	    child_classes : ["col-md-4 col-md-offset-4 col-sm-8 col-sm-offset-2 form-horizontal"],
	    intro_stick : true,
	    //name_classes : ["col-sm-6"],
	    //item_classes : ["col-sm-6"]
	},

	elements : {

	    user: {
		type: "string",
		name : "",
		holder_value : "username or e-mail",
		ui_opts : {
		    type : "edit",
		    root_classes : ["input-group vertical_margin"],
		    label : true,
		    fa_icon : "user",
		    //name_classes : ["control-label col-sm-offset-1 col-sm-3"],
		    label_node : 'span',
		    name_classes : ["input-group-addon"],
		    //wrap : true,
		    //wrap_classes : ["col-sm-3 nopadding"]
		}
		
	    },
	    
	    password :{
		name : "",
		type : "password",
		ui_opts : {
		    type : "edit",
		    root_classes : ["input-group vertical_margin"],
		    label : true ,
		    fa_icon : "key",
		    //wrap : true,
		    label_node : 'span',
		    name_classes : ["input-group-addon"],
		    //name_classes : ["control-label col-sm-offset-1 col-sm-3"],
		    //item_classes : ["col-sm-3"]
		},
		
		holder_value : 'password'
		
	    },
	    /*
	    status :{
		type  : "string",
		value : "Logging in ...",
		ui_opts : {
		    root_element : "user",
		    item_classes : ["input-group-addon"],
		    //root_classes : ["form-group input-group inline"]
		}
	    },
*/
	    login : {
		name : "Log in !",
		type : "action",
		ui_opts : {
		    //item_root : true,
		    //root_element : "user",
		    //button_node : "span",
		    //name_node : "span",
		    //fa_icon : "link",
		    root_classes : ["vertical_margin"],
		    wrap : true,
		    wrap_classes : ["input-group-btn text-right"],
		    item_classes : ["btn btn-success"]
		}
	    },

	    // fb_login : {
	    // 	name : "Facebook log in",
	    // 	type : "action",
	    // 	ui_opts : {
	    // 	    item_classes : ["btn btn-primary"],
	    // 	    root_classes : ["form-group"]
	    // 	}
	    // }
	}
    },

    logout : {
	name : "Log out of Sadira...",
	intro : "Unknown login status",
	strings : {
	    intro1 : "confirm you want to disconnect from the Sadira network.",
	    intro2 : "You are not logged in.",
	    intro3 : "You are curently logged in as "
	},
	
	ui_opts : {
	    fa_icon : "sign-out",
	    intro_stick : true,
	    root_classes : ["container-fluid"]
	   
	},
	elements : {
	    logout_but : {
		name : "Log me out !",
		type : "action",
		ui_opts : { root_classes : ["text-center"], item_classes : ["btn btn-danger btn-lg"]}
	    }
	},

	widget_builder : function(ui_opts, logout){

	    var b=logout.get('logout_but');
	    function enable_logout(){
		logout.set_intro_text( '<p>'+ S(logout, 'intro3')+' <strong>'+window.sadira.user.id +'</strong>,' + S(logout,'intro1') + '</p>');
		b.disable(false);
	    }
	    function disable_logout(){
		b.disable(true);
		logout.set_intro_text(
		    S(logout,'intro2')
		);
	    }
	    
	    b.listen('click',function(){
		var rq=new request({ cmd : "/logout"});
		rq.execute(function(error, res){
		    if(error){
			logout.debug("Error logout : " + error);
			return;
		    }
		    
		    if(è(res.error))
			logout.debug(res.error);
		    else{
			window.sadira.user={};
			window.sadira.trigger('user_logout');
		    }
		});
		
	    });
	    
	    window.sadira.listen('user_login', function(user){enable_logout();});
	    window.sadira.listen('user_logout', function(user){
		console.log("Disable logout !");
		disable_logout();
	    } );
	    
	    window.sadira.user ? enable_logout() : disable_logout();

	}
    },
    
    marked : {
	name : "MD Text",
	type : "html"
    },

    signup : {
	name : "Create a new account",
	//subtitle : 
	intro : "<p>You can create a local sadira account or use one of the supported platforms providing your authentication for us.</p><p><strong>Choose a login method : </p></strong>",
	//ui_opts : { sliding  : true, slided : false },
	ui_opts : {
	    child_view_type : "pills",
	    root_classes : ["container-fluid"],
	    //name_classes : ["panel-heading"],
	    name_node : 'h2',
	    child_classes : ["container-fluid"],
	    intro_stick: true,
	    fa_icon : 'key'
	},

	elements : {

	    local : {
		name : "Local account",
		subtitle : "Create a new account locally.",
		intro : "<strong><p>Fill up the email and password fields to create your new user account.</p></strong><p><ul><li> Enter a valid email adress, it will be used to identify you.</li><li> You'll can configure a username later in your user page if you wish.</li><li> The password will be checked for basic strength.</li></ul></p>",

		ui_opts : {
		    //name_node : "h3",
		    fa_icon : "leaf",
		    root_classes : ["container-fluid"],
		    child_classes : ["container-fluid"],
		    intro_stick: true
		},
		elements : {
		    
		    data : {
			//name : "Fill up your data :",
			ui_opts : {
			    child_node_type : "form",
			    child_classes : ["form-horizontal container-fluid"],
			    root_classes : ["container-fluid"]
			},
			elements : {
			    
			    email : {
				//
				name : "Email address",
				type : "string",
				holder_value : "name@example.org",
				ui_opts : { type : "edit",
					    root_classes : ["form-group"],
					    label : true,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],
					    //item_classes :  ["col-sm-4"]
					    wrap : true,
					    wrap_classes : ["col-sm-4"]
					  }
			    },
			    password : {
				name : "New password",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true ,
					    wrap : true,
					    name_classes : ["control-label col-sm-offset-1 col-sm-3"],
					    wrap_classes : ["col-sm-4"]
					  }
			    },
			    password_repeat : {
				name : "Enter password again",
				type : "password",
				ui_opts : { type : "edit", root_classes : ["form-group"], label : true,
					    wrap : true,
					    name_classes :["control-label col-sm-offset-1 col-sm-3"],
					    wrap_classes : ["col-sm-4"] }
			    }
			    
			}
		    },
		    
		    action_panel : {
			ui_opts : { root_classes : ["col-md-12"], child_classes : []},
			elements : {

			    signup : {
				name : "Create new account",
				type : "action",
				ui_opts : {
				    //label: true,
				    //name_classes :["control-label","col-sm-3"],
				    //wrap : true,
				    //wrap_classes : ["col-md-6"],
				    //root_classes : ["col-md-offset-5 col-md-3"],
				    item_classes : ["btn btn-primary btn-lg"],
				    root_classes : ["text-center"],
				    //label_cnt_classes : ["col-sm-3","col-sm-offset-5"]
				}
			    },
			    status : {
				type : "html",
				value : "<p><strong>Congrats!</strong> You just created your account. Welcome.</p>",
				ui_opts : {root_classes : ["col-md-6"], item_classes : ["alert alert-info"], }
			    }

			}
		    }

		    
		}
	    },
	    
	    shib : {
		name : "IDEM signup",
		subtitle : "Signup using your IDEM-GARR account",
		ui_opts : {
		    //name_node : "h3",
		    fa_icon : "institution"
		},
		elements : {

		    signup : {
			name : "Signup !",
			type : "action"
		    }
		    
		}
		
	    },

	    fb : {
		name : "Facebook",
		subtitle : "Signup using your Facebook account",
		ui_opts : {
		    fa_icon : "facebook-official",
		    //name_node : "h3"
		},
		elements : {
		    signup : {
			name : "Signup !",
			type : "action",
			link : "/auth/facebook"
		    }
		}
	    },

	    google : {
		name : "Google",
		subtitle : "Signup using your Google account",
		ui_opts : {
		    name_node : "h3",
		    fa_icon : "google-plus"
		},
		elements : {
		    
		    signup : {
			name : "Signup !",
			type : "action",
			link : "/auth/google",
			ui_opts : { fa_icon : "google-plus" }
		    }
		}
	    }
		
	}
    },
    process : {
	name : "Process",
	elements : {
	    uptime : {
		name : "Uptime",
		type : "double"
	    },
	    memuse : {
		name : "Memory use",
		type : "bytesize"
	    }
	}
    },

    sysmon : {
	name : "Sadira system monitor",
	elements : {
	    cnx : {
		
		type : "sadira",
		name : "Link"
	    },
	    workers : {
		name : "Workers"
	    }
	}

    },
    vector : {
	name : "Vector view",
	ui_opts : {
	    // root_classes : ["container-fluid"],
	    //child_classes : ["container-fluid"]
	    item_classes : "vector_plot",
	    enable_range : false,
	    enable_selection : false
	},
	elements :{
	    btns : {
		store : false,
		ui_opts: { root_classes : ["inline"], child_classes : [] },
		elements : {
		    // zoom :   { name:  "", type : "action", ui_opts:{fa_icon : "search-plus", item_classes : ["btn btn-default btn-sm"]}},  
		    // unzoom : { name : "", type : "action", ui_opts:{item_classes:["btn btn-default btn-sm"], fa_icon : "search-minus",}},
		}
	    },

	    ctls: {
		ui_opts: {
		    root_classes : ["inline"],
		    child_classes : ["container-fluid"] },
		elements : {
	    	    range : {
			type : "labelled_vector",
			name : "Range",
			value_labels : ["from","to","zoom"],
			value : [0.0, 0.0, 0.0],
			ui_opts: {
			    root_classes : ["inline"], label : true, fa_icon : "arrows-h",//, sliding : true, slided: false
			    child_classes : ["inline"]
			},
		    },
		    selection : {
			type : "labelled_vector",
			name : "Selection",
			value_labels : ["start","end"],
			value : [0, 0],
			ui_opts: {root_classes : ["inline"], child_classes : ["inline"], label : true, fa_icon : "edit", sliding : true, slided: false},
		    },
		    lines : {
			name : "Plots",
			ui_opts : {
			    label : true,
			    child_classes : ["inline"],
			    sliding: true,
			    slided: true
			}
		    }
		}
	    }
	    /*
	    controls : {
	
		elements : {
		}
	    }
	    */
	}
    },
    dbtypes : {
	name : "Datatypes",
	subtitle : "Available sadira/tk datatypes",
	ui_opts : {root_classes : ["container-fluid"], child_classes : ["container"]},
	elements : {}
    },
    dbtemplates : {
	name : "Sadira widget templates",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    //child_view_type : ""
	},
	elements : {
	    build_progress : {
		name : "Building templates ... ",
		type : "progress", value : 0
	    }
	}
    },

    root_widget : {
	

    },
    
    sadira_home : {
	name : '<span style="color: springgreen;">ॐ</span> <strong> Sadira </strong>',
	ui_opts : {
	    root_classes : ["container-fluid left"],
	    //child_classes : ["container-fluid"],
	    child_view_type : "tabbed",
	    //name_node : "h4",
	    //name_classes : ["title_logo"],
	    
	    intro_stick : true,
	    child_toolbar : false,
	    toolbar_brand : true
	},

	toolbar : {
	    elements : {
		/*
		file_menu : {
		    name : "File",
		    elements : {
			open : { name : "Open"},
			load : { name : "Load"},
			close : { name : "Close"},
		    }
		},
		*/
		demos : {
		    name : "Demos",
		    elements : {
			xd1 : {
			    name : "XD-1",
			    type : "xd1",
			    link : true
			    
			},
			minispectro : {
			    name : "Minispectro",
			    type : "videocap",
			    link : true
			}
		    }
		},
		toolkit : {
		    name : "Web Toolkit",
		    elements : {
			demo : {
			    name : "Toolkit sandbox",
			    type : "ui_demo"
			},
			
			tuto : {
			    name : "Sadira Toolkit tutorial",
			    type : "stk_tutorial"
			},

			tlist : {
			    name : "Templates",
			    type : "dbtemplates"
			}
		    }
		},
		database : {
		    name : "Dev",
		    elements : {
			browser : {
			    name : "Database browser",
			    type : "db_browser"
			},
			sock_mgr : {
			    type : "socket_manager"
			},
			nunki : {
			    type : "nunki",
			    link : true
			}
		    }
		}
		/*,
		login : {
		    type : "login", name : "Login"
		}

		register : {
		    type : "signup", name : "Create account"
		}
*/


	    }
	},

	
	elements : {
	    welcome : {
		subtitle : "INAF/IASF-Bologna — <i>Astro-web-software </i>",
		name : "Sadira",
		type : "html",
		//intro : "",
		url : "/sadira/welcome.html",
		ui_opts : {
		    //in_root : 'prepend',
		    icon : "/sadira/icons/iasfbo.png",
		    //icon_size : "4em",
		    //root_classes : ["jumbotron"],
		  //  intro_stick : true,
		    //render_name : false,
		    //item_classes : ["row"]
		}
			  
	    },
	    
	    deps : {
		name : "Software deps",
		
		type : "soft_links",
		ui_opts : {item_classes : ["container-fluid"], name_node:"h2"}
	    }
	}
    },
    
    soft_tpl : {
	name : "SoftName",
	type : "url",
	ui_opts : {
	    root_classes : ["panel panel-default"],
	    name_classes : ["panel-heading"],
	    item_classes : ["panel-content"],
	    icon : "/sadira/icons/brands/nodejs.svg",
	    intro_stick : true,
	    //icon_size : "4em",
	    name_node : "div",
	    
	}
    },
    
    soft_links : {
	name : "Dependencies",
	subtitle : "Software used by Sadira",
	intro : "<p>This will contain description and links to all external libraries and software used within the Sadira project.</p>",
	ui_opts : {
	    root_classes : ["container-fluid"],
	    child_classes : ["list-group"],
	    intro_stick : true,
	    child_view_type : "table"
	},
	elements : {
	    node : {
		type : "soft_tpl",
		ui_opts : {
		    icon : "/sadira/icons/brands/nodejs.svg",
		},
		name : "Node.js",
		intro : "<p>Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.</p>",
		value : "https://nodejs.org/"
	    },
	    mongo : {
		 type : "soft_tpl",ui_opts : {icon : "/sadira/icons/brands/logo-mongodb.png"},
		name : "mongo DB",
		intro : "<p><strong>Agile and Scalable.</strong>MongoDB makes working with a database simple and elegant, providing agility and freedom to scale.</p>",
		value : "http://www.mongodb.org/"
	    }

	    
	}
	
	
    },

    ui_demo : {
	name : "Toolkit test", subtitle : "Sadira/Tk sandbox",
	intro : "<p>Write the template and builder code for your widget then try to run it</p>",
	ui_opts : {
	    root: true,
	    root_classes : ["container-fluid"],
	    child_classes : ["row"]
	},
	//toolbar : {},

	elements : {
	    code : {
		//name : "Widget source code",
		ui_opts : {
		    root_classes : ["col-md-6"],
		    child_classes : ["container-fluid"],
		    child_view_type : "tabbed"
		},
		elements : {
		    source : {
			name : "Source code",
			ui_opts : {child_view_type : "tabbed"},
			elements : {
			    template : {
				name : "Template",subtitle : "Edit source code (in JavaScript for simplicity)",
				type : "code",
				default_value : '{\n\ttype : "hello",\n\tname : "Hello",\n\tsubtitle : "Hello Sadira/Tk!",\n\t elements : {\n\t\tbtn : {\n\t\t\ttype : "action",\n\t\t\tname : "Click me !"\n\t\t},\n\t\ttext : {\n\t\t\tname : "Result :",\n\t\t\t type : "string"\n\t\t}\n\t}\n}',
				
				//default_value: '{}',
				ui_opts : {
				    type : "edit",
				    root_classes : ["container-fluid"],
				    highlight_source : true
				}
			    },
			    builder : {
				name : "Template builder",subtitle : "Edit your widget builder source code",
				type : "code",
				default_value : 'function(ui_opts, hello_tpl){\n\thello_tpl.get("btn").listen("click", function(){\n\t\thello_tpl.get("text").set_value("Hello World!");\n\t});\n }',
				ui_opts : {
				    type : "edit",
				    root_classes : ["container-fluid"],
				    
				    highlight_source : true
				}
			    },
			    widget : {
				name : "Choose an existing widget to start with :",
				ui_opts: {
				    type : "edit",//,
				    label : true,
				    in_root: "prepend",
				    root_classes : ["container-fluid"],child_classes : ["form-group input-group"]
				},
				elements :{
				    tlist : {
					//name : "Choose:",
					type : "template_list",
					//type : "string",
					ui_opts : {
					    type : "edit",
					    item_classes : [],
					    //style:"menu",
					    text_node : "span",
					    label : true,
					    item_root : true,
					}
				    },
				    tpl_set : {
					type : "action",
					name : "Set template in editor",
					ui_opts : {
					    button_node : "span",
					    item_classes : ["btn btn-info "], fa_icon : "play",
					    //item_root : true,
					    root_classes : ["input-group-btn"]
					}
				    }
				}
			    },
			    
			}
		    },
	    	    compile : {
			name : "Compilation",
			ui_opts : {
			    root_classes : ["container-fluid"],
			    child_classes : ["container-fluid"],
			},
			elements : {
			    build : {
				name : "Build/rebuild widget",
					type : "action",
				ui_opts : {item_classes : ["btn btn-primary"], item_root : true}
			    },
			    status : {
				ui_opts : {
				    root_classes : ["well row"], label:true
				},
				type : "string",
				name : "JS compile"
			    },
			    build_status : {
				ui_opts : { root_classes : ["well row" ], label:true},
				type : "string",
				name : "Widget build"
			    }
			}
			
		    },
		    
		}
	    },

	    view : {
		name : "Your widget",
		ui_opts : {
		    root_classes : ["col-md-6 "],
		    child_classes : ["container-fluid panel panel-default"],
		}
		
	    }

	}


    },

    colormap : { 
	name : "Colormap",
	subtitle : "Buggy!",
	intro : "<br/><br/><p class='alert alert-warning'><strong>This is buggy, sorry !</strong>Need rewrite. New version will offer a list of «common» colormaps for straight use and user colormaps will be stored in webstorage.</p>",
	ui_opts : {
	    type : "edit",
	    //editable : true,
	    root_classes : ["container-fluid"],
	    item_classes : []
	    //mini_elm : "cmap"
	    
	},
	// value : [[0,0,0,1,0],
	// 	      [0.8,0.2,0.8,1.0,0.2],
	// 	      [0.9,0.9,0.2,1.0,0.2],
	// 	      [0.9,0.9,0.2,1.0,0.5],
			// 	      [0.9,0.2,0.2,1.0,0.5],
	// 	      [1,1,1,1,1]] },
	
	
	value : [[0,0,0,1,0],
		 [0.7,0.2,0.1,1.0,0.2],
		 [0.8,0.9,0.1,1.0,0.6],
		 [1,1,1,1,1]],

	elements : {
	    select : {
		name : "Select colormap",
		type : "combo",
		ui_opts : { label : true}
	    }
	}
    },
};

var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

if(nodejs)
    module.exports=base_templates;
