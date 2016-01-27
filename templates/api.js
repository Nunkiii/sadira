({
  object_builder:function (ok, fail){
    //console.log("api object_builder ...");
    var api=this;
	    this.handle_api=function(h){
      api.api_handler=h;
    }
    ok();
  },
  key:"api"
})
