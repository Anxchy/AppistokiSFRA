// Setting onSale product value based on promotions.
'use strict';

var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var PromotionMgr = require('dw/campaign/PromotionMgr');

function productAttribute(params, listPrice, productMinPrice, product, activeProductPromotions) {
    if ((params.IsSalePriceBookPromotion) && (params.IsCampaignPromotion)) {
        if (!empty(activeProductPromotions) || (listPrice && productMinPrice && (listPrice.value > productMinPrice.value))) {
            product.custom.isSale = true;
        }
    } else if (params.IsCampaignPromotion) {
        if (!empty(activeProductPromotions)) {
            product.custom.isSale = true;
        }
    } else if (params.IsSalePriceBookPromotion) {
        if ((listPrice && productMinPrice && (listPrice.value > productMinPrice.value))) {
            product.custom.isSale = true;
        }
    }

    if (product.custom.isSale) {
        if (empty(activeProductPromotions) && (listPrice && productMinPrice && (listPrice.value <= productMinPrice.value))) {
            product.custom.isSale = false;
        } else if (!listPrice) {
            product.custom.isSale = false;
        }
    }

    return true;
}


function execute(params) {

    if (params && (params.IsClasses || params.IsProducts)) {

        var categoryID = 'root';
        if (params.IsClasses && !params.IsProducts) {
            categoryID = 'CLASSES';
        }

        //Executes the product search
        var productSearchModel = new ProductSearchModel();
        var svc = atomeService.call();
        var t = 4;
        // productSearchModel.setCategoryID(categoryID);
        // productSearchModel.search();
        // var products = productSearchModel.getProductSearchHits();
        // var priceBookId = params.PriceBook;
        // if (products !== null) {
        //     while (products.hasNext()) {
        //         var prod = products.next();
        //         var product = prod.getProduct();
        //         if (product && !product.isMaster() && !product.isProductSet()) {

        //             var PriceModel = product.getPriceModel();

        //             var listPrice = PriceModel ? PriceModel.getPriceBookPrice(priceBookId) : null;

        //             //var listPrice = PriceModel ? PriceModel.getPriceBookPrice('promotionpricebook') : null;

        //             var productMinPrice = PriceModel ? PriceModel.minPrice : null;

        //             var activeProductPromotions = PromotionMgr.getActivePromotions().getProductPromotions(product);

        //             if (categoryID === "root" && product.custom.productType && product.custom.productType.value !== "DIEN") {
        //                 productAttribute(params, listPrice, productMinPrice, product, activeProductPromotions);
        //             } else if (categoryID === "CLASSES" && product.custom.productType && product.custom.productType.value === "DIEN") {
        //                 productAttribute(params, listPrice, productMinPrice, product, activeProductPromotions);
        //             } else if (categoryID == "root" && product.custom.productType) {
        //                 productAttribute(params, listPrice, productMinPrice, product, activeProductPromotions);
        //             }


        //         }
        //     }
        // }
    }
    return true;
}


module.exports = {
    execute: execute
};
