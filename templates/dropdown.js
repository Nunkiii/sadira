({
    name : "Dropdown list selector",
//    items : [{label : "Ah", value : 0}],
    ui_opts:{ update_label:true },
    widget_builder:function (ok, fail){

	console.log("DROPDOWN BUILD");
	
	var dropdown=this;

	
	create_widget({
	    type : 'button', ui_opts : {  name : this.ui_opts.name, type : this.ui_opts.type || ['default']}
	}).then(function(b){

	    var div=bdiv=ce("div"); div.className="dropdown";
	    div.appendChild(b.ui_root);
	    var ul=dropdown.ul=cc('div',div);
	    ul.className='dropdown-menu';
	    new_event(dropdown,'select');

	    //console.log("Created BUT !!" + b.type);
	    dropdown.button=b;
	    b.but.add_class('dropdown-toggle');
	    b.but.setAttribute('data-toggle',"dropdown");
	    b.but.setAttribute('aria-haspopup',true);
	    b.but.setAttribute('aria-expanded',false);
	    
	    var caret=cc('span',b.but); caret.className="caret";
	    
	    //this.ui_root.appendChild(b.ui_root);
	    


	    //return ok(div);
	    //var ul=this.ul=cc('ul',this.ui_root);
	    
	    dropdown.set_button_label=function(title){
		b.but.innerHTML=title;
		var caret=cc('span',b.but); caret.className="caret";
	    }
	    
	    
      	    dropdown.clear=function(){
		ul.innerHTML="";
		dropdown.button.but.add_class('disabled');
	    }
	    
	    dropdown.add_item=function(item, id){
		//var li=item.li=cc('li', dropdown.ul);
		var a=cc('a',dropdown.ul); a.className="dropdown-item";
		a.href="javascript:void(0)";
		a.innerHTML="";
		var ico=get_icon(item);
		if(ico!==undefined) a.appendChild(ico);
		a.innerHTML+=item.label;
		console.log("Adding item " + item.label);
		a.setAttribute('data-id',id);
		a.addEventListener('click', function(){
		    //select( dd.items(li.getAttribute('data-id')));
		    //dropdown.parent.select(dropdown.parent.items[this.getAttribute('data-id')]);
		    dropdown.select(item);
		});
		
	    }
	    
	    dropdown.setup_list=function(){
		dropdown.clear();

		if(dropdown.usi.elements!==undefined){
		    for(var e in dropdown.usi.elements){
			dropdown.ul.appendChild(dropdown.usi.elements[e].ui_root);
		    }
		}
		
		if(dropdown.items===undefined) return;
		var id=0;
		console.log("Settig up set items ! " + dropdown.items.length);
		dropdown.items.forEach(function(item){
		    dropdown.add_item(item, id);
		    id++;
		});
		
		if(dropdown.button!==undefined)
		    if(dropdown.items.length>0){
			dropdown.button.but.remove_class('disabled');
			dropdown.select(dropdown.items[0]);
		    }else
			dropdown.button.but.add_class('disabled');
		
		
	    }
	    
	    dropdown.select=function(item){
		dropdown.selected=item;
		dropdown.value=item.label;
		dropdown.trigger('select',item);
		if(dropdown.ui_opts.update_label===true){
		    dropdown.button.but.innerHTML=item.label;
		    var caret=cc('span',dropdown.button.but); caret.className="caret";
		}
	    }
	    


	    dropdown.set_items=function(list){
		dropdown.items=list;
		dropdown.setup_list();
	    }
	    
	    
	    dropdown.setup_list();

	    
	    
	    if(dropdown.ui_opts.type==="toolbar"){
		var rt=ce('li'); rt.className="nav-item dropdown";
		var a=dropdown.a=cc('a',rt);
		a.className='nav-link dropdown-toggle';
		a.href="javascript:void(0)";
		a.setAttribute('data-toggle',"dropdown");
		a.setAttribute('role',"button");
		a.setAttribute('aria-expanded',false);
		a.innerHTML="";
		var ico=get_ico(dropdown);
		if(ico!==undefined) a.appendChild(ico);
		a.innerHTML+=dropdown.name;
		var sp=cc('span',a); sp.className="caret";
		rt.appendChild(ul);
		delete dropdown.ui_root;
		dropdown.ui_root=rt; //.parentNode.replaceChild( rt, dropdown.ui_root);

		
		//console.log("Configured toolbar dropdown !");
		
		ok();
	    }else{

		// setTimeout(function(){
		
		//     ok(div);
		// },3000);
		
		// return;
		console.log("DONE DROPDOWN BUILD");
		ok(div);

	    }
	    
	}).catch(fail);
    },
    key:"dropdown"
})
