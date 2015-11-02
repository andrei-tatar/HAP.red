module.exports = function(RED) {
    var events = require('../../events')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);

        this.on('input', function(msg) {
            events.emit('text-update', {
                id: config.controlId,
                payload: msg.payload
            }, config.sendTo === 'sender' ? msg.socketId : undefined);
        });
    }

    RED.nodes.registerType("ui_text", TextNode);
};