'use strict';

var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');

/**
 * Handle entry point for Atome Payment integration
 * @param {Object} basket Basket
 * @returns {Object} processor result
 */
function Handle(basket) {
    var collections = require('*/cartridge/scripts/util/collections');
    var currentBasket = basket;

    Transaction.wrap(function () {
        var paymentInstruments = currentBasket.getPaymentInstruments();
        collections.forEach(paymentInstruments, function (item) {
            currentBasket.removePaymentInstrument(item);
        });

        currentBasket.createPaymentInstrument(
            'ATOME_PAYMENT', currentBasket.totalGrossPrice
        );
    });

    return { fieldErrors: {}, serverErrors: [], error: false };
}

/**
 * default hook if no payment processor is supported
 * @param {number} orderNumber orderNumber
 * @param {Object} paymentInstrument paymentInstrument
 * @param {Object} paymentProcessor paymentProcessor
 * @return {Object} an object that contains error information
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    var serverErrors = [];
    var fieldErrors = {};
    var error = false;

    try {
        Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
        });
    } catch (e) {
        error = true;
        serverErrors.push(
            Resource.msg('error.technical', 'checkout', null)
        );
    }

    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}

exports.Handle = Handle;
exports.Authorize = Authorize;
