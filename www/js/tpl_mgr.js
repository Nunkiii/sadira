

/*
  Template base functions
*/

//console.log("Adding get to " + tpl_root.name);
function get(tpl, name){
    for(var e in tpl.elements){
	    //console.log(tpl_root.name+ " : looking child  [" + e + "] for name ["+name+"]");
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
    if(è(t.elements)){
	data.els={};
	for(var te in t.elements)
	    data.els[te]=get_template_data(t.elements[te]);
    }
    return data;
}

function set_template_data(t, data){
    if(è(data.value)) t.value=data.value;
    if(è(data.els)){
	if(t.elements===undefined)t.elements={};
	for(var te in data.els)
	    set_template_data(t.elements[te],data.els[te]);
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
    
    //console.log("Subst template for " + tpl.template_name +" : " + tpl_item.name + " tname is " + tpl_item.template_name);
    
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
    
    for(var o in tpl){
	switch(o){
	case "name" : if(!tpl_item.name) tpl_item.name=tpl.name; break;
	case "subtitle" : if(!tpl_item.subtitle) tpl_item.subtitle=tpl.subtitle; break;
	case "intro" : if(!tpl_item.intro) tpl_item.intro=tpl.intro; break;
	case "elements" : break; 
	case "ui_opts" : break;
	default:
	    tpl_item[o]=clone_obj(tpl[o]);
	}
    }
}

local_templates.prototype.substitute_template=function(tpl_item){
    //console.log("Substitute " + tpl_item.name + " type " + tpl_item.type);

    var ttype;
    if(tpl_item.type=="template" && typeof tpl_item.template_name!='undefined'){
	ttype=tpl_item.template_name;
	tpl_item.type=tpl_item.template_name;
    }

    var ttype=tpl_item.type;
    if(ù(ttype)){
	//console.log("Undefined template ! widget name["+tpl_item.name+"]");
	return;
    }
    
    var tpl=this.templates[ttype];
    if(ù(tpl)) return;
    //	throw "Unknwon template " + tpl_item.template_name;
    //console.log("subst for " + tpl_item.name + " tpl " + tpl.template_name);
	
//    if(typeof tpl.template_name !='undefined'){
//	var tpls=this.templates[tpl.template_name];
//	if(typeof tpls==='undefined')
//	    throw "Unknwon template " + tpl.template_name;
//	this.update_template(tpl_item, tpls);
//    }
    this.update_template(tpl_item, tpl);
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

local_templates.prototype.create_object=function(template){
    var obj=this.build_template(template);
    obj.get=function(n){ return get(obj,n); }
    new_event(obj, "server_data");
    
    if(obj.object_builder!==undefined)
	obj.object_builder(obj);
    return obj;
}

local_templates.prototype.build_template=function(template){

    var tpl;

    if(typeof template === 'string'){ 
	tpl=clone_obj(this.templates[template]);
	if(typeof tpl === 'undefined') 
	    throw "Unknown template " + template;
	tpl.type=template;
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
