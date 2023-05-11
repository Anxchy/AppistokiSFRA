'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var serviceImpl = LocalServiceRegistry.createService('marketingcloud.rest.auth', {
    createRequest: function (svc) {
		svc.addHeader('Content-Type', 'application/json');
		svc.setRequestMethod('POST');
	    svc.setURL(svc.URL);
        svc.setAuthentication('NONE');
        var svcCredential = svc.getConfiguration().credential;
        if (empty(svcCredential.user) || empty(svcCredential.password)) {
            throw new Error('Service configuration requires valid client ID (user) and secret (password)');
        }
        var requestBody = {//Changing the request body to incorporate the additional fields required by OAUTH2.0 based API.
            client_id: svcCredential.user,
            client_secret: svcCredential.password,
            grant_type: "client_credentials"
        };
            return JSON.stringify(requestBody);
    },
    parseResponse: function (svc, response) {
		return { svc: svc, response: JSON.parse(response.text) };
    }
});

module.exports = serviceImpl;
