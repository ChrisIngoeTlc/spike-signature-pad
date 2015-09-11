"use strict";
/*jshint -W030 */

var winston = require('winston'),
    config = require('../middleware/configuration');
require('winston-mongodb').MongoDB;

function Logger(){
    return winston.add(winston.transports.MongoDB, {
        level: config.get('logger:level'),
        host: config.get('logger:host'),
        db: config.get('logger:db'),
        collection: config.get('logger:collection'),
        handleExceptions: true
    });
}

module.exports = new Logger();