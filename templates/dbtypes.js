({ name:"Datatypes",
  subtitle:"Available sadira/tk datatypes",
  ui_opts:{ root_classes:[ "container-fluid" ],
    child_classes:[ "container" ] },
  elements:{},
  key:"dbtypes",
  widget_builder:function (ui_opts, dbt){

    for(var dt in template_ui_builders){
	var t=template_ui_builders[dt];
	var fstring="<pre><code>"+t.toString()+"</pre></code>";
	var tple={
	    name : dt,
	    ui_opts : {
		name_node : "h4",
		root_classes : ["container-fluid panel panel-default"],
		child_classes : ["inline"]},
	    elements : {
		code : {
		    name :"JS builder",
		    type : "html",
		    value : fstring,
		    ui_opts : {
			editable : true,
			sliding:true,
			slided:false,
			label : true,
			root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
	};
	create_ui({},tple);
	dbt.ui_childs.add_child(tple,tple.ui_root);
    }
	
    
} })