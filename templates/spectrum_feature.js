({ name:"Spectrum feature",
  plot_type:"pixel",
  ui_opts:{ fa_icon:"magnet",
    name_edit:true,
    child_classes:[ "container-fluid" ] },
  elements:{ wl:{ name:"Wavelength",
      type:"double",
      min:0,
      max:30000,
      value:0,
      ui_opts:{ editable:true,
        label:true } },
    pixel:{ name:"Pixel",
      type:"double",
      min:0,
      max:20000,
      step:1,
      value:0,
      ui_opts:{ editable:true,
        label:true } } },
   widget_builder:function (ok, fail){
       var feature=this;
       var ui_opts=this.ui_opts;
       
	    var deltatext=20;

	    feature.draw=function(context, view){
		var lineg = context.append('g');
		var label_text=feature.name; 

		var lineval=feature.get(feature.plot_type);
			//var sv=this; //spectro_view;
		var r=view.xr;
		var w=view.width;
		//var ar=view.vw/r[1];
		var m=lineval.value===undefined? w/2.0 : // pixel.value/r[1]*w; //(r[1]-r[0])/2.0*w;
		    view.xscale(lineval.value);
		//console.log("Range is " + r[0] + ", " + r[1] + " pos is " + m );
		var y1=5;//view.ui_opts.margin.bottom;
		var y2=view.height;
		
		//console.log("Draw feature...." + label_text + " y1 " + y1 + " y2 " + y2) ;
		//pixel.set_value(m);
		
		var spectrum_line=lineg.append('line')
		    .attr('x1',m)
		    .attr('y1',y1)
		    .attr('x2',m)
		    .attr('y2',y2)
		    .attr('stroke','rgba(100,150,150,.5)')
		    .attr('fill','purple')
		    .attr('stroke-width','3')
		    .attr('stroke-linecap','round');	

		var g = context.append('g');
		
		var label= g.append('text')
		    .attr('x',m-deltatext)
		    .attr('y',-3)
		    .attr("font-family", "sans-serif")
	            .attr("font-size", "8px")
	            .attr("fill", "purple")
		    .text(label_text);
		    //.attr('transform',' rotate(90,'+ (m-deltatext) +','+ (-3) + ')');
		
			
		spectrum_line.node().addEventListener('mousedown', function(e) {
		    
		    e.preventDefault();
		    var xlast=spectrum_line.attr('x1');
		    //var last = e.pageX;
		    var last = e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;

		    var svgn=view.svg.node();
		    var cw=svgn.clientWidth || svgn.parentNode.clientWidth;
		    var ar= cw/view.vw ;

		    //console.log("DRAG BEGIN " + last + " xlast " + xlast +  " ar " + ar + " vw " + view.vw + " cw = " + cw );

		    document.documentElement.add_class('dragging');
		    document.documentElement.addEventListener('mousemove', on_move, true);
		    document.documentElement.addEventListener('mouseup', on_up, true);
		    
		    function on_move(e) {
			
			e.preventDefault();
			e.stopPropagation();
			
			var pos= e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			var delta = pos - last;
			//last = pos;
			var newp = xlast*1.0+delta/ar;
			
			//console.log("DELTAPOS : " + delta + " newp " + newp + " AR " + ar);
			//var x1=spectrum_line.attr('x1');
			spectrum_line.attr('x1',newp);
			//var x2=spectrum_line.attr('x2');
			spectrum_line.attr('x2',newp);
			label.attr('x',newp-deltatext);
			
			lineval.set_value(r[0]+newp/w*(r[1]-r[0]));
			//delta -= last;
			
		    }
		    
		    function on_up(e) {
			e.preventDefault();
			e.stopPropagation();
			document.documentElement.remove_class('dragging');
			//document.documentElement.className = document.documentElement.className.replace(/\bdragging\b/, '');
			document.documentElement.removeEventListener('mousemove', on_move, true);
			document.documentElement.removeEventListener('mouseup', on_up, true);
			//console.log("Done move..."); 
			//div.trigger("drag_end");
		    }
		    
		}, false);
	    }
       ok();
   },
  key:"spectrum_feature" })
