module.exports = function(RED) {
    "use strict";
    var mpd = require('mpd');
    var util = require('util');
    
    function MpdServerNode(config) {
        RED.nodes.createNode(this, config);
        
        var node = this;
        node.connected = false;
        
        var connection = mpd.connect({port: config.port, host: config.host});

        connection.on('error', function(err) {
            util.log('[MPD] - ' + err);
        });

        var connected = function() {
            connection.emit("connected");
            node.connected = true;
            util.log('[MPD] - Connected to MPD server ' + config.host + ':' + config.port);
        };

        connection.on('ready', function() {
            if (config.password) {
                connection.sendCommand(mpd.cmd("password", [config.password]), function (err) {
                    if (err) util.log('[MPD] - ' + err);
                    else connected();
                });
            }
            else connected();
        });

        connection.on('end', function() {
            util.log('[MPD] - Disconnected to MPD server '  + config.host + ':' + config.port);
            node.connected = false;
        });

        node.client = connection;

        node.on("close", function() {
            connection.socket.destroy();
        });
    }
    RED.nodes.registerType("mpd-server", MpdServerNode);

    function MpdCommandNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        var server = RED.nodes.getNode(n.server);
        var dispose = updateStatus(node, server);

        var serverConnected = new Promise(function (resolve, reject) {
            if (server.connected)
                resolve();
            else
                server.client.on("connected", function() {
                    resolve();
                });
        });

        node.on('input', function (msg) {
            serverConnected.then(function() {
                var options = msg.options && msg.options.length ? msg.options : [];

                server.client.sendCommand(mpd.cmd(msg.payload, options), function(err, msg) {
                    if (err) {
                        util.log('[MPD] - ' + err);
                        return;
                    }

                    var parsed = mpd.parseArrayMessage(msg);
                    if (parsed) node.send({payload: parsed.length === 1 ? parsed[0] : parsed});
                });
            });
        });
        
        node.on("close", dispose);
    }
    RED.nodes.registerType("mpd-command",MpdCommandNode);

    function MpdStatusNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var server = RED.nodes.getNode(config.server);
        var dispose = updateStatus(node, server);

        var systemEventHandler = function(name) {
            if (config.system !== 'any' && config.system !== name)
                return;

            node.send({payload: name});
        };

        server.client.on('system', systemEventHandler);

        node.on("close", function() {
            server.client.removeListener('system', systemEventHandler);
            dispose();
        });
    }
    RED.nodes.registerType("mpd-status", MpdStatusNode);

    function updateStatus(node, server) {
        var setConnected = function() {
            node.status({fill:"yellow",shape:"dot",text:"connected"});
        };
        var setAuthenticated = function() {
            node.status({fill:"green",shape:"dot",text:"connected"});
        };
        var setEnd = function() {
            node.status({fill:"red",shape:"ring",text:"not connected"});
        };

        server.client.on('ready', setConnected);
        server.client.on('connected',setAuthenticated );
        server.client.on('end', setEnd);

        if (server.connected)
            setAuthenticated();
        else
            setEnd();

        return function() {
            server.client.removeListener('ready', setConnected);
            server.client.removeListener('connected', setAuthenticated);
            server.client.removeListener('end', setEnd);
        }
    }
};