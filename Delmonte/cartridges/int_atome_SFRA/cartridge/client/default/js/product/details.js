'use strict';
var $ = window.$;
var base = require('base/product/base');
var detail = require('base/product/detail');

/**
 * Process the attribute values for an attribute that has image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 * @param {Object} msgs - object containing resource messages
 */
function processSwatchValues(attr, $productContainer, msgs) {
    attr.values.forEach(function (attrValue) {
        var $attrValue = $productContainer.find('[data-attr="' + attr.id + '"] [data-attr-value="' +
            attrValue.value + '"]');
        var $swatchButton = $attrValue.parent();

        if (attrValue.selected) {
            $attrValue.addClass('selected');
            $attrValue.siblings('.selected-assistive-text').text(msgs.assistiveSelectedText);
        } else {
            $attrValue.removeClass('selected');
            $attrValue.siblings('.selected-assistive-text').empty();
        }

        if (attrValue.url) {
            $swatchButton.attr('data-url', attrValue.url);
        } else {
            $swatchButton.removeAttr('data-url');
        }

        // Disable if not selectable
        $attrValue.removeClass('selectable unselectable');

        $attrValue.addClass(attrValue.selectable ? 'selectable' : 'unselectable');
    });
}

/**
 * Process attribute values associated with an attribute that does not have image swatches
 *
 * @param {Object} attr - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {Object[]} attr.values - Array of attribute value objects
 * @param {string} attr.values.value - Attribute coded value
 * @param {string} attr.values.url - URL to de/select an attribute value of the product
 * @param {boolean} attr.values.isSelectable - Flag as to whether an attribute value can be
 *     selected.  If there is no variant that corresponds to a specific combination of attribute
 *     values, an attribute may be disabled in the Product Detail Page
 * @param {jQuery} $productContainer - DOM container for a given product
 */
function processNonSwatchValues(attr, $productContainer) {
    var $attr = '[data-attr="' + attr.id + '"]';
    var $defaultOption = $productContainer.find($attr + ' .select-' + attr.id + ' option:first');
    $defaultOption.attr('value', attr.resetUrl);

    attr.values.forEach(function (attrValue) {
        var $attrValue = $productContainer
            .find($attr + ' [data-attr-value="' + attrValue.value + '"]');
        $attrValue.attr('value', attrValue.url)
            .removeAttr('disabled');

        if (!attrValue.selectable) {
            $attrValue.attr('disabled', true);
        }
    });
}

/**
 * Retrieve contextual quantity selector
 * @param {jquery} $el - DOM container for the relevant quantity
 * @return {jquery} - quantity selector DOM container
 */
function getQuantitySelector($el) {
    return $el && $('.set-items').length ?
        $($el).closest('.product-detail').find('.quantity-select') :
        $('.quantity-select');
}

/**
 * Routes the handling of attribute processing depending on whether the attribute has image
 *     swatches or not
 *
 * @param {Object} attrs - Attribute
 * @param {string} attr.id - Attribute ID
 * @param {jQuery} $productContainer - DOM element for a given product
 * @param {Object} msgs - object containing resource messages
 */
function updateAttrs(attrs, $productContainer, msgs) {
    // Currently, the only attribute type that has image swatches is Color.
    var attrsWithSwatches = ['color'];

    attrs.forEach(function (attr) {
        if (attrsWithSwatches.indexOf(attr.id) > -1) {
            processSwatchValues(attr, $productContainer, msgs);
        } else {
            processNonSwatchValues(attr, $productContainer);
        }
    });
}

/**
 * Updates the availability status in the Product Detail Page
 *
 * @param {Object} response - Ajax response object after an
 *                            attribute value has been [de]selected
 * @param {jQuery} $productContainer - DOM element for a given product
 */
function updateAvailability(response, $productContainer) {
    var availabilityValue = '';
    var availabilityMessages = response.product.availability.messages;
    if (!response.product.readyToOrder) {
        availabilityValue = '<li><div>' + response.resources.info_selectforstock + '</div></li>';
    } else {
        availabilityMessages.forEach(function (message) {
            availabilityValue += '<li><div>' + message + '</div></li>';
        });
    }

    $($productContainer).trigger('product:updateAvailability', {
        product: response.product,
        $productContainer: $productContainer,
        message: availabilityValue,
        resources: response.resources
    });
}

/**
 * Generates html for product attributes section
 *
 * @param {array} attributes - list of attributes
 * @return {string} - Compiled HTML
 */
function getAttributesHtml(attributes) {
    if (!attributes) {
        return '';
    }

    var html = '';

    attributes.forEach(function (attributeGroup) {
        if (attributeGroup.ID === 'mainAttributes') {
            attributeGroup.attributes.forEach(function (attribute) {
                html += '<div class="attribute-values">' + attribute.label + ': ' +
                    attribute.value + '</div>';
            });
        }
    });

    return html;
}

/**
 * Dynamically creates Bootstrap carousel from response containing images
 * @param {Object[]} imgs - Array of large product images,along with related information
 * @param {jQuery} $productContainer - DOM element for a given product
 */
function createCarousel(imgs, $productContainer) {
    var carousel = $productContainer.find('.carousel');
    $(carousel).carousel('dispose');
    var carouselId = $(carousel).attr('id');
    $(carousel).empty().append('<ol class="carousel-indicators"></ol><div class="carousel-inner" role="listbox"></div><a class="carousel-control-prev" href="#' + carouselId + '" role="button" data-slide="prev"><span class="fa icon-prev" aria-hidden="true"></span><span class="sr-only">' + $(carousel).data('prev') + '</span></a><a class="carousel-control-next" href="#' + carouselId + '" role="button" data-slide="next"><span class="fa icon-next" aria-hidden="true"></span><span class="sr-only">' + $(carousel).data('next') + '</span></a>');
    for (var i = 0; i < imgs.length; i++) {
        $('<div class="carousel-item"><img src="' + imgs[i].url + '" class="d-block img-fluid" alt="' + imgs[i].alt + ' image number ' + parseInt(imgs[i].index, 10) + '" title="' + imgs[i].title + '" itemprop="image" /></div>').appendTo($(carousel).find('.carousel-inner'));
        $('<li data-target="#' + carouselId + '" data-slide-to="' + i + '" class=""></li>').appendTo($(carousel).find('.carousel-indicators'));
    }
    $($(carousel).find('.carousel-item')).first().addClass('active');
    $($(carousel).find('.carousel-indicators > li')).first().addClass('active');
    if (imgs.length === 1) {
        $($(carousel).find('.carousel-indicators, a[class^="carousel-control-"]')).detach();
    }
    $(carousel).carousel();
    $($(carousel).find('.carousel-indicators')).attr('aria-hidden', true);
}

/**
 * Parses JSON from Ajax call made whenever an attribute value is [de]selected
 * @param {Object} response - response from Ajax call
 * @param {Object} response.product - Product object
 * @param {string} response.product.id - Product ID
 * @param {Object[]} response.product.variationAttributes - Product attributes
 * @param {Object[]} response.product.images - Product images
 * @param {boolean} response.product.hasRequiredAttrsSelected - Flag as to whether all required
 *     attributes have been selected.  Used partially to
 *     determine whether the Add to Cart button can be enabled
 * @param {jQuery} $productContainer - DOM element for a given product.
 */
function handleVariantResponse(response, $productContainer) {
    var isChoiceOfBonusProducts =
        $productContainer.parents('.choose-bonus-product-dialog').length > 0;
    var isVaraint;
    if (response.product.variationAttributes) {
        updateAttrs(response.product.variationAttributes, $productContainer, response.resources);
        isVaraint = response.product.productType === 'variant';
        if (isChoiceOfBonusProducts && isVaraint) {
            $productContainer.parent('.bonus-product-item')
                .data('pid', response.product.id);

            $productContainer.parent('.bonus-product-item')
                .data('ready-to-order', response.product.readyToOrder);
        }
    }

    // Update primary images
    var primaryImageUrls = response.product.images.large;
    createCarousel(primaryImageUrls, $productContainer);

    // Update pricing
    if (!isChoiceOfBonusProducts) {
        var $priceSelector = $('.prices .price', $productContainer).length ?
            $('.prices .price', $productContainer) :
            $('.prices .price');
        $priceSelector.replaceWith(response.product.price.html);
        // Ajax price update
        if ($('.atome_widget .atome-amount').hasClass('installment-' + response.product.id)) {
            $('.installment-' + response.product.id).empty().append(response.installmentPrice);
        } else {
            $('.atome-amount-installment').empty().append(response.installmentPrice);
        }
    }

    // Update promotions
    $productContainer.find('.promotions').empty().html(response.product.promotionsHtml);

    updateAvailability(response, $productContainer);

    if (isChoiceOfBonusProducts) {
        var $selectButton = $productContainer.find('.select-bonus-product');
        $selectButton.trigger('bonusproduct:updateSelectButton', {
            product: response.product,
            $productContainer: $productContainer
        });
    } else {
        // Enable "Add to Cart" button if all required attributes have been selected
        $('button.add-to-cart, button.add-to-cart-global, button.update-cart-product-global').trigger('product:updateAddToCart', {
            product: response.product,
            $productContainer: $productContainer
        }).trigger('product:statusUpdate', response.product);
    }

    // Update attributes
    $productContainer.find('.main-attributes').empty()
        .html(getAttributesHtml(response.product.attributes));
}

/**
 * Updates DOM using post-option selection Ajax response
 *
 * @param {OptionSelectionResponse} optionsHtml - Ajax response optionsHtml from selecting a product option
 * @param {jQuery} $productContainer - DOM element for current product
 */
function updateOptions(optionsHtml, $productContainer) {
    // Update options
    $productContainer.find('.product-options').empty().html(optionsHtml);
}

/**
 * Updates the quantity DOM elements post Ajax call
 * @param {UpdatedQuantity[]} quantities -
 * @param {jQuery} $productContainer - DOM container for a given product
 */
function updateQuantities(quantities, $productContainer) {
    if (!($productContainer.parent('.bonus-product-item').length > 0)) {
        var optionsHtml = quantities.map(function (quantity) {
            var selected = quantity.selected ? ' selected ' : '';
            return '<option value="' + quantity.value + '"  data-url="' + quantity.url + '"' +
                selected + '>' + quantity.value + '</option>';
        }).join('');
        getQuantitySelector($productContainer).empty().html(optionsHtml);
    }
}

/**
 * updates the product view when a product attribute is selected or deselected or when
 *         changing quantity
 * @param {string} selectedValueUrl - the Url for the selected variation value
 * @param {jQuery} $productContainer - DOM element for current product
 */
function attributeSelect(selectedValueUrl, $productContainer) {
    if (selectedValueUrl) {
        $('body').trigger('product:beforeAttributeSelect',
            { url: selectedValueUrl, container: $productContainer });

        $.ajax({
            url: selectedValueUrl,
            method: 'GET',
            success: function (data) {
                handleVariantResponse(data, $productContainer);
                updateOptions(data.product.optionsHtml, $productContainer);
                updateQuantities(data.product.quantities, $productContainer);
                $('body').trigger('product:afterAttributeSelect',
                    { data: data, container: $productContainer });
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    }
}

/**
 * Update Color Attribute
 */
function colorAttribute() {
    $(document).on('click', '[data-attr="color"] button', function (e) {
        e.preventDefault();

        if ($(this).attr('disabled')) {
            return;
        }
        var $productContainer = $(this).closest('.set-item');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.product-detail');
        }

        attributeSelect($(this).attr('data-url'), $productContainer);
    });
}

/**
 * Update Product Variation Attribute
 */
function selectAttribute() {
    $(document).on('change', 'select[class*="select-"], .options-select', function (e) {
        e.preventDefault();

        var $productContainer = $(this).closest('.set-item');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.product-detail');
        }
        attributeSelect(e.currentTarget.value, $productContainer);
    });
}

/**
 * Check availability
 */
function availability() {
    $(document).on('change', '.quantity-select', function (e) {
        e.preventDefault();

        var $productContainer = $(this).closest('.product-detail');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.modal-content').find('.product-quickview');
        }

        if ($('.bundle-items', $productContainer).length === 0) {
            attributeSelect($(e.currentTarget).find('option:selected').data('url'),
                $productContainer);
        }
    });
}

var exportDetails = $.extend({}, base, detail, {
    attributeSelect: attributeSelect,
    availability: availability,
    colorAttribute: colorAttribute,
    selectAttribute: selectAttribute
});

module.exports = exportDetails;
