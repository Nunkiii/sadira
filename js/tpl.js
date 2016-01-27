/*
  Sadira system templates
*/

template_object.prototype.save=function(a,b){
  var dbn=this.db.name!==undefined ? this.db.name : 'data';
  sadira.mongo[dbn].write_doc(this,a,b);
  return this;
}

template_object.prototype.id=function(){
  return this.db.id;
}

template_object.prototype.per=function(){
  return this.db.p;
}

template_object.prototype.grant=function(rules, cb){
    var obj=this;
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

template_object.prototype.grant_user=function(uname, gr, cb){
  var obj=this;
  if(gr===undefined) gr='r';
    sadira.find_user(uname, function(err, user){

    if(err) return cb!==undefined? cb(err): console.log("grant error " + err);
    if(obj.db.p===undefined) obj.db.p=new perm();
    var g={}; g[gr]={u : [user._id] };
    obj.db.p.grant(g);
    if(cb!==undefined)cb(null);
  });
};

template_object.prototype.grant_group=function(gname, gr, cb){
    var obj=this;

    if(gr===undefined) gr='r';
    sadira.group_id(gname, function(err, group_id){
	console.log("granting group " + gname + " id " + group_id);
	if(err)
	    return cb!==undefined? cb(err): console.log("grant error " + err);
	if(obj.db.p===undefined) obj.db.p=new perm();
	var g={}; g[gr]={g : [group_id] };
	obj.db.p.grant(g);
	if(cb!==undefined)cb(null);
    });
    
};

template_object.prototype.collection=function(cname){
    return this.db.collection;//===undefined? obj.type : obj.db.collection; 
}


    
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

