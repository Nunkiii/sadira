({ name:"Vector view",
  ui_opts:{ item_classes:"vector_plot",
    item_bottom:true,
    enable_range:false,
    enable_selection:false },
  elements:{ btns:{ store:false,
      ui_opts:{ root_classes:[ "inline" ],
        child_classes:[ "inline" ] },
      elements:{} },
    ctls:{ ui_opts:{ root_classes:[ "inline" ],
        child_classes:[ "container-fluid" ] },
      elements:{ range:{ type:"labelled_vector",
          name:"Range",
          value_labels:[ "from",
            "to",
            "zoom" ],
          value:[ 0,
            0,
            0 ],
          ui_opts:{ root_classes:[ "inline" ],
            label:true,
            fa_icon:"arrows-h",
            child_classes:[ "inline" ] } },
        selection:{ type:"labelled_vector",
          name:"Selection",
          value_labels:[ "start",
            "end" ],
          value:[ 0,
            0 ],
          ui_opts:{ root_classes:[ "inline" ],
            child_classes:[ "inline" ],
            label:true,
            fa_icon:"edit",
            sliding:true,
            slided:false } },
        lines:{ name:"Plots",
          ui_opts:{ label:true,
            root_classes:[ "inline" ],
            child_classes:[ "inline" ],
            sliding:true,
            slided:false } },
        logscale:{ name:"Log scale",
          type:"bool",
          ui_opts:{ label:true,
            root_classes:[ "inline" ],
            type:"edit" } } } } },
  key:"vector",
  widget_builder:function (){

//    console.log("Building vec : " + vec.name + " parent " + vec.parent.name + " value length =  " + vec.value.length);
    
    var vec=this;
    var ui_opts=vec.ui_opts;
    var lines=vec.get("lines");
    var logscale=vec.get("logscale");
    var range=vec.get("range");


    var ui=vec.ui=ce("div");
    

    var brush, select_brush;

//    vec.value=[];    
    vec.plots=[];

    
    var bn=d3.select(ui);//vec.ui_childs.div);
    var vw=vec.vw=400, vh=vec.vh=200;
    var pr;
    
    var svg = vec.svg=bn.append('svg')
	.attr("viewBox", "0 0 "+vw+" "+vh)
	.attr("preserveAspectRatio", "none");
    
//	.attr("preserveAspectRatio", "xMinYMin meet");
    //base_node.appendChild(svg.ownerSVGElement);

    vec.svg_node=svg.node(); //[0][0].ownerSVGElement;
    
    var margin = vec.ui_opts.margin= {top: 12, right: 8, bottom: 25, left: 50}; //ui_opts.margin;
    //var width = vec.parent.ui_root.clientWidth //ui_opts.width 
    var width=vec.width=vw - margin.left - margin.right;
    var height =vec.height= vh- margin.top - margin.bottom;
    var height2=height/2.0;

    var xr=vec.xr=[1e30,-1e30];
    var yr=vec.yr=[1e30,-1e30];
    
    //console.log("Drawing vector w,h=" + width + ", " + height );
    
    var xscale = vec.xscale=d3.scale.linear().range([0, width]);
    var xAxis = d3.svg.axis().scale(xscale).orient("bottom").ticks(5);
    
    var yscale;
    var yAxis;

    function setup_yaxis(){
	if(ui_opts.yscale !== undefined && ui_opts.yscale==='log')
	    yscale = vec.yscale=d3.scale.log().range([height, 0]);
	else yscale = vec.yscale=d3.scale.linear().range([height, 0]);

	yAxis= d3.svg.axis().scale(yscale).orient("left").ticks(5);
    }

    logscale.set_value( ui_opts.yscale==='log');

    setup_yaxis();

    logscale.listen('change', function(islog){
	ui_opts.yscale= islog ? "log" : "linear";
	setup_yaxis();
	vec.config_range();
    });
    

    if(ui_opts.enable_range===false)
	range.hide(true);
    else{
	brush = d3.svg.brush().x(xscale).on("brushend", range_changed);
	new_event(vec,"range_change");
    }
    
    var selection=vec.get("selection");

    if(ui_opts.enable_selection===false)
	selection.hide(true);
    else{
	new_event(vec,"selection_change");
	select_brush = d3.svg.brush().x(xscale).on("brush", selection_changed);
    }


    var d3zoom = d3.behavior.zoom()
	.scaleExtent([1, 10])
        .on("zoom",function(){
	    //console.log("Zooom " + JSON.stringify(d3.event));
	    range.set_value([d3.event.translate[0], d3.event.translate[1], d3.event.scale]);
	    vec.redraw();

	})
	// .on("zoom", function(){
	//     console.log("ZOOOOOOM !!!");
	// })
    ;
    
    var zoom_rect=vec.svg.append("rect")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")	
    //.attr("transform", "translate(0," + height + ")")
	.attr("class", "pane")
	.attr("width", width)
	.attr("height", height)
	.call(d3zoom);

    

    // var zzoom = d3.behavior.zoom()
    //     //.x(x)
    //     .xExtent([-2000,2000])
    //     //.y(y)
    //     .yExtent([-1500,1500])
    //     .scaleExtent([0.1, 10]);
    
    
    new_event(vec,'redraw');

    vec.xlabel="X";
    vec.ylabel="Y";

    vec.serialize=function(){
	//vec.value=[];
	return {};
    }

    vec.deserialize=function(v){
    }
    
    /*
    vec.serialize=function(){
	var v=[];
	vec.value.forEach(function(p){
	    v.push({ data : p.data, args: p.args, opts: p.opts}  );
	});
	return v;
    }

    vec.deserialize=function(v){
	if(v===undefined) return;
	vec.value=vec.plots=[];
	lines.elements={};
	if(lines.ui_childs!==undefined && lines.ui_childs.div!==undefined)
	    lines.ui_childs.div.innerHTML="";
	
	v.forEach(function(p){
	    //var args=p.args;
	    //args.unshift(
	    //console.log(vec.name + " : deserialize new plot .... nplots="+vec.value.length );
	    var pp=vec.add_plot_linear(p.data,0,1);
	    if(è(p.opts))
		pp.set_opts(p.opts);

	    //vec.ui_root.innerHTML+="<h2>SPEC</h2>"+JSON.stringify(pp.data, null, 3) + " <h4>opts</h4>" + JSON.stringify(p.opts, null, 3);
	});

	vec.redraw();
	vec.config_range();
    }
    */
    
    vec.set_value=function(v){
	if(v!==undefined){

	    console.log("Vector set val " + v.length + " ==? " + ( v===vec.value) + " TYPE  " + typeof(v[0]) + " cons  ");
	    //vec.value=v;
	    var plots = vec.value;
	    //console.log("Vector set value to " + JSON.stringify(value));
	    if(v.length===undefined){
		console.log("Data is not a vector!");
		return;
	    }

	    if(v.length===0){
		console.log("Data is null size vector!");
		return;
	    }

	    if(typeof v[0] =='number'){
		console.log("Setting raw data points from value..." + v.length);
		var dta=v.slice();
		console.log("Setting raw data points from value..." + v.length + " dta " + dta.length);
		vec.value=[];
		console.log("Setting raw data points from value..." + v.length + " dta " + dta.length);
		v=dta;
		console.log("Setting raw data points from value..." + v.length);
		
	    }
	    
	    if(vec.value.length==0){
		var start =vec.start || 0;
		var step=vec.step || 1;
		vec.add_plot_linear(v, start, step);
		//return;
	    }

	    this.config_range();
	    // if(ù(pr))
	    // 	pr=context.append("path");
	    
	    // pr.datum(v)
	    // 	.attr("class", "line_black")
	    // 	.attr("d", vec.line);
	    
	    //range.set_value([0,v.length-1]);
	    
	    //if(range.value[0]==null || range.value[1]==null){
		//this.set_range([0,v.length-1]);
	    //}

	    
	}
	
    }
    
    
    vec.set_selection=function(new_sel){
	selection.set_value(new_sel);
	if(è(select_brush))
	    select_brush.extent(new_sel);
	
	var sv=selection.value;
	var selw=sv[1]-sv[0];
	
	var r=[sv[0]-selw, sv[1]+selw];	
	var plots=vec.value;
	
	if(plots!==undefined && plots.length>0){
	    function get_x(x){return plots[0].x(x);};
	    var d=plots[0].data.length;
	    if(r[0]< get_x(0))
		r[0]=get_x(0);
	    if(r[1]> get_x(d-1))
		r[0]=get_x(d-1)
	}

	vec.trigger("selection_change", selection.value);
    }
    
    
    function selection_changed() {
	//svg.select(".select_brush").call(select_brush);
	
	selection.set_value(select_brush.extent());
	vec.trigger("selection_change", selection.value);
	//	    fv.cmap.display();
    }

    

    vec.config_range=function(xconf, yconf){

	if(xconf===undefined) xconf=true;
	if(yconf===undefined) yconf=true;
	
	var plots = vec.value;

	if(plots===undefined) return;
	
	xr=vec.xr=[1e30,-1e30];
	yr=vec.yr=[1e30,-1e30];
	
	for (var p=0;p<plots.length;p++){
	    var pl=plots[p];
	    
	    //console.log("Config Range : plot "+p+" ND " +plots[p].data.length);
	    if(pl.le===undefined){
		console.log("Bug");
		break;
	    }
	    
	    if(pl.le.val('enable')){
		//for(var x in pl) console.log("PL " + x);
		var pll= pl.data.length;
		//console.log("PLL start " +pl.args[0] + ", step " + pl.args[1] );
		var x_id=pl.x_id===undefined? 0 : pl.x_id;
		var y_id=pl.y_id===undefined? 0 : pl.y_id;

		
		if(vec.x_range!==undefined){
		    if(vec.x_range[0]<xr[0])xr[0]=vec.x_range[0];
		    if(vec.x_range[1]>xr[1])xr[1]=vec.x_range[1];
		}else{
		    var ix;
		    for(var j=0; j < pll ; j++){
			
			if(pl.x!==undefined){
			    ix=pl.x(j);
			}else
			    ix=pl.data[j][x_id];
			
			if(ix<xr[0])xr[0]=ix;
			if(ix>xr[1])xr[1]=ix;
		    }
		}
		
		if(vec.y_range!==undefined){
		    if(vec.y_range[0]<yr[0])yr[0]=vec.y_range[0];
		    if(vec.y_range[1]>yr[1])yr[1]=vec.y_range[1];
		}else{
		    var iy;
		    
		    for(var j=0; j < pll ; j++){
		    
			if(pl.x!==undefined){
			    iy=pl.data[j];
			}else{
			    iy=pl.data[j][y_id];
			}
			
			if(iy<yr[0])yr[0]=iy;
			if(iy>yr[1])yr[1]=iy;
		    }
		}

	    }
	}
	//xr=[0,24];
	
	if(xconf){

	    if((xr[1]-xr[0]) == 0 || xr[0]==1e30 || xr[1]==-1e30){
		xr[0]=0;xr[1]=1.0;
	    }

	    
	    
	    //vec.set_range(xr);
	    xscale.domain(xr);
	    //console.log("Config zoom " + JSON.stringify(xscale.domain()));
	    d3zoom.x(xscale);
	    //for(var p in d3zoom) console.log(" P = " + p + " type " + typeof d3zoom[p]);
	    d3zoom.xExtent(xr);

	    if(selection.value[0]<xr[0] || selection.value[1]>xr[1])
		selection.set_value(xr);
	    
	    if(è(brush))brush.extent(range.value);
	    if(è(select_brush)){
		select_brush.x(d3zoom.x());
		//select_brush.y(d3zoom.y());
		select_brush.extent(selection.value);
	    }
	    
	}

	if(yconf){
	    if((yr[1]-yr[0])==0 || yr[0]===1e30 || yr[1]===-1e30){
		yr[0]=0;yr[1]=1.0;
	    }
	    if(ui_opts.yscale==='log' && yr[0]<=0){
		yr[0]=0.1;

		yscale.clamp(true).domain(yr).nice();
	    }else
		yscale.domain(yr);
	}
	
	//console.log("Config ranges : ["+xr[0]+","+xr[1]+" ]Y ["+yr[0]+","+yr[1]+"]");
	vec.redraw();
	return;
	//x.domain([fv.viewer_cuts[0],fv.viewer_cuts[1]]);
	//if(è(vec.y_range)){
	//     y.domain(vec.y_range);
	// }else
	//     y.domain(yr); //d3.extent(data, function(d) { return d; }));
    }
    
    
	//xsvg.each(function(){
	    //	 console.log("XAXIS: x=" + this.getBBox().x + " y=" + this.getBBox().y+ " w=" + this.getBBox().width+ " h=" + this.getBBox().height);
	    //xw=this.getBBox().width;
	//});	       
	

    
    //{width: 200, height: 100, margin : {top: 0, right: 10, bottom: 30, left: 50} };

    new_event(vec, 'mousemove');

    vec.svg.on('mousemove', function () {
	
	var mpx= d3.mouse(this);
	var mp =[
	    vec.xr[0]+(mpx[0]-margin.left)/vec.width*(vec.xr[1]-vec.xr[0]),
	    vec.yr[1]-((mpx[1]-margin.top)/vec.height)*(vec.yr[1]-vec.yr[0]),
	    mpx[0],mpx[1]];
	
	vec.trigger('mousemove', mp);
    });
    
    
    if(ui_opts.show_cursor===true){
	vec.cursor=vec.get('btns').add_child(
	    create_widget({
		name : "Cursor ",
		type : "labelled_vector", value : [0,0],
		value_labels : ["C<sub>X</sub>","C<sub>Y</sub>"],
		ui_opts : {
		    label : true,
		    root_classes : ["container-fluid inline"],
		    child_classes : ["inline"],
		    sliding: true,
		    slided : true
		}
	    }), 'cursor');
	
	vec.listen('mousemove', function(mp){
	    vec.cursor.set_value([mp[0],mp[1]]);
	});
    }
    
    if(ui_opts.cursor_shape!==undefined){
	
	var cursor_line=vec.svg.append('line')
	    .attr('x1',10)
	    .attr('y1',margin.top)
	    .attr('x2',10)
	    .attr('y2',vec.height+margin.top)
	    .attr('stroke','rgba(50,50,50,1.0)')
	    .attr('stroke-width','1')
	    .attr('pointer-events', 'none')
	    .attr('stroke-linecap','round');	
	
	
	vec.listen('mousemove', function(mp){
	    cursor_line.attr('x1',mp[2]);
	    cursor_line.attr('x2',mp[2]);
	});
	
    }

    
    vec.redraw=function(){
	
	if(range.value[0]==null || range.value[1]==null){
	    //this.set_range([0,this.value.length-1]);
	    console.log("Vector : No range set !");
	    return;
	}

	// if(d3.event!==null){
	//     var t = d3.event.translate,
	// 	s = d3.event.scale;

	//     console.log("Checking zoom ! " + t[0] + ", " + t[1] + " scale " + s);

	//     t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
	//     t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));

	//     console.log("Set T : " + t[0] + ", " + t[1] + " scale " + s);
	//     d3zoom.translate(t);
	// }
	
	var brg=vec.brg=null,select_brg=vec.select_brg=null;

	vec.svg.select("g").remove();
	
	var context= vec.svg.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	    //.attr('z-index', 10)
	;	
	
	//console.log("VECTOR REDRAW ! Nplots=" + vec.value.length + " zoom " + xscale.domain());
	vec.xr= xscale.domain();
	
	var xsvg = context.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .append("text")
	    .attr("transform", "translate(" + (width / 2) + " ," + (margin.bottom) + ")")
	//.attr("transform", "rotate(-90)")
	//.attr("y", 6)
	//.attr("dy", ".71em")
	    .style("text-anchor", "middle")
	    .text(vec.xlabel);
	
	
	var ysvg=context.append("g")
	    .attr("class", "axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "translate(0,"+height/2+") rotate(-90)")
	    .attr("y", -2*margin.left/3)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text(vec.ylabel);
	
	xAxis.scale(xscale);
	yAxis.scale(yscale);

	xsvg.call(xAxis);
	ysvg.call(yAxis);

	

	//d3zoom.on("zoom", vec.redraw);
	
	if(ui_opts.enable_range!==false){
	    
	    brg=context.append("g").attr("class", "brush").call(brush);
	    brg.selectAll("rect").attr("y", height2).attr("height", height2 + 7);	
	    brg.selectAll(".resize").append("path").attr("d", resizePath).attr("transform", "translate(0," + height2 + ")");
	    svg.select(".brush").call(brush);
	}

	if(ui_opts.enable_selection!==false){

	    //select_brush.x(d3zoom.x());
	    //select_brush.y(d3zoom.y());
	    select_brush.extent(selection.value);
	    
	    select_brg=vec.select_brg=context.append("g").attr("class", "select_brush").call(select_brush);
	    select_brg.selectAll("rect").attr("y", -6).attr("height", height2);	
	    select_brg.selectAll(".resize").append("path").attr("d", resizePath);
	    svg.select(".select_brush").call(select_brush);
	}

	
	if(vec.value!==undefined)
	    for(var i=0;i<vec.value.length;i++){
		if(vec.value[i].redraw !== undefined)
		    vec.value[i].redraw(context);
		else
		    console.log("Bug no redraw func on plot !");
	    }
	
	//console.log("redraw trigger  " + context);
	vec.trigger("redraw", context);
    }
    
    function xfunc_linear(id, start, step){
	return start + id*step;
    }

    //var plot_tpl = ;
    
    function create_line_label(p, label, color){
	var le_tpl={
	    
	    ui_opts : {
		    //render_name : false,
		label : true,
		root_classes : ["inline"],
		child_classes : ["panel panel-default btn-xs horizontal_margin inline"]
	    },
	    elements : {
		enable : {
		    name :  label,
		    type : "bool",
		    value : true,
		    ui_opts : {
			type: "edit", label : true, root_classes : ["inline"],
		    }
		    
		},
		line_color : {
		    type : "color",
		    ui_opts : {
			root_classes : ["inline"],
			type : 'edit',
		    },
		    value : color

		},
	    }
	};

	var le=create_widget(le_tpl, lines);
	
	lines.add_child(le,label);
	le.elements.enable.listen("change", function () { vec.config_range();} );
	le.elements.line_color.listen("change", function (c) {
	    p.stroke=this.value; vec.config_range(false,false);
	});
	
	//le.elements.enable.trigger("change");
	p.le=le;
	return le;
    }
    
    
    var plot=function(data, xfunc, args){

	var p=this;

	p.data= data.slice();
	if(xfunc===undefined)
	    xfunc=xfunc_linear;

	p.xfunc=xfunc;
	//p.args=args;
	//args.unshift(0);
	p.args=[0];
	for(var i=0;i<args.length;i++) p.args.push(args[i]);
	p.x=function(id){
	    p.args[0]=id;
	    return p.xfunc.apply(p, p.args);
	}
	
	p.line=vec.line=d3.svg.line()
	    .x(function(d,i) { return xscale(p.x(i)); })
	    .y(function(d,i) {
		var s=p.x(i);
		// if(s<xscale.domain()[0])
		//     return 10000.0;
		//else
		    return yscale(d);
	    })
	;
	//.interpolate("linear");
	var plots = vec.value;
	p.set_opts=function(opts){
	    
	    p.opts=opts;
	    p.stroke=opts.stroke || "#000";
	    
	    p.stroke_width=opts.stroke_width || "1px";
	    p.fill=opts.fill || "none";
	    
	    var pl = plots===undefined ? 0 : plots.length;
	    var defname="Line"+ (pl+1);
	    
	    p.label=opts.label===undefined ? defname : opts.label;
	    
	    if(p.le===undefined){
		p.le=create_line_label(p, p.label, p.stroke)
	    }else{
		p.le.set('line_color',p.stroke);
		p.le.get('enable').set_title(p.label);
	    }
	}
	
	p.set_opts({});
	
	p.redraw=function(context){
	    if(p.data.length>0)
		if(p.data[0]===NaN)
		    return;
	    
	    var buf=[];
	    //p.le.elements.enable.set_title(p.label);
	    p.le.elements.line_color.set_value(p.stroke);
	    
	    if(p.le.elements.enable.value && p.data.length!==0){
		p.path=context.append("path");
		p.path.attr("stroke", p.stroke);
		p.path.attr("stroke-width", p.stroke_width);
		p.path.attr("fill", p.fill);

		//p//.attr("d", lineFunction(lineData))
		//p.path
		//.attr("class", "line_black")
		p.path.attr("d",p.line(p.data));
			    
			   
	    }
	}
    };
    
    
    var points_plot=function(data, opts){

	var p=this;

	p.data= data;
	if(opts===undefined) opts = {};
	
	var x_id=p.x_id = opts.x_id === undefined ? 0 : opts.x_id;
	var y_id=p.y_id = opts.y_id === undefined ? 1 : opts.y_id;
	
	p.line=d3.svg.line()
	    .x(function(d,i) {
		if(opts.x_filter!==undefined) return xscale(opts.x_filter(d[x_id],d[y_id]));
		return xscale(d[x_id]);
	    })
	    .y(function(d,i) {
		if(opts.y_filter!==undefined) return yscale(opts.y_filter(d[x_id],d[y_id]));
		return yscale(d[y_id]);
	    });
	//.interpolate("linear");
	
	if(vec.value===undefined) vec.value=[];
	var plots = vec.value;
	//var defname="line"+ (plots.length+1);
	
	p.stroke_width=opts.stroke_width || "1px";
	p.fill=opts.fill || "none";
	p.label=opts.label || ("Line " + (plots.length+1));


	var ple=create_line_label(p,p.label, '#77f');
	p.stroke=p.le.elements.line_color.value; //opts.stroke || "black";
	
	var draw_dots=true;
	
	p.redraw=function(context){
	    
	    ple.elements.enable.set_title(p.label);
	    
	    if(ple.elements.enable.value && p.data.length!==0){
		
		//var g=context.append('g');

		p.path=context.append("path");
		p.path.attr("stroke", p.stroke);
		p.path.attr("stroke-width", p.stroke_width);
		p.path.attr("fill", p.fill);

		//p//.attr("d", lineFunction(lineData))
		//p.path
		//.attr("class", "line_black")
		p.path.attr("d",
			    p.line(p.data)
			   );
		
		
		// draw dots
		
		if(draw_dots){
		    context.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 2)
			.attr("cx", function(d){ return xscale(d[x_id]);})
			.attr("cy", function(d){
			    //console.log("Get " + y_id + " : " + d[y_id] + " : " + yscale(d[y_id]));
			    return yscale(d[y_id]);
			})
			.style("fill", p.stroke);
		    
		// .on("mouseover", function(d) {
		    // 	tooltip.transition()
		    // 	    .duration(200)
		    // 	    .style("opacity", .9);
		    // 	tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
		    // 		     + ", " + yValue(d) + ")")
		    // 	    .style("left", (d3.event.pageX + 5) + "px")
		    // 	    .style("top", (d3.event.pageY - 28) + "px");
		    // })
		    // .on("mouseout", function(d) {
		    // 	tooltip.transition()
		    // 	    .duration(500)
		    // 	    .style("opacity", 0);
		    // });
		}
		// context.selectAll('circles')
		//     .data(p.data)
		//     .enter()
		//     .append('circle')
		//     .attr("cx", function(d) {
		// 	return d[0];
		//     })
		//     .attr("cy", function(d) {
		// 	return d[1];
		//     })
		//     .attr("r", 5)
		//     .attr('fill','red');

		// context.selectAll("texts")
		//     .data(p.data)
		//     .enter()
		//     .append("text")
		//     .text(function(d) {
		// 	return d[0] + "," + d[1];
		//     })
		//     .attr("font-family", "sans-serif")
		//     .attr("font-size", "11px")
		//     .attr("fill", "red");
		
		// p.path=context.append("path");
		// p.path.attr("stroke", p.stroke);
		// p.path.attr("stroke-width", p.stroke_width);
		// p.path.attr("fill", p.fill);
		
		// p.path.datum(p.data)
		// //.attr("class", "line_black")
		//     .attr("d", p.line);
		
		//console.log("plot redraw..." + "DL = " +p.data.length  + " D0 = " + p.data[0][0]);
		
		context.append("text")
		    .attr("transform", "translate(" + (5) + "," + (yscale(p.data[0][y_id])-10) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .attr("font-size", "10px")
		    .style("fill", p.stroke)
		    .text(p.label);
	    }
	}
    };


    var function_plot=function(func, opts){

	var p=this;

	p.range=(opts.range===undefined) ? vec.xr : opts.range;
	p.sampling=(opts.sampling!==undefined) ? opts.sampling : 1.0;
	
	p.line=d3.svg.line()
	    .x(function(d,i) { return xscale(d[0]); })
	    .y(function(d,i) { return yscale(d[1]); });
	
	p.label=(opts.label===undefined) ? "Function"+ (vec.value.length+1) : opts.label;
	
	p.stroke=opts.stroke || "#000";
	p.stroke_width=opts.stroke_width || "1px";
	p.fill=opts.fill || "none";

	p.le=create_line_label(p,p.label, p.stroke);
	
	// p.le={ type : "bool", value : true, name : p.label, ui_opts : {type: "edit", label : true, root_classes : ["inline"]} };
	// create_ui({},p.le);
	// lines.add_child(p.le,p.label);
	// p.le.listen("change", function () { vec.config_range();} );

	function sample_data(){
	    p.data=[];
	    for(var x=p.range[0];x<=p.range[1];x+=p.sampling){
		p.data.push([x,func(x)]);
	    }
	    //console.log("FUNC " + JSON.stringify(p.data));
	}
	
	//p.set_opts({});
	p.redraw=function(context_in){
	    
	    if(!p.le.elements.enable.value) return;
	    
	    if(context_in!==undefined){
		p.context=context_in.append("g");
	    }
	    
	    var context=p.context;
	    

	    context.select("path").remove();
	    context.select("text").remove();
	    
	    //p.le.set_title(p.label);
	    sample_data();
	    
	    if(p.le.value && p.data.length!==0){
		
		p.path=context.append("path");
		p.path.attr("stroke", p.stroke);
		p.path.attr("stroke-width", p.stroke_width);
		p.path.attr("fill", p.fill);
		
		p.path.attr("d",
			    p.line(p.data)
			   );
		
		// p.path.datum(p.data)
		// 	//.attr("class", "line_black")
		// 	.attr("d", p.line);
		
		
		context.append("text")
		    .attr("transform", "translate(" + (5) + "," + (yscale(p.data[0][1])-10) + ")")
		    .attr("dy", ".35em")
		    .attr("text-anchor", "start")
		    .attr("font-size", "10px")
		    .style("fill", p.stroke)
		    .text(p.label);
	    }
	}

	sample_data();
	
    };

    vec.add_plot=function(data, xfunc){
	//console.log("Adding plot DL=" + data.length + " ... ");
	var args=[];
	
	if(arguments.length>2){
	    for(var a=0;a<arguments.length;a++)
		args.push(arguments[a+2]);
	}

	
	var p=new plot(data, xfunc, args);
	if(this.value===undefined) this.value=[];
	    
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    vec.add_plot_points=function(data, opts){

	var p=new points_plot(data, opts);
	if(this.value===undefined) this.value=[];
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    vec.add_plot_func=function(func, opts){

	var p=new function_plot(func, opts);
	if(this.value===undefined) this.value=[];
	this.value.push(p);
	//console.log("Added plot DL=" + p.data.length + " NP="+plots.length);
	this.config_range();
	return p;
    }

    
    
    vec.add_plot_linear=function(data, start, step){
	return this.add_plot(data, xfunc_linear, start, step);
    }


    
    // if(typeof vec.value=='undefined'){
    // 	vec.value = [];
    // }
    
    
    
    
    // var area = d3.svg.area().interpolate("step-before")
    //     .x(function(d,i) { return x(vec.start + i*vec.step); })
    //     .y0(height)
    //     .y1(function(d) { return y(d); });
    
    
    function resizePath(d) {
	var e = +(d == "e"),
	    x = e ? 1 : -1,
	    y = height2 / 3;
	
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

    
    // if( ù(vec.y_range) && è(vec.value))
    // 	vec.set_range([vec.value[0],vec.value[vec.value.length-1]]);
    

    vec.set_value(vec.value);

    // 	var start =vec.start || 0;
    // 	var step=vec.step || 1;
    // 	vec.add_plot_linear(vec.value, start, step);
    // }


    
    
    return vec.ui;
} })