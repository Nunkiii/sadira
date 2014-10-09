dialog_handlers.chat = {

  chat_session : function (dlg, status_cb){

    dlg.listen("connect", function (dgram){
      console.log("Connect : " + JSON.stringify(dgram.header));
    });
    
    status_cb();
  }

}
