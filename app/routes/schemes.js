"use strict";

var logger = require("../middleware/logger"),
    _ = require("underscore"),
    ProductService = require("../services/ProductService");

exports.getAll = function(req, res){
    logger.info('Request URL: ' + req.url);

    ProductService.getAllSchemes(function (err, rows) {
        if (err) {
            logger.error('Database error for ProductService.getAllSchemes: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        if (rows.length === 0) {
            logger.error('ProductService.getAllSchemes is empty');
            return res.status(500).json('Internal Server Error');
        }

        var schemes = parseAllSchemes(rows);

        return res.status(200).json(schemes);
    });
};

exports.getById = function(req, res){
    logger.info('Request URL: ' + req.url);

    var schemeId = req.params.id;

    ProductService.getSchemes(schemeId, null, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.warn('ProductService.getSchemes is empty for schme ID: ' + schemeId);
                return res.status(404).json('Not Found');
            }
            logger.error('Database error for ProductService.getSchemes: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        var schemes = parseClassfications(rows);

        return res.status(200).json(schemes);
    });
};

exports.getByClassification = function(req, res){
    logger.info('Request URL: ' + req.url);

    var classificationId = req.params.id;

    ProductService.getSchemes(null, classificationId, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.warn('ProductService.getByClassification is empty for classification ID: ' + classificationId);
                return res.status(404).json('Not Found');
            }

            logger.error('Database error for ProductService.getSchemes: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        var schemes = parseSchemes(rows);

        return res.status(200).json(schemes);
    });
};

function parseClassfications(rows) {
    var classifications = [];
    _.each(rows, function(row){
        classifications.push({
            id: columnValue(row, "class_id"),
            name: columnValue(row, "class_name")
        });
    });
    return classifications;
}

function parseSchemes(rows) {
    var schemes = [];
    _.each(rows, function(row){
        schemes.push({
            id: columnValue(row, "scheme_id"),
            name: columnValue(row, "scheme_name"),
            image: columnValue(row, "image_urn"),
            imagePath: columnValue(row, "image_path")
        });
    });
    return schemes;
}

function parseAllSchemes(rows) {
    var schemes = [];
    _.each(rows, function(row){
        schemes.push({
            id: columnValue(row, "scheme_id"),
            name: columnValue(row, "scheme_name")
        });
    });
    return schemes;
}

function columnValue(row, name) {
    var column = _.find(row, function(column){
        return column.metadata.colName === name;
    });
    return column.value;
}

