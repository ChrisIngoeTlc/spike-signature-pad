"use strict";

var logger = require("../middleware/logger");

exports.welcome = function(req, res){
    logger.info('Request URL: ' + req.url);

    res.render('index', 'OK');
};

exports.captureSignature = function(req, res) {

    logger.info('Request URL: ' + req.url);

    var orderDetails = extractOrderDetailsFromPayload(req.body);

    if (!orderDetails){
        var message = "Incorrect activity payload provided.";
        logger.error(message);
        return res.render('error', message);
    }
    return res.render('signature', orderDetails);
};

function extractOrderDetailsFromPayload(requestBody){

    var orderDetails;

    try{
        orderDetails = {
            'rep_name': requestBody.repName ? requestBody.repName : '',
            'orderRef': requestBody.orderRef ? requestBody.orderRef : '',
            'orderGroassValue': requestBody.orderGrossValue ? requestBody.orderGrossValue : '',
            'orderNetValue': requestBody.orderNetValue ? requestBody.orderNetValue : '',
            'customerName': requestBody.customerName ? requestBody.customerName : ''
        };
    }
    catch(err){
        logger.error('An error occurred parsing the order details payload. ' + err + ' ' + JSON.stringify(requestBody));
        return null;
    }

    return orderDetails;
}
