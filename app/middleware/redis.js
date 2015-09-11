"use strict";

var redis = require('redis'),
    config = require('./configuration'),
    logger = require("./logger");

var port = config.get("redis:port");
var host = config.get("redis:host");
var password = config.get("redis:password");
var client = redis.createClient(port, host);
if (password) {
    client.auth(password, function() {});
}

client.on('connect', function() {
    logger.info("Redis connection established");
});

client.on('error', function(err) {
    logger.error("Redis connection error. Terminating process." + JSON.stringify(err));
    process.exit(0);
});

client.on('end', function() {
    logger.info("Redis disconnected");
    process.exit(0);
});

module.exports = client;