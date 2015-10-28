var hap = require('./hap');

module.exports = function(RED) {
    var events = hap(RED);

    function SwitchNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.on('input', function(msg) {
            events.emit('switch-changed', {
                id: config.switchId,
                state: msg.payload
            }, config.sendto === 'sender' ? msg.socketio_id : undefined);
        });

        var dispose = events.on('switch-changed', function (msg, socket) {
            if (msg.id === config.switchId)
                node.send({payload: msg.state, socketio_id: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("switch", SwitchNode);
};