({
    name:"Are you sure ?",
    ui_opts:{ labels:[ "yes",
		       "no" ],
	      fa_icon:"question-circle",
	      root_classes:"well",
	      child_classes:"text-center big_vertical_margin",
	      name_node:"h4" },
    elements:{ bbox:{ type:"button_box" } },
    widget_builder:function (ok, fail){
	new_event(this,'accept');
	var yn=this,
	    bb=this.get('bbox');

	series(create_widget,[
	    { type : 'button', ui_opts : {name : this.ui_opts.labels[0], type : 'success'}},
	    { type : 'button', ui_opts : {name : this.ui_opts.labels[1], type : 'warning'}}
	]).then(function(btns){
	
	    btns[0].listen('click',function(){yn.trigger('accept', true);});
	    btns[1].listen('click',function(){yn.trigger('accept', false);});
	    bb.add_button(btns[0]);
	    bb.add_button(btns[1]);
	});
	ok();
    },
    key:"yesno"
})
