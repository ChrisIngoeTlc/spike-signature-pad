"use strict";

var logger = require("../middleware/logger"),
    ProductService = require("../services/ProductService");

exports.clearCache = function(req, res){
    logger.info('Request URL: ' + req.url);

    ProductService.clearCache(function (err) {
        if (err) {
            return res.status(500).json('Internal Server Error');
        }
        return res.status(204).json("No Content");
    });
};