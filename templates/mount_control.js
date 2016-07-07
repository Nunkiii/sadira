({
    //type:"mount_control",
    name:"Mount control",
    
    ui_opts:{
	child_view_type:"div",
	child_classes:[ "container-fluid" ],
	root_classes:[ "container-fluid" ],
	name_node:"h2",
	icon:"/icons/nunki/mount.svg"
    },
    elements:{
	config:{
	  elements:{
		server:{
		  name:"Mount server",
    	  type:"socket"
    	}
      }
    },
    status:{
      name:"Mount status",
      elements:{
    	position:{
    	  name:"Current position",
          type:"sky_coords"
    	}
      }
    },
    actions:{
      name:"Actions",
      elements:{
    	goto_radec:{
    	  name:"Goto Ra-Dec",
    	  elements:{
    	    coords:{
    	      name:"Coordinates",
    	      type:"sky_coords",
    	      value:[ 0,
                      0 ] },
            go:{
    	      name:"Goto",
    	      type:"action"
    	    }
    	  }
    	},
        slew:{
    	  name:"Slew telescope",
          elements:{
    	    speed:{
    	      name:"Slewing speed",
    	      type:"double",
              value:0
    	    },
            arrow_pad:{
    	      name:"Direction",
              //type:"arrow_pad"
    	    },
            slew:{
    	      name:"Slew",
    	      type:"action"
    	    }
    	  }
    	}
      }
    }
    },
    key:"mount_control",
    
    widget_builder:function (ok, fail){
	console.log("Mount control build ");
	ok();
    }
})
