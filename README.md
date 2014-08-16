sadira
=====

This is an experimental project.

Sadira/Qk is (aimed to be) a node.js/web-browser JavaScript/C++/Custom scientific generic application framework. 

The main 'inaccessible' goal is to provide the scientific community with a magic tool automatically wrapping a complex interactive web application on top of the everyday mess of [astro]-physicist's research : objects : numbers, vectors, functions, images, n-cubes, pipeline logic, database access, custom algorithms in whatever language.

Ecma[Java]Script, a powerfull high-level language, along with its increasing support and hardware-acceleration on the web browsers, provide a powerfull, theoretically platform-agnostic, user-interface trough rich html dom, hardware-accelerated WebGL/WebCL computations, new possibilities of client/server socket programming with websockets and webrtc. 

This opens the possibility of *Sadira*, at reasonably 'low' programming price, in comparison with a corresponding custom c++/native-ui-toolkit implementation.

This work was realised at the INAF, IASF-Bologna, in Italy, funded by the GLORIA project, a EU commission program. 

##Communication system

The core of Sadira is its binary communication protocol, permitting the exchange of arbitrarilly complex messages between either Node.js servers and web browsers using WebSockets or the newer WebRTC datachanels, allowing browsers and node.js servers to communicate with each other. Using webRTC, sadira will be used as the core of peer to peer applications running between web browsers (and optionally also node.js servers). 

The actual support of webRTC and particulary the datachannel part is still very limited right now in curent web browsers, but this technology will surely be broadly available in a near future.

###Datagrams

The sadira server, within Gloria, must be able to respond to standard AJAX (get) requests, to be embeddedable in non-websocket aware environment and also to conform with the specs. For the Gloria 'get interface', the server must respond to a query url with a *single* buffer of binary data, containing both image metadata (width, height, name, etc...) and binary pixel data.

It is not possible to use the astrojs fits.js library to read from an arraybuffer from scratch, so we cannot just ajax-download the whole fits file as an ArrayBuffer and read it client side with fits.js.

One of the core sadira class exists for the purpose of encoding metadata and binary data into a single 'datagram' binary buffer :

https://github.com/Nunkiii/sadira/blob/master/www/js/datagram.js

The file can be included in node.js and browsers. The datagram embed a BSON encoded header  +  an arbitrary binary data packet into a 'datagram' binary buffer, received in the browser as an ArrayBuffer. Datagrams are the 'words' transmitted inside 'dialogs' :

https://github.com/Nunkiii/sadira/blob/master/www/js/dialog.js

, dialogs ocuring within a websocket or a webrtc datachanel connexion.

The datagrams can also be used for binary AJAX GET requests. In the Gloria 'get' server case, it can also be used to encode the binary replies of the gloria image data GET requests, allowing to pass image name, width, height,... in a BSON encoded header, along with the pixel binary float32 ArrayBuffer data.
    
##HTML user interface builder 

##Installation

Git clone or download the zip project's file.

##Examples

To do.

