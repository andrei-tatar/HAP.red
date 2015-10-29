var hap = require('./hap');

module.exports = function(RED) {
    var events = hap(RED);

    function ToastNode(config) {
        RED.nodes.createNode(this, config);

        this.on('input', function(msg) {
            events.emit('show-toast', {
                message: msg.payload
            }, config.sendTo === 'sender' ? msg.socketId : undefined);
        });
    }

    RED.nodes.registerType("toast", ToastNode);
};