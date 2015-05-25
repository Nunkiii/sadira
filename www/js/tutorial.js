var tutorial_objects = {

    ui_option : {

	name : "UI option",
	

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

