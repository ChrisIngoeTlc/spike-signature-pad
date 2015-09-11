"use strict";

var nconf = require('nconf');

function getEnvironment() {
    var environment = process.env.NODE_ENV || 'development';
    return environment.toLowerCase();
}

function isIISNodeEnvironment() {
    var environment = getEnvironment();
    if (environment === "staging" || environment === "production" || environment === "qa") {
        return true;
    }
    return false;
}

function getPort() {
    if (isIISNodeEnvironment()) {
        return process.env.PORT;
    }
    return nconf.get('express:port');
}

function Config(){
    nconf.argv().env('_');
    var environment = getEnvironment();
    var path = 'config/';
    if (isIISNodeEnvironment()) {
        path = '../config/';
    }
    nconf.file(environment, path + environment + '.json');
    nconf.file('default', path + 'default.json');
}

Config.prototype.get = function(key) {
    if (key === "iisnode") {
        return isIISNodeEnvironment();
    }
    if (key === "environment") {
        return getEnvironment();
    }
    if (key === "port") {
        return getPort();
    }
    return nconf.get(key);
};

module.exports = new Config();
