module.exports = function(RED) {
    var events = require('../events')(RED);

    function NumericNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            events.emit('numeric-changed', {
                id: config.controlId,
                value: msg.payload
            });
        });

        var dispose = events.on('numeric-changed', function (msg, socket) {
            if (msg.id === config.controlId)
                node.send({payload: msg.value, socketId: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("ui_numeric", NumericNode);
};