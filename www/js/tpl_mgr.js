// Global object base of all ui template constructors. (To remove..)

template_ui_builders={};


/*
  Template base functions
*/

//console.log("Adding get to " + tpl_root.name);
function get(tpl, name){
  for(var e in tpl.elements){
      //console.log(tpl.type + "["+tpl.name+ "] : looking child  [" + e + "] for name ["+name+"]");
	if(e===name)
	    return tpl.elements[e];
    }
    for(var e in tpl.elements){
	try{
	    var n=tpl.elements[e].get(name);
	    if(n) return n;
	}
	catch(err){
	    //console.log("Error looking for [" + e + "] in [" + tpl.name + "] : " + err);
	}
    }
    //console.log(tpl.name+ " : looking child  [" + e + "] for name ["+name+"] : NOT FOUND!");
    return undefined;
}
function add(tpl, key, child){
    if(tpl.elements===undefined) tpl.elements={};
    tpl.elements[key]=child;
    return tpl;
}

function set(tpl, name, value){
    
}

function copy_object(src, cb){
    var dest=build_object(src);
    cb(null, dest);
    
}

function get_template_data(t){
    var data={};
    if(è(t.type)) data.type=t.type;
    if(è(t.name)) data.name=t.name;
    if(è(t.db)){
	if(Object.keys(t.db).length>0)
	    data.db=t.db;
    }
    if(è(t.value)){
	if(t.serialize!==undefined)
	    data.value=t.serialize();
	else
	//console.log("store  value " + t.value);
	    data.value=t.value;
    }
    if(è(t.serialize_fields)){
	data.fields={};
	t.serialize_fields.forEach(function(f){
	    data.fields[f]=clone_obj(t[f]);
	});
    }
      
    if(è(t.elements) && t.serialize_childs!==false){
	data.els={};
	for(var te in t.elements){
//	    if(t.elements[te].nodeName!==undefined){
	    //console.log("store  " + te);
	    //	    }else
	    
	    var e=t.elements[te];
	    if(e.store===undefined || e.store===true)
		data.els[te]=get_template_data(e);
	}
    }

    //console.log(JSON.stringify(data,null,5));
    return data;
}

function set_template_data(t, data){
    // if(t.type==='combo'){

    // console.log("Setting template data for " + data.name + " data" + JSON.stringify(data));
    // 	console.log(t.name + "."+t.type+" : setting template data...");
    // 	console.log("Deserialize found for ["+data.value+"] to ["+t.name+"] ");
    // 	for(var p in t)
    // 	    console.log("Prop " + p);

    //    }

    if(t.deserialize!==undefined){

	t.deserialize(data.value);
    }else{
	
	if(è(data.value)){
	    
	    if(t.set_value!==undefined){
		//console.log("Setting value ["+data.value+"] to ["+t.name+"] ");
		t.set_value(data.value);
	    }
	    else{
		//console.log(t.name + " NO SET_VALUE setting value to " + data.value);
		t.value=data.value;
	    }
	}
    }

    if(è(data.name)){
	
	if(t.set_title!==undefined)
	    t.set_title(data.name);
	else
	    t.name=data.name;
    }
    
    if(t.db===undefined)t.db={};
    if(data.db !== undefined){
	for(var te in data.db){
	    t.db[te]=data.db[te];
	}
    }		
    if(è(data._id)){
	t.db.id=data._id;
    }
    if(è(data.fields)){
	for( var f in data.fields){
	    t[f]=clone_obj(data.fields[f]);
	};
    }
    
    if(è(data.els)){
	if(//t.type==='container' ||
	   t.elements===undefined)t.elements={};
	for(var te in data.els){
	    
	    if(t.elements[te]===undefined){
		//console.log(t.name + "." + t.type +" : read data for " + te + " : still undefined.." );
		if(data.els[te].type!==undefined){
		    
		    if(typeof window !== 'undefined'){
			var w=create_widget(data.els[te].type, t);

			if(t.add_child===undefined){
			    console.log("Bug here for " + t.name + " type " + t.type);
			    t.elements[te]={};
			}else
			    t.add_child(w, te);
		    }
		    else{
			var no=build_object(data.els[te].type, true);
			no.build({recurse : true});
			//t.add_child(no, te);
			t.elements[te]=no;
			//t.elements[te]=create_object(data.els[te].type);
		    }
		    
		}else
		    t.elements[te]={};
	    }
	    //console.log("Setting child data for [" + te + "] object is" + t.elements[te]);
	    set_template_data(t.elements[te],data.els[te]);
	}
    }

    new_event(t,"data_loaded");
    t.trigger("data_loaded",data);

    return t;
}


function encode_data_structure(t){
}


var local_templates=function(app){
    this.templates={};
    this.app=app;
}


function update_template(tpl, uptpl){
    for (var e in uptpl){
	if( tpl[e] !== undefined){
	    if( typeof tpl[e] === 'object')
		update_template(tpl[e],uptpl[e]);
	    else
		tpl[e]=uptpl[e];
	}
	else {
	    tpl[e]=uptpl[e];
	}
    }
}

local_templates.prototype.set_template=function(tname, template){
//    if(this.templates[tname]===undefined)
	this.templates[tname]=template;
  
  // else{
  // 	update_template(this.templates[tname],template);
  //   }
}

local_templates.prototype.add_templates=function(templates){
    for(var tname in templates){
	this.set_template(tname,templates[tname]);
    }
}

local_templates.prototype.get_master_template=function(template_name){
  return this.templates[template_name];
}


function add_builder(struct, builder){
    if(builder===undefined) return;
    if(struct.builders===undefined){ struct.builders=[builder]; return; }
    var bi=0,bl=struct.builders.length;
    for(bi=0;bi<bl;bi++) if(struct.builders[bi]===builder) return;
    struct.builders.push(builder);
}


function template_object(){
    new_event(this, "server_data");
    //add_builder(this,local_templates.prototype.common_builder);
}


template_object.prototype.path=function(){
    var o=this; var path=o.key;
    for(o=o.parent;o!==undefined ; o=o.parent){
	if(o.key!==undefined){
	    //console.log(" k + " + o.key);
	    
	    path=o.key+"."+path;
	}else{
	    if(o.name!==undefined && o.parent===undefined)
		path=o.name+"."+path;
	}
    }
    return path;
}

template_object.prototype.get=function(n){ return get(this,n); };

template_object.prototype.get_parent=function(pname){
    if(pname===undefined) return this.parent;
    var p=this.parent;
	
    while(p!==undefined && p.parent!==undefined){
	if(p.parent.elements[pname]!==undefined)
	    return p.parent.elements[pname];
	p=p.parent;
    }
    return p;
};

template_object.prototype.add=function(key,child){return add(this,key,child);};
template_object.prototype.set=function(child,value){
    
    var c=get(this,child);
    if(c!==undefined){
	//console.log("set value of " + c.name + " : " + value);
	
	if(c.set_value!==undefined)
	    c.set_value(value);
	else c.value=value;
    }
    else throw this.name +" : cannot set value: child [" + child + "] not found!"
    return this;
};

template_object.prototype.val=function(child){
    var c=get(this,child);
    if(c!==undefined)return c.value;
    throw this.name +" : cannot get value: child [" + child + "] not found!"
};

template_object.prototype.add_link=function(linko){
    
    if(linko.db!==undefined && linko.type!==undefined){
	var id=linko.db.id;
	if(id!==undefined){
	    var o=this.add(id,create_object(linko.type));
	    o.db={ id : id, link : true};
	    return o;
	}
    }
    console.log("Error creating link !");
    return undefined;
};


template_object.prototype.build=function(opts_in){
    //console.log(this.name + " t " + this.type + " build ");

    var ui;
    var tpl_node=this;
    var opts=opts_in===undefined? {}:opts_in;
    
    if(opts.recurse===true){
	for(var e in this.elements)
	    this.elements[e].build(opts);
    }
    if(tpl_node.builders!==undefined){

	var nb=0;
	var bl=tpl_node.builders.length;

	//console.log(this.name + " t " + this.type + " build NB=" + bl);
	
	if(opts.object===true)
	    tpl_node.builders.forEach(function(b){
		//console.log("Exec builder " + b.toString());
		var bui=b.call(tpl_node,tpl_node);
		if(ui === undefined) ui=bui;
		nb++;
		
	    });
	else
	    tpl_node.builders.forEach(function(b){
		//console.log("Exec Widget builder " + b.toString());
		var bui=b.call(tpl_node,opts, tpl_node);
		if(ui === undefined) ui=bui;
		nb++;
		
	    });
    }
    return ui;
}


local_templates.prototype.create_objects_from_data=function(data){
    var lt=this;
    var nd=data.length;
    var objects=[];
    data.forEach(function(d){
	objects.push(lt.create_object_from_data(d));
    });
    return objects;
}

local_templates.prototype.create_object_from_data=function(data){

    if(data===null){
    	console.log("NULL DATA !!!????");
    	return null;
    }

    var obj;
    var isobject= (typeof(window) === 'undefined');

    
    if(data.type===undefined){
	obj=this.build_object({},isobject);
	//throw Error("Cannot build object from data name ["+data.name+"]: Not a template");
	
    }else{
	
	obj=this.build_object(data.type,isobject);
    }

    
    //console.log("Create from data " + obj.type + " name " + obj.name + " DATA ["+JSON.stringify(data)+"]");
    //console.log("Create from data object type " + data.type + " name " + data.name);
    //obj.build();
    
    
    if(typeof window !== 'undefined')
	create_ui({},obj);
    else{
	//console.log("Building " + obj.type);
	obj.build({object:true, recurse : true});
    }
    
    set_template_data(obj, data);
    
    return obj;
}


local_templates.prototype.create_object=function(template, cb){
    var tmaster=this;
    var app=this.app;
    //console.log("create tpl "+template+"pname = " + typeof this);
    //for(var k in Object.keys(this)) console.log("tmk " + k + " v=" + this[k]);
    var obj=this.build_object(template, true);
    
    //console.log("Build object " + obj.name + " type " + obj.type);
    obj.build({object:true, recurse: true});
    return obj;
    
}


local_templates.prototype.build_object=function(template, is_object){

    if(template===undefined)
	throw Error("No template given");

    if(is_object===undefined) is_object=false;

    var last_structure;
    var tpl_types=[];
    var object= new template_object(); 
    var lt=this;
    var tpl_tree=[];
    
    if(typeof template === 'string'){
	tpl_types.push(template);
	object.type=template;
    }else{
	tpl_tree.unshift([template.type,template]); 
	//tpl_tree.unshift(template);
	if(template.type!==undefined){
	    
	    tpl_types.push(template.type);
	}
    }
    
    
    function update_structure(struct, tpl, root, is_object){
	
	for(var p in tpl){

	    var obj=tpl[p];
	    //console.log("update structure property " + p);
	    
	    switch(p){
	    case 'type':
		struct.type=obj;
		if(root && is_object===false)
		    add_builder(struct,template_ui_builders[obj]);

		break;
	    case 'elements' :
		if(root){
		    if(struct[p]===undefined) struct[p]= {}; //new template_object();
		    for(var c in obj){
			//console.log("Child " + c + " = " + obj[c] + " obj is " + JSON.stringify(obj));
			
			var child=obj[c];
			if(child!==undefined){
			    if(struct.elements[c]===undefined) struct.elements[c]=new template_object();
			    if(child.type!==undefined){
				//console.log("Building child " + c + ' substruct ' + JSON.stringify(child));
				struct.elements[c]=lt.build_object(child, is_object);
				//console.log("After building child " + c + ' substruct ' + JSON.stringify(child));
			    }else
				update_structure(struct.elements[c], child, true, is_object);
			    
			}else{
			    console.log(tpl.name + "["+tpl.type+"] Strange element " + c + " undef !");
			}
			
			//console.log("AFTER Child " + c + " = " + obj[c] + " obj is " + JSON.stringify(obj));
			
		    }
		}
		break;
	    case 'widget_builder' :
		if(root && is_object===false)
		    add_builder(struct,obj);
		break;
	    case 'object_builder' :
		if(root && is_object===true)
		    add_builder(struct,obj);
		break;
	    default:
		if(typeof(obj) != 'object'){
		    struct[p]=obj;
		}
		else{
		    //console.log(p + " COPY  type " + typeof(obj) + " str[p]=" + struct[p]);

		    //if(p==='ui_opts')	console.log(struct.name + " ui_opts "+ JSON.stringify(struct[p],null,5) +" update with "+JSON.stringify(obj,null,5));
			
		    
		    if(struct[p]!==undefined){

			update_structure(struct[p],obj, false, is_object);
		    }else
			struct[p]=clone_obj(obj);
		}
	    }
	}

	//console.log("Updated structure " + struct.name +" tpl name " + tpl.name + " type " + struct.type + "TPL " + JSON.stringify(tpl));
    }
    
    if(tpl_types.length>0){
	var ttype=tpl_types[0];
	if(this.templates[ttype] === undefined) throw Error("Undefined template ["+ttype+"]");
	for(var tpl=this.templates[ttype];tpl!==undefined && ttype!==undefined;tpl=this.templates[ttype]){
	    tpl_tree.unshift([ttype,tpl]); ttype=tpl.type;
	}
    }
 
    
    //console.log(object.type + " build NT=" + tpl_tree.length);

    tpl_tree.forEach(function(tpl){
	//console.log("API build  template " + tpl[0] + " with " + JSON.stringify(tpl[1]));
	//console.log(" updating  from tpl " + tpl[0]);
	update_structure(object, tpl[1], true, is_object); //loct.update_template(tpl_item, tpl);


	if(tpl[1].type===undefined && is_object===false){
	    //console.log("Looking for builder for " + tpl[0]);
	    var tub=template_ui_builders[tpl[0]];
	    if(tub!==undefined){
		add_builder(object, tub);
	    }
	}
	
	
    });

    if(this.object_builder!==undefined){
	add_builder(object, this.object_builder);
    }

    if(this.widget_builder!==undefined){
	add_builder(object, this.widget_builder);
    }

    //console.log(object.name + " t " + object.type + " nb " + object.builders.length );
    
    function set_keys(o,k){
	o.key=k;
	if(o.elements)
	    for(var k in o.elements)
		set_keys(o.elements[k],k);
    }
    set_keys(object);
    
    return object;
}


var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

if(nodejs){
    module.exports.local_templates=local_templates;
    module.exports.template_object=template_object;
    
    GLOBAL.get_template_data=get_template_data;
    GLOBAL.set_template_data=set_template_data;
    GLOBAL.get=get;
    GLOBAL.add=add;
    
}
