var debug=true;

// Full-featured widget class. Child of widget.base class. 

function sobj () {
    var me=this;
    //Initialisation of members
  console.log("sobj constructor ");
    widget.base.prototype.constructor.apply(this,arguments);
    //console.log("sobj called base constructor done");
    //    this.constructor();

    this.keep=false; //The widget will be replaced.
    this.selected_child=null; //Selected child currently visible 

    // The widget is an <article> tag
    this.widget_div=document.createElement('article');

    // Header of the widget: normally it contains a title and a
    // navigation menu.
    this.top_div=document.createElement('header');
    //this.top_div.className="top_div";


    // First <section>: the eventual childs of this widgets
    this.childs_div=document.createElement('div');
    this.childs_div.className="childs"; 


    // Second <section>: the actual content of this peculiar widget
    this.widget_content_div=document.createElement('div');
    this.widget_content_div.className="widget_content_div";
    // Eventual extra content of the widget
    this.widget_extra=document.createElement('aside');
    //The div containing the list childs.
    this.widget_listed_childs=document.createElement('div');
    this.widget_listed_childs.className='content';
    // Footer of the widget
    this.widget_footer=document.createElement('footer');

    this.main_content_div=document.createElement('section');
    this.main_content_div.className='main_content';
    



    this.tab_nav=document.createElement('nav');
    //Tab-ul for the tabbed childs
    this.tab_ul=document.createElement('ul');
    this.tab_nav.appendChild(this.tab_ul);
    this.childs_div.appendChild(this.tab_nav);
    this.tab_nav.style.display="none";

    //Tab-view for the curently visible child
    this.tab_nav_view=document.createElement('div');
    this.tab_nav_view.className='tab_nav_view';
    this.childs_div.appendChild(this.tab_nav_view);


    // Attaching main sections to the widget
    this.widget_div.appendChild(this.top_div);
    this.widget_div.appendChild(this.childs_div);

    //this.main_content_div.appendChild(this.top_div);
    this.main_content_div.appendChild(this.widget_content_div);
    this.main_content_div.appendChild(this.widget_listed_childs);
    this.main_content_div.appendChild(this.widget_extra);
    this.main_content_div.appendChild(this.widget_footer);
    

    if(this.title==null)
     	this.title=this.widget_name;
    
    this.widget_div.dataset.widget=this.widget_name; 

    
    /*
    this.li=document.createElement('li');
    this.sp_title=document.createElement('a');
    this.sp_title.innerHTML=this.title;
    this.li.appendChild(this.sp_title);

    this.li.onclick=function(event){
	//console.log('click select child ' + child_widget.widget_name );
	me.change_selected_child(); //this);//.widget);
    }

    this.tab_ul.appendChild(this.li);
    this.li.style.display='none';
    */

    this.change_selected_child();


    this.dom_parent=null;
    //this.title="Untitled";
    // this.set_widget_name("sobj");
}

sobj.prototype = new widget.base(); 
sobj.prototype.constructor = sobj; 


//Function called after the object construction.

sobj.prototype.init = function(cb) {
    cb(null,this);
}


//Configuring and attaching the title to the widget's top <ul> tag.

sobj.prototype.set_title = function(title_html){
    var me=this;

    this.dom_widget_title=document.createElement('h1');
    this.display_title=true;
    
    if(typeof title_html=='undefined')
	title_html=this.title;
    
   // this.dom_widget_title.className="widget_title";

    this.dom_widget_title.onclick=function(event){
	//console.log('click select child ' + child_widget.widget_name );
	    me.change_selected_child(); //this);//.widget);
    }
    
    this.dom_widget_title.innerHTML=title_html;
    this.top_div.appendChild(this.dom_widget_title);    
}

//Configuring and attaching menu 

sobj.prototype.set_menu = function(menubar){

    if(typeof menubar == 'undefined')
	menubar=this.menubar;

    if(typeof menubar == 'undefined')
	throw "No menubar found or passed as arg !";
    
    this.top_nav=document.createElement('nav');
    this.top_nav.className='topnav';
    this.top_nav.appendChild(menubar.ul);
    this.top_div.appendChild(this.top_nav);

    menubar.ul.style.zIndex=20-this.widget_depth();
}

//Setting up the top widget buttons and actions

sobj.prototype.set_top_buttons = function(opts){

    var where=opts.where;
    var so=this;

    //Creating top windows buttons

    so.top_buttons_ul=document.createElement('ul');

    //so.top_buttons_ul.style.display="inline-block";
    //so.top_buttons_ul.style.cssFloat="right";
    

    if(so.description){
	var d=document.createElement('div');
	d.className='description_nav';
	d.innerHTML=so.description;
	so.top_div.appendChild(d);
    }
    
    if(where=='list'){
	so.top_buttons_ul.className="list_buttons";
	so.top_div.prependChild(so.top_buttons_ul);
    }

    if(where=='top'){
	so.top_buttons_ul.className="top_buttons";
	so.widget_content_div.prependChild(so.top_buttons_ul);
    }

    if(where=='tab'){
	so.li.appendChild(so.top_buttons_ul);
	so.top_buttons_ul.className="tab_buttons";
    }
    //so.top_buttons_ul.style.background='red';

    var a;

    li=document.createElement('li');
    a= document.createElement('button');
    a.className="icon-popup";
    li.appendChild(a);
    so.top_buttons_ul.appendChild(li);

    a.onclick=function(event){
	return; //Todo... postMessage = cpu@100%? 
	var w = window.open("index.html");
	//w.transfer(" Yes!");
	//w.document.doctype('<!DOCTYPE HTML>');
	//w.document.createElement('html');
	var nm=0;
	setInterval(function(){
	    w.postMessage("I want to send you a widget " + nm, "http://localhost:9999"); nm++;
	}, 2000);

	so.widget_div.parentNode.removeChild(so.widget_div);
	w.document.body.appendChild(so.widget_div);

    };
    

    li=document.createElement('li');
    a= document.createElement('button');
    a.className="icon-cancel";
    li.appendChild(a);
    so.top_buttons_ul.appendChild(li);

    
    //console.log("widget " + so.widget_name + " attach button events...");
    a.onclick=function(event){
	//console.log("Delete widget "+ so.widget_name +":"+ so.widget_id);
	so.parent_widget.delete_child_widget(so.widget_id);
    };
    

    if(debug){
     	this.dom_widget_addr=document.createElement('span');
	this.dom_widget_addr.className="widget_addr";
	this.dom_widget_addr.innerHTML="Widget("+this.widget_name+") address : " +this.widget_addr();
     	this.widget_footer.appendChild(this.dom_widget_addr);
    }


}

sobj.prototype.set_html = function(cb){
    var me=this;

    //console.log('Getting html for ' + this.widget_name);

    if(typeof this.html != 'undefined'){
	
	//console.log('Inline HTML !');
	this.html(function(content){
	    me.widget_content_div.innerHTML=content;
	    cb();
	});
	
    }
    else{

	download_url(this.get_html_template(), function(content){
	    me.widget_content_div.innerHTML=content; 
	    //console.log("content is " + content);
	    cb();
	} ); 
    }
}

//Returns the top level DOM object used by this widget 
sobj.prototype.get_dom_object = function(){
    return this.widget_div;
}
//Returns the parent DOM object to which this widget is curently attached
sobj.prototype.get_dom_parent = function(){
    return this.dom_parent;
}

sobj.prototype.attach_to = function(domo){
    domo.appendChild(this.widget_div);
    this.dom_parent=domo;
}


//Add a new widget, configure it and attaches it on its new parent's html strucutre.

sobj.prototype.add_widget = function(child_widget, options, widget_ready_cb){
    
    this.add_child(child_widget);
    
    if(typeof options == 'undefined') options={where: 'tab', notitle : false};

    var where=options.where;
    var notitle=options.notitle;
    
    
    var so=this;

    child_widget.where=where;

    
    var child_position_handlers = {
	list : {
	    cleanup_func : function (child, parent){
		parent.widget_listed_childs.removeChild(child.widget_div);
	    },

	    attach_func : function(child, parent){
		//child.li=document.createElement('div'); //Can remove this div also
		//child.li.appendChild(child.widget_div);
		parent.widget_listed_childs.appendChild(child.widget_div);
	    }
	},
	
	top : {
	    cleanup_func : function (child, parent){
		parent.widget_div.removeChild(child.widget_div);
	    },
	    attach_func : function(child, parent){
		insertAfter(parent.top_div,child.widget_div);
	    }
	},
	tab : {
	    cleanup_func : function (child, parent){

		console.log("TAB Cleanup : parent " + parent.widget_name + " child " + child.widget_name + ":"+child.widget_addr() + " N childs = " + parent.child_widgets.length);
		
	    	parent.tab_ul.removeChild(child.li);
		
		if(typeof parent.selected_child!= 'undefined')
		    console.log("Curently selected is  " + parent.selected_child.widget_name + " : " + parent.selected_child.widget_addr());
		
		if(parent.child_widgets.length>0){
		    
		    if(child==parent.selected_child){
		
			console.log("Remove selected tab child : " + child.widget_name );// so.child_widgets[0].where);
			var idx=parent.get_widget_idx(child);
			var ii=idx+1;
			while(ii<parent.child_widgets.length && parent.child_widgets[ii].where!='tab') ii++;
			
			if(ii<parent.child_widgets.length){
			    //console.log('chainging to next '+ii);
			    parent.change_selected_child(parent.child_widgets[ii]);
			}
			else{
			    
			    ii=idx-1;
			    while(ii>=0 && parent.child_widgets[ii].where!='tab') ii--;
			    if(ii>=0 && ii<parent.child_widgets.length){
				//console.log('chainging to previous '+ii);
				parent.change_selected_child(parent.child_widgets[ii]);
				
			    }
			    else
				parent.change_selected_child(null);
		    
			}

		    }
		}
	    },
	    
	    attach_func : function(child, parent){
	    	var li=document.createElement('li');

		parent.tab_nav.style.display="block";
		    
		child.sp_title=document.createElement('a');
		child.sp_title.innerHTML=child.title;
		li.appendChild(child.sp_title);
		child.li=li;
		child.sp_title.onclick=function(event){
		    //console.log('click select child ' + child_widget.widget_name );
		    parent.change_selected_child(child); //this);//.widget);
		}
		parent.tab_ul.appendChild(li);
		parent.change_selected_child(child);
	    }

	},
	table : {}
    };

    child_widget.child_cleanup = child_position_handlers[where].cleanup_func;
    child_widget.child_attach = child_position_handlers[where].attach_func;


    try{
	//Loading the widget's HTML content on widget_content_div.
	child_widget.set_html(function(){
	    //console.log(child_widget.title + ' HTML set');
	    
	    if(!notitle)
		child_widget.set_title();    
	    
	    child_widget.init(function(error, child){
		
		child_widget.child_attach(child_widget, so);
		/*
		if(where=='tab'){
		    
		    var li=document.createElement('li');
		    
		    child_widget.sp_title=document.createElement('a');
		    child_widget.sp_title.innerHTML=child_widget.title;
		    li.appendChild(child_widget.sp_title);
		    child_widget.li=li;
		    child_widget.sp_title.onclick=function(event){
			//console.log('click select child ' + child_widget.widget_name );
			so.change_selected_child(child_widget); //this);//.widget);
		    }
		    so.tab_ul.appendChild(li);
		    so.change_selected_child(child_widget);
		}

		if(where=='top'){
		    //child_widget.widget_div.style.display='none';
		    
		    //so.widget_div.insertBefore(child_widget.widget_div, so.childs_div);
		    //so.widget_div.
		    insertAfter(so.top_div,child_widget.widget_div);
		    
		}
		
		
		if(where=='list'){
		    child_widget.li=document.createElement('div'); //Can remove this div also
		    child_widget.li.appendChild(child_widget.widget_div);
		    so.widget_listed_childs.appendChild(child_widget.li);
		}
		*/
		
		//Placing the top buttons.
		child_widget.set_top_buttons(options);
		
		if(child_widget.post_init) 
		    child_widget.post_init();
		
		if(typeof widget_ready_cb != 'undefined')
		    widget_ready_cb(null, child_widget);

	    });
	    
	});
	
	
    }
    catch (e){
	var ems="Error while constructing "+ child_widget.widget_name + " : "  + e;
	console.log(ems);
	if(typeof widget_ready_cb != 'undefined')
	    widget_ready_cb(ems);
    }
     
}


//Change the curently visible child widget in the tab view. If null is passed, no widget is displayed.

sobj.prototype.change_selected_child = function(new_selected_child){

    if(typeof new_selected_child == 'undefined') new_selected_child=this;
    if(new_selected_child==null) new_selected_child=this;
    
    if(this.selected_child!=null && this.selected_child!=new_selected_child){
	if(this.selected_child==this)
	    this.tab_nav_view.removeChild(this.selected_child.main_content_div);//widget_content_div);
	else{
	    this.tab_nav_view.removeChild(this.selected_child.widget_div);
	    this.selected_child.li.className="";
	}
    }
    
    
    if(this.selected_child!=new_selected_child){
	this.selected_child=new_selected_child;
	
	//if(new_selected_child!=null){
	if(this.selected_child==this)
	    this.tab_nav_view.appendChild(this.selected_child.main_content_div);//widget_content_div);
	//console.log("new selected child is " + new_selected_child.widget_name + ' id: ' + new_selected_child.widget_id);
	else{
	    this.tab_nav_view.appendChild(this.selected_child.widget_div);
	    this.selected_child.li.className="selected";//_tab";
	}

	

	var ntabs=this.tab_ul.childNodes.length;

	// if(ntabs>1){
	//     this.li.style.display='inline-block';
	//     //console.log("NTABS="+ntabs);
	// }
	// if(ntabs<=1)
	//     ;//this.li.style.display='none';
	// //   }
	
	
	
    }
}

sobj.prototype.cleanup = function(cb){
    //console.log("Cleanup done for child : " + child.widget_name + '('+child.widget_id+') where : '+ child.where + ' nchilds = ' + so.child_widgets.length );
    //console.log(this.widget_name + "["+this.widget_addr()+"] : cleaning up the bits...");

    if(typeof this.child_cleanup != 'undefined'){

	if(typeof this.parent_widget!='undefined'){
	    console.log("Calling child cleanup !");
	    this.child_cleanup(this, this.parent_widget);
	}
    }
    //this.change_selected_child(null);
    //this.parent_widget.change_selected_child();
    
    /*
    var so=this.parent_widget;
    var child=this;
    var idx=so.get_widget_idx(this);


    if(child.where=='list'){
	so.widget_listed_childs.removeChild(child.li);
    }

    if(child.where=='top'){
	so.widget_div.removeChild(child.widget_div);
    }
    
    if(child.where=='tab'){
	
	so.tab_ul.removeChild(child.li);
	
	if(so.child_widgets.length>1){
	    
	    if(child==so.selected_child){
		console.log("Remove selected tab child : " + child.widget_name );// so.child_widgets[0].where);
		
		var ii=idx+1;
		while(ii<so.child_widgets.length && so.child_widgets[ii].where!='tab') ii++;
		
		if(ii<so.child_widgets.length){
		    //console.log('chainging to next '+ii);
		    so.change_selected_child(so.child_widgets[ii]);
		}
		else{
		    
		    ii=idx-1;
		    while(ii>=0 && so.child_widgets[ii].where!='tab') ii--;
		    if(ii>=0 && ii<so.child_widgets.length){
			//console.log('chainging to previous '+ii);
			so.change_selected_child(so.child_widgets[ii]);
			
		    }
		    else
			so.change_selected_child(null);
		    
		}
	    }
	}else{
	    //console.log('Last child...');
	    so.change_selected_child(null);
	}
    }
    */

    cb();
    
}



//Returns a dom object present in this widget's HTML dom structure. 
//The returned object is identified by its tag name and name property.

sobj.prototype.get_dom_object = function(tag_name, name){
//    console.log("Get dom "+ tag_name + ", "+name+" and I am " + this.widget_name);
    var tmp_objects=this.widget_div.getElementsByTagName(tag_name);
    for(var i=0;i<tmp_objects.length;i++) 
	if(tmp_objects[i].getAttribute("name") == name)
	    return tmp_objects[i];
    return null;
}

//Returns a dom object present in this widget's HTML dom structure based on a selector.

sobj.prototype.select = function(selector){
    var tmp_objects=this.widget_div.querySelectorAll(selector);
    for(var i=0;i<tmp_objects.length;i++) 
	if(tmp_objects[i].dataset)
	    return tmp_objects[i];
    return null;
}



//End of sobj code.
