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
    // 	console.log("Setting template data for " + data.name + " data" + JSON.stringify(data));
    // 	console.log(t.name + "."+t.type+" : setting template data...");
	//console.log("Deserialize found for ["+data.value+"] to ["+t.name+"] ");
    // 	for(var p in t)
    // 	    console.log("Prop " + p);
    // }
	//

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
    if(è(data.db)){
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
			no.build();
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
    if(this.templates[tname]===undefined)
	this.templates[tname]=template;
    else{
	update_template(this.templates[tname],template);
    }
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
    var ui;
    var tpl_node=this;
    var opts=opts_in===undefined? {}:opts_in;
    if(tpl_node.builders!==undefined){
	var nb=0;
	var bl=tpl_node.builders.length;

	if(opts.object===true)
	    tpl_node.builders.forEach(function(b){
		var bui=b.call(tpl_node,tpl_node);
		if(ui === undefined) ui=bui;
		nb++;
		
	    });
	else
	    tpl_node.builders.forEach(function(b){
		var bui=b.call(tpl_node,opts, tpl_node);
		if(ui === undefined) ui=bui;
		nb++;
		
	    });
    }
    return ui;
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

    }else
	obj=this.build_object(data.type,isobject);

    
    console.log("Create from data " + obj.type + " name " + obj.name + " DATA ["+JSON.stringify(data)+"]");
    //console.log("Create from data object type " + data.type + " name " + data.name);
    //obj.build();
    if(typeof window !== 'undefined')
	create_ui({},obj);
    else obj.build({object:true});
    
    set_template_data(obj, data);
    return obj;
}


local_templates.prototype.create_object=function(template, cb){
    var tmaster=this;
    var app=this.app;
    //console.log("create tpl "+template+"pname = " + typeof this);
    //for(var k in Object.keys(this)) console.log("tmk " + k + " v=" + this[k]);

    if(template===undefined){
	if(cb!==undefined) return cb(null, new template_object());
	else return new template_object();
    }

    //var obj=this.build_template(template);
    var obj=this.build_object(template, true);

    function build_elements(t, cb){
	if(cb===undefined) cb=function(e){
	    if(e) console.log("Unhandled build_elements error " + e);
	}

	//tmaster.common_builder(t);

	function build_childs(cb){
	    if(t.object_builder!==undefined)
		t.object_builder(t,app);
	    if(t.elements!==undefined){
		var ne=Object.keys(t.elements).length;
		for(var e in t.elements){
		    build_elements(t.elements[e],function(er){
			if(er) return cb(er);
			ne--;
			//console.log("Building child " + e + "ne = " + ne) ;

			if(ne===0) cb(null);
		    });
		}
	    }else cb(null);
	}
	if(è(tmaster.object_builder)){
	    tmaster.object_builder(t, function(e){
		if(e) return cb(e);
		build_childs(cb);
	    });
	}else
	    build_childs(cb);


    }
    build_elements(obj,cb);
    return obj;
}


local_templates.prototype.update_template=function(tpl_item, tpl){
    var toup=["ui_opts"];
    var me=this;
    //console.log("update template item " + tpl_item.type + " base " + tpl.type + " templ " + tpl.toString());
    for(var ti=0;ti< toup.length;ti++){
	var t=toup[ti];
	//console.log(tpl_item.name + " : Check " + t + " typof " + typeof tpl_item[t] );

	if(typeof tpl[t]!='undefined'){
	    if(typeof tpl_item[t]=='undefined')
		tpl_item[t]=clone_obj(tpl[t]); //tpl[t];
	    //else
	    for(var o in tpl[t]){
		//console.log(tpl_item.name + " : Checking to add child " + o + " name " + tpl[t][o].name + " type " + tpl[t][o].type);
		if(tpl_item[t][o]===undefined){
		    tpl_item[t][o]=clone_obj(tpl[t][o]);

		}
		//else this.update_template(tpl_item[t][o], tpl[t][o]);

	    }

	    //for(var e in tpl_item[t]) console.log(tpl_item.name + " CHILD " + e );
	}
    }
    var t='elements';
    if(typeof tpl[t]!='undefined'){
	if(typeof tpl_item[t]=='undefined')
	    tpl_item[t]=clone_obj(tpl[t]); //tpl[t];
	for(var o in tpl[t]){
	    if(tpl_item[t][o]===undefined){
		tpl_item[t][o]=clone_obj(tpl[t][o]);
		
	    }
	}
    }

    

    for(var o in tpl){// Object.keys(tpl)){
	//console.log("PRoc " + o);
	switch(o){
	case "name" : if(tpl_item.name===undefined) tpl_item.name=tpl.name; break;
	case "subtitle" : if(tpl_item.subtitle===undefined) tpl_item.subtitle=tpl.subtitle; break;
	case "intro" : if(tpl_item.intro===undefined) tpl_item.intro=tpl.intro; break;
	case "elements" : break;
	case "ui_opts" : break;
	case "widget_builder" :
	    if(tpl_item.builders===undefined)
		tpl_item.builders=[tpl.widget_builder];
	    else
		tpl_item.builders.push(tpl.widget_builder);
	    //if(tpl_item.type=='sspec')
	    //console.log("Added base builder " + tpl.widget_builder.toString());
	    break;
	case "type":
	    //tpl_item.type=tpl.type; break;

	    if(tpl_item.type===undefined){
		tpl_item.type=tpl.type;
	    }else{
		//tpl_item.btype=tpl.type;
	    }
	    break;
	default:
	    tpl_item[o]=clone_obj(tpl[o]);
	    break;
	}
    }

    var t=template_ui_builders[tpl_item.type];

    if(t!==undefined){
	if(tpl_item.builders===undefined)
	    tpl_item.builders=[t];
	else
	    tpl_item.builders.push(t);
    }


    // if(tpl_item.widget_builder!==undefined){
    // if(tpl_item.builders===undefined)
    //     tpl_item.builders=[tpl_item.widget_builder];
    // else
    //     tpl_item.builders.push(tpl_item.widget_builder);
    // //if(tpl_item.type=='sspec')
    // //console.log("Added last child builder " + tpl_item.widget_builder.toString());
    // }


    //console.log("Subst templates for "+tpl_item.name +" [" + tpl_item.type + "] btype ["+tpl_item.btype+"] tpl name is " + tpl.name );
}

local_templates.prototype.substitute_template=function(tpl_item){
    var loct=this;
    //console.log("Substitute " + tpl_item.name + " type " + tpl_item.type);
    if(tpl_item===undefined) return true;

    var tname=tpl_item.type;
    if(tname===undefined) tname=tpl_item.tname;


    if(tname!==undefined){
	if(tpl_item.type==="template"){
	    throw "deprecated [template] type ! (name=["+tpl_item.name+"])";
	}

	var tpl=this.templates[tname];
	var tpl_tree=[];//, tname=tpl_item.type;

	while(tpl!==undefined) {
	    tpl.tname=tname;
	    tpl_tree.unshift(tpl);

	    if(tpl.type!==undefined){
		tpl=this.templates[tpl.type];
		tname=tpl.type;
	    }else tpl=undefined;
	}
	tpl_tree.forEach(function(tpl){
	    //console.log(tpl_item.name + " updating  from tpl " + tpl.type);
	    loct.update_template(tpl_item, tpl);
	});
    }



    // tpl=this.templates[tpl_item.type];
    // if(tpl!==undefined) {
    // //console.log("Subst templ type " + tpl_item.type);
    // this.update_template(tpl_item, tpl);
    // }

    //console.log("Subst templ DONE");
    return true;
}

local_templates.prototype.substitute_templates=function(tpl){
    // if(tpl.type=="double")
    //console.log(tpl.name + " : Subst Tpl : " + tpl.type);

    if(tpl===undefined) return undefined;
    this.substitute_template(tpl);
    for (var e in tpl.elements){
	this.substitute_templates(tpl.elements[e]);
    }
    if(è(tpl.toolbar)){
	for(var tbi in tpl.toolbar){
	    this.substitute_templates(tpl.toolbar[tbi]);
	}
    }
    return tpl;
}


local_templates.prototype.build_template=function(template){

    var tpl;

    if(typeof template === 'string'){

	var master_tpl=this.templates[template];
	if(master_tpl===undefined) throw "Unknown template ["+template+"]";
	//tpl=clone_obj(master_tpl);
	//console.log("Building template " + template);
	tpl=new template_object();
	tpl.type=template;

	for(var key in master_tpl){

	    if (master_tpl.hasOwnProperty(key))
		tpl[key] = clone_obj(master_tpl[key]);

	    //console.log("copy key " + key + " : " + tpl[key] );

	}
	if(tpl === undefined)
	    throw "Unknown template " + template;

	// if(tpl.type!==undefined){
	//     //console.log("got type " + tpl.type + " ==? " + template);
	//     if(tpl.type !== template){
	// tpl.btype=tpl.type;
	// tpl.type=template;
	// //console.log("Ok got types " + tpl.type + " and " + tpl.btype);
	//     }
	// }else tpl.type=template;
    }else{
	//console.log("Template is an object " + typeof template + " : " + JSON.stringify(tpl));
	tpl=template;
    }

    this.substitute_templates(tpl);
    
    return tpl;
}



// local_templates.prototype.create_object=function(template, cb){

//     if(template===undefined){
//     	if(cb!==undefined) return cb(null, new template_object());
//     	else return new template_object();
//     }
    
//     var tmaster=this;
//     var app=this.app;

//     if(cb===undefined)
// 	cb=function(e){
// 	    if(e!==null){
// 		console.log("Error : " + e);
//     		throw e;
// 	    }
// 	}
    
//     try{
// 	console.log("Building template ... ");
// 	var obj = tmaster.build_object(template);
// 	console.log("Building template ... done ");
// 	obj.build();
// 	console.log("Constr template ... done ");
// 	cb(null, obj);
// 	console.log("Callabck call ... done ");
// 	return obj;
//     }
//     catch (e){
// 	cb(e);
// 	return null;
//     }


local_templates.prototype.build_object=function(template, is_object){

    if(template===undefined) throw Error("No template given");

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
		if(typeof(obj) != 'object')
		    struct[p]=obj;
		else{
		    //if(p==='ui_opts')	console.log(struct.name + " ui_opts "+ JSON.stringify(struct[p],null,5) +" update with "+JSON.stringify(obj,null,5));
			
		    
		    if(struct[p]!==undefined){

			update_structure(struct[p],obj, false, is_object);
		    }else
			struct[p]=clone_obj(obj);
		}
	    }
	}
    }
    
    if(tpl_types.length>0){
	var ttype=tpl_types[0];
	if(this.templates[ttype] === undefined) throw Error("Undefined template ["+ttype+"]");
	for(var tpl=this.templates[ttype];tpl!==undefined;tpl=this.templates[ttype]){
	    tpl_tree.unshift([ttype,tpl]); ttype=tpl.type;
	}
    }
    
    tpl_tree.forEach(function(tpl){
	//console.log(" updating  from tpl " + JSON.stringify(tpl));
	update_structure(object, tpl[1], true, is_object); //loct.update_template(tpl_item, tpl);


	if(tpl[1].type===undefined && is_object===undefined){
	    var tub=template_ui_builders[tpl[0]];
	    if(tub!==undefined){
		add_builder(object, tub);
	    }
	}
	
	
    });

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
