'use strict';

module.exports = function (object, apiProduct, type) {
    Object.defineProperty(object, 'uuid', {
        enumerable: true,
        value: apiProduct.UUID
    });

    Object.defineProperty(object, 'id', {
        enumerable: true,
        value: apiProduct.ID
    });

    Object.defineProperty(object, 'productName', {
        enumerable: true,
        value: apiProduct.name
    });

    Object.defineProperty(object, 'productType', {
        enumerable: true,
        value: type
    });

    Object.defineProperty(object, 'brand', {
        enumerable: true,
        value: apiProduct.brand
    });
    
    Object.defineProperty(object, 'onlineFrom', {
        enumerable: true,
        value: apiProduct.onlineFrom
    });
    
    Object.defineProperty(object, 'isSale', {
        enumerable: true,
        value: apiProduct.custom.isSale
    });
};
