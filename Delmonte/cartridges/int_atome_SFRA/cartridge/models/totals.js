/* eslint-disable no-nested-ternary */
'use strict';

var base = module.superModule;


/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
function totals(lineItemContainer) {
    base.call(this, lineItemContainer);
    var atomeHelper = require('~/cartridge/scripts/atome/helpers/atomeHelpers');
    var installmentGrossPrice = lineItemContainer.totalGrossPrice.value / 3;
    var currencyCode = session.currency.currencyCode;
    var currency = currencyCode === 'SGD' ? 'S$' : currencyCode === 'MYR' ? 'RM' : 'HK$';
    this.installmentGrandTotal = currency + atomeHelper.toFixed(installmentGrossPrice, 2);
}

module.exports = totals;
