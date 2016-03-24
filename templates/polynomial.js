({
    name:"Polynomial function",
    ui_opts:{ root_classes:[ "container-fluid" ],
	      save:"Polynomials",
	      child_classes:"container-fluid",
	      fa_icon:"superscript" },
    elements:{
	pdeg:{
	    name:"Polynomial degree",
	    type:"double",
	    min:0,
	    max:10,
	    step:1,
	    ui_opts:{ editable:true,
		      label:true,
		      root_classes:[ "list-group-item" ] },
	    default_value:1 },
	params:{
	    ui_opts:{ editable:true,
		      label:true,
		      root_classes:[ "list-group-item vertical_margin" ],
		      child_classes:"inline" },
	    value:[ 0,
		    1 ],
	    name:"Parameters",
	    type:"labelled_vector",
	    label_prefix:"x"
	}
    },
    
    widget_builder:function (ok, fail){
	var p=this;
	var ui_opts=this.ui_opts;
	var params=p.get('params');
	var pdeg=p.get('pdeg');
	pdeg.listen('change',function(){ p.reset(); });
	
	p.reset=function(value){
	    
	    var d=pdeg.value*1.0+1.0;
	    
	    if(value===undefined) value=params.value;
	    
	    if(value.length<d)
		for(var i=value.length;i<d;i++)
		    value[i]=0;
	    else
		if(d<value.length){
		    value=value.slice(0,d);
		}

	    //console.log("Reset d="+d + " vl " + value.length );
	    params.set_value(value);
	    //console.log("Reset d="+d + " vl " + value.length );
	    
	};
	
	p.func=function(x){
	    var pp=params.value;
	    if(pp===undefined) return undefined;
	    if(pp.length==0) return undefined;
	    
	    var r=0;xx=1.0;
	    for(var i=0;i<pp.length;i++){
		r+=xx*pp[i];
		xx*=x;
	    }
	    //console.log("calc pfunc("+x+")="+r + "P="+ JSON.stringify(pp));
	    return r;
	};
	
	p.reset();
	ok();
    },
    key:"polynomial"
})
