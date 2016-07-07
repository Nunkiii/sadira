({
    key:"labelled_vector",
    serialize_fields:[ "value_labels" ],
    serialize_childs:false,
    value_labels : [],
    elements:{},
    ui_opts : {
	
    },
    widget_builder:function (ok, fail){
	
	var lvec=this;

	//console.log("Building labelled vector !");
	
	var ui_opts=this.ui_opts;
	//console.log(lvec.name + ' lvec builder before ! events =  ' + JSON.stringify(lvec.event_callbacks));

	new_event(lvec,"change");
	//console.log(lvec.name + ' lvec builder after ! events =  ' + JSON.stringify(lvec.event_callbacks));

	lvec.set_value=function(nv){
	
	    
	    if(typeof nv !='undefined'){
		
		//console.log(lvec.name + " : TPLI set value " + JSON.stringify(nv));
		this.value=nv;
		var l=this.value.length;

		var ll=this.value_labels.length;
		
		if(nv.length>ll){
		    var lprefix=lvec.label_prefix!==undefined ? lvec.label_prefix : lvec.name; 
		    for(var i=ll; i<nv.length;i++)
			this.value_labels[i]=lprefix+'<sub>'+i+'</sub>';
		    this.rebuild(); //lvec.trigger("change");
		}else if(nv.length<ll){
		    this.value_labels=this.value_labels.slice(0,nv.length);
		    this.rebuild(); //lvec.trigger("change");
		}else
		    for(var v=0;v<this.inputs.length;v++){
			//console.log("TPLI set value " + JSON.stringify(this.value[v]) + " on " + lvec.inputs[v].name );
			lvec.inputs[v].set_value(this.value[v]);
		    }	    
	    }
	}
	
	
	//ui.className="labelled_vector";
	lvec.inputs=[];
	
	var cdepth=lvec.depth? lvec.depth+1:1;
	if(lvec.value===undefined) lvec.value=[];
	if(lvec.value_labels===undefined) lvec.value_labels=[];
	
	lvec.clear_childs();
	
	var sub_type=lvec.vector_type ===undefined ? "double" : lvec.vector_type;
	

	function create_lv_item(item_tpl){
	    var pr=new Promise(function(ok, fail){
		create_widget(item_tpl, lvec).then(function(w){
	     	    ok(w);
	    	}).catch(fail);
		
	    });
	    return pr;
	}
	
	var itpls=[];
	
	for(var v=0;v<lvec.value_labels.length;v++){
	    if(lvec.value[v] === undefined) lvec.value[v]=0;
	    //var li=ce("li");
	    //var label=ce("label");
	    //console.log("LV set " + v + " : "+ lvec.value[v] );
	    itpls.push({ 
		id : v,
		type : sub_type,
		name : lvec.value_labels[v],
		min : lvec.min, 
		max : lvec.max, 
		step : lvec.step, 
		value : lvec.value[v],
		ui_opts : {
		    label : true,
		    root_classes : ['inline'],
		    item_classes : ['inline'],
		    editable : ui_opts.editable,
		    type: ui_opts.type
		}
	    });
	    //var vui=create_ui(ui_opts, lvec.inputs[v]);
	    
	}

	lvec.log("Creating LVEC");
	
	multi(create_lv_item,itpls).then(function(res){
	    res.forEach(function(w,v){
		lvec.inputs[v]=w;
		//lvec.ui.appendChild(vui);
		//console.log("Adding input " + v + " : v="+lvec.inputs[v].value );
		lvec.add_child(lvec.inputs[v], lvec.value_labels[v]);
		lvec.inputs[v].listen("change",function(v){
		    lvec.value[this.id]=this.value;
		    console.log("LV change triggered ! " + this.id  + " : " + this.value);
		    lvec.trigger("change",this.id);
		});
	    });
	    
	    ok();
	}).catch(fail);
	
	
    }
})
