var mongo=require("../js/mongo");

exports.init=function(pkg,app){
  console.log("Initializing mongodb...");

  app.mongo=new mongo.server(pkg,app);
  
  app.mongo.connect(function(error, mongoose){
    if(error){
      app.log(error);
      process.exit(1);
    }
    
    app.log("MongoDB connected !");
  });
}


