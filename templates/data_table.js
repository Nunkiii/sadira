({ widget_builder:function (ui_opts, dt){

	    
	    var ui=dt.ui=ce('table');

	    dt.redraw=function(){
		ui.innerHTML="";
		var thead=cc("thead",ui);
		var tbody=cc("tbody",ui);
		
		ui.className="table table-hover";

		if(dt.header===undefined)
		    return;
		var ncol=dt.header.length;
		var tr=cc("tr",thead);
		
		for(var c=0;c<ncol;c++){
		    var th=cc("th",tr);
		    th.innerHTML=dt.header[c];
		}
		
		if(dt.value===undefined) return;
		var dl = dt.value.length;
		console.log(dt.name + " : Drawing " + dl + " lines");
		for(var l=0;l<dl;l++){
		    var tr=cc("tr",tbody);
		    var line=dt.value[l];
		    for(var c=0;c<ncol && c<line.length;c++){
			var th=cc("td",tr);
			th.innerHTML=""+line[c];
		    }
		}
	    }
	    
	    dt.redraw();
	    return dt.ui;
	},
  key:"data_table" })