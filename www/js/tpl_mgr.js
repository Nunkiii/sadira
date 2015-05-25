

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

function get_template_data(t){
    var data={};
    if(è(t.type)) data.type=t.type;
    if(è(t.name)) data.name=t.name;
    if(è(t.db)){
	if(Object.keys(t.db).length>0)
	    data.db=t.db;
    }
    if(è(t.value)) data.value=t.value;
    if(è(t.elements)){
	data.els={};
	for(var te in t.elements)
	    data.els[te]=get_template_data(t.elements[te]);
    }
    return data;
}

function set_template_data(t, data){
    //console.log("Setting template data for " + t + " data" + JSON.stringify(data));
    //console.log("Setting template data for " + t.name);
    if(è(data.value)){
	//console.log("Setting value ["+data.value+"] to ["+t.name+"] ");
	if(t.set_value)
	    t.set_value(data.value);
	else
	    t.value=data.value;
	
    }
    if(è(data.name)){
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
    if(è(data.els)){
	if(t.elements===undefined)t.elements={};
	for(var te in data.els){

	    if(t.elements[te]===undefined){
		if(data.els[te].type!==undefined){
		    if(window===undefined)
			t.elements[te]=create_object(data.els[te].type);
		    else{
			var w=create_widget(data.els[te].type);
			t.add_child(w, te);
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

local_templates.prototype.update_template=function(tpl_item, tpl){
    var toup=["elements","ui_opts"];
    
    for(var ti=0;ti< toup.length;ti++){
	var t=toup[ti];
	//console.log("Check " + t + " typof " + typeof tpl_item[t] );
	
	if(typeof tpl[t]!='undefined'){
	    if(typeof tpl_item[t]=='undefined')
		tpl_item[t]=clone_obj(tpl[t]); //tpl[t];
	    else
		for(var o in tpl[t]){
		    if(typeof tpl_item[t][o]=='undefined')tpl_item[t][o]=clone_obj(tpl[t][o]);//tpl[t][o]; //
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
	case "type":
	    if(tpl_item.type===undefined){
		tpl_item.type=tpl.type;
	    }else{
		tpl_item.btype=tpl.type;
	    }
	    break;
	default:
	    tpl_item[o]=clone_obj(tpl[o]);
	    break;
	}
    }

    //console.log("Subst templates for "+tpl_item.name +" [" + tpl_item.type + "] btype ["+tpl_item.btype+"] tpl name is " + tpl.name );
}

local_templates.prototype.substitute_template=function(tpl_item){
    //console.log("Substitute " + tpl_item.name + " type " + tpl_item.type);
    if(tpl_item===undefined) return true;

    if(tpl_item.type!==undefined){
	if(tpl_item.type==="template"){
	    throw "deprecated [template] type ! (name=["+tpl_item.name+"])";
	}
    }

    
    var tpl=this.templates[tpl_item.btype];
    if(tpl!==undefined) {
	//console.log("Subst templ brype " + tpl_item.btype);
	this.update_template(tpl_item, tpl);
    }

    
    tpl=this.templates[tpl_item.type];
    if(tpl!==undefined) {
	//console.log("Subst templ type " + tpl_item.type);
	this.update_template(tpl_item, tpl);
    }

    //console.log("Subst templ DONE");
    return true;
}

local_templates.prototype.substitute_templates=function(tpl){
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

local_templates.prototype.common_builder=function(obj){
    var lt=this;

    obj.get=function(n){ return get(obj,n); };
    obj.add=function(key,child){return add(this,key,child);};
    obj.set=function(child,value){
	var c=get(this,child);

    if(c!==undefined)c.value=value;
	else throw obj.name +" : cannot set value: child [" + child + "] not found!"
	return this;
    };

    obj.val=function(child){
	var c=get(this,child);
	if(c!==undefined)return c.value;
	throw obj.name +" : cannot get value: child [" + child + "] not found!"
    };
    
    obj.add_link=function(linko){
	
	if(linko.db!==undefined && linko.type!==undefined){
	    var id=linko.db.id;
	    if(id!==undefined){
		var o=this.add(id,lt.create_object(linko.type));
		o.db={ id : id, link : true};
		return o;
	    }
	}
	console.log("Error creating link !");
	return undefined;
    };
    
    new_event(obj, "server_data");
    
}


function template_object(){}


local_templates.prototype.create_object_from_data=function(data){

    // if(data===null){
    // 	console.log("NULL DATA !!!????");
    // 	return null;
    // }
    var obj=create_object(data.type);
    console.log("Create from data " + obj.type + " name " + obj.name);

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
    
    var obj=this.build_template(template);

    function build_elements(t, cb){
	if(cb===undefined) cb=function(e){
	    if(e) console.log("Unhandled build_elements error " + e);
	}
	tmaster.common_builder(t);
	
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

local_templates.prototype.build_template=function(template){

    var tpl;

    if(typeof template === 'string'){ 
	
	var master_tpl=this.templates[template];
	//tpl=clone_obj(master_tpl);
	//console.log("Building template " + template);
	tpl=new template_object();

	for(var key in master_tpl){
	    
            if (master_tpl.hasOwnProperty(key))
		tpl[key] = clone_obj(master_tpl[key]);

	    //console.log("copy key " + key + " : " + tpl[key] );
	    
	}
	if(tpl === undefined) 
	    throw "Unknown template " + template;

	if(tpl.type!==undefined){
	    //console.log("got type " + tpl.type + " ==? " + template);
	    if(tpl.type !== template){
		tpl.btype=tpl.type;
		tpl.type=template;
		//console.log("Ok got types " + tpl.type + " and " + tpl.btype);
	    }
	}else tpl.type=template;
    }else{
	//console.log("Template is an object " + typeof template + " : " + JSON.stringify(tpl));
	tpl=template;
    }

    this.substitute_templates(tpl);

    return tpl;
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
