qk/sadira
=====

Qk/Sadira is aimed to be an ECMAScript(JavaScript)/HTML scientific-oriented application framework running on Node.js servers and web-browsers. Its goal is to provide to existing data processing applications: 

* a JavaScript object data model based on templates,
* an HTML graphical user interface toolkit,
* a peer to peer, dialog based JavaScript communication system and binary protocol for data exchange,
* serialization of objects in databases, files, web-storage.

#Scope

The main 'inaccessible' goal of *quarklib* is to provide the scientific community with a magic tool automatically wrapping an interactive application (providing rich user-interface, data and process sharing via a peer to peer communication protocol, ...) on top of the everyday mess of the [astro]-physicist researcher : binary data files of any kind, numbers, vectors, functions, images, n-cubes, complex pipeline logic, database access, custom exotic algorithms in any language (Fortran, C++, etc...).

ECMAScript has become a powerfull high-level language with its increasing just-in-time compilation and hardware-acceleration features on web browsers and server interpretors. The growing set of "JS-enabled" technologies available on the browser and the server provides a powerfull, theoretically *platform-agnostic* user-interface, consisting in rich CSS-driven html content, hardware-accelerated WebGL/WebCL computations, and also new possibilities of client/server socket programming with websockets and webrtc. 

>From this renewed viewpoint, *sadira* is the latest implementation of the *quarklib* project, now using JS-based server and client code and the latest web technologies to create a *lower* codeline count, still providing a powerfull system, in comparison with an equivalent native c++/networked/platform-specific ui-toolkit implementation. 

A pure web application has the natural advantage to be  *installation-free*, web-storage beeing used for local serialization :  for example, to recover the UI state. Furthermore, web applications are natively *multi-platform*, code needs ony be written once.

This work is curently realised at the **INAF, IASF-Bologna**, in Italy, funded by the GLORIA project, an EU commission program. 

##Design

The qk/sadira project can bring to the [Gloria][1]-project, as well as any other data-oriented application, the following tools :
 
- A common server/browser JavaScript set of API's to build modern networking applications betweeen ecmascript-based nodes. Typical nodes are servers running likely on GNU/Linux along with Node.js interpreters or, client-side, 'advanced' web-browser+webrtc platforms (latest Chrom(ium)(e) on various platform/devices). The latest can be started by any *lambda* user visiting a 'container page'. User login and authentication should be based on 'federative' login frameworks such as Saml 2.0.

This scheme is OS agnostic, but obviously relies on various and complex device/OS/software support, but : **that is the web browser application's problem**. That fundamental container application, the **browser**, is our 'universal OS' layer. The browser should be accessible from any kind of device/OS combination. The level of HTML/EcmaScript rules we use in a given configuration 'should' be taken in account while building our web-interfaces.

[1]: http://www.gloria-project.eu "GLORIA"

###HTTP server

Sadira uses Node's http facilities to communicate with the outside world. The sadira web servers handles the HTTP requests the following way : The URL part of the request is translated into a potential javascript handler. If this handler routine doesn't exist, the request is either forwarded to another web-server (like apache), by the help of the http-proxy node library, or simply processed by a *very* basic file server, so sadira can run as a standalone service.

The various request handlers are provided by the user, they can be dynamically added/removed from the server's available services.

###Communication

One of the core components of *sadira* is its binary communication protocol, permitting the exchange of arbitrarilly complex data between either Node.js servers or web browsers using WebSockets or the newer WebRTC datachanels. sadira allows browsers and node.js servers to communicate with each othertrough a simple yet powerfull binary protocol. Using WebRTC datachannels, sadira can be used as the core of peer to peer applications running between web browsers and/or node.js servers. 

The actual support of webRTC and particulary the datachannel part is still very limited right now in curent web browsers, but this technology will surely be broadly available in a near future.

###Binary streams

For performance and bandwidth usage reasons, data often need to be exchanged in binary form. ArrayBuffer support in web browser opened the way to custom binary handling of data. *Sadira* uses the BSON format to encode the data of JavaScript objects transfered within dialogs in a binary efficient way. 

Large binary messages need to be serialized in packets, sometimes asynchronously (in case of UDP), to avoid congestionning, which is also a feature of the sadira dialogs.


###Grammar and Vocabulary: *Templates*

Templates are stuctured data field assemblies describing a project's data, processing pipelines, and user interfaces. From the user point of view, they are simple JavaScript objects like the minimal, empty template 

	  var example_template = {};


Some properties have a special meaning. Child objects are attached to the *elements* object property : 

	  var example_template = {
	      elements : {
	      	       child1 : {},
		       child2 : {}
	      }
	  };

	 

####Talking : *Dialogs*


####Dialog words : *Datagrams*


One of the core sadira class exists for the purpose of encoding metadata and binary data into a single 'datagram' binary buffer :

https://github.com/Nunkiii/sadira/blob/master/www/js/datagram.js

The file can be included in node.js and browsers. The datagram embed a BSON encoded header  +  an arbitrary binary data packet into a 'datagram' binary buffer, received in the browser as an ArrayBuffer. Datagrams are the 'words' transmitted inside 'dialogs' :

https://github.com/Nunkiii/sadira/blob/master/www/js/dialog.js

, dialogs ocuring within a websocket or a webrtc datachanel connexion.

The datagrams can also be used for binary AJAX GET requests. In the Gloria 'get' server case, it can also be used to encode the binary replies of the gloria image data GET requests, allowing to pass image name, width, height,... in a BSON encoded header, along with the pixel binary float32 ArrayBuffer data.

####Big binary objects : *Serializers*
   
Big binary buffers cannot be transfered in one piece, they need to be sliced in packets and reconstructed server side before beeing used. This is the scope of the serializer classes in sadira. It manages a stream of datagrams containing pieces of the final object. When done with datagram grabbing, the serializer notifies the client application with the reconstructed object data.

 
##HTML user interface builder 
##Data storage 

## Troubleshooting


Git clone or download the zip project's file.

    sudo apt-get install redis
    sudo apt-get install nodejs npm

    npm install mongodb express express-session method override cookie-parser body-parser connect-logger minimist 
    npm install connect-redis passport http-proxy websocket method override ejs  es6-promise tosource  socket.io 
    npm install passport-local passport-facebook passport-google-oauth owasp-password-strength-test

    openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem

    sed -i 's|/path/to/key.pem|./key.pem|g' ./sadira.conf
    sed -i 's|/path/to/cert.pem|./cert.pem|g' ./sadira.conf
    sed -i 's|\"http_proxy\" : true|\"http_proxy\" : false|g' ./sadira.conf


##Examples

	sudo ./sadira.js --cf sadira.conf


##Troubleshooting

###You can't see the page

Maybe you have an apache server running

Solution: 

	  sudo serviche apache2 stop

###Fatal : HTTP create Error: bind EACCES

Solution: make sure that you run sadira as superuser