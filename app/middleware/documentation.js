"use strict";

var swagger = require("swagger-node-express"),
    routes = require("../../documentation/routes"),
    models = require("../../documentation/models"),
    config = require('./configuration');

var docs_handler = null;

exports.setup = function (express, app) {
    swagger.setAppHandler(app);

    swagger.addModels(models)
        .addGet(routes.getProductTypes)
        .addGet(routes.getSizes)
        .addGet(routes.getStyle)
        .addGet(routes.getTtnc)
        .addGet(routes.getTitles)
        .addGet(routes.getEditions)
        .addGet(routes.getClassifications)
        .addGet(routes.getContent)
        .addGet(routes.getAllSchemes)
        .addGet(routes.getClassificationsByScheme)
        .addGet(routes.getSchemesByClassification)
        .addDelete(routes.clearCache);

    swagger.configureDeclaration("product-builder", {
        description : "Operations to get a product",
        produces: ["application/json"]
    });

    swagger.configureDeclaration("product", {
        description : "Operations to get for a given product the possible attributes and content",
        produces: ["application/json"]
    });

    swagger.configureDeclaration("scheme", {
        description : "Operations to retrieve scheme information",
        produces: ["application/json"]
    });

    swagger.configureDeclaration("cache", {
        description : "Operations to manipulate the Product API redis cache",
        produces: ["application/json"]
    });

    swagger.setApiInfo({
        title: "Products API",
        description: "This API should be used to build up a product. Calls to the API are sequential and should start by product-builder continued by product. In order to have a complete product you need the information of product-type, size, title, edition and classification",
        contact: "paul.barroso@thomsonlocal.com"
    });

    var apidocs = config.get("path:routes") + "api-docs";
    swagger.configureSwaggerPaths("", apidocs, "");
    swagger.configure("/", "1.0.0");

    docs_handler = express.static(__dirname + '/../../documentation/swagger-ui/');
};

exports.docs = function(req, res, next) {
    if (req.url.substr(-5).indexOf('/docs') !== -1) {
        res.writeHead(302, { 'Location' : req.url + '/' });
        res.end();
        return;
    }
    req.url = req.url.substr(req.url.indexOf('/docs') + '/docs'.length);
    return docs_handler(req, res, next);
};
