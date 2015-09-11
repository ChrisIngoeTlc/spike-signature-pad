"use strict";

var logger = require("../middleware/logger"),
    ProductService = require("../services/ProductService"),
    _ = require('underscore');

var CONTENT_BOOLEAN_STRING = "(Y or N)";

exports.getContent = function(req, res){
    logger.info('Request URL: ' + req.url);

    var id = req.params.id;

    ProductService.getContent(id, function (err, rows) {
        if (err) {
            if (err.indexOf("PARAMETER VALIDATION ERROR") !== -1) {
                logger.warn('ProductService.getContent is empty for product ID: ' + id);
                return res.status(404).json('Not Found');
            }
            logger.error('Database error for product id: ' + id +' getContent call: ' + JSON.stringify(err));
            return res.status(500).json('Internal Server Error');
        }
        var content = parseContent(rows);
        addValidationInfoToUrlFields(content);
        return res.status(200).json(content);
    });
};

function columnValue(row, name) {
    var column = _.find(row, function(column){
        return column.metadata.colName === name;
    });
    return column.value;
}

function parseContent (rows) {
    var content = [];
    _.each(rows, function(row){
        var element = {
            name: cleanName(columnValue(row, "field_title")),
            type: mapContentType(columnValue(row, "field_title"), columnValue(row, "input_type")),
            mandatory: Boolean(columnValue(row, "mandatory")),
            style: columnValue(row, "style_id"),
            regex: cleanName(columnValue(row, "regex_validation")),
            directoryLineId: columnValue(row, "directory_line_id"),
            sequence: columnValue(row, "directory_line_sequence")
        };
        if (element.type !== "boolean") {
            element.maxChar = Number(columnValue(row, "maximum_characters"));
        }
        content.push(element);
    });
    return content;
}

function mapContentType (name, inputType) {
    if (name.indexOf(CONTENT_BOOLEAN_STRING) !== -1) {
        return "boolean";
    }
    if (inputType === "text") {
        return "string";
    }
    if (inputType === "company name") {
        return "company";
    }
    return inputType;
}

function cleanName (name) {
    if (name.indexOf(CONTENT_BOOLEAN_STRING) !== -1) {
        return name.substring(0,name.indexOf(CONTENT_BOOLEAN_STRING)).trim();
    }
    return name;
}

function addValidationInfoToUrlFields (content) {
    _.each (content, function (contentField) {
        if (contentField.type === "url") {
            if (contentField.name === "URL") {
                contentField.availableMessage = 'Domain available';
                contentField.unavailableMessage = 'Domain unavailable';
            } else if (contentField.name === "Transfer URL") {
                contentField.expectedAvailable = false;
                contentField.availableMessage = 'Domain does not exist';
            } else if (contentField.name === "New URL") {
                contentField.expectedAvailable = true;
                contentField.unavailableMessage = 'Domain unavailable';
            }
        }
    });
}