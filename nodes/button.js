var hap = require('./hap');

module.exports = function(RED) {
    var events = hap(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        var dispose = events.on('button-click', function (msg, socket) {
            if (msg.id === config.controlId || config.controlId === '')
                node.send({payload: msg.id, socketio_id: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("button", ButtonNode);
};