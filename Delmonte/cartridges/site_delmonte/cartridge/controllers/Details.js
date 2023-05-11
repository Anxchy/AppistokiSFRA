'use strict';

/**
 * @namespace Home
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

var server = require('server');
var URLUtils = require('dw/web/URLUtils');


server.get('UserDetails', function (req, res, next) {
    var userForm = server.forms.getForm('contactUserDetails');
    res.render('details/contactUserDetail', {
    contactUserForm:userForm
    });
    next();
});

    
server.post('Details', function(req, res, next) {
	var test = req.form;
	var firstName = req.form;
	var lastName = req.form.lastName;
	var email = req.form.email;
	var phone = req.form.phone;
	var inquiryAbout = req.form.inquiryAbout;
	var inquiry = req.form.inquiry;
	var Transaction = require('dw/system/Transaction');
//	Transaction.wrap(function () {
//		var CustomObjectMgr = require('dw/object/CustomObjectMgr');
//		var contact = CustomObjectMgr.createCustomObject('contactUsCustomers', email);
//		contact.custom.firstName=firstName
//		contact.custom.lastName=lastName
//		contact.custom.phone=phone
//		contact.custom.inquiryAbout=inquiryAbout
//		contact.custom.inquiry=inquiry
//		
//     });
	
	res.render('details/contactDetailsSuccess', {
		Name : firstName
    });
	next();
});

//Customer interest page.
server.get('CustomerInterest', function (req, res, next) {
	var actionUrl = URLUtils.url('SFRAFormResult-CustomerInterestData');
    var customerForm = server.forms.getForm('customerInterest');
    res.render('details/customerInterestPage', {
    contactUserForm:customerForm
    });
    next();
});

// submitting the customer interest form data.
server.post('CustomerInterestData', function(req, res, next) {
	var Transaction = require('dw/system/Transaction');
	Transaction.wrap(function () {
		var customerInterestObjectMgr = require('dw/object/CustomObjectMgr');
		var customerObject = customerInterestObjectMgr.createCustomObject('customerInterest', req.form.email);
		customerObject.custom.firstName = req.form.firstName;
		customerObject.custom.lastName = req.form.lastName;
		customerObject.custom.interest =  req.form.interest;

	});

	res.render('details/contactDetailsSuccess', {
		Name : req.form.firstName
    });

	return next();
});

module.exports = server.exports();