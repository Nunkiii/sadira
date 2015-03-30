

/*
  Template base functions
*/

//console.log("Adding get to " + tpl_root.name);
function get(tpl, name){
    for(var e in tpl.elements){
	//console.log(tpl.name+ " : looking child  [" + e + "] for name ["+name+"]");
	if(e===name)
		return tpl.elements[e];
    }
    for(var e in tpl.elements){
	try{
	    var n=tpl.elements[e].get(name);
	    if(n) return n;
	}
	catch(err){
	    console.log("Error looking for [" + e + "] in [" + tpl.name + "] : " + err);
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
    if(è(t.value)) data.value=t.value;
    if(è(t.type)) data.type=t.type;
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
    if(è(data.value)) t.value=data.value;
    if(è(data._id)){
	if(t.db===undefined)t.db={};
	t.db.id=data._id;
    }
    if(è(data.els)){
	if(t.elements===undefined)t.elements={};
	for(var te in data.els){

	    if(t.elements[te]===undefined){
		if(data.els[te].type!==undefined){
		    t.elements[te]=create_object(data.els[te].type);
		    
		}else
		    t.elements[te]={};
	    }
	    //console.log("Setting child data for [" + te + "] object is" + t.elements[te]);
	    set_template_data(t.elements[te],data.els[te]);
	}
    }
    return t;
}

function encode_data_structure(t){
}


var local_templates=function(){
    this.templates={};
}

local_templates.prototype.set_template=function(tname, template){
    this.templates[tname]=template;
}

local_templates.prototype.add_templates=function(templates){
    for(var tname in templates){
	this.templates[tname]=templates[tname];
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


    if(tpl_item.type==="template")
	throw "deprecated template type !";

    
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

    obj.get=function(n){ return get(obj,n); }
    obj.add=function(key,child){return add(this,key,child);}
    obj.set=function(child,value){
	var c=get(this,child);
	if(c!==undefined)c.value=value;
	else throw obj.name +" : cannot set value: child [" + child + "] not found!"
	return this;
    }
    
    obj.add_link=function(linko){
	if(linko.db!==undefined && linko.type!==undefined){
	    var id=linko.db.id;
	    if(id!==undefined){
		var o=obj.elements[id]=lt.create_object(linko.type);
		o.db=clone_obj(linko.db);
		o.db.link=true;
		return o;
	    }
	}
	console.log("Error creating link !");
	return undefined;
    };
    
    new_event(obj, "server_data");
    
}

local_templates.prototype.create_object=function(template){
    var tmaster=this;
    //console.log("create tpl "+template+"pname = " + typeof this);
    //for(var k in Object.keys(this)) console.log("tmk " + k + " v=" + this[k]);

    if(template===undefined) return {};
    
    var obj=this.build_template(template);

    function build_elements(t){
	tmaster.common_builder(t);
	if(è(tmaster.object_builder))
	    tmaster.object_builder(t);

	if(t.object_builder!==undefined)
	    t.object_builder(t);
	
	for(var e in t.elements){
	    build_elements(t.elements[e]);
	}
    }
    build_elements(obj);
    return obj;
}

local_templates.prototype.build_template=function(template){

    var tpl;

    if(typeof template === 'string'){ 
	//console.log("Building template " + template);
	tpl=clone_obj(this.templates[template]);
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
    GLOBAL.get_template_data=get_template_data;
    GLOBAL.set_template_data=set_template_data;
    GLOBAL.get=get;
    GLOBAL.add=add;
}
