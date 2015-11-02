var hap = require('./common');

module.exports = function(RED) {
    var events = hap(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            events.emit('switch-changed', {
                id: config.controlId,
                state: msg.payload
            });
        });

        var dispose = events.on('switch-changed', function (msg, socket) {
            if (msg.id === config.controlId)
                node.send({payload: msg.state, socketId: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("ui_switch", SwitchNode);
};