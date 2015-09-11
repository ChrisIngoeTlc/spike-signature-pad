"use strict";

var logger = require("../middleware/logger");

exports.index = function(req, res){
    logger.warn('Request Not Found: ' +  req.url);
    return res.status(404).json('Not Found');
};