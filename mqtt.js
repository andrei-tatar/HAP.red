var mosca = require('mosca');
var config = require('./config');

module.exports = function(log) {
    if (!config.mqtt.enabled)
        return;

    var server = new mosca.Server({
        port: config.mqtt.port
    });

    server.authenticate = authenticateClient;
    server.authorizePublish = authorizePublish;
    server.authorizeSubscribe = authorizeSubscribe;
    server.on('ready', function () {
        log.info("MQTT server (Mosca) started on port: " + server.opts.port);
    });

    function authenticateClient(client, username, password, callback)  {
        var authorized =
            username === config.mqtt.user &&
            password.toString() === config.mqtt.password;
        callback(null, authorized);
    }

    function authorizePublish(client, topic, payload, callback) {
        callback(null, true); //allow all to publish
    }

    function authorizeSubscribe(client, topic, callback) {
        callback(null, true); //allow all to subscribe
    }
};
