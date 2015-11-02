module.exports = function(RED) {
    var events = require('../../events')(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        var regex = new RegExp('^'+config.controlId+'$');

        var dispose = events.on('button-click', function (msg, socket) {
            if (msg.id.match(regex) || config.controlId === '')
                node.send({payload: msg.id, socketId: socket.id});
        });

        node.on("close", function (done) {
            dispose();
            done();
        });
    }

    RED.nodes.registerType("ui_button", ButtonNode);
};