var server = require('server');


server.get('Show', function (req, res, next) {
    var service = require('site_delmonte/cartridge/services/dadjokeservice');
    var properties = {};
    var template = 'magic';

    var svcResult = service.dadJokeAPIService.call();
    if (svcResult.status === 'OK') {
        properties.joke = svcResult.object.joke;
    }

    res.render(template, properties);
    next();
});

module.exports = server.exports();