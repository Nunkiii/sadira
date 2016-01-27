({ name:"MD Text",
  type:"html",
  key:"marked",
  widget_builder:function (ui_opts, tpl_item){
    //var marked = require('marked');
    console.log(marked('I am using __markdown__.'));

    tpl_item.set_value("<h1>Hello World!</h1>");
} })