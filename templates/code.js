({
  name:"Source code",
  ui_opts:{ fa_icon:"code" },
  object_builder:function (ok,fail){
       var code=this;
       this.set_value=function(v){
	   //console.log("CODE SETTING VALUE");
	   if(v!==undefined)
	       code.value=v;
    }
    ok();
   },
   widget_builder:function (ok,fail){
       var code=this;
	    var ui=ce('div');
	    
	    // var bbox=create_widget({ type : 'button_box', ui_opts : {root_classes : ['vertical_margin']} });
	    // var save=create_widget({ type : 'button', ui_opts : { name : 'Save', fa_icon : 'save'}, root_classes : []});	    
	    // bbox.add_button(save);	    
	    // ui.appendChild(bbox.ui_root);
	    code.ed_div=cc('div',ui);
	    code.ed_div.style.height='50vh';
	    this.ace_editor=ace.edit(code.ed_div);
	    this.ace_editor.setTheme("ace/theme/monokai");
	    this.ace_editor.getSession().setMode("ace/mode/javascript");

	    this.ace_editor.getSession().on('change', function(e) {
		code.value=code.ace_editor.getValue();
		// e.type, etc
	    });
	    
      this.set_value=function(v){
	  console.log("CODE SETTING VALUE");
	  if(v!==undefined)
	      code.value=v;
	  if(code.value!==undefined)
	      code.ace_editor.setValue(code.value);
	  console.log("CODE SETTING VALUE");
      }
      
      if(this.value!==undefined) this.set_value();
      else if(this.default_value!==undefined) this.set_value(this.default_value);
      
    ok(ui);
  },
   key:"code" })
