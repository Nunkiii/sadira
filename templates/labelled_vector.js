({ serialize_fields:[ "value_labels" ],
  serialize_childs:false,
  elements:{},
  key:"labelled_vector",
  widget_builder:function (){

    var lvec=this;
    var ui_opts=this.ui_opts;
    //console.log(lvec.name + ' lvec builder before ! events =  ' + JSON.stringify(lvec.event_callbacks));
    new_event(lvec,"change");
    //console.log(lvec.name + ' lvec builder after ! events =  ' + JSON.stringify(lvec.event_callbacks));
    
    //ui.className="labelled_vector";
    lvec.inputs=[];
    
    //lvec.inputs[v].ui_root.remove_class("container-fluid");
    
    var cdepth=lvec.depth? lvec.depth+1:1;
    if(lvec.value===undefined) lvec.value=[];
    if(lvec.value_labels===undefined) lvec.value_labels=[];

    lvec.clear_childs();
    var sub_type=lvec.vector_type ===undefined ? "double" : lvec.vector_type;

    for(var v=0;v<lvec.value_labels.length;v++){
	if(lvec.value[v] === undefined) lvec.value[v]=0;
	//var li=ce("li");
	var label=ce("label");
	//console.log("LV set " + v + " : "+ lvec.value[v] );

	var item_tpl={ 
	    id : v,
	    type : sub_type,
	    name : lvec.value_labels[v],
	    min : lvec.min, 
	    max : lvec.max, 
	    step : lvec.step, 
	    value : lvec.value[v],
	    ui_opts : {
		label : true,
		
		item_classes : 'inline',
		editable : ui_opts.editable,
		type: ui_opts.type
	    }
	    /*
	    parent : { 
		ui_childs : { 
		    add_child : function(e,nui){ui.appendChild(nui);},
		    replace_child : function(nui,oui){
			ui.replaceChild(nui, oui);
			console.log("LAB VECTOR container Replaced UI!");
		    }
		    }
	    }
*/
	}; 
	//var vui=create_ui(ui_opts, lvec.inputs[v]);
	
	lvec.inputs[v]=create_widget(item_tpl, lvec);
	//lvec.ui.appendChild(vui);
	//console.log("Adding input " + v + " : v="+lvec.inputs[v].value );
	lvec.add_child(lvec.inputs[v], lvec.value_labels[v]);

	
	
	// lvec.inputs[v].parent={ui_childs : { replace_child : function(tpl_root){
	//     console.log("Huuum");//lvec.ui.replaceChild(tpl_root, );
	// }}};
	
	//lvec.inputs[v].ui_root.remove_class("container-fluid");
	//lvec.inputs[v].ui_root.add_class("col-md-6");

	
	lvec.inputs[v].listen("change",function(v){
	    lvec.value[this.id]=this.value;
	    console.log("LV change triggered ! " + this.id  + " : " + this.value);
	    lvec.trigger("change",this.id);
	});
    }

    //lvec.ui_childs.div.add_class("inline");

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

    //console.log("Done building LABVEC : " + lvec.name);

    //return lvec.ui;
} })