"use strict";

var ConnectionPool = require('tedious-connection-pool'),
    config = require('./configuration'),
    logger = require("./logger");

var poolConfig = {
    max : config.get('sqlserver:maxConnections'),
    min: config.get('sqlserver:minConnections'),
    idleTimeoutMillis : config.get('sqlserver:timeoutConnection')
};

var connectionConfig = {
    userName: config.get('sqlserver:user'),
    password: config.get('sqlserver:password'),
    server: config.get('sqlserver:server'),
    options: {
        database : config.get('sqlserver:db'),
        rowCollectionOnRequestCompletion: true
    }
};

var pool = new ConnectionPool(poolConfig, connectionConfig);

module.exports = function (callback) {

    pool.requestConnection(function (err, connection) {
        if (err) {
            logger.error("SQL Server pool requestConnection error. Error ..." + JSON.stringify(err));
            return callback(null);
        } else {
            connection.on('connect', function(err) {
                if (err) {
                    logger.error("SQL Server connection error. Terminating process. Error ..." + JSON.stringify(err));
                    process.exit(0);
                }
            });

            callback(connection);
        }
    });
};