({ name:"Dependencies",
  subtitle:"Software used by Sadira",
  intro:"<p>This will contain description and links to all external libraries and software used within the Sadira project.</p>",
  ui_opts:{ root_classes:[ "container-fluid" ],
    child_classes:[ "list-group" ],
    intro_stick:true,
    child_view_type:"table" },
  elements:{ node:{ type:"soft_tpl",
      ui_opts:{ icon:"/icons/brands/nodejs.svg" },
      name:"Node.js",
      intro:"<p>Node.js® is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.</p>",
      value:"https://nodejs.org/" },
    mongo:{ type:"soft_tpl",
      ui_opts:{ icon:"/icons/brands/logo-mongodb.png" },
      name:"Mongo DB",
      intro:"<p><strong>Agile and Scalable.</strong>MongoDB makes working with a database simple and elegant, providing agility and freedom to scale.</p>",
      value:"http://www.mongodb.org/" } },
  key:"soft_links" })
