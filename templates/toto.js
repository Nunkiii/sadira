({

  key : "toto",
  name : "Toto eoooeooeo",
  subtitle : "Tototototo",
  ui_opts : {
    fa_icon : "globe"
  },
  elements : {
    test : {
      ui_opts : {
	type : "edit",
	//label : true,
	fa_icon : "paw"
      },
      
      name : "Brol",
      subtitle : "Un double number",
      type : "double",
      value : 5
    }
  },
  
  widget_builder : function(ok, fail){
    //alert("Hello world");

    this.set("test",18);

    var test=this.get("test");

    test.listen("change", function(newval){
      alert("Value changed to " + newval)
    });
    
    ok();
  }
})
