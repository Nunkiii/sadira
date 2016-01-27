({ name:"FITS tools",
  ui_opts:{ root_classes:[ "container-fluid" ] },
  elements:{ create_template_from_table:{ name:"Create template from FITS table",
      elements:{ opts:{ name:"Setup",
          ui_opts:{ root_classes:[ "" ],
            child_classes:[ "container-fluid" ] },
          elements:{ template_name:{ name:"Template name",
              type:"string",
              ui_opts:{ type:"edit",
                root_classes:[ "container-fluid" ],
                child_classes:[ "form-inline" ] } },
            file:{ name:"FITS File",
              ui_opts:{ type:"edit",
                root_classes:[ "container-fluid" ],
                child_classes:[  ] },
              elements:{ path:{ name:"File path",
                  type:"string",
                  ui_opts:{ label:true,
                    type:"edit",
                    root_classes:[ "col-sm-12" ] } },
                hdu:{ name:"HDU",
                  type:"double",
                  min:0,
                  step:1,
                  default_value:0,
                  ui_opts:{ label:true,
                    type:"edit",
                    root_classes:[ "col-sm-12" ] } } } } } },
        exec:{ ui_opts:{ child_classes:[ "container-fluid vertical_margin" ] },
          elements:{ sock:{ type:"socket",
              widget_builder:function () { this.hide();} },
            create:{ type:"button",
              ui_opts:{ root_classes:[ "container-fluid" ],
                name:"Create template",
                type:"primary" },
              elements:{} } },
          widget_builder:function (){
			    var ex=this;
			    var b=this.get('create');
			    b.listen('click',function(){
				
				var opts_data=get_template_data(ex.parent.get('opts'));
				this.parent.message("<pre>"+JSON.stringify(opts_data, null, 5)+"</pre>");
				var sock=ex.get('sock');
				
				sock.listen('socket_connect', function(){
				    var d= this.dialogs.create_dialog({ handler : "fits.create_template_from_table"}, { x : 12} );
				    d.listen("error", function(dgram){
					console.log("Error !received ");
					ex.parent.message(dgram.header.error, { type : "danger", title : "Error received"});
				    });
				    
				    d.connect(function(error, init_dgram){
					ex.message("Init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre>");
					if(error)
					    return b.debug("Init data error= " + error + " init datagram = <pre> " + JSON.stringify(init_dgram,null,4)+" </pre>");
					
					d.send_datagram({type : "setup", opts : opts_data}, null, function(error){
					    
					});
					
				    });
				    
				});

				sock.connect();
			    });
			} } } } },
  key:"fits" })