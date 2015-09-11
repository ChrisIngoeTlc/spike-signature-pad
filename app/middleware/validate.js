"use strict";

var logger = require("../middleware/logger");

exports.id = function(req, res, next, id){
    if (id.match(/^\d+$/) === null) {
        logger.warn('Invalid Id Param for URL: ' + req.url );
        return res.status(400).json('Bad Request');
    }
    next();
};