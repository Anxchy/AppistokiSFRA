'use strict';

var logger = dw.system.Logger.getLogger('AtomeService');
var serviceResonse = null;
var StringUtils = require('dw/util/StringUtils');

/**
 * Atome API Call
 * @param {string} endPoint - API endPoint
 * @param {Object} requestObj API request Object
 * @param {string} method method request
 * @returns {result} result
 */
function atomeAPICall(endPoint, requestObj, method) {
    var result;
    try {
        var atomeInitService = require('~/cartridge/scripts/service/init/atomeInitService');
        var service = atomeInitService.atomeService;
        var serviceCredentials = service.getConfiguration().getCredential();
        var baseURL = serviceCredentials.getURL();
        var sharedSecret = serviceCredentials.user + ':' + serviceCredentials.password;
        var url = baseURL + endPoint;
        var auth = StringUtils.encodeBase64(sharedSecret);
        service.setURL(url);
        service.setRequestMethod(method);
        service.addHeader('Authorization', 'Basic ' + auth);

        var requestJSON = JSON.stringify(requestObj);
        result = service.call(requestJSON);
    } catch (e) {
        logger.error('Error in Atome Service: {0}', e.message);
    }
    return result;
}

/**
 * Create Order in Atome
 * @param {Object} order order
 * @returns {serviceResonse} Service Response
 */
function createNewPayment(order) {
    var atomeHelper = require('~/cartridge/scripts/atome/helpers/atomeHelpers');

    // Call to Atome service to create Order
    var requestObj = atomeHelper.createOrderRequest(order.orderNo);
    serviceResonse = atomeAPICall('payments', requestObj, 'POST');

    return serviceResonse;
}


/**
 * Get Atome Order Status
 * @param {string} referenceId - referenceId
 * @returns {serviceResonse} Service Response
 */
function getPaymentInformation(referenceId) {
    try {
        var requestObj = {
            referenceId: referenceId
        };
        // Call to Atome service to get Order Status
        serviceResonse = atomeAPICall('payments/' + referenceId, requestObj, 'GET');
    } catch (e) {
        logger.error('Error in Atome Get Order Staus Service Request: {0}', e.message);
    }
    return serviceResonse;
}

/**
 * Cancel Atome Order
 * @param {string} referenceId - referenceId
 * @returns {serviceResonse} Service Response
 */
function cancelPayment(referenceId) {
    try {
        var requestObj = {
            referenceId: referenceId
        };
        // Call to Atome service to get Order Status
        serviceResonse = atomeAPICall('payments/' + referenceId + '/cancel', requestObj, 'POST');
    } catch (e) {
        logger.error('Error in Atome Cancel Order Service Request: {0}', e.message);
    }
    return serviceResonse;
}

/**
 * Cancel Atome Order
 * @param {number} refundAmount -refund amount
 * @param {string} referenceId -referenceId
 * @returns {serviceResonse} Service Response
 */
function refundPayment(refundAmount, referenceId) {
    try {
        var requestObj = {
            refundAmount: refundAmount
        };
        // Call to Atome service to Refund Order
        serviceResonse = atomeAPICall('payments/' + referenceId + '/refund', requestObj, 'POST');
    } catch (e) {
        logger.error('Error in Atome Refund Order Service Request: {0}', e.message);
    }
    return serviceResonse;
}

module.exports = {
    createNewPayment: createNewPayment,
    getPaymentInformation: getPaymentInformation,
    cancelPayment: cancelPayment,
    refundPayment: refundPayment
};
