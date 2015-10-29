var hap = require('./hap');

module.exports = function(RED) {
    var events = hap(RED);

    function SliderNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            events.emit('slider-changed', {
                id: config.controlId,
                value: msg.payload
            });
        });

        var dispose = events.on('slider-changed', function (msg, socket) {
            if (msg.id === config.controlId)
                node.send({payload: msg.value, socketId: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("slider", SliderNode);
};