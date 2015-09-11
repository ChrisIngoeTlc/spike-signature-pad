"use strict";

var requestConnection = require("../middleware/sqlserver"),
    async = require("async"),
    Request = require('tedious').Request,
    TYPES = require('tedious').TYPES,
    redis = require('../middleware/redis'),
    config = require('../middleware/configuration'),
    productCacheTime = config.get('productCache:expiryTime'),
    logger = require("../middleware/logger"),
    _ = require('underscore');

var KEYS_CACHE = "ProductServiceCache";

exports.getPositionAndPage = function(campaign, callback){
    var query = 'exec ' + config.get("storeproc:getPositionAndPage");
    var params = [
        { name: 'campaign_id', type: TYPES.Int, value: campaign },
        { name: 'product_type_id', type: TYPES.Int, value: null }
    ];
    fetch(callback, query, params);
};

exports.getSizes = function(productId, campaign, callback){
    var query = 'exec ' + config.get("storeproc:getSizes");

    var params = [
        { name: 'product_type_id', type: TYPES.Int, value: productId },
        { name: 'campaign_id', type: TYPES.Int, value: campaign }
    ];
    fetch(callback, query, params);
};

exports.getTitles = function(productId, callback){
    var query = 'exec ' + config.get("storeproc:getTitles");

    var params = [
        { name: 'product_id', type: TYPES.Int, value: productId }
    ];
    fetch(callback, query, params);
};

exports.getEditions = function(productId, titleId, callback){
    var query = 'exec ' + config.get("storeproc:getEditions");

    var params = [
        { name: 'product_id', type: TYPES.Int, value: productId },
        { name: 'title_id', type: TYPES.Int, value: titleId }
    ];
    fetch(callback, query, params);
};

exports.getClassifications = function(productId, titleId, editionId, callback){
    var query = 'exec ' + config.get("storeproc:getClassifications");

    var params = [
        { name: 'product_id', type: TYPES.Int, value: productId },
        { name: 'title_id', type: TYPES.Int, value: titleId },
        { name: 'edzone_id', type: TYPES.Int, value: editionId }
    ];
    fetch(callback, query, params);
};

exports.getContent = function(productId, callback){
    var query = 'exec ' + config.get("storeproc:getContent");

    var params = [
        { name: 'Product_Id', type: TYPES.Int, value: productId }
    ];
    fetch(callback, query, params);
};

exports.getSchemes = function(scheme, classification, callback){
    var query = 'exec ' + config.get("storeproc:getSchemes");

    var params = [
        { name: 'scheme_id', type: TYPES.Int, value: scheme },
        { name: 'Class_Id', type: TYPES.Int, value: classification }
    ];
    fetch(callback, query, params);
};

exports.getAllSchemes = function(callback){
    var query = 'exec ' + config.get("storeproc:getAllSchemes");

    var params = [
        { name: 'scheme_id', type: TYPES.Int, value: null }
    ];
    fetch(callback, query, params);
};

function fetch (callback, query, params) {
    var key = generateRedisKey(query, params);

    redis.get(key, function(err, rows) {
        if (err) {
            logger.error('Redis error for key: ' + key +' ... error: ' + JSON.stringify(err));
        } else if (rows) {
            return callback(err, JSON.parse(rows));
        } else {
            return callStoreProcedure (callback, query, params);
        }
    });
}

function generateRedisKey (query, params) {
    var key = query;
    if (params) {
        _.each(params, function (param) {
            key += param.name + ":"+param.value + ";";
        });
    }
    return key.replace(/\s/g,"_");
}

function callStoreProcedure (callback, query, params) {
    var openConnection = null;
    var request = new Request(query, function(err, rowcount, rows) {
        openConnection.close();
        if (rows && rows.length > 0) {
            cacheRows(rows, query, params);
        }
        return callback(err, rows);
    });
    _.each(params, function (param) {
        request.addParameter(param.name, param.type, param.value);
    });
    requestConnection(function(connection) {
        if (connection) {
            openConnection = connection;
            connection.execSql(request);
        }
    });
}

function cacheRows (rows, query, params) {
    var key = generateRedisKey(query, params);
    redis.setex(key, productCacheTime ,JSON.stringify(rows), function (err) {
        if (err) {
            logger.error('Redis error setting key: ' + key +' ... error: ' + JSON.stringify(err));
        }
        redis.sadd(KEYS_CACHE, key, function (err) {
            if (err) {
                logger.error('Redis error saving key: ' + key +' to keys cache... error: ' + JSON.stringify(err));
            }
        });
    });
}

exports.clearCache = function(callback){
    logger.info("Starting to clear redis cache for the products API");
    redis.smembers(KEYS_CACHE, function (err, keys) {
        if (err) {
            logger.error('Redis error retrieving cache keys... error: ' + JSON.stringify(err));
            return callback(err);
        }

        var deleteKey = function (key, callback) {
            redis.del(key, function(err) {
                if (err) {
                    logger.error('Error deleting from cache key : ' + key +' ... error: ' + JSON.stringify(err));
                    return callback(err);
                }
                logger.info('Success deleting from cache key : ' + key);
                return callback(null);
            });
        };

        async.each(keys, deleteKey, function(err){
            if (err) {
                logger.error("Error deleting keys cache ... error " + JSON.stringify(err));
                callback(err);
            } else {
                logger.info("Success clearing redis cache for the products API");

                redis.del(KEYS_CACHE, function(err) {
                    if (err) {
                        logger.error('Error deleting set of cache keys ... error: ' + JSON.stringify(err));
                    }
                    logger.info('Success deleting set of cache keys');
                    return callback(null);
                });

            }
        });
    });

};