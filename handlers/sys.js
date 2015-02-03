exports.init=function(pkg,app){
    app.get("/sys/monitor", sysmonitor);
}

function sysmonitor( req, res, next){
    var query = get_json_parameters(req);
    next();
}
