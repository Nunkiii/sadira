({ name:"Pie Chart",
  ui_opts:{ root_classes:[ "container-fluid" ] },
  widget_builder:function (ok, fail){
	    var pchart=this;
	    
	    var width = 300,
		height = 200,
		radius = Math.min(width, height) / 2;
	    
	    var ui = ce('div'); var dui=d3.select(ui);
	    var svg =dui.append("svg")
		//.attr('viewBox',"0 0 300 200")
	    	//.attr("preserveAspectRatio", "none")
		.attr('width', width)
	    	.attr('height', height)
		.append("g");
	    
	    svg.append("g")
		.attr("class", "slices");
	    svg.append("g")
		.attr("class", "labels");
	    svg.append("g")
		.attr("class", "lines");


	    var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
		    //console.log("DATA " + d);
		    return d.value*1.0;
		});

	    var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.4);

	    var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	    var key = function(d){
		//console.log("Get " + JSON.stringify(d));
		
		return d.data.key;
	    };
	    var color = d3.scale.category20();
	    //var color = d3.scale.ordinal();
		// .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
		// .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	    
	    function randomData (){
		//return [ [0, 10], [1, 30], [2, 60] ];
		return [
		    { key: "X", value: Math.random() },
		    { key: "Y", value: Math.random() },
		    { key: "Z", value: Math.random() },
		    { key: "T", value: Math.random() }
		];
	    }
	    
	    

	    // d3.select(".randomize")
	    // 	.on("click", function(){
	    // 	    change(randomData());
	    // 	});


	    this.set_data=function(data) {
		var text = svg.select(".labels").selectAll("text");
		var polyline = svg.select(".lines").selectAll("polyline");
		var slice = svg.select(".slices").selectAll("path.slice");
		var slice = svg.select(".slices").selectAll("path.slice");
		
		if(data.filter(function(d) { return d.value > 0; }).length > 0) {
		    
		    //data=randomData();
		    //console.log("Set data " + JSON.stringify(data));
		    //return;
		    /* ------- PIE SLICES -------*/


		    var sd=slice.data(pie(data), key);
		    
		    sd.enter()
			.insert("path")
			.style("fill", function(d,i) { return color(i); // d.data.label);
						     })
			.attr("class", "slice");
		    
		    sd
			.transition().duration(1000)
			.attrTween("d", function(d) {
			    this._current = this._current || d;
			    
			    var interpolate = d3.interpolate(this._current, d);
			    this._current = interpolate(0);
			    return function(t) {
				return arc(interpolate(t));
			    };
			})
		    
		    sd.exit()
			.remove();
		    
		    /* ------- TEXT LABELS -------*/
		    
		    

		    
		    var td=text.data(pie(data), key);
		    
		    td.enter()
			.append("text")
			.attr("dy", ".35em")
			.text(function(d) {
			    //return d.data.key;
			    return d.data.key + "("+d.data.value+")" ;
			});
		    
		    function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		    }
		    
		    td.transition().duration(1000)
			.attrTween("transform", function(d) {
			    this._current = this._current || d;
			    var interpolate = d3.interpolate(this._current, d);
			    this._current = interpolate(0);
			    return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			    };
			})
			.styleTween("text-anchor", function(d){
			    this._current = this._current || d;
			    var interpolate = d3.interpolate(this._current, d);
			    this._current = interpolate(0);
			    return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			    };
			});
		    
		    td.exit()
			.remove();

		    
		    
		    
		    /* ------- SLICE TO TEXT POLYLINES -------*/
		    
		    
		    var pd=polyline.data(pie(data), key);
		    
		    pd.enter()
			.append("polyline");
		    
		    pd.transition().duration(1000)
			.attrTween("points", function(d){
			    this._current = this._current || d;
			    var interpolate = d3.interpolate(this._current, d);
			    this._current = interpolate(0);
			    return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
				return [arc.centroid(d2), outerArc.centroid(d2), pos];
			    };
			});
		    
		    pd.exit()
			.remove();
		}else{
		    text.remove();
		    polyline.remove();
		    slice.remove();
		}
	    }
	    this.set_data(randomData());
      ok(ui);
      
	},
  key:"pie_chart" })
