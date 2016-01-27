({ key:"date",
  widget_builder:function (ui_opts, date){

    date.ui= ui_opts.type==='edit' ? ce("input") : ce("span");
    date.ui.type="date";

    date.set_value=function(nv){
	if(nv !==undefined)
	    date.value=nv;
	
//	console.log("SETTING DATE " + date.value);
	//date.ui.innerHTML="Hello World!!!";
	if(date.value!==undefined){
	    if(ui_opts.type!=='edit')
		date.ui.innerHTML=date.value.toLocaleString();
	    else
		date.ui.value=date.value;
	}
    }
    
    config_common_input(date);
    

    return date.ui;
} })