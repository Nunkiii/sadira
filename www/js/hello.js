var hello_objects = {

    hello_component : {
	name : "Hello component",
	subtitle : "A custom widget for Hello app",
	ui_opts : { child_classes : ["row"]},
	elements : {
	    numbers : {
		name : "Addition of two numbers",
		intro : "Enter two numbers :",
		ui_opts : {
		    root_classes : ["col-sm-4"],
		    intro_stick: true,
		    child_classes : ["text-center vertical_margin"]
		},
		elements : {
		    a : {
			ui_opts : { label : true, type : "edit"},
			name : "A",
			type : "double",
			default_value : 5
		    },
		    b : {
			ui_opts : { label : true, type : "edit"},
			name : "B",
			type : "double",
			default_value : 5
		    },
		    
		}
	    },
	    right : {
		name : "Lauch the super computation !",
		ui_opts : { root_classes : ["col-sm-6"]},
		elements : {
		    but : {
			
			type : "action",
			name : "Click to add numbers !",
			ui_opts : {
			    item_classes : ["btn btn-success"],
			    root_classes : ["text-center vertical_margin"]
			},
		    },
		    
		    result : {
			name : "Result",
			type : "double",
			
			ui_opts : {
			    label : true,
			    root_classes : ["well"]
			},
		    }
		}
	    }
	},
	
	widget_builder : function (ui_opts, hcomp){
	    var but=hcomp.get('but');
	    var result=hcomp.get('result');
	    
	    but.listen('click', function(){
		var a=hcomp.val('a');
		var b=hcomp.val('b');
		result.set_value(a*1.0+b*1.0);
	    });
	}

    },

    
    hello :  {
	
	name : "Hello Application",	
	subtitle  : "Minimal standalone Sadira/Tk application",
	intro  : "<strong>Welcome!</strong><p>This shows how to build a JSON template based javascript application using the <i>Sadira web Toolkit</i>!</p>",

	ui_opts : {
	    intro_stick : true,
	    //intro_name : true,
	    root_classes : ["container-fluid"],
	    //child_classes : ["container-fluid"],
	    child_view_type : 'tabbed'
	},

	elements :  {
	    st : {
		ui_opts : {
		    //label : true,
		    editable : true
		},
		type : "string",
		name : "Test string",
		value : "This is a test string !"
	    },

	    hc : {
		type : "hello_component"
	    }
	}
    }
}

sadira.listen("ready",function(){
    tmaster.add_templates(hello_objects);
    var hello_widget=create_widget('hello');

    document.body.appendChild(hello_widget.ui_root);
});
