"use strict";

var helmet = require('helmet'),
    express = require('express'),
    http = require('http'),
    routes = require('./routes'),
    config = require('./middleware/configuration'),
    notFound = require('./middleware/notFound'),
    validate = require('./middleware/validate'),
    logger = require("./middleware/logger"),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    cons = require('consolidate'),
    documentation = require("./middleware/documentation");
    require("./middleware/redis");

var app = express();
var port = config.get('port');

//MIDDLEWARE
app.set('port', port);
app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ limit: "10kb", extended: false }));
app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', config.get('path:views'));
app.use(express.static(config.get('path:css')));
app.use(helmet.xssFilter());
app.use(helmet.hidePoweredBy());
app.use(helmet.ienoopen());
app.use(helmet.nosniff());
app.use(helmet.xframe());
app.use(cors());

//ROUTES
var path = config.get("path:routes");
app.get(path + 'healthcheck', routes.healthcheck.index);
app.get(path, routes.status.check);
app.use(notFound.index);

//START
var server = http.createServer(app);
server.listen(app.get('port'), function(){
    if (config.get("iisnode")) {
        logger.info('Express server running on iisnode under: ' + path + '   configured for environment:  ' + config.get('environment'));
    } else {
        logger.info('Express server listening on port ' + app.get('port') + '   configured for environment:  ' + config.get('environment'));
    }
});


//LISTENERS
var closeServer = function (err) {
    logger.error('uncaughtException: ' + err);
    process.exit(0);
};

process.on('exit', closeServer);
process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
process.on('uncaughtException', closeServer);


module.exports = app;