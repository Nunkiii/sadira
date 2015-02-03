var mongo=require("../js/mongo");

exports.init=function(pkg,app){
  console.log("Initializing mongodb...");

  mongo.connect(pkg.opts, function(error, mongoose){
    if(error){
      app.log(error);
      process.exit(1);
    }
    
    app.log("MongoDB connected !");
    app.mongoose=mongoose;
  });
}


