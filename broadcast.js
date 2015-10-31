var os = require('os'),
    ip = require('ip'),
    dgram = require('dgram'),
    config = require("./config");

module.exports = function(log) {

    var broadcastAddresses = getBroadcastAddresses();
    if (broadcastAddresses.length === 0) {
        log.info('No network interface(s)');
        return;
    }

    log.info('Broadcasting on ' + broadcastAddresses.join('/') + ':' + config.broadcast.port);

    var broadcastMessage = new Buffer(6 + config.broadcast.serverName.length);
    broadcastMessage.write("HAP");
    broadcastMessage.writeUInt16BE(config.mqtt.port, 3);
    broadcastMessage.write(config.broadcast.serverName, 5);
    broadcastMessage[broadcastMessage.length - 1] = 0;

    var socket = dgram.createSocket('udp4');
    socket.bind(config.broadcast.port);
    socket.on('listening', function() {
        socket.setBroadcast(true);
        sendBroadcast();
        setInterval(sendBroadcast, config.broadcast.interval);
    });

    function sendBroadcast() {
        broadcastAddresses.forEach(function(address) {
            socket.send(broadcastMessage, 0,
                broadcastMessage.length, config.broadcast.port, address);
        });
    }

    function getBroadcastAddresses() {
        var broadcastAddresses = [];
        var interfaces = os.networkInterfaces();

        for (var key in interfaces) {
            if (!interfaces.hasOwnProperty(key))
                continue;

            var addresses = interfaces[key];
            addresses.forEach(function (address) {
                if (address.internal || address.family != 'IPv4') return;
                var subnet = ip.subnet(address.address, address.netmask);
                broadcastAddresses.push(subnet.broadcastAddress);
            });
        }

        return broadcastAddresses;
    }
};