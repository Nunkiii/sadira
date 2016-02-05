({
    name:"Toolbar",
    key:"toolbar",
    
    ui_opts:{
	root_node:"nav",
	root_classes:["navbar navbar-light"],
	name_node:"a",
	name_classes:"navbar-brand",
	child_classes:[ "collapse navbar-toggleable-xs" ]
    },
    elements:{},
    
    widget_builder:function (ok, fail){
	
	var tb=this;
	//console.log("Building toolbar " + this.name + " UIR " + this.ui_root);
	
	var cnt=this.ui_root; //ce('div');cnt.className='container-fluid';
	//this.ui_root.appendChild(cnt);
	this.ui_name.href='javascript:void(0)';
	//var name_cnt=ce('div');name_cnt.className='navbar-header';
	//cnt.appendChild(name_cnt);
	
	var tbid=Math.random().toString(36).substring(2);
	var but=ce("button");

	but.className="navbar-toggler hidden-sm-up pull-right";
	but.setAttribute('data-toggle','collapse');
	but.setAttribute('data-target','#'+tbid);

	but.innerHTML="&#9776;";

	cnt.appendChild(but);
	
	//var sp=cc("span",but); sp.className="sr-only"; sp.innerHTML="Toggle navigation";
	// sp=cc("span",but); sp.className="icon-bar";
	// sp=cc("span",but); sp.className="icon-bar";
	// sp=cc("span",but); sp.className="icon-bar"; 
	
	if(this.ui_name!==undefined)
	    cnt.appendChild(this.ui_name);
	
	if(this.ui_childs.div!==undefined){
	    cnt.appendChild(this.ui_childs.div);
	    this.ui_childs.div.id=tbid;
	}else
	    console.log(this.name+"("+this.type+"): no ui_childs.div !");

	

	if(this.parent!==undefined && this.parent.usi.toolbar!==undefined)
	    this.ui_root.style.zIndex=this.parent.usi.toolbar.ui_root.style.zIndex-1;
	
	//console.log("Building toolbar " + this.name + " OKOK ");

	
	ok();
    //ok(cnt);
    }
})
