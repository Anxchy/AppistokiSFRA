'use strict';

var server = require('server');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var Transaction = require('dw/system/Transaction');
var logger = require('dw/system/Logger').getLogger('AtomeService');
var atomeConfigs = require('~/cartridge/scripts/service/atomeConfigurations');
var atomeApis = require('~/cartridge/scripts/service/atomeApis');


/**
 * Callback URL while paying through Atome
 */
server.post('PaymentCallbackUrl', server.middleware.https, function (req, res, next) {
    var reqBody = JSON.parse(req.body);
    var referenceId = reqBody.referenceId;
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var atomeHelper = require('~/cartridge/scripts/atome/helpers/atomeHelpers');
    var OrderMgr = require('dw/order/OrderMgr');
    var Order = require('dw/order/Order');

    logger.error('Callback Request: referenceId : {0}', referenceId);

    if ((OrderMgr.getOrder(referenceId) !== null)) {
        var order = OrderMgr.getOrder(referenceId);

        var atomeOrder = atomeApis.getPaymentInformation(referenceId);
        atomeOrder = JSON.parse(atomeOrder.object);

        if (atomeOrder.status === 'PAID' && order.status.value === Order.ORDER_STATUS_CREATED) {
            // Handles payment authorization
            var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo);
            if (handlePaymentResult.error) {
                logger.error('Callback-Success: Error In SFCC Handle Payment Result');
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }

            var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', order, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
            if (fraudDetectionStatus.status === 'fail') {
                logger.error('Callback-Apporve: Error In fraud Detection Status');
                Transaction.wrap(function () { OrderMgr.failOrder(order, true); });
                // fraud detection failed
                req.session.privacyCache.set('fraudDetectionStatus', true);
                res.json({
                    error: true,
                    cartError: true,
                    redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }

            // Places the order
            var placeOrder = COHelpers.placeOrder(order, fraudDetectionStatus);
            if (placeOrder.error) {
                logger.error('Error In SFCC Place Order');
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }

            // Save Order Transaction details
            atomeHelper.saveOrderTransactionDetails(order, referenceId, atomeOrder.status, atomeOrder.refundableAmount, atomeOrder.currency);

            // Payment status update
            Transaction.wrap(function () {
                order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
            });

            logger.error('Order has been succeeded : {0}', atomeOrder.status);

            res.setStatusCode(200);
            res.json({ success: true });
        } else {
            // Handles payment authorization
            var handleIPNPayemnt = COHelpers.handlePayments(order, order.orderNo);
            if (handleIPNPayemnt.error) {
                logger.error('Callback-Declined: Error In SFCC Handle Payment Result');
                res.json({
                    error: true,
                    errorMessage: Resource.msg('error.technical', 'checkout', null)
                });
                return next();
            }

            Transaction.wrap(function () {
                OrderMgr.failOrder(order, true);
            });

            // Save Order Transaction details
            atomeHelper.saveOrderTransactionDetails(order, referenceId, atomeOrder.status, atomeOrder.refundableAmount, atomeOrder.atomeCurrency);

            logger.error('Order has been declined : {0}', atomeOrder.status);

            res.setStatusCode(400);
            res.json({ success: false });
        }
    }
    return next();
});


/**
 * Result URL after Atome payment
 */
server.get('PaymentResultUrl', server.middleware.https, function (req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var Order = require('dw/order/Order');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

    var orderId = req.session.privacyCache.get('orderID');
    var orderToken = req.session.privacyCache.get('orderToken');
    var order = OrderMgr.getOrder(orderId, orderToken);

    if (order.status.value === Order.ORDER_STATUS_NEW) {
        COHelpers.sendConfirmationEmail(order, req.locale.id);
        res.redirect(URLUtils.https('Order-Confirm', 'ID', orderId, 'token', order.orderToken, 'error', false).toString());
    } else {
        res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'payment').toString());
    }

    return next();
});

/**
 * Return from Atome with Cancel Payment
 */
server.get('PaymentCancelUrl', server.middleware.https, function (req, res, next) {
    var OrderMgr = require('dw/order/OrderMgr');
    var Order = require('dw/order/Order');
    var orderId = req.session.privacyCache.get('orderID');
    var order = OrderMgr.getOrder(orderId);

    if (order.status.value === Order.ORDER_STATUS_CREATED) {
        Transaction.wrap(function () {
            OrderMgr.failOrder(order, true);
        });
    }

    res.redirect(URLUtils.https('Checkout-Begin', 'stage', 'payment').toString());
    next();
});

/**
 * Cancel Order in Atome
 * referenceId is required to Cancel the Order
 */
server.get('CancelPayment', server.middleware.https, function (req, res, next) {
    if (atomeConfigs.isAtomeEnabled) {
        var OrderMgr = require('dw/order/OrderMgr');
        var orderID = req.querystring.orderID;
        var order = OrderMgr.getOrder(orderID);
        var cancelOrder = atomeApis.cancelPayment(orderID);

        if (cancelOrder && cancelOrder.status === 'OK') {
            var cancelOrderResult = JSON.parse(cancelOrder.object);
            if (cancelOrderResult.status === 'CANCELLED') {
                Transaction.wrap(function () {
                    OrderMgr.cancelOrder(order);
                });
            }
        	res.json({
	            error: false,
	            message: Resource.msg('atome.cancel.success.msg', 'atome', null)
        });
        } else if (cancelOrder && cancelOrder.error) {
            var errorMessage = JSON.parse(cancelOrder.errorMessage);
        	res.json({
            error: true,
            message: errorMessage.message
        	});
        }
    }
    next();
});


/**
 * Refund Order from Atome
 * referenceId and refundAmount are required to Initiate Refund Order
 */
server.get('RefundPayment', server.middleware.https, function (req, res, next) {
    if (atomeConfigs.isAtomeEnabled) {
        var OrderMgr = require('dw/order/OrderMgr');
        var orderID = req.querystring.orderID;
        var refundAmount = req.querystring.refundAmount;
        var order = OrderMgr.getOrder(orderID);

        var refundOrder = atomeApis.refundPayment(refundAmount, orderID);
        if (refundOrder && refundOrder.status === 'OK') {
            var refundOrderObj = JSON.parse(refundOrder.object);
            if (refundOrderObj.status === 'REFUNDED') {
                Transaction.wrap(function () {
                    OrderMgr.failOrder(order);
                });
            }
        	res.json({
            error: false,
            status: refundOrderObj.status,
            amount: refundOrderObj.amount,
            currency: refundOrderObj.currency,
            referenceId: refundOrderObj.referenceId,
            refundableAmount: refundOrderObj.refundableAmount,
	        message: Resource.msg('atome.refund.success.msg', 'atome', null)
        	});
        } else if (refundOrder && refundOrder.error) {
            var errorMessage = JSON.parse(refundOrder.errorMessage);
        	res.json({
            error: true,
            message: errorMessage.message
        	});
        }
    }
    next();
});

/**
 * Get Atome Payment Information
 * referenceId required to get Order Status
 */
server.get('GetPaymentInformation', server.middleware.https, function (req, res, next) {
    if (atomeConfigs.isAtomeEnabled) {
    	var orderID = req.querystring.orderID;
    	var result = atomeApis.getPaymentInformation(orderID);
    	// Update order Status
    	if (result.status === 'OK') {
        	var resultObj = JSON.parse(result.object);
        	res.json({
	            error: false,
	            status: resultObj.status,
            amount: resultObj.amount,
            currency: resultObj.currency,
            referenceId: resultObj.referenceId,
            refundableAmount: resultObj.refundableAmount
        	});
    } else {
        	res.json({
            error: true,
            message: Resource.msg('atome.get.order.status.error.msg', 'atome', null)
        	});
    }
    }
    next();
});

module.exports = server.exports();

