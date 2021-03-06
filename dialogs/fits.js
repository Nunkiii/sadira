var SRZ=require('../www/js/serializer.js');
var fits = require('../../node-fits/build/Release/fits.node');


exports.init=function(pkg, app,cb){
    //console.log("Init fits !");
    //var fn="/home/fullmoon/prog/astrometry.net-0.46/catalogs/brightstars.fits";
    // var fn="/home/fullmoon/prog/dev/node-fits/test/asu.fit";
    // app.dialog("fits.test_get_data", test_get_data);
    // get_fits_table_data({ file_name : fn}, function(e,data){
    // 	if(e) return console.log("Err " + e);
    // });
    cb();
}



function get_fits_table_data(opts, cb){

    var f=fits.file(opts.file_name);
    
    var headers=f.get_headers_array();
    console.log("Head : " + JSON.stringify(headers, null, 5));


    f.set_hdu(1);

    f.get_table_columns({ type : "hash"},function(er, column_info){
	
	if(er) return cb(er);

	console.log("Col info " + JSON.stringify(column_info, null, 5));
	var object_tpl = {db : {collection : "Tycho2", name : "data"}, elements : {}};
	
	for (var c in column_info.columns){
	    var col=column_info.columns[c];
	    object_tpl.elements[c]={
		type : col.type==="text" ? "string" : "double",
		name : c,
		value : col.type==="text" ? "" : "0.0",
	    };
	};
	
	var object = create_object(object_tpl);
	var object_col=[];
	for(var x in object.elements) object_col.push(object.elements[x]);
	
	f.set_hdu(1);

	for(var seq=0;seq<1000;seq++){
	    f.get_table_data(function(er, data){
		if(er) return cb(er);
		console.log("nrows " + data.length);
		data.forEach(function(row){
		    for(var i=0;i<row.length;i++)
			object_col[i].value=row[i];
		    
		    object.save();
		    delete object._id;
		    //var object_data=get_template_data(object);
		    //console.log(JSON.stringify(object_data, null, 5));
		});

		console.log("Wrote seq " + seq);
		
	    }, { nrows : 1000, row_start : seq*1000} );
	}
    });
}



var layer_defaults = [ 
    {
	colormap : [[0,0,0,1,0],
		    [.5,0.0,1.0,.5,1.0]],
	cuts : []
    },
    {
	colormap : [[0,0,0,1,0],
		    [1.0,1.0,0.0,1.0,1.0]],
	cuts : []
    },
    {
	colormap : [[0,0,0,1,0],
		    [0.0,1.0,1.0,1.0,1.0]],
	cuts : []
    },
    {
	colormap : [[0,0,0,1,0],
		    [1.0,0.0,0.0,1.0,1.0]],
	cuts : []
    }
];


function test_get_data(dlg, status_cb){
    
    var data_files = {
	catseye : {
	    multi_root : "./example_fits_files/multiband/Cat's Eye Nebula/",
	    multi_files : [
		{fname: "hst_05403_01_wfpc2_f953n_pc_sci.fits", title: "Filter 953nm", colormap : [[0,0,0,1,0],[0.0,0.0,1.0,1.0,1.0]] },
		{fname:"hst_05403_01_wfpc2_f658n_pc_sci.fits",title: "Filter 658nm"},
                {fname:"hst_05403_01_wfpc2_f588n_pc_sci.fits",title: "Filter 588nm", colormap : [[0,0,0,1,0],[0.0,1.0,0.0,1.0,1.0]] },
                {fname:"hst_05403_01_wfpc2_f631n_pc_sci.fits",title: "Filter 631nm"},
                {fname:"hst_05403_01_wfpc2_f673n_pc_sci.fits",title: "Filter 673nm", colormap : [[0,0,0,1,0],[1.0,0.0,0.0,1.0,1.0]] }
            ],
            crop : {x: 220, y: 220, w:512, h:512},
            du : 1

        },
        M42 : {
            multi_root : "./example_fits_files/multiband/M42/",
            multi_files : [
                {fname:"m42_40min_red.fits",title: "M42 Red"},
                {fname:"m42_40min_ir.fits",title: "M42 InfraRed"}
            ]
        },
        loiano : {
            multi_root : "./example_fits_files/multiband/loiano/",
            multi_files : [
                {fname:"ei.fits",title: "Loiano Infrared", colormap : [[0,0,0,1,0],[1.0,0.0,0.0,1.0,1.0]] },
                {fname:"er.fits",title: "Loiano Red", colormap : [[0,0,0,1,0],[.7,0.2,0.1,1.0,1.0]]},
                {fname:"ev.fits",title: "Loiano Visible", colormap : [[0,0,0,1,0],[0.0,1.0,0.0,1.0,1.0]]},
                {fname:"eb.fits",title: "Loiano Blue", colormap : [[0,0,0,1,0],[0.0,0.0,1.0,1.0,1.0]]}
            ]
        }
    };
    
    
    //console.log("DLG header : " + JSON.stringify(dlg.header));
    
    var what = dlg.header.what;
    
    status_cb();
    
    //dlg.send_datagram({type : "tags", tags: multi_files}, null, function(error){});
    
    dlg.listen("get_data", function(dgram){
	
        var imgid=dgram.header.imgid;
        var df=data_files[what];
        var ff=df.multi_files[dgram.header.imgid];

        var file_name=df.multi_root+ff.fname;
        console.log("Sending imgid " + imgid + " : " + file_name);
	
        var f = new fits.file(file_name);
        //f.file_name="./example_fits_files/m42_40min_red.fits"                                                                                                                                                                                                                                                                                                                                                                                                   
        //f.file_name="./example_fits_files/example.fits";                                                                                                                                                                                                                                                                                                                                                                                                        
        //reading primary header unit to be sent along the data.                                                                                                                                                                                                                                                                                                                                                                                                  
	
        if(typeof df.du != 'undefined')
            f.set_hdu(df.du);
	
        f.get_headers(function(error, headers){
	    
            if(error){
                console.log("Bad things happened : " + error);
                return;
            }
	    
            //console.log("FITS Headers : " + JSON.stringify(headers,null,5));
	    
	    
            console.log("read du  image ...");
            f.read_image_hdu(function(error, image){
		
                if(error != null){
                    console.log("Error read image " + error);
                    return;
                }

                if(typeof df.crop != 'undefined'){
                    console.log("Cropping");
                    image.crop({x: 220, y: 220, w:512, h:512});
                }
                //image.crop({ w:1024, h:1024});                                                                                                                                                                                                                                                                                                                                                                                                                  
                //image.crop({ w:2048, h:2048});                                                                                                                                                                                                                                                                                                                                                                                                                  
		
		
                //console.log("Getting data");
                var data=image.get_data();
		
                //console.log("OK, Loaded " + typeof(image));
		
                // var data=new Buffer(64); //image.get_data();                                                                                                                                                                                                                                                                                                                                                                                                   
                // var dv                                                                                                                                                                                                                                                                                                                                                                                                                                         
                // data.writeFloatLE(3.14, 0);                                                                                                                                                                                                                                                                                                                                                                                                                    
                // data.writeFloatLE(2.00, 4);                                                                                                                                                                                                                                                                                                                                                                                                                    
		
                // console.log("Loaded image....DATA = "+ data);                                                                                                                                                                                                                                                                                                                                                                                                  
		
                console.log("FIRST DATA IS " + data[0] + ", "+ data[1000]);
                var srep=new SRZ.srz_mem(data);
		
                srep.header={width : image.width(), height: image.height(), name : ff.title,
                             colormap : (ff.colormap ? ff.colormap : layer_defaults[imgid].colormap),
                             cuts : layer_defaults[imgid].cuts,
                            };
                //srep.header={width : 512, height: 512 };                                                                                                                                                                                                                                                                                                                                                                                                        

                console.log("SRZ configured size= " + srep.size());
		
                srep.on_done=function(){
                    console.log("Image data sent!");
                    //dlg.close();                                                                                                                                                                                                                                                                                                                                                                                                                                    
                };
		
                dlg.srz_initiate(srep, function(error){
                    if(error) console.log("SRZ error : " + error);
                });
		
		
            });
	    
        });
	
    });
    
}



function test_get_multi_data(dlg, status_cb){
    
    var f = new fits.file();

    f.file_name="./example_fits_files/example.fits";
    f.read_image_hdu(function(error, image){
	
	if(error != null)
	    return status_cb(error);
	else
	    status_cb();
	
	console.log("Loaded image....");
	
	var data=image.get_data();
	
	// var data=new Buffer(64); //image.get_data();
	// var dv
	// data.writeFloatLE(3.14, 0);
	// data.writeFloatLE(2.00, 4);
	
	// console.log("Loaded image....DATA = "+ data);
	
	//console.log("FIRST DATA IS " + data[0] + ", "+ data[1]);
	var srep=new SRZ.srz_mem(data);
	srep.header={width : image.width(), height: image.height() };
	
	console.log("SRZ configured size= " + srep.size());
	
	srep.on_done=function(){
	    console.log("Image data sent!");
	    dlg.close();
	};
	
	dlg.srz_initiate(srep, function(error){
	    if(error) console.log("SRZ error : " + error);
	});
	
	
    });
    
}
