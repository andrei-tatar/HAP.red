var socketio = require('socket.io');

module.exports = function(RED) {
    if (!RED.server.socketio)
        RED.server.socketio = socketio(RED.server);
    var io = RED.server.socketio;
    
    function SocketIoOutputNode(config) {
        RED.nodes.createNode(this, config);
        this.on('input', function(msg) {
            io.emit('msg', {
                event: msg.event || config.event, 
                data: msg.payload 
            });
        });
    }
    
    RED.nodes.registerType("socketio-output", SocketIoOutputNode);
};