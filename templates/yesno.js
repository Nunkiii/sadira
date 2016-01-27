({ name:"Are you sure ?",
  ui_opts:{ labels:[ "yes",
      "no" ],
    fa_icon:"question-circle",
    root_classes:"well",
    child_classes:"text-center big_vertical_margin",
    name_node:"h4" },
  elements:{ bbox:{ type:"button_box" } },
  widget_builder:function (){
	    new_event(this,'accept');
	    var yn=this, bb=this.get('bbox');
	    var byes=create_widget({ type : 'button', ui_opts : {name : this.ui_opts.labels[0], type : 'success'}});
	    var bno=create_widget({ type : 'button', ui_opts : {name : this.ui_opts.labels[1], type : 'warning'}});

	    byes.listen('click',function(){yn.trigger('accept', true);});
	    bno.listen('click',function(){yn.trigger('accept', false);});
	    bb.add_button(byes);
	    bb.add_button(bno);
	},
  key:"yesno" })