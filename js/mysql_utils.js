var mysql = require('mysql');

var andabase_login_dic={
    utable : "T_USERS",
    user : "ID_USER",
    login : "LOGINNAME",
    hashpass : "HASHPASS",
    group : "ID_GROUPUSER",
    usergroup : "T_USERRELATIONS"
};


var nilde_login_dic={
    utable : "T_USERS",
    user : "ID_USER",
    login : "LOGINNAME",
    hashpass : "HASHPASS",
    group : "ID_GROUPUSER",
    usergroup : "T_USERRELATIONS"
};


var user_table_def = {
    
};

exports.query_table=function(cmd, tname, columns){
    var q=cmd+" table "+tname+"(";
    for(var k=0;k<columns;k++){
	var c=columns[k];
	q+=c.Field;
	q+=" "+c.Type;
	if(typeof c.Null!=='undefined')
	    q+=c.Null === 'NO'? " not null" : " null";
	if(typeof c.Default!=='undefined'){
	    
	}
	if(typeof c.Key!=='undefined'){
	    if(c.Key="PRI")
		q+=" primary key";
	}
	if(typeof c.Extra!=='undefined'){
	}
    }
    q+=");";
    return q;
}


exports.sql=function(opts){
    console.log("Creating new sql interface to " + JSON.stringify(opts) );
    this.opts=opts;
    return this;
}

exports.sql.prototype.connect=function(result_cb) {
    
    var me=this;
    
    //console.log("Connecting to SQL database ...");

    function try_connect(){
	
	if(me.timeout!==undefined){
	    //console.log("Clear timeout....");
	    clearTimeout(me.timeout);
	}
	
	if(me.sql_cnx!==undefined){
	    //console.log("sql connexion state is " + me.sql_cnx.state);
	    if(me.sql_cnx.state=='authenticated') 
		return result_cb(null, me.sql_cnx);
	    else{
		delete me.sql_cnx;
		me.sql_cnx= mysql.createConnection(me.opts);
	    }
	}else{
	    me.sql_cnx= mysql.createConnection(me.opts);
	}
	
	me.sql_cnx.on('error', function(err) {
	    

	    // if(err.code === 'PROTOCOL_CONNECTION_LOST') 

	    // if(err.fatal)
	    // 	delete me.sql_cnx;
	    // }
	    
	    console.log('SQL server error', err);

	    me.timeout=setTimeout(try_connect, 2000); 
	    // } else {                                  
	    // 	result_cb(err);                            
	    // }
	});

	me.sql_cnx.connect(function(err) { 
	    if(err) {                   
		console.log( (err.fatal ? "Fatal e":"E" ) + "rror when connecting to SQL server : " + JSON.stringify(err));
		
		if(err.fatal){
		    delete me.sql_cnx;
		    //return result_cb(err);
		}
		
		
		me.timeout=setTimeout(try_connect, 2000); 
		
	    }else{
		console.log("CNX OPEN, OK CNX id : " + me.threadId);
		me.query("set names utf8",function(err,res){
		    result_cb(null, me.sql_cnx);
		});	
	    }
	});       
	
    }

    try_connect();
}

exports.sql.prototype.query=function(q, cb){
    this.connect(function(err, sql_cnx) {
	if(err)
	    return cb("SQL query error : " + err); 
	
	sql_cnx.query(q,cb);
	
	//console.log(query.sql);
    });
}

exports.sql.prototype.create_template=function(table, cb){

    exports.query("describe "+table+" ", function(error, result){
	console.log("Result : " + JSON.stringify(result, null,4));
    });
    
    this.query("select * from "+table+" limit 1", function(error, result){
	//console.log("Result is : " + JSON.stringify(result));
	if(error) return cb(error);
	var r=result[0];
	var tpl={table: table, elements : {}};
	Object.keys(r).forEach(function(f){
	    var o=r[f];
	    var otype=o.constructor.name;
	    switch(otype){
	    case "Number":
		tpl.elements[f]={ type : "double", value : o};
		break;
	    case "String":
		tpl.elements[f]={ type : "string", value : o};
		break;
	    case "Date":
		tpl.elements[f]={ type : "date", value : o};
		break;
	    case "Buffer":
	    default:
		console.log("Unhandled column type " + otype);
		break;
	    };
	    //console.log("field ["+f+"] :  " + o + " type " + typeof o + " date ? " + (o instanceof Date) + " consname " + o.constructor.name );
	});
	
	cb(null,tpl);
    });
    
}


exports.initialize_login=function(){
    
}


exports.login=function( hash, result_cb, login_dic){
    if(typeof login_dic=='undefined') login_dic=andabase_login_dic;

    var q;

    try{
	q="select "+login_dic.user+" from "+login_dic.utable
	    +" where md5(concat("+login_dic.login+",'&&',"+login_dic.hashpass+")) = '"+exports.sql_cnx.escape(hash)+"';";
    }
    catch(e) {  return  result_cb(e); }
    
    exports.query(q, function(error, qdata){
	if(error!=null) return result_cb(error);
	
	console.log("User login " + JSON.stringify(qdata));
    });

    

      // $q=mysql_query("select ID_AUTHOR from T_USERS where ID_USER = '".$id_user."';");
      
      // 	$q=mysql_query("select ID_GROUPUSER from T_USERRELATIONS where ID_USER=".$id_user.";");
      // 	while($r = mysql_fetch_assoc($q)) {
      // 	  $id_group[] = $r["ID_GROUPUSER"];
      // 	}
    
    
}
