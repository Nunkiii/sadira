// Global object base of all ui template constructors. (To remove..)

var nodejs= typeof module !== 'undefined'; //Checking if we are in Node

function multi(prom, args){

    var p=new Promise(function(resolve,reject){
	if(args.length===0) return resolve([]);
	var R=[], N=args.length; 
	for(var i=0;i<N;i++){
	    prom(args[i])
		.then(function(r){
		    R.push(r); N--; if(N===0){ resolve(R); }
		})
		.catch(function(error){ reject(error)} );
	    //pri(args)
	}
    });
    return p;
}

function series(prom, args){

    var p=new Promise(function(resolve,reject){
	
	var R=[], N=args.length; var i=0;
	function exec(){
	    prom(args[i])
		.then(function(r){
		    R.push(r); i++;
		    if(N===i){ resolve(R); }
		    else exec();
		})
		.catch(function(error){ reject(error)} );
	}
	if(args.length===0) resolve([]); else exec();
    });
    return p;
}



if(nodejs===true){
    //   GLOBAL.template_ui_builders={};
}else{

}



/*
  Template base functions
*/


function gete(els,name){
    for(var e in els){
	
	if(e===name){
	    //console.log("FOUND GET["+t+"] type " + tpl.type + " name ["+tpl.name+ "] : looking child  [" + e + "] for name ["+name+"]");
	    return els[e];
	}
    }
    for(var e in els){
	var n=get(els[e],name);
	if(n)
	    return n;
    }
}


//console.log("Adding get to " + tpl_root.name);
function get(tpl, name){
    if(tpl.elements!==undefined){
	var e=gete(tpl.elements,name);
	if(e!==undefined) return e;
    }
    
    if(tpl.usi!==undefined && tpl.usi.elements!==undefined){
	var e=gete(tpl.usi.elements,name);
	if(e!==undefined) return e;
    }
    
    //console.log(tpl.name+ " : looking child  [" + tpl.elements + "] for name ["+name+"] : NOT FOUND!");
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
    build_object(src).then(function(o){cb(null,o);}).catch(function(e){cb(e);});;
    
}

var default_keys=['type','name','subtitle','intro'];

function get_template_data(t){
    var data={};
    default_keys.forEach(function(k){ if(t[k]!==undefined) data[k]=t[k];});
    
    if(è(t.db)){
	if(Object.keys(t.db).length>0)
	    data.db=t.db;
	//if(t.db.link===true) return data;
    }
    if(è(t.value)){
	if(t.serialize!==undefined){
	    //console.log("Serializing value ! ");
	    data.value=t.serialize();
	}
	else{
	    //console.log("store  value " + t.value);
	    data.value=t.value;
	}
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

    //console.log("Setting template data for " + data.name + " data" + JSON.stringify(data));

    //console.log("name " + t.name + " T "+t.type+" DT "+data.type+":  setting template data...");

    // 	console.log("Deserialize found for ["+data.value+"] to ["+t.name+"] ");
    // 	for(var p in t)
    // 	    console.log("Prop " + p);

    //    }
    var promise = new Promise(function(resolve, reject){

	new_event(t,"data_loaded");
	
	
	if(data.name!==undefined){
	    //console.log("Was " + t.name + " : Setting new data name to " + data.name);
	    t.name=data.name;
	    
	    if(t.set_title!==undefined)
		t.set_title(data.name);	
	    // else
	    //     t.name=data.name;
	}
	
	if(è(data.value)){
	    if(t.deserialize!==undefined){
		//console.log("Deserialize value ["+data.value+"] to ["+t.name+"] ");
		t.deserialize(data.value);
	    }else{
		
		
		
		if(t.set_value!==undefined){
		    //console.log("Setting value ["+data.value.length+"] to ["+t.name+"] ");
		    t.set_value(data.value);
		}
		else{
		    //console.log("tpe " + t.key +" Name="+ t.name + " : NO SET_VALUE : COPY  " + data.value.length);
		    t.value=data.value;
		}
	    }
	    
	    //console.log("TPLT "+ t.type + " DT "+ data.type + " name " + t.name  + " value SET ! " + t.value.length);
	}
	
	
	if(t.db===undefined)t.db={};
	if(data.db !== undefined){
	    for(var te in data.db){
		switch(te){
		case "p" : t.db.p=new perm(data.db.p); break;
		default : 
		    t.db[te]=data.db[te];
		}
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
	    
	    var NE=0;for(var te in data.els)NE++;

	    if(NE===0) return resolve(t);


	    //console.log(t.name + " : Loading "+NE+" childs !");
	    
	    function done_el(el){
		NE--;
		if(NE===0){
		    //console.log(t.name + " : Finished childs !");
		    t.trigger("data_loaded",data);
		    resolve(t);
		    
		}
	    }
	    
	    
	    for(var te in data.els){
		//console.log(t.name + "." + t.type +" : read child data for " + te + " : still undefined.." + t.elements[te] );
		
		if(t.elements[te]===undefined){

		    t.create_child_from_data( data.els[te], te).then(function(obj){
			//console.log("Created new child " + JSON.stringify(obj));
			//t.elements[te]=obj;
			done_el(obj);
			// if(typeof window !== 'undefined'){
			//     console.log("WINDOW Building a " + data.els[te].type);
			//     create_widget(data.els[te].type, t).then(function(w){
				
			// 	if(t.add_child===undefined){
			// 	    console.log("Bug here for " + t.name + " type " + t.type);
			// 	    //t.elements[te]={};
			// 	}
			// 	else
			// 	    t.add_child(w, te);
			//     });
			// }
			// else{
			//     console.log("Building a " + data.els[te].type);
			//     build_object(data.els[te].type, true).then(function(no){
			// 	no.build({recurse : true});
			// 	//t.add_child(no, te);
			// 	t.elements[te]=no;
			// 	set_template_data(t.elements[te],data.els[te]);
			//     });
			//     //t.elements[te]=create_object(data.els[te].type);
			    // }
		    }).catch(function(e){
			reject(e);
		    });
					   
					   
		    // }else{
		    // 	t.elements[te]={};
		    // 	set_template_data(t.elements[te],data.els[te]).then(function(obj){
		    // 	    done_el(obj);
		    // 	}).catch(function(e){ reject(e); });
					     // }
					     
		}else{
		    //console.log("("+te+") : Exist already in ("+ t.type +")("+t.name+")T" + t.elements[te].type + " Name " + t.elements[te].name);
		    set_template_data(t.elements[te],data.els[te]).then(function(obj){
			done_el(obj);
		    }).catch(function(e){
			reject(e);
		    });
		}
		//console.log("Setting child data for [" + te + "] object is" + t.elements[te]);
		
	    }
	} else resolve(t);
	

    });

    return promise;
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

local_templates.prototype.get_template=function(ttype){
    var lt=this;

    //console.log("Creating promise for get_template " + ttype);
    
    var promise = new Promise(function(resolv, reject){
	
	//console.log("Looking for template " + ttype);

	if(lt.templates[ttype] === undefined){
	    if(nodejs)
		return reject("Get template [" + ttype + "] : Undefined template");
	    else{
		
		if(window.root_widget!==undefined)
		    root_widget.wait("Loading template " + ttype);
		else
		    console.log("Loading Template "+ ttype + "...");//" CODE_DATA : " +  code_data);
		get_document({ collection : "templates", path : [{ name : 'name', value : ttype}]}, function(err, tpl_data){
		    if(window.root_widget!==undefined)
			root_widget.wait(false);
		    
		    if(err){
			return reject("Get template [" + ttype + "] : Cannot fetch template : " + err);
		    }
		
		    if(tpl_data.error!==undefined)
			return reject("Get template [" + ttype + "] : " + tpl_data.error);

		    if(tpl_data.length===undefined)
			return reject("No data returned for template [" + ttype + "] ");

		    if(tpl_data.length===0)
			return reject("Template not found [" + ttype + "] : ");
		    
		    var code_data=tpl_data[0].els.code.value;
		    
		    
		    
		    var tpl_code;
		    try{ 
			tpl_code=eval(code_data);//"try{ " + code_data + "}catch(e){console.log('EVALERR: ' + e);}");
			//console.log("Eval "+ttype+" DONE !");
			lt.set_template(ttype,tpl_code);
			resolv(lt.templates[ttype]);
		    }
		    catch(e){
			console.log("Error EVAL " + dump_error(e));
			reject(e);
		    }
		    
		    //console.log("Got Template "+ ttype+" CODE : " +  JSON.stringify(tpl_code));
		    
		    
		    
		    //console.log("Got Template "+ ttype+" name : " +  lt.templates[ttype].name);
		    
		    //console.log("Got Template "+ ttype+" name : " +  JSON.stringify(lt.templates[ttype]));
		    

		});
		
	    }
	}else{
	    //console.log("Found in cache!" + ttype);
	    resolv(lt.templates[ttype]);
	}
    });

    return promise;
}

local_templates.prototype.set_template=function(tname, template){
    //    if(this.templates[tname]===undefined)
    template.key=tname;
    //template.type=tname;
    this.templates[tname]=template;
    
    return template;
  // else{
  // 	update_template(this.templates[tname],template);
  //   }
}

local_templates.prototype.add_templates=function(templates){
    for(var tname in templates){
	this.set_template(tname,templates[tname]);
    }
}


function add_builder(struct, builder,name){
  //console.log("Add builder to " + struct.type + ":" +struct.name + " NAME " + name);
    if(builder===undefined) return;
    //if(name!==undefined) builder.name=name;
    if(struct.builders===undefined){
	struct.builders=[];
	struct.builders_n=[];
    }
    var bi=0,bl=struct.builders.length;
    for(bi=0;bi<bl;bi++) if(struct.builders[bi]===builder) return;
    struct.builders.push(builder);
    struct.builders_n.push(name);
}


function template_object(){
    //new_event(this, "server_data");
    if(nodejs) this.db={};
    new_event(this, 'name_changed');
    //add_builder(this,local_templates.prototype.common_builder);
}


template_object.prototype.path=function(){
    var o=this; var path=o.ckey;
    for(o=o.parent;o!==undefined ; o=o.parent){
	if(o.key!==undefined){
	    //console.log(" k + " + o.key);
	    
	    path=o.ckey+"."+path;
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
    console.log("creating link to " + linko.db.id);//+ JSON.stringify(linko));
    if(linko.db!==undefined && linko.type!==undefined){
	var id=linko.db.id;
	if(id!==undefined){
	    console.log("Create link " + id);
	    var o=new template_object();
	    console.log("Create link " + id);
	    o.db= { id : id, link : true, link_type : linko.type};
	    return this.add(id,o);
	}else{
	    console.log("No db.id ! Error creating link to " + JSON.stringify(linko.db));
	}
    }else{
	console.log("Error creating link to " + JSON.stringify(linko));
	return undefined;
    }
};


template_object.prototype.set_subtitle=function(subtitle){
  if(subtitle!==undefined){
    this.subtitle=subtitle;
    //console.log("!!!!!!!!!!name_changed!!!!!" + this.name + " S" + this.subtitle);
    this.trigger("name_changed", this.name, this.subtitle);
  }
}

template_object.prototype.set_title=function(title, subtitle){
	
    if(title!==undefined){
	this.name=title;
    }
    if(subtitle!==undefined){
	this.subtitle=subtitle;
    }
    if(title!==undefined ||  subtitle!==undefined){
	//console.log("!!!!!!!!!!name_changed!!!!!" + this.name + " S" + this.subtitle);
	this.trigger("name_changed", this.name, this.subtitle);
    }
}

template_object.prototype.common_builder=function(){
    var obj=this;
    //console.log("COOMON Object builder ! for " + obj.name + " type " + obj.type);
}

template_object.prototype.set_value=function(v){
    if(v!==undefined) this.value=v;
}

template_object.prototype.common_object_builder=function(){
    var obj=this;
    //console.log("COOMON Object builder ! for " + obj.name + " type " + obj.type);
//    new_event(obj, 'name_changed');
    if( obj.db===undefined) obj.db={};
    
    
    obj.save=function(a,b){
	var dbn=obj.db.name!==undefined ? obj.db.name : 'data';

	sadira.mongo[dbn].write_doc(obj,a,b);
	
	return obj;
    };
    //obj.dbcreate=function(a,b){return sad.mongo.sys.write_doc(this,a,b);};
    //obj.db={
    //perm : new perm()
    //};
    
    obj.id=function(){
	return obj.db.id;
    };
    obj.perm=function(){
	return obj.db.p;
    };
    
    obj.grant=function(rules, cb){
	if(rules===undefined){
	    rules=this.db.grants;
	}
	if(rules===undefined){
	    return cb(null);
	}
	var nr=rules.length;
	function res_cb(e){
	    if(e) return cb(e);
	    nr--;
	    if(nr===0) cb(null);
	}
	
	rules.forEach(function(r){
	    r[0]==='u' ?
		obj.grant_user(r[1],r[2],res_cb) :
		obj.grant_group(r[1],r[2],res_cb);
	});
    }
    
    obj.grant_user=function(uname, gr, cb){
	if(gr===undefined) gr='r';
	sadira.find_user(uname, function(err, user){
	    if(err) return cb!==undefined? cb(err): console.log("grant error " + err);
	    if(obj.db.p===undefined) obj.db.p=new perm();
	    var g={}; g[gr]={u : [user._id] };
	    obj.db.p.grant(g);
	    if(cb!==undefined)cb(null);
	});
    };
    
    obj.grant_group=function(gname, gr, cb){
	
	if(gr===undefined) gr='r';
	sadira.group_id(gname, function(err, group_id){
	    //console.log("granting group " + gname + " id " + group_id);
	    if(err)
		return cb!==undefined? cb(err): console.log("grant error " + err);
	    if(obj.db.p===undefined) obj.db.p=new perm();
	    var g={}; g[gr]={g : [group_id] };
	    obj.db.p.grant(g);
	    if(cb!==undefined)cb(null);
	});
	
    };
    
    obj.collection=function(cname){
	if(cname!==undefined){
	    obj.db.collection=cname;
	}
	return obj.db.collection===undefined? obj.type : obj.db.collection; 
    };

    
    
    // obj.set_grants=function(cb){
    // 	var o=this;
    // 	if(o.db.grants!==undefined){
    // 	    //console.log("We have grants : "+JSON.stringify(o.db.grants)+" P= ["+o.db.p+"]");
    
    // 	    if(o.db.p===undefined){
    // 		//console.log("Applying grants "+JSON.stringify(o.db.grants)+" to ["+o.name+"] !! ");
    // 		o.grant(o.db.grants, function(e){
    // 		    if(e!=null){
    // 			sad.log("!!grant error " + e);
    // 			return cb(e);
    // 			//return cb(e);
    // 		    }
    // 		    o.save(cb);
    
    // 		    //console.log("Apllyed grants ok to " + obj.name);
    // 		    //delete obj.db.grants;
    // 		    //cb(null);
    // 		});
    // 	    }
    // 	}
    
    //}
    
    // obj.handle_request=function(req_name, req_cb){
    // 	if(obj.apis===undefined) obj.apis={};
    // 	obj.apis[req_name]=req_cb;
    // };
    
    
    //obj.db.perm.grant();
}

template_object.prototype.create_child=function(tpl, key){
    var obj=this;
    var promise = new Promise(function(ok, fail){
	
	build_object(tpl).then(function(child){

	    if(key===undefined){
		key=Math.random().toString(36).substring(2);
	    }
	    if(obj.elements===undefined) obj.elements={};
	    obj.elements[key]=child;
	    child.parent=obj;

	    //console.log("create_child :  ["+child.type+"] ["+child.name+"] cons " + child.constructor.name);
	    
	    // if(opt!==undefined)
	    // 	ok({ child : child, data :  opt.data });
	    // else
	    ok(child);
	    
	}).catch(function(e){
	    console.log("Cannot create child " + e);
	    fail(e);
	});
	    
    });
			      
    return promise;
    
}

template_object.prototype.create_child_from_data=function(data, key){
    var obj=this;
    var promise = new Promise(function(ok, fail){

	create_object_from_data(data).then(function(child){
		
	    if(this.elements===undefined) this.elements={};
	    var els=this.elements;
	    if(key===undefined){
		key=Math.random().toString(36).substring(2);
	    }
	    obj.elements[key]=child;
	    ok(child);
	}).catch(function(e){ fail(e); });
	    
    });
			      
    return promise;
    
}

template_object.prototype.build=function(opts_in){

    var tpl_node=this;
    var prom = new Promise(function(ok, fail){

	var opts=opts_in===undefined? {}:opts_in;
	
	
	if(opts.recurse===true){
	    function build_child(c){
		var p=new Promise(function(good,bad){
		    c.build(opts).then(good).catch(bad);
		}); return  p;
	    }
	    var childs=[];
	    for(var e in tpl_node.elements){
		//console.log("Building " + tpl_node.elements[e].type);
		childs.push(tpl_node.elements[e]);
	    }
	    if(childs.length===0) return build_object();
	    
	    multi(build_child, childs).then(function(){
		build_object();
	    }).catch(function(e){
		fail(e);
		return;
	    });
	    
	}else build_object();

	function build_object(){
	    //console.log(tpl_node.name + " t " + tpl_node.type + " build object");
	    // tpl_node.common_builder.call(tpl_node);
	    
	    // if(nodejs)
	    // 	tpl_node.common_object_builder.call(tpl_node);
	    
	    if(tpl_node.builders===undefined) return ok();
		
	    function run_builder(b){
		var p=new Promise(function(good,bad){
		    //console.log("\x1b[31;1m Calling builder for " + tpl_node.type + " recurse " + opts.recurse+"\x1b[0m");
		    var it=setInterval(function(){
			console.log("Still calling build on " + tpl_node.type + " N " + tpl_node.name);
		    }, 1000);
		    
		    b.call(tpl_node,function(iui){
			clearInterval(it);
			
			good(iui);
		    },bad);

		});
		return  p;
	    }

	    //console.log(tpl_node.type + ":" + tpl_node.name + "  series building NB="+tpl_node.builders.length);
	    series(run_builder, tpl_node.builders).then(function(uis){
		uis.forEach(function(iui){
		    //console.log(tpl_node.name + " Typof : " + typeof(iui) + " CONS " + iui.constructor.name);
		    ok(iui)
		});
		ok();
	    }).catch(function(e){
		fail(e);
	    });
	    return;
	    
	    //console.log(this.name + " t " + this.type + " build NB=" + bl);
		
	    //	if(opts.object===true)
	    tpl_node.builders.forEach(function(b,i){
		//console.log(this.name + " t " + this.type + " build NB=" + bl);
		//var bs=b.toString();
		//bs=bs.slice(0,64);
		//console.log(tpl_node.name + " t " + tpl_node.type + " : Exec builder " + nb);
		
		
		var bui;
		try{
		    bui=b.call(tpl_node);
		    
		    if(bui!==undefined)
			console.log("Typof : " + typeof(bui) + " CONS " + bui.constructor.name);
		    
		}
		catch (e){
		    console.log("Error build ["+tpl_node.builders_n[i]+"]: " + dump_error(e) );
		}
		if(ui === undefined) ui=bui;
		nb++;
		//console.log(tpl_node.name + " t " + tpl_node.type + " : Exec builder DONE" + nb);
		
		
	    });
	}

    });

    return prom;
}



// local_templates.prototype.create_objects_from_data=function(data){
//     var lt=this;
//     var nd=data.length;
//     var objects=[];
//     data.forEach(function(d){
// 	objects.push(lt.create_object_from_data(d));
//     });
//     return objects;
// }

local_templates.prototype.create_object_from_data=function(data){
    var lt=this;
    
    var promise = new Promise(function(resolve,reject){
	
	if(data===null || data===undefined){
    	    reject("NULL DATA !!!????");
	    return;
	}

	//console.log("Create from data TYPE " + data.type);
	
	lt.build_object(data)//data.type===undefined ? {} :data.type)
	    .then(function(obj){
		
		//console.log("Createed OBJ TYPE " + obj.type + " name " + obj.name);

		if(nodejs)
		    obj.build( {recurse : true}).then(function(o){ conclude(); }).catch(reject);
		else{
		    obj.create_ui().then(function(){
			conclude();
		    }).catch(reject);
		}

		function conclude(){
		    set_template_data(obj, data).then(function(t){
			resolve(t);
		    }).catch(function(e){ reject(e); });
		}
	    })
	    .catch( function(error){
		console.log("From data: build error " + error);
		reject(error);
	    });
	//console.log("Building " + obj.type);
    });
    
    return promise;
}


local_templates.prototype.create_object=function(template){
    var lt=this;
    var promise=new Promise(function(resolv, reject){

	lt.build_object(template).then(function(object){
	    
	    object.build({recurse: true}).then(function(){
		//console.log("created new object type [ "+object.type +"] Name ["+object.name +"] B? "+ (object.build!==undefined)+" cons " + object.constructor.name  );
		resolv(object);
	    }).catch(reject);
	    
	    //console.log("create_child :  ["+child.type+"] ["+child.name+"] cons " + child.constructor.name);
	    
			//+" opts " + JSON.stringify(opt)  );
			
	    //resolv(object);

	    
	}).catch(function(error){ reject(error); });
    });
				       
    return promise;
}


local_templates.prototype.build_object=function(template, opt){
    
    var lt=this;

    //console.log("Build object  LT? ["+lt+"] :" + (lt.get_template===undefined));
    
    var promise = new Promise(function(resolv, reject){

	
	if(template===undefined){
	    reject("No template given");
	    return;
	}
	var is_object=nodejs;
	var last_structure;
	var tpl_types=[];
	var object= new template_object(); 

	var tpl_tree=[];
    
	if(typeof template === 'string'){
	    tpl_types.push(template);
	    object.type=template;
	}else{
	    tpl_tree.unshift([template.type,template]);
	    object.type=template.type;
	    //tpl_tree.unshift(template);
	    if(template.type!==undefined){
		
		tpl_types.push(template.type);
	    }
	}


	function update_child_structure(struct, p, obj, codef){
	    
	    var prom=new Promise(function(ok,fail){
		if(struct[p]===undefined) struct[p]= {}; //new template_object();
		var nj=0;
		for(var c in obj) nj++;
		var els=struct[p];
		for(var c in obj){
		    //console.log("Child " + c + " = " + obj[c] + " obj is " + JSON.stringify(obj));
		    
		    var child=obj[c];
		    if(child!==undefined){
			//if(els[c]===undefined) els[c]=new template_object();
			
			if(child.type!==undefined){
			    
			    
			    if(els[c]===undefined){
				//nj++;
				//console.log("Try creating child " + c);
				
				struct.create_child(child, c).then(function(no){
				    //console.log(" " + c + " ---------------------| create child received " + no.data);
				    //console.log("Created child["+c+"] [" + no.type + "] cons : " + no.constructor);
				    
				    nj--;if(nj===0) ok(); else console.log("remains " + nj);
				    
				    //update_structure(child, no.data, true, is_object).then(function(){
 				    //    console.log("Done update_struct child [" + no.child.name + "] build : " + no.child.build
				    //		+ " : " + no.child.constructor);
				    // done_job();
				    //}).catch(function(e){fail(e)});
				    //els[c]=no;
				}).catch(function(e){
				    console.log("Error create child " + dump_error(e));
				    fail(e);
				});
			    }else{
				//nj++;
				update_structure(els[c], child, true, codef).then(function(){
				    nj--;if(nj===0) ok();else console.log("remains " + nj);
				}).catch(function(e){fail(e)});
				//els[c]=new template_object();
			    }
			    //console.log("After building child " + c + ' substruct ' + JSON.stringify(child));
			}else{
			    if(els[c]===undefined) els[c]=new template_object();
			    
			    update_structure(els[c], child, true, codef).then(function(){
				nj--;if(nj===0) ok();else console.log("remains " + nj);
			    }).catch(function(e){fail(e)});
			}
			
		    }else{
			console.log(tpl.name + "["+tpl.type+"] Strange element " + c + " undef !");
			nj--;if(nj===0) ok();else console.log("remains " + nj);
		    }
		}
	    });
	    return prom;
	}


	function update_structure(struct, tpl, root, codef){

	    var prom=new Promise(function(ok,fail){
		
		var nj=0;
		
		function update_childs(struct,p,obj){
		    if(struct[p]===undefined) struct[p]= {}; //new template_object();
		    //var nj=0;
		    //for(var c in obj) nj++;
		    var els=struct[p];
		    for(var c in obj){
			//console.log("Child " + c + " = " + obj[c] + " obj is " + JSON.stringify(obj));
			
			var child=obj[c];
			if(child!==undefined){
			    //if(els[c]===undefined) els[c]=new template_object();
			    
			    if(child.type!==undefined){
				
				
				if(els[c]===undefined){
				    nj++;
				    //console.log("Try creating child " + c);
				    
				    struct.create_child(child, c).then(function(no){
					//console.log(" " + c + " ---------------------| create child received " + no.data);
					//console.log("Created child["+c+"] [" + no.type + "] cons : " + no.constructor);
					done_job();
						//nj--;if(nj===0) ok(); else console.log("remains " + nj);
					
						//update_structure(child, no.data, true, is_object).then(function(){
 						//    console.log("Done update_struct child [" + no.child.name + "] build : " + no.child.build
						//		+ " : " + no.child.constructor);
						// done_job();
						//}).catch(function(e){fail(e)});
					//els[c]=no;
				    }).catch(function(e){
					console.log("Error create child " + dump_error(e));
					fail(e);
				    });
				}else{
				    nj++;
				    update_structure(els[c], child, true, codef).then(function(){
					//nj--;if(nj===0) ok();else console.log("remains " + nj);
					done_job();
				    }).catch(function(e){fail(e)});
				    //els[c]=new template_object();
				}
				//console.log("After building child " + c + ' substruct ' + JSON.stringify(child));
			    }else{
				if(els[c]===undefined) els[c]=new template_object();
				nj++;
				update_structure(els[c], child, true, codef).then(function(){
				    //nj--;if(nj===0) ok();else console.log("remains " + nj);
				    done_job();
				    
				}).catch(function(e){fail(e)});
			    }
			    
			}else{
			    console.log(tpl.name + "["+tpl.type+"] Strange element " + c + " undef !");
			    //nj--;if(nj===0) ok();else console.log("remains " + nj);
			}
		    }
		}
		
		
		//console.log(object.name + "["+object.type+"] update_structure with tpl " + JSON.stringify(tpl));// + " builder " + tpl.object_builder);
		for(var p in tpl){
		    
		    var obj=tpl[p];
		    //console.log(object.type + " update structure property " + p + " TYPE "+ typeof(obj) + " value " + obj);
		    
		    switch(p){
		    case 'type':
			struct.type=obj;
			//  if(root && is_object===false)
			//add_builder(struct,template_ui_builders[obj]);
			
			break;
		    case 'ui_opts' :
			if(struct.ui_opts===undefined) struct.ui_opts={};
			for(var u in obj){
			    var utype=Object.prototype.toString.call( obj[u] );
			    if( utype === '[object Array]' ) {
				//console.log("TPL "+tpl.type+" utype ("+utype+") Update ui_opts key '"+u+"' : " + JSON.stringify(obj[u]));
				if(struct.ui_opts[u]===undefined)
				    struct.ui_opts[u]=[];
				else{
				    if(Object.prototype.toString.call(struct.ui_opts[u] !== '[object Array]')){
					var val=struct.ui_opts[u];
					struct.ui_opts[u]=[val];
					//return fail("ui_opts["+u+"] already exists and is not an array ! : TPL "+tpl.type+" utype ("+utype+") Update ui_opts with : " + JSON.stringify(obj[u]));
				    }
				}
				obj[u].forEach(function(e){
				    struct.ui_opts[u].push(e);
				});
			    }else
				struct.ui_opts[u]=clone_obj(obj[u]);
			}
			
			break;
		    case 'usi' :
			struct.usi=new template_object();
			if(obj.elements!==undefined && is_object===false)
			    update_childs(struct.usi,"elements",obj.elements);

			break;
		    case 'elements' :
			
			if(root){
			    
			    update_childs(struct,p,obj);
			    // update_child_structure(struct, p, obj, codef).then(function(no){
			    // 	console.log("Updated elements child structure!!!!");
			    // 	done_job();
			    // }).catch(function(e){fail(e);});
			    
			    //console.log("AFTER Child " + c);// + " = " + obj[c] + " obj is " + JSON.stringify(obj));
			    
			}
			break;
		    case 'widget_builder' :
			if(root && is_object===false)
			    add_builder(struct,obj,codef);
			break;
		    case 'object_builder' :
			if(root && is_object===true)
			    add_builder(struct,obj,codef);
			break;
		    case 'event_callbacks' :
			break;
		    default:
			if(typeof(obj) != 'object'){
			    
			    
			    struct[p]=obj;
			    //console.log("update_structure type ["+p+"] COPY struct[p]=" + struct[p]);
			}
			else{
			    //console.log("update_structure type ["+p+"] COPY type " + typeof(obj) + " str[p]=" + struct[p]);
			    
			    //if(p==='ui_opts')	console.log(struct.name + " ui_opts update : existing = "+ JSON.stringify(struct[p],null,5) +" update with "+JSON.stringify(obj,null,5));
			    
			    
			    if(struct[p]!==undefined){
				nj++;
				update_structure(struct[p],obj, false, is_object).then(function(){
				    done_job();
				}).catch(function(e){fail(e)});
			    }else{
				//console.log( object.type + " : update structure property " + p + " :  "+ JSON.stringify(obj));
				struct[p]=clone_obj(obj);
				//console.log(object.type + " update structure property " + p + " TYPE "+ typeof(obj) + " value " + obj);
			    }
			}
		    }
		}
		
		function done_job(){
		    nj--;
		    
		    if(nj===0){
			//console.log(object.type + " Done update_struct created object [ "+ object.name + "] constructor " + object.constructor.name);
			ok();
			//console.log(object.type + " OK Called !! ");
		    }else{
			//console.log(object.type + " waiting jobs ... NJ="+nj);
		    }
		}
		
		nj++; done_job();
		
		
	    });
	    
	    return prom;
	    //console.log("Updated structure " + struct.name +" tpl name " + tpl.name + " type " + struct.type + "TPL " + JSON.stringify(tpl));
	}
	

	
	var ttype=tpl_types[0];	

	//console.log("Build object ttype " + ttype);
	
	if(tpl_types.length>0){
	    
	    
	    function scan(tt, done){
		//console.log("Build object " + ttype + " Scanning template  " + tt.type + " LT? :" + (lt.get_template===undefined));
		
		lt.get_template(tt).
		    then(function(tpl){
			tpl_tree.unshift([tt,tpl]);
			//if(ttype==="user")console.log(ttype + " : TPL["+tt+"] is " + JSON.stringify(tpl) + " Builder " + tpl.object_builder + " NB=" +tpl_tree.length);
			done(null,tpl.type);
		    })
		    .catch(function(err){
			console.log("ERROOOR" + err);
			done(err);
		    });
		
	    }
	    
	    function handle_scan(err, next_type){
		if(err) return reject(err);
		if(next_type!==undefined)
		    scan(next_type, handle_scan);
		else construct();
	    }
	    
	    scan(ttype,handle_scan);
	    
	    // while(tpl!==undefined && ttype!==undefined){
	    // 	tpl_tree.unshift([ttype,tpl]); ttype=tpl.type;
	    // 	//console.log("??? Looking for " + ttype + " COND " + (tpl!==undefined && ttype!==undefined));
	    
	    // 	if(ttype===undefined)
	    // 	    break;
	    // 	tpl=this.get_template(ttype, function(err, next_tpl){
	    
	    // 	});
	    
	    // 	if(tpl===undefined) break;
	    //     }
	    
	    // });
	    
	    
	}else construct();

        
	function set_keys(o,k){
	    o.ckey=k;
	    if(o.elements)
		for(var k in o.elements)
		    set_keys(o.elements[k],k);
	}

	function done() {
	    //console.log("Done build object...." + object.type);

	    // if(opt!==undefined)
	    // 	resolv({ object : object, data : opt});
	    // else
	    resolv(object);
	    
	}
	
	function construct(){

	    var nt=tpl_tree.length,ct=0;
	    
	    function update(){
		update_structure(object, tpl_tree[ct][1], true, tpl_tree[ct][0]).then(function(){
		    ct++;
		    if(ct===nt){
			
			
			// if(lt.object_builder!==undefined){
			//     add_builder(object, lt.object_builder);
			    
			// }
			
			// if(lt.widget_builder!==undefined){
			//     add_builder(object, lt.widget_builder);
			// }
	    
			//console.log("Construct " + JSON.stringify(object) + " NTPL " + tpl_tree.length);
			//console.log(object.name + " CONSTRUCTED " + object.type  );
			set_keys(object);

			done();
			
		    }else update();
		    
		}).catch(function(e){
		    console.log("Update struct error " + e);
		    reject(e)
		});
		
	    }

	    if(nt===0){
		done();
	    }else
	    
		update();
	    
	}
	
	
	//console.log(object.name + " T " +object.type + "  depth=" + tpl_tree.length);
	//return object;
    });

    return promise;
}




if(nodejs){
    module.exports.local_templates=local_templates;
    module.exports.template_object=template_object;
    
    GLOBAL.get_template_data=get_template_data;
    GLOBAL.set_template_data=set_template_data;
    GLOBAL.get=get;
    GLOBAL.add=add;

    GLOBAL.multi=multi;
    GLOBAL.template_object=template_object;
}
