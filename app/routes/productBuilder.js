"use strict";

var logger = require("../middleware/logger"),
    _ = require("underscore"),
    ProductService = require("../services/ProductService");

exports.getPositionAndPage = function(req, res){
    logger.info('Request URL: ' + req.url);

    var allDetails = req.query.allDetails || false,
        campaign = req.query.campaign;

    ProductService.getPositionAndPage(campaign, function (err, rows) {
        if (err) {
            logger.error('Database error for getPositionAndPage: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        if (rows.length === 0) {
            logger.error('ProductService.getPositionAndPage is empty');
            return res.status(500).json('Internal Server Error');
        }

        var positionAndPages = parsePositionAndPages(rows);

        if (allDetails) {
            return res.status(200).json(positionAndPages);
        } else {
            return res.status(200).json(filterPositionAndPages(positionAndPages));
        }
    });
};

exports.getSizes = function(req, res){
    logger.info('Request URL: ' + req.url);

    var id = req.params.id,
        campaign = req.query.campaign;

    ProductService.getSizes(id, campaign, function (err, rows) {
        if (err) {
            logger.error('Database error for product id: ' + id +' getSizes call: ' + JSON.stringify(err));

            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                return res.status(404).json('Not Found');
            }
            return res.status(500).json('Internal Server Error');
        }

        var sizes = parseSizes(rows);
        return res.status(200).json(sizes);
    });
};

exports.getStyle = function(req, res){
    logger.info('Request URL: ' + req.url);

    var id = req.params.id,
        campaign = req.query.campaign;

    ProductService.getSizes(id, campaign, function (err, rows) {
        if (err) {
            logger.error('Database error for product id: ' + id +' getSizes call: ' + JSON.stringify(err));

            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                return res.status(404).json('Not Found');
            }
            return res.status(500).json('Internal Server Error');
        }

        var style = parseStyle(rows);
        return res.status(200).json(style);
    });
};

exports.getTtnc = function(req, res){
    logger.info('Request URL: ' + req.url);

    var id = req.params.id,
        campaign = req.query.campaign;

    ProductService.getSizes(id, campaign, function (err, rows) {
        if (err) {
            logger.error('Database error for product id: ' + id +' getSizes call: ' + JSON.stringify(err));

            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                return res.status(404).json('Not Found');
            }
            return res.status(500).json('Internal Server Error');
        }

        var sizes = parseTtnc(rows);
        return res.status(200).json(sizes);
    });
};

function columnValue(row, name) {
    var column = _.find(row, function(column){
        return column.metadata.colName === name;
    });
    return column.value;
}

function parsePositionAndPages (rows) {
    var positionAndPages = [];
    _.each(rows, function(row){
        positionAndPages.push({
            id: columnValue(row, "product_type_id"),
            name: columnValue(row, "product_type_name"),
            positionId: columnValue(row, "Position_ID"),
            positionName : columnValue(row, "position_name"),
            pageId: columnValue(row, "Pgroup_ID"),
            pageName : columnValue(row, "pgroup_name")
        });
    });
    return positionAndPages;
}

function parseSizes (rows) {
    var sizes = [];
    _.each(rows, function(row){
        sizes.push({
            id: columnValue(row, "Size_ID"),
            name: columnValue(row, "size_name"),
            productId: columnValue(row, "product_id"),
            editablePrice: Boolean(columnValue(row, "editable_price")),
            minimumPrice: columnValue(row, "minimum_price"),
            styleId : columnValue(rows[0], "Style_ID")
        });
    });
    return sizes;
}

function parseStyle (rows) {
    var style = {};
    if (rows[0]){
        style.id = columnValue(rows[0], "Style_ID");
        style.name = columnValue(rows[0], "style_name");
    }
    return style;
}

function parseTtnc (rows) {
    var sizes = [];
    _.each(rows, function(row){
        sizes.push({
            sizeId: columnValue(row, "Size_ID"),
            productId: columnValue(row, "product_id"),
            ttnc: columnValue(row, "ttnc_type_name")
        });
    });
    return sizes;
}

function filterPositionAndPages (positionAndPages) {
    var filtered = [];
    _.each(positionAndPages, function(element){
        filtered.push(_.pick(element, 'id', 'name'));
    });
    return filtered;
}