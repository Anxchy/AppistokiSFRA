'use strict';

var base = module.superModule; 
var URLUtils = require('dw/web/URLUtils');

/**
 * Send an email that would notify the user that account was created
 * @param {obj} registeredUser - object that contains user's email address and name information.
 */
function sendCreateAccountSfmcEmail(registeredUser) {
        var profileValidation = true;
        var authToken = require('*/cartridge/scripts/init/authToken');
        var result = authToken.call();
       
        if(result && result.ok){
            var requestBody = {};
            var token = result.object.response.access_token;
            requestBody.ContactKey =  registeredUser.email;
            requestBody.EventDefinitionKey = "APIEvent-6672fda5-87a3-6c8e-9343-efb144638a54";
            requestBody.Data = {
                "CustomerID": registeredUser.customerNo,		
                "CustomerRegistered": true,
                "CustomerNo": registeredUser.customerNo,
                "Email": registeredUser.email,	
                "FirstName": registeredUser.firstName,
                "SecondName": registeredUser.lastName,
                "StoreHomeLink" :  URLUtils.https('Home-Show').toString(),
                "AccountHomeLink": URLUtils.https('Account-Show').toString()
        };
        var sfmcservice = require('*/cartridge/scripts/init/sfmcService');
        var result = sfmcservice.call(requestBody, token);
        }
}

base.sendCreateAccountEmail = sendCreateAccountSfmcEmail;
module.exports = base;
