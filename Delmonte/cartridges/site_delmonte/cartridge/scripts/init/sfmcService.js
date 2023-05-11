/* eslint-disable no-undef */
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var serviceImpl = LocalServiceRegistry.createService('marketingcloud.rest.interactions.events', {
    createRequest: function (svc , requestBody, token) {
		if(requestBody) {
			svc.addHeader('Content-Type', 'application/json');
            svc.addHeader('Authorization', 'Bearer ' + token);
			svc.setRequestMethod('POST');
	        svc.setURL(svc.URL);
			}
  			if (svc.getRequestMethod() === 'POST') {
                return JSON.stringify(requestBody);
            }
            return svc;
    },
    parseResponse: function (svc, apiResponse) {
		return { svc: svc, apiResponse: apiResponse };
    },
    getRequestLogMessage: function (request) {
        return JSON.stringify(request);
    },
    getResponseLogMessage: function (response) {
        return JSON.stringify(response);
    }
});

module.exports = serviceImpl;
