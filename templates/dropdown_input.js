({
    type:"input_group",
    ui_opts:{},
    elements:{
	dropdown:{
	    type:"dropdown",
	    ui_opts:{
		root_classes:"input-group-btn",
		update_label:false
	    }
	},
	input:{
	    ui_opts:{ root_node:"input" },
	    widget_builder:function (ok, fail){
		var input_w=this;
		var input=this.ui_root; //input=ce('input');
		input.className='form-control';
		input.addEventListener('input',function(){
		    input_w.parent.value=this.value;
		});
		ok();
	    }
	}
    },
    widget_builder:function (ok,fail){
	var ddi=this;
	var dd=this.get('dropdown');
	var list_input=ddi.get('input');

	new_event(this, 'change');

	dd.listen('select',function(item){
	    list_input.ui_root.value=item.label;
	    ddi.value=item.label;
	});
	
	ddi.input_value=function(value){
	    if(value!==undefined){
		list_input.ui_root.value=value;
		ddi.value=value;
	    }else
		return list_input.ui_root.value;
	}
	
	ddi.set_items=dd.set_items;
	ddi.select=dd.select;
	ok();
    },
    key:"dropdown_input"
})
