"use strict";

var logger = require("../middleware/logger"),
    _ = require("underscore"),
    ProductService = require("../services/ProductService");

exports.getTitles = function(req, res){
    logger.info('Request URL: ' + req.url);

    var productId = req.params.id;

    ProductService.getTitles(productId, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.error('ProductService.getTitles is empty for product ID: ' + productId);
                return res.status(404).json('Not Found');
            }
            logger.error('Database error for product id: ' + productId +' getTitles call: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }

        var sizes = parseRows(rows);
        return res.status(200).json(sizes);
    });
};

exports.getEditions = function(req, res){
    logger.info('Request URL: ' + req.url);

    var productId = req.params.id;
    var titleId = req.params.titleid;
    ProductService.getEditions(productId, titleId, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.warn('ProductService.getEditions is empty for product ID: ' + productId +' and title Id ' + titleId);
                return res.status(404).json('Not Found');
            }
            logger.error('Database error for product id: ' + productId +' and title Id ' + titleId + ' getTitles call: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }

        var sizes = parseRows(rows);
        return res.status(200).json(sizes);
    });
};

exports.getClassifications = function(req, res){
    logger.info('Request URL: ' + req.url);

    var productId = req.params.id;
    var titleId = req.params.titleid;
    var editionId = req.params.editionid;

    ProductService.getClassifications(productId, titleId, editionId, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.warn('ProductService.getClassifications is empty for product ID: ' + productId +' and title Id ' + titleId + ' and edition Id ' + editionId);
                return res.status(404).json('Not Found');
            }
            logger.error('Database error for product id: ' + productId +' and title Id ' + titleId + ' and edition Id ' + editionId + ' getTitles call: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        var sizes = parseRows(rows);
        return res.status(200).json(sizes);
    });
};

function parseRows (rows) {
    var elements = [];
    _.each(rows, function(row){
        elements.push({
            id: row[0].value,
            name: row[1].value
        });
    });
    return elements;
}