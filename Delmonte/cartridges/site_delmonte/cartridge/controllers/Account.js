'use strict';

/**
 * @namespace Account
 */

var server = require('server');
var account = module.superModule; 
server.extend(account);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Resource = require('dw/web/Resource');

/**
 * Checks if the email value entered is correct format
 * @param {string} email - email string to check if valid
 * @returns {boolean} Whether email is valid
 */
function validateEmail(email) {
    var regex = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    return regex.test(email);
}



/**
 * Account-SubmitRegistration : The Account-SubmitRegistration endpoint is the endpoint that gets hit when a shopper submits their registration for a new account
 * @name Base/Account-SubmitRegistration
 * @function
 * @memberof Account
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - rurl - redirect url. The value of this is a number. This number then gets mapped to an endpoint set up in oAuthRenentryRedirectEndpoints.js
 * @param {httpparameter} - dwfrm_profile_customer_firstname - Input field for the shoppers's first name
 * @param {httpparameter} - dwfrm_profile_customer_lastname - Input field for the shopper's last name
 * @param {httpparameter} - dwfrm_profile_customer_phone - Input field for the shopper's phone number
 * @param {httpparameter} - dwfrm_profile_customer_email - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_customer_emailconfirm - Input field for the shopper's email address
 * @param {httpparameter} - dwfrm_profile_login_password - Input field for the shopper's password
 * @param {httpparameter} - dwfrm_profile_login_passwordconfirm: - Input field for the shopper's password to confirm
 * @param {httpparameter} - dwfrm_profile_customer_addtoemaillist - Checkbox for whether or not a shopper wants to be added to the mailing list
 * @param {httpparameter} - csrf_token - hidden input field CSRF token
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */


server.get(
    'SubmitRegistration1',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var profileObject = res.getViewData();
        var authenticatedCustomer = profileObject.authenticatedCustomer;
        var profileValidation = true;
        var authToken = require('*/cartridge/scripts/init/authToken');
        var result = authToken.call();
       
        if(result && result.ok){
            var requestBody = {};
            var token = result.object.response.access_token;
            requestBody.ContactKey =  profileObject.email,
            requestBody.EventDefinitionKey = "APIEvent-6672fda5-87a3-6c8e-9343-efb144638a54";
            requestBody.Data = {
                "CustomerID": "12222221",		
                "CustomerRegistered": true,
                "CustomerNo": '123456781551',
                "Email": profileObject.email,	
                "FirstName": profileObject.firstName,
                "SecondName": profileObject.lastName
        }
        var sfmcservice = require('*/cartridge/scripts/init/sfmcService');
        var result = sfmcservice.call(requestBody, token);
        var test = true;
        }

        return next();
    }
);

module.exports = server.exports();
