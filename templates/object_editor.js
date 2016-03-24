({
    key:"object_editor",
    name:"User objects",
    elements:{
	bbox:{
	    ui_opts:{
		child_classes:[ "btn-group" ]
	    },
	    elements:{
		new_object:{ name:"New image",
			     type:"action",
			     ui_opts:{ item_classes:[ "btn btn-default btn-sm" ],
				       fa_icon:"plus" } },
		new_datared:{ name:"New image reduction",
			      type:"action",
			      ui_opts:{ item_classes:[ "btn btn-default btn-sm" ],
					fa_icon:"plus" } } } },
	tree:{
	    name:"Images",
	    ui_opts:{
		child_view_type:"tabbed"
	    },
	    elements:{}
	}
    },
    
    
    widget_builder:function (ok, fail){
	
	var edit=this;
	var bbox=edit.elements.bbox;
	var new_object=bbox.elements.new_object;
	var new_red=bbox.elements.new_datared;
    
	var object_tree=window.object_tree=edit.elements.tree;
    

    new_object.listen("click", function(){

	create_widget({ type : "image"}, object_tree).then(function(new_img){
	    //var new_img=tmaster.build_template("image");
	    new_img.xd=edit.xd;
	    //console.log("Setting XD to " + new_img.xd);
	    
	    //var img_ui=create_ui({}, new_img, edit.depth+1);
	    object_tree.ui_childs.add_child(new_img, new_img.ui_root);
	});
	    
    });
   new_red.listen("click", function(){

	var new_img=tmaster.build_template("image_reduction");
	var img_ui=create_ui({}, new_img);
	object_tree.ui_childs.add_child(new_img, img_ui);
    });
       ok();
       
} })
