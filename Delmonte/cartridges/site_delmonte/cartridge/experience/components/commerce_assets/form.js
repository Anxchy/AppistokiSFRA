'use strict';

const Template = require('dw/util/Template');
const HashMap = require('dw/util/HashMap');
const URLUtils = require('dw/web/URLUtils');
var ImageTransformation = require('*/cartridge/experience/utilities/ImageTransformation.js');

/**
 * Render logic for storefront.productBannerStrip component.
 * @param {dw.experience.ComponentScriptContext} context The Component script context object.
 * @returns {string} The template to be displayed
 */

module.exports.render = function (context, modelIn) {
    const content = context.content;
    const model = modelIn || new HashMap();
    
    model.name = content.name;
    model.lastName = content.lastName;
    model.image = ImageTransformation.getScaledImage(content.image);
    
    return new Template('experience/components/commerce_assets/form').render(model).text;
};