var hap = require('./hap');

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

        var dispose = events.on('switch-changed', function (msg) {
            if (msg.id === config.controlId)
                node.send({payload: msg.state});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("switch", SwitchNode);
};