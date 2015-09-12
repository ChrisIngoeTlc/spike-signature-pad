"use strict";

var logger = require("../middleware/logger");

exports.check = function(req, res){
    logger.info('Request URL: ' + req.url);

    res.render('index', 'OK');
};
