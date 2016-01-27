({
    name:"My Template Object",
    subtitle:"A Sadira/tk object template",
    intro:"Description of object functionality here.",
    ui_opts : {
	fa_icon : "cube"
    },
    db:{ grants:[ [ "g",
		    "everybody",
		    "r" ],
		  [ "g",
		    "admin",
		    "w" ] ],
	 collection:"templates" },
    elements:{
	code:{ name:"Template source code",
	       type:"code" }
    },
   
    object_builder : function(ok, fail) {
       
       var template_object=this;
       
       //var prom = new Promise(function(ok, fail){
	   
	   template_object.write_source_file=function(file_path){
	       var fs = require('fs');
	       var fname=file_path+template_object.name+".js";
	       console.log("writing file " + fname );
	       fs.writeFile(fname, "("+template_object.val('code')+")", function(err) {
		   if(err) {
		       return console.log(err);
		   }
	       });
	       
	   }
	   
	    this.read_source_file=function(file_path, cb){
		var fs = require('fs');
		fs.readFile(file_path, function(err, data) {
		    if(err) {
			return cb("Error reading file " + err);
		    }
		    var jscode= ""+data; 
		    template_object.set('code', jscode);
		    
		    //console.log("SOURCE DATA " + jscode);
		    
		    var object_code=eval(jscode);
		    template_object.set_title(object_code.key, object_code.name);
		    //console.log("Setting name to " + template_object.name);
		    return cb(null, template_object);
		});
	    }
	    
       
       template_object.register=function(){
	   //var template_object=template_object;
	   
	   //var source=template_object.val('code');
	   
	   var code=template_object.elements.code;
	   var source=code.value;
	   
	   //console.log("Code is " + code.name + " type " + code.type);
	   
	   if(source===undefined){
	       return console.log("Undefined template source ! ");
	   }
	   
	   //console.log("Code is " + code.name + " type " + code.type + " L=" + code.value.length);
	   
	   try{
	       template_code=eval(source);
	   }
	   catch(e){
	       return console.log("Bad compil for source " + source + " : " + dump_error(e) );
	   }

	   if(template_code===undefined){
	       return console.log("Bad compil for source " + source );
	   }else{
	       //console.log(template_object.name + " Register  ... TPLNAME " + template_code.key);
	       sadira.tmaster.set_template(template_object.name, template_code );
	       
	       
	       if(sadira.tmaster.templates[template_object.name]===undefined){
	       }
	       else{
		   //console.log("!!! Aready REG " + template_object.name);
	       }
	   }
	   
       }

       template_object.get_db_data=function(cb){
	   sadira.mongo.sys.find( {collection : "templates", path : [ { name : "name", value : template_object.name}] }, cb);
       }
       
       template_object.db_update=function(cb){
					   
	   template_object.get_db_data(function(error, data){
	       if(error){
		   return cb("db_update error : "+error);
	       }
	       template_object.db.name="sys";
	       template_object.db.collection="templates";

	       if(data.length>0){
		   template_object.db.id=data[0]._id;
	       }
	       
	       template_object.save(function(err){
		   //console.log("Ok wrote doc ["+ template_object.db.id+"] err="+err);
	       });
	       
	   });
       }
       
       template_object.db_load=function(cb){
	   template_object.get_db_data(function(err, template_data){
	       if(err){
		   return console.log("Find doc err="+err);
	       }
	       
	       if(template_data.length==0){
	       }
	       else{
		   //console.log(template_object.name + " Get template data " + JSON.stringify(template_data));
		   set_template_data(template_object,template_data[0]);
		   
	       }
					   

					   
	   });
	   
       }
	
	ok();
    
  },
  key:"template_object" })
