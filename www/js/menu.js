function menu_item(parent_item,caption,callback){

    var me=this;

    me.parent=parent_item;
    me.callback=callback;
    me.caption=caption;
    me.items=[];

    if(parent_item!=null){

	me.li=document.createElement('li');
	me.li.className='alone';
	//me.a=document.createElement('span');
	me.a=document.createElement('a');
	//me.a.href="#";
	me.a.innerHTML=caption;
	me.li.appendChild(me.a);
	me.li.onmouseover=function(ev){
//	    console.log("Opening " + me.caption);
	    me.li.add_class('hovering');
	}
	me.li.onmouseout=function(ev){
	    // console.log("Mouse leave " + me.caption);
	    me.li.remove_class('hovering');
	}
    }
    
    if(callback!=null){    
	this.a.onclick=function(ev){
	    callback(ev, me);
	}
    }
}

menu_item.prototype.set_caption=function(new_caption){
    this.caption=new_caption;
    if(this.parent!=null){
	this.a.innerHTML=new_caption;
    }
}

menu_item.prototype.has_subitems=function(){
    this.ul=document.createElement('ul');
    if(this.li!=null){
	this.li.appendChild(this.ul);
	this.li.remove_class('alone');
    }
}


menu_item.prototype.delete_subitems=function(){
    this.items=[];
    if(this.ul)
	this.ul.innerHTML="";
    delete this.ul;
}

menu_item.prototype.get_item=function(caption){

    for(var i=0;i<this.items.length;i++)
	if(this.items[i].caption === caption)
	    return this.items[i];
    return undefined;
}


menu_item.prototype.add_item=function(caption, callback){
    if(this.ul==null) this.has_subitems();
    var new_item = new menu_item(this,caption,callback);
    this.ul.appendChild(new_item.li);
    this.items.push(new_item);
    return new_item;
}


menu_item.prototype.remove_item=function(item){

    for(var i=0;i<this.items.length;i++)
	if(this.items[i] === item ){
	    this.ul.removeChild(item.li);
	    this.items.remove(i);
	    delete item;
	    
	    //Clears the ul in case there are no items left in the (sub)menu
	    if(this.items.length==0 && this.ul){ 
		this.ul.parentNode.removeChild(this.ul);
		delete this.ul;
		this.ul=null;
	    }

	    return;
	}
    throw "Item not found : " + item.caption;
}


menu_item.prototype.set_root=function(opts){
    
    this.has_subitems();
    this.ul.className="menu";
    if(typeof opts!='undefined' && typeof   opts.cls!='undefined')
	this.ul.className+=" "+opts.cls;

    //this.ul.id="nav";
    
}
