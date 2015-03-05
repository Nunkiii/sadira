
function widget(){
    this.dims=[500,300];
    this.title="widget!";
    this.build();
    return this;
}

widget.prototype.build=function(){
    var wid=this;
    new_event(wid, "resize");
    var w=this.widget_div=ce("div");w.className="widget";
    w.style.zIndex=15;
    var top_bar=this.topbar=cc("div",w); top_bar.add_class("topbar");
    var content=this.content=cc("div",w);content.className="content";

    top_bar.innerHTML="";//<div class='container'><span class='h4'>Widget Title [X][Y][Z]</span></div>";
    content.innerHTML="";//Hello World !";

    w.style.width=this.dims[0]+"px";
    w.style.height=this.dims[1]+"px";

    var border_zone=15;
    var select_type=-1, select_pos=[0,0]; //Type : 0=border, 1=corner Pos : 0=left,top 1=right,bottom

    function border_mousedown(e){
	if(select_type==-1) return;

	e.preventDefault();
	var lastX = e.pageX;
	var lastY = e.pageY;
	
	function on_move(e) {
	    e.preventDefault();
	    e.stopPropagation();

	    var deltaX = e.pageX - lastX;
	    //lastX = e.pageX;
	    var deltaY = e.pageY - lastY;
	    //lastY = e.pageY;

	    if(select_type==2){//title bar
		w.style.top=(brect.top+deltaY)+"px";
		w.style.left=(brect.left+deltaX)+"px";
		return;
	    }
	    
	    if(select_type){//corner
		if(select_pos[0]){ //bottom
		    if(select_pos[1]){ //right
			w.style.width=(brect.width+deltaX)+"px";
			w.style.height=(brect.height+deltaY)+"px";
		    }else{ //left
			w.style.width=(brect.width-deltaX)+"px";
			w.style.left=(brect.left+deltaX)+"px";
			w.style.height=(brect.height+deltaY)+"px";
		    }
		}else{ //top
		    if(select_pos[1]){ //right
			w.style.height=(brect.height-deltaY)+"px";
			w.style.top=(brect.top+deltaY)+"px";
			w.style.width=(brect.width+deltaX)+"px";
		    }else{ //left
			w.style.height=(brect.height-deltaY)+"px";
			w.style.top=(brect.top+deltaY)+"px";
			w.style.width=(brect.width-deltaX)+"px";
			w.style.left=(brect.left+deltaX)+"px";
		    }
		}
	    }else{ //border
		if(select_pos[0]){ 
		    if(select_pos[1]){ //bottom
			w.style.height=(brect.height+deltaY)+"px";
		    }else{ //top
			w.style.height=(brect.height-deltaY)+"px";
			w.style.top=(brect.top+deltaY)+"px";
		    }
		}else{
		    if(select_pos[1]){ //right
			w.style.width=(brect.width+deltaX)+"px";
			//brect.width
		    }else{ //left
			w.style.width=(brect.width-deltaX)+"px";
			w.style.left=(brect.left+deltaX)+"px";
		    }
		}
	    }

	    //wid.trigger("resize", {x : w.offsetLeft, y : w.offsetTop, w : w.clientWidth, h: w.clientHeight} );
	    
	    /*
	    var sty=document.defaultView.getComputedStyle(cnt);
	    var m=sty.marginLeft+sty.marginRight;
	    frac += deltaX / parseFloat(sty.width) * 100;
	    */
	}
	
	function on_up(e) {
	    e.preventDefault();
	    e.stopPropagation();
	    //document.documentElement.remove_class('dragging');
	    
	    document.documentElement.removeEventListener('mousemove', on_move, true);
	    document.documentElement.removeEventListener('mouseup', on_up, true);
	    //console.log("Done move..."); 
	    //console.log("MouseUp !");
	}
	
	
	//document.documentElement.add_class('dragging');
	document.documentElement.addEventListener('mousemove', on_move, true);
	document.documentElement.addEventListener('mouseup', on_up, true);

	var brect={};//w.getBoundingClientRect();
	//console.log("MouseDown !" + select_type + " pos " + JSON.stringify(select_pos) + " bound " + JSON.stringify(brect) + " CW " + w.clientWidth);

	brect.width=brect.w=w.clientWidth;
	brect.height=brect.h=w.clientHeight;
	brect.left=brect.x=w.offsetLeft;
	brect.top=brect.y=w.offsetTop;
	
	//console.log("corrected bounds " + JSON.stringify(brect));
	//wid.trigger("resize", {x : w.offsetLeft, y : w.offsetTop, w : w.clientWidth, h: w.clientHeight} );
    }
    
    var top_zone;

    
    function wmouse_move(ev){
	
	var rect=w.getBoundingClientRect();
	var x=ev.clientX-rect.left, y=ev.clientY-rect.top;
	//console.log("Move " + x + ", " + y);
	
	if(y<border_zone){ //top
	    if(x<border_zone){ //left corner
		select_type=1;select_pos=[0,0];
		w.style.cursor="nw-resize";
	    }else if(x>=(rect.width-border_zone)){ //right corner
		select_type=1;select_pos=[0,1];		
		w.style.cursor="ne-resize";
	    }else{ //top resize
		select_type=0;select_pos=[1,0];
		w.style.cursor="n-resize";
	    }
	    
	}else
	    if(y<(border_zone+top_zone)){ //top zone (move win)
		//console.log("Top.... "+ y + " < " + (border_zone*1.0+ top_zone*1.0));
		select_type=2;
		w.style.cursor="move";
	    }else
		
		if(y>=(rect.height-border_zone)){ //bottom
		    if(x<border_zone){ //left corner
			select_type=1;select_pos=[1,0];
			w.style.cursor="sw-resize";
		    }else if(x>=(rect.width-border_zone)){ //right corner
			select_type=1;select_pos=[1,1];
			w.style.cursor="se-resize";
		    }else{ //bottom resize
			select_type=0;select_pos=[1,1];
			w.style.cursor="s-resize";
		    }
		    
		}else{ //middle
		    if(x<border_zone){ //left corner
			select_type=0;select_pos=[0,0];
			w.style.cursor="w-resize";
		    }else if(x>=(rect.width-border_zone)){ //right corner
			select_type=0;select_pos=[0,1];
			w.style.cursor="e-resize";
		    }else{
			select_type=-1;
			w.style.cursor="auto";
		    }
		}

	wid.trigger("resize", {x : w.offsetLeft, y : w.offsetTop, w : w.clientWidth, h: w.clientHeight} );
    }

    
    w.addEventListener("mouseenter", function (ev){
	

	top_zone=top_bar.clientHeight*1.0-border_zone;
	//console.log("Widget mouse enter " + ev.clientX + ", " + ev.clientY + "top zone " + top_zone);
	w.addEventListener("mousemove", wmouse_move);
	w.addEventListener('mousedown', border_mousedown, false);


	//ev.currentTarget.style.border="3px solid orange";
    });

    w.addEventListener("mouseleave", function (ev){
	//console.log("Widget mouse leave " + ev.clientX + ", " + ev.clientY);
	//ev.currentTarget.style.border="3px solid orange";
	w.removeEventListener("mousemove", wmouse_move);
	w.removeEventListener('mousedown', border_mousedown, false);
	
    });

    
    return w;
};


(function(){
    window.addEventListener("load",function(){
//    console.log("Hello A window !");
    });
})();
