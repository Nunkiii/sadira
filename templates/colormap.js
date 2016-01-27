({ object_builder:function (cmap, app){

	    cmap.register_collection=function(){
		var c={
		    type : "db_collection",
		    db : {
			grants : [['g','everybody','r'],['g','admin','w']],
			collection : "collections"
		    },
		    elements : {
			name : { value : "colormap"},
			template : { value : "api_provider"},
		    }
		};
		
		var col=create_object(c, function (e){
		    app.mongo.write_doc(c, function(err, doc){
			if(err) app.log("Error " + err);
		    });
		    
		});

	    }
	    
	    //console.log("Building colormap...");
	    cmap.load_json=function(file){
	// return;
	// 	var cmo=create_object("db");
	// 	cmo.name="X";
	// 	cmo.collection("colormaps");
	// 	cmo.save();
		
	// 	cmo=create_object("string");
	// 	cmo.name="X";
	// 	cmo.collection("colormaps");
	// 	cmo.save();
		
		// 	return;
		
		var fs=require('fs');
		fs.readFile(file,'utf8', function (err, data) {
		    if (err) throw err;
		    var jdata=JSON.parse(data);
		    var cmaps=jdata.doc.ColorMap;
		    
		    cmaps.forEach(function(cm){
			var cmo=create_object("colormap");
			//cmo.collection("colormaps");
			cmo.name=cm['@name'];
			cmo.value=[];
			cm.Point.forEach(function(cmp){
			    cmo.value.push([cmp['@r'],cmp['@g'],cmp['@b'],cmp['@o'],cmp['@x']]);
			});
			cmo.save();
			
			console.log(JSON.stringify(cmo));
		    });
		    
		    
		});
		
	    }
	    
	},
  key:"colormap" })