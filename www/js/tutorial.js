var tutorial_objects = {

    vector_test : {

	type : "vector",
	name : "vector update test",
	elements : {
	    target : {
		type : "string",
		name : "Target",
		holder_value : "Spectrum light source",
		ui_opts : {
		    label : true
		    //type : "edit"
			}
	    },

	    keys : {
		name : "Meta-data",
		ui_opts : {
		    child_view_type : "div",
		    name_node : "h3"
		},
		elements : {
		    date_obs : {
			name : "Observation time",
			type : "date",
			ui_opts : {
			    label : true
			}
		    }
		}
	    }
	},
	
	widget_builder : function (ui_opts, vt){
	    
	    //template_ui_builders.spectrum(ui_opts, vt);
	    
	    var d1=[1,2,3,4,5,6,5,2,1,-4];
	    vt.add_plot_linear(d1, 0, 1);
	    //vt.redraw();
	    vt.elements.target.set_value("Totototoototo");
	    //vt.set('target','Another strange light source');
	}

    },
    
  
    ui_option : {
	name : "UI option",
	ui_opts : {

	},

	elements : {
	    name  : {
		name : "Option name",
		type : "string"
	    },
	    desc : {
		name : "Description",
		type : "html"
	    }
	}

    },
    
    stk_tutorial :  {
	
	name : "Sadira Tooltik tutorial",	
	subtitle  : "Step by step introduction on how to use the Sadira web toolkit",
	intro  : "Step by step introduction on how to use the Sadira web toolkit",
	
	ui_opts : {
	    child_view_type : "tabbed",
	    intro_stick : true,
	    intro_name : true,
	    root_classes : ["container-fluid"],
	},
	
	elements :  {
	    
	    intro : {
		name : "Introduction",
		type : "html",
		
		value : " Introduction text"
		
	    },

	    tut1 : {
		name : "Templates",
		intro : "What are sadira templates ?",
		type : "html",
		value : " Blalllaaa text "
	    },

	    pw : {

		name : "Test parola",
		type : "password",
		ui_opts: { type : "edit", child_view_type : "pills"},
		
		elements : {

		    test : {
			name : "TEst4",
			type : "string",
			value : "Abracadabra !!!!",
			ui_opts : { type : "edit"}
		    },

		    test33 : {
			name : "TEst Stroing 234",
			type : "string",
			value : "Abracadabra !!!!",
			    ui_opts: { type : "edit", child_view_type : "pills"},			
			elements : {

			    test : {
				name : "TEst4",
				type : "string",
			value : "Abracadabra !!!!",
				ui_opts : { type : "edit"}
			    },

		    test33 : {
			name : "TEst Stroing 234",
			type : "string",
			value : "Abracadabra !!!!"
		    },
		    
		    tes2t : {
			name : "TEst34",
			type : "string",
			value : "Abracadabra !!!!"
		    }

		}

		    },
		    
		    tes2t : {
			name : "TEst34",
			type : "string",
			value : "Abracadabra !!!!"
		    }

		}
	    }
	    
	} 
    }
};

sadira.listen("ready",function(){
  tmaster.add_templates(tutorial_objects);
});

