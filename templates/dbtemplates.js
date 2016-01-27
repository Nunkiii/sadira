({ name:"Sadira widget templates",
  ui_opts:{ root_classes:[ "container-fluid" ] },
  elements:{ build_progress:{ name:"Building templates ... ",
      type:"progress",
      value:0 } },
  key:"dbtemplates",
  widget_builder:function (ui_opts, dbt){
    var templ={name : "Tmaster :" ,elements: {}, ui_opts : { child_classes : ["container-fluid"]} };
    var ntpl=0;
    var build_progress=dbt.elements.build_progress;
    
    setTimeout(function(){
	var nt=0,ti=0;
	for(var tn in tmaster.templates) nt++;
	for(var tn in tmaster.templates){
	    ti++;
	    build_progress.set_value(ti*100.0/nt);
	    var t=tmaster.templates[tn];

	    var builder;
	    if(è(t.widget_builder)){
		//console.log("Scanning " + tn + " builder " + t.tpl_builder);
		builder=t.widget_tpl_builder;
	    }else
		builder=template_ui_builders[tn];	


	    var fsubt = t.name === undefined  ? "":t.name;
	    var te={
		name :" <span class='label label-default '>"+tn+"</span>",  
		subtitle : fsubt,
		ui_opts : { root_classes : ["container-fluid"],
			    child_view_type : 'tabbed',
			    fa_icon : 'code-fork'
			    //name_node : "h3",
			    //label :true
			  },
		toolbar : { ui_opts : { toolbar_classes : ""} },
		elements : {

		    tryi : {
			name : "Build here",
			type : "action",
			ui_opts: {item_classes : ["btn btn-info btn-xs"], root_classes : []},
			tn : tn
		    },
		    try : {
			name : "Try in new page...",
			type : "action",
			link : "/widget/"+tn,
			
			ui_opts: {item_classes : ["btn btn-info btn-xs"], root_classes : ["inline"]}
		    }
		} };

	    
	    //var tstring="Helllooo"
	    if(t!={}){
		var tstring="<pre><code>"
		    + JSON.stringify(t,null,2)
		//		t.prototype.toSource()
		
		    +"</code></pre>";
		te.elements.code = {
		    name :"Template",
		    type : "text",
		    value : tstring,
		    ui_opts : {
			editable : false,sliding:false,slided:true, label : false, root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
		

		
	    if(è(builder)){
		fstring="<pre><code>"+builder.toString()+"</pre></code>";
		te.elements.bcode = {
		    name :"Constructor",
		    type : "text",
		    value : fstring,
		    ui_opts : {
			editable : false,sliding:false,slided:true, label : false, root_classes : ["inline"],
			highlight_source: true
		    }
		}
	    }
	    
	    
	    templ.elements[tn]=te;
	    ntpl++;
	}
	
	templ.subtitle = ntpl + " templates in use : "

	var tw=create_widget(templ, dbt);
	
	for(var t in tw.elements) {
	    var tryi=tw.elements[t].elements.tryi;
	    tryi.listen("click", function(){
		var tt=tmaster.build_template(this.tn);
		create_ui({},tt);
		this.ui_root.appendChild(tt.ui_root);
	    });
	    var tico=get_ico(tmaster.templates[t]);
	    if(ù(tico))
		if(è(tmaster.templates[t].ui_opts)){
		    if(è(tmaster.templates[t].ui_opts.fa_icon)){
			tico=ce("span");
			tico.className='fa fa-'+tmaster.templates[t].ui_opts.fa_icon;
		    }
		}
	    
	    if(è(tico)) tw.elements[t].ui_title_name.prependChild(tico);
	    
	}
	
	dbt.ui_childs.add_child(templ,tw.ui_root);
	build_progress.hide();

    }, 500);
} })