var mongo=require("../js/mongo");

exports.init=function(pkg,app, cb){
  console.log("Initializing mongodb...");

  app.mongo=new mongo.server(pkg,app);
  
  app.mongo.connect(function(error){
      if(error)
	  return cb(error);
      app.log("MongoDB connected !");
      cb(null);
  });
}


