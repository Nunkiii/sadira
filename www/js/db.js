function add_classes(classes, class_node){

    if(!class_node || !classes) return;
    for(var c=0;c<classes.length;c++)
	class_node.className+=" "+classes[c];
}

function tab_widget(classes){

    var div=this.div=ce("div"); 
    div.className="tab_widget";
    add_classes(classes,div)

    var nav=this.nav=ce("nav");
    var lm=this;

    div.appendChild(this.nav);

    this.frames=[];

    this.select_frame=function(f){
	if(typeof this.selected_frame!='undefined'){
	    this.selected_frame.div.style.display='none';
	    this.selected_frame.className="normal_tab";
	}
	f.div.style.display='block';
	this.selected_frame=f;
	this.selected_frame.className="selected_tab";
	return f;
    }

    this.add_frame=function(title){

	var li=nav.appendChild(ce("li"));
	li.innerHTML=title;
	li.div=div.appendChild(ce("div"));
	li.div.className="tab_section";
	li.div.style.display='none';
	this.frames.push(li);
	
	li.onclick=function(){
	    console.log("Click!!");
	    lm.select_frame(this); //xd.fullscreen(false);
	}
	if(this.frames.length==1) this.select_frame(li);

	return li;
    }
    
    return this;
}


var local_templates=function(){
  this.templates={};
}

local_templates.prototype.add_templates=function(templates){
  for(var tname in templates){
    this.templates[tname]=templates[tname];
  }
}

local_templates.prototype.substitute_template=function(tpl_item){
  if(tpl_item.type=="template"){
    var tpl=this.templates[tpl_item.template_name];
    tpl_item.elements=clone_obj(tpl.elements);
    for(var o in tpl){
      switch(o){
	  case "name" : if(!tpl_item.name) tpl_item.name=tpl.name; break;
	  case "elements" : break;
	  default:
	  tpl_item[o]=tpl[o];
      }
    }
    return true;
  }
  return false;
}

local_templates.prototype.substitute_templates=function(tpl_item){
  this.substitute_template(tpl_item);
  for (var e in tpl_item.elements){
    this.substitute_templates(tpl_item.elements[e]);
  }
}

local_templates.prototype.build_template=function(template_name){
  var tpl= clone_obj(this.templates[template_name]);
//  console.log("TPL= " + JSON.stringify(tpl));
  this.substitute_templates(tpl);
  //console.log("TPL AFTER= " + JSON.stringify(tpl));
//  console.log("TPL= " + JSON.stringify(this.templates));
  return tpl;
}

template_ui_builders={};

template_ui_builders.default_before=function(ui_opts, tpl_item){
    tpl_item.get_value=function(){return tpl_item.value; }
}
template_ui_builders.default_after=function(ui_opts, tpl_item){

    if(typeof tpl_item.set_value != 'undefined' && typeof tpl_item.value != 'undefined'){
	tpl_item.set_value(tpl_item.value);
    }
}

template_ui_builders.vector=function(ui_opts, tpl_item){

}

template_ui_builders.labelled_vector=function(ui_opts, tpl_item){
    var ui=tpl_item.ui=ce("ul");
    ui.className="labelled_vector";
    tpl_item.inputs=[];

    switch (ui_opts.type){
    case "short":
	for(var v=0;v<tpl_item.value.length;v++){
	    var li=ce("li"), label=ce("label"), val=ce("span");
	    tpl_item.inputs.push(val);
	    val.className="value";
	    //val.innerHTML=tpl_item.value[v];
	    label.innerHTML=tpl_item.value_labels[v];
	    label.appendChild(val);
	    li.appendChild(label);
	    ui.appendChild(li);
	}
	tpl_item.set_value=function(nv){
	    if(nv)tpl_item.value=nv;
	    for(var v=0;v<tpl_item.value.length;v++){
		tpl_item.inputs[v].innerHTML=Math.floor(tpl_item.value[v]*1000)/1000;
	    }
	    //ui.innerHTML=tpl_item.value? "yes":"no";
	}
	
	break;
    case "edit":
	for(var v=0;v<tpl_item.value.length;v++){
	    var li=ce("li"), label=ce("label"), inp=ce("input");
	    tpl_item.inputs.push(inp);
	    if(ui_opts.input_type)
		inp.type=ui_opts.input_type;
	    else
		inp.type="number";

	    inp.v=v;

	    if(tpl_item.min) inp.min=tpl_item.min;
	    if(tpl_item.max) inp.max=tpl_item.max;
	    if(tpl_item.step) inp.step=tpl_item.step;

	    inp.value=tpl_item.value[v];
	 
	    inp.onchange=function(){
		tpl_item.value[this.v]=this.value*1.0;
		if(tpl_item.onchange) tpl_item.onchange();
	    }
	    label.innerHTML=tpl_item.value_labels[v];
	    label.appendChild(inp);
	    li.appendChild(label);

	    ui.appendChild(li);
	}
	
	tpl_item.set_value=function(nv){
	    if(nv)tpl_item.value=nv;
	    for(var v=0;v<tpl_item.value.length;v++){
		tpl_item.inputs[v].value=tpl_item.value[v];
	    }
	    //ui.innerHTML=tpl_item.value? "yes":"no";
	}
	break;
    default:
	throw "Unknown UI type ";
    }
    
    
    return tpl_item.ui;
    
}

template_ui_builders.local_file=function(ui_opts, tpl_item){
    switch (ui_opts.type){
    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="local_file";
	ui.innerHTML=tpl_item.value;

	break;
    case "edit": 
	var ui=tpl_item.ui=ce("input");
	ui.className="local_file";
	ui.type="file";

	ui.addEventListener("change",function(evt){
	    tpl_item.value=this.value;
	    if(tpl_item.onchange){
		tpl_item.onchange(evt);
	    }
	}, false);
	break;
    default: 
	throw "Unknown UI type ";
    }

    tpl_item.set_value=function(nv){
	if(nv)tpl_item.value=nv;
	ui.innerHTML=tpl_item.value;
    }
    return tpl_item.ui;
}

template_ui_builders.bytesize=function(ui_opts, tpl_item){
    template_ui_builders.double(ui_opts, tpl_item);

    switch (ui_opts.type){
    case "short":
	tpl_item.format_number=function(v){
	    var u=["","k","M","G","T"];
	    var id=0,idmax=4;
	    var val=v, unit='bytes';
	    while(val>1024 && id<idmax){
		val=val/1024.0;
		id++;
	    };
	    
	    return val + " " +u[id]+unit;
	};
	tpl_item.set_value=function(nv){
	    if(typeof nv!='undefined')tpl_item.value=nv;
	    //console.log("setting val : " + tpl_item.value);
	    tpl_item.ui.innerHTML=tpl_item.format_number(tpl_item.value);
	}
	break;
    case "edit": 
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    
    return tpl_item.ui;
}

template_ui_builders.bool=function(ui_opts, tpl_item){

    switch (ui_opts.type){

    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(nv){
	    if(nv)tpl_item.value=nv;
	    ui.innerHTML=tpl_item.value? "yes":"no";
	}
	break;
    case "edit": 
	var ui=tpl_item.ui=ce("input");
	ui.type="checkbox";
	tpl_item.set_value=function(nv){
	    if(nv)tpl_item.value=nv;
	    ui.checked=tpl_item.value;
	}
	tpl_item.get_value=function(){
	    return ui.checked;
	}
	if(tpl_item.onchange){
	    ui.onchange=function(){
		tpl_item.value=this.checked; 
		tpl_item.onchange();
	    }
	}
	break;
    default: 
	throw "Unknown UI type ";
    }
    
    
    return tpl_item.ui;
}



template_ui_builders.double=function(ui_opts, tpl_item){
    //console.log("double builder :  " + JSON.stringify(ui_opts));
    switch (ui_opts.type){
    case "short":
	var ui=tpl_item.ui=ce("span");
	ui.className="value";
	tpl_item.set_value=function(){ui.innerHTML=Math.floor(tpl_item.value*1000)/1000;}
	break;
    case "edit": 
	var ui=tpl_item.ui=ce("input");
	if(ui_opts.input_type)
	    ui.type=ui_opts.input_type;
	else
	    ui.type="number";
	if(tpl_item.min) ui.min=tpl_item.min;
	if(tpl_item.max) ui.max=tpl_item.max;
	if(tpl_item.step) ui.step=tpl_item.step;
	tpl_item.get_value=function(){return tpl_item.value;}
	tpl_item.set_value=function(nv){if(nv)tpl_item.value=nv; ui.value=tpl_item.value}
	ui.addEventListener("change",function(){
	    tpl_item.value=this.value*1.0; 
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	break;
    default: 
	throw "Unknown UI type ";
    }
    return tpl_item.ui;
}

template_ui_builders.action=function(ui_opts, tpl_item){
    var ui=tpl_item.ui=ce("input"); ui.type="button";
    ui.value=tpl_item.name;

    ui.addEventListener("click",function(){
	if(tpl_item.onclick){
	    tpl_item.onclick();
	}
    },false);

    tpl_item.ui_root.removeChild(tpl_item.ui_name);
    
    return ui;
}

template_ui_builders.vector=function(ui_opts, tpl_item){

    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };
    var ui=tpl_item.ui=ce("div"); ui.className="plot_container";
    var margin = ui_opts.margin;
    var width = ui_opts.width - margin.left - margin.right;
    var height = ui_opts.height- margin.top - margin.bottom;
    
    var x = d3.scale.linear().range([0, width]);
    var y = d3.scale.sqrt().range([height, 0]);
    
    var xAxis = d3.svg.axis().scale(x).orient("bottom");    
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
	
    var brush = d3.svg.brush().x(x).on("brushend", brushed);
	
    var area = d3.svg.area().interpolate("step-before")
	.x(function(d) { return x(d.x); })
	.y0(height)
	.y1(function(d) { return y(d.n); });
    

	
    var bn=d3.select(ui);
	//d3.select("svg").remove();

    var brg=null;
    var xmarg, xw, ymarg;

    var svg = bn.append('svg');
	//base_node.appendChild(svg.ownerSVGElement);
	
    svg.attr("width", width + margin.left + margin.right);
    svg.attr("height", height + margin.top + margin.bottom);

    context = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var histo=lay.histo;
    if(x_domain==null){
	x_domain=[histo[0].x*1.0,histo[histo.length-1].x*1.0];
    }
	
	x.domain(x_domain);//
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	y.domain(d3.extent(lay.histo, function(d) { return d.n; }));
	
	
	
	var xsvg = context.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);
	
	
	xmarg=margin.left; //this.getBBox().x;
	ymarg=margin.top; //this.getBBox().x;
	
	xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    xw=this.getBBox().width;
	});	       
	
	
	var ysvg=context.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Number of pixels");
	
	// ysvg.each(function(){
	// 		 console.log("YAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 	     });	       
	
	var pathsvg=context.append("path")
	    .datum(lay.histo)
	    .attr("class", "line")
	//.attr("d", line);
	    .attr("d", area);
	
	// pathsvg.each(function(){
	// 		    console.log("PATH: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	// 		});
	
	
	/*
	  fv.cmap.domnode.style.marginLeft=(xmarg-2.0)+'px';
	  fv.cmap.domnode.style.width=(xw+0.0)+'px';
	  fv.cmap.domnode.style.height=(50+0.0)+'px';
	  fv.cmap.domnode.style.marginTop='-10px';
	*/	       
	
	// cmap.display();
	
	var height2=height;
	
	brg=context.append("g")
	    .attr("class", "brush")
	    .call(brush);
	
	brg.selectAll("rect")
	    .attr("y", -6)
	    .attr("height", height2 + 7);
	
	brg.selectAll(".resize").append("path").attr("d", resizePath);
	
	//			   
	
	
	//base_node.appendChild(fv.cmap.domnode);
	
	
	//		   brush.extent([data[0].pixvalue*1.0,data[data.length-1].pixvalue*1.0]);
	brush.extent(x_domain);//[fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	
	
	

	
	function resizePath(d) {
	    var e = +(d == "e"),
	    x = e ? 1 : -1,
	    y = height / 3;
	    
	    //brushed();
	    //x+=xmarg;
	    
	    return "M" + (.5 * x) + "," + y
		+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
		+ "V" + (2 * y - 6)
		+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
		+ "Z"
		+ "M" + (2.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8)
		+ "M" + (4.5 * x) + "," + (y + 8)
		+ "V" + (2 * y - 8);
	    
	    
	}
	
	
	
	//brush.extent([2000,4000]);
	//svg.select(".brush").call(brush);		   
	brushed();
	//
	//ready_function();
 	//brush(context);
	
	//$('#bottom_space')[0].innerHTML='<br/><br/>The End!<br/>';
	
	//   brush.extent([0.2, 0.8]);
	//  svg.select(".brush").call(brush);		   
	
	// var gBrush = g.append("g").attr("class", "brush").call(brush);
	// gBrush.selectAll("rect").attr("height", height);
	// gBrush.selectAll(".resize").append("path").attr("d", resizePath);
	
	function brushed() {
	    
	    // brush.extent();
	    
	    //	console.log("Helllo ! " );
	    cuts.value[0]=lay.p_values[0]=brush.extent()[0];
	    cuts.value[1]=lay.p_values[1]=brush.extent()[1];
	    cuts.set_value();
	    
	    //console.log("Hello " + lay.p_values[0] + ","+lay.p_values[1]);
	    update_pvalues();
	    //low_cut.value=fv.viewer_cuts[0];
	    //high_cut.value=fv.viewer_cuts[1];
	    
	    
	    svg.select(".brush").call(brush);
	    
	    
	    if(brg!=null){
		
		
		//cmap.domnode.style.width=(brg[1].getBBox().width+0.0)+'px';
		//cmap.domnode.style.marginLeft=(brg[1].getBBox().x+xmarg)+'px';
		

		var bid=0;
		
		brg.selectAll("rect").each(function(){
		    
		    // brg.each(function(){
		    //console.log("BRUSH "+bid+": x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
		    if(bid==1){
			cmap.domnode.style.width=(this.getBBox().width+0.0)+'px';
			cmap.domnode.style.marginLeft=(this.getBBox().x+xmarg)+'px';
			
		    }
		    bid++;
		    
		});	       	
		
	    }else
		console.log("brg is NULL !");
	    
	    //	    fv.cmap.display();
	    
	}

}


template_ui_builders.color=function(ui_opts, tpl_item){

    
    var ui=tpl_item.ui=ce("div"); ui.className="color_container";
    var cui=ce("input"); cui.type="color";
    ui.appendChild(cui);
    
    cui.addEventListener("change", function() {
        ui.style.backgroundColor = cui.value;    
    },false);
    ui.style.backgroundColor = cui.value;    
    
    tpl_item.set_value=function(nv){
	if(nv)tpl_item.value=nv;
	cui.value=tpl_item.value;
    }

    switch (ui_opts.type){
    case "short":
	break;
    case "edit": 
	cui.addEventListener("change",function(){
	    tpl_item.value=this.value; 
	    if(tpl_item.onchange){
		tpl_item.onchange();
	    }
	},false);
	break;
    default: 
	throw "Unknown UI type ";
    }
    return tpl_item.ui;
}

template_ui_builders.angle=function(ui_opts, tpl_item){
    return template_ui_builders.double(ui_opts, tpl_item);
}

function create_item_ui(ui_opts, tpl_node){
    var tpl_name=tpl_node.type;
    if(typeof tpl_name=='undefined') throw "No valid template name on tpl_node...";
    if(tpl_name=="template") return;
    //console.log("Building ["+tpl_name+"]");//...." + JSON.stringify(tpl_node,null,4));
    var builder=template_ui_builders[tpl_name];
    if (!builder){
	throw "Cannot build object type [" + tpl_name +"]";
    }
    template_ui_builders.default_before(ui_opts,tpl_node);
    var ui=builder(ui_opts, tpl_node);
    template_ui_builders.default_after(ui_opts,tpl_node);
    return ui;
}


function create_ui(global_ui_opts, tpl_root, depth){

    if(!depth){
	depth=0;
    }

    //if(typeof tpl_root.ui_opts == 'undefined' ) tpl_root.ui_opts={type:"short"}; 

    if(typeof tpl_root.ui_opts == 'undefined') tpl_root.ui_opts=global_ui_opts;
    else
	for(var o in global_ui_opts) 
	    if(!tpl_root.ui_opts[o])tpl_root.ui_opts[o]=global_ui_opts[o];

    var ui_opts=tpl_root.ui_opts;    
    var ui_root=tpl_root.ui_root=ce("div"); 

    var ui_name=tpl_root.ui_name= ui_opts.label ? ce("label") : ce("h1");

    ui_root.className="db";

    if(!ui_opts.label)
	ui_name.className="dbname";

    if(depth==0) ui_root.className+=" root";

    if(typeof ui_opts.root_classes != 'undefined')
	add_classes(ui_opts.root_classes, ui_root);
    
    if(typeof ui_opts.name_classes != 'undefined')
	add_classes(ui_opts.name_classes, ui_name);
    
    ui_root.appendChild(ui_name); 
    ui_name.innerHTML=tpl_root.name;


    function rebuild(){
	var new_ui=create_ui(global_ui_opts,tpl_root, depth );
	var cnt=new_ui.container=tpl_root.container;
	cnt.replace_child(new_ui, ui_root);
    }
    
    if(ui_opts.editable){

	var clickable_zone;
	if(ui_opts.type=="edit"){
	    ui_root.className+=" un_editable";
	    clickable_zone=ui_name;
	}else{
	    ui_root.className+=" editable";
	    clickable_zone=ui_root;
	}
	
	clickable_zone.addEventListener("click", function(){
	    console.log("Editable clicked");
	    if(ui_opts.type=="edit"){
		ui_opts.type="short";
	    }else{
		ui_opts.type="edit";
	    }
	    rebuild();
	}, false);
    }
    
    
    if(tpl_root.type){
	try{
	    
	    var item_ui=create_item_ui(ui_opts, tpl_root);
	    if(item_ui){
		if(ui_opts.label){
		    ui_name.appendChild(item_ui);
		    item_ui.className+=" value";
		}
		else{
		    ui_root.appendChild(item_ui);
		    item_ui.className+=" dbitem";
		}
		
		if(typeof ui_opts.item_classes != 'undefined')
		    add_classes(ui_opts.item_classes, item_ui);
	    }
	}
	catch(e){
	    console.log("Error building : " + dump_error(e));
	}
    }

    //var ne=0; for (var e in tpl_root.elements){ console.log(tpl_root.name + " + E("+ne+")="+e); ne++; }
    //console.log(tpl_root.name + " : -->Nchilds = " + ne);
    
    if(!tpl_root.elements) return ui_root;

    var cvtype = tpl_root.ui_opts.child_view_type ? tpl_root.ui_opts.child_view_type : "div";
    var ui_childs={};

    switch(cvtype){
    case "div":
	ui_childs.div=ce("div"); 
	ui_childs.div.className="childs";
	ui_childs.add_child=function(e,ui){ui_childs.div.appendChild(ui);}
	ui_childs.replace_child=function(new_ui,ui){
	    ui_childs.div.replaceChild(new_ui, ui);
	    console.log("Replaced UI!");
	}
	break;
    case "tabbed":
	ui_childs=new tab_widget();
	ui_childs.div.className+=" childs";
	ui_childs.add_child=function(e,ui){
	    var f=ui_childs.add_frame(e.name); 
	    e.ui_root.removeChild(e.ui_name);
	    f.div.appendChild(ui);
	}
	ui_childs.replace_child=function(new_ui,ui){ui.div.replaceChild(new_ui, ui);}
	break;
    }
    if(typeof ui_opts.child_classes != 'undefined')
	add_classes(ui_opts.child_classes, ui_childs.div);
    
    ui_root.appendChild(ui_childs.div);

    for (var e in tpl_root.elements){
	var e=tpl_root.elements[e];
	e.container=ui_childs;
	var ui=create_ui(global_ui_opts,e, depth+1 );
	
	
	ui_childs.add_child(e,ui);
    }

    return ui_root;
}



function attach_menu(tpl_root, menu){
    menu.ul.style.zIndex=20;
    tpl_root.ui_root.replaceChild(menu.ul, tpl_root.ui_name); 
}
