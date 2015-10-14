var socketio = require('socket.io');

module.exports = function(RED) {
    if (!RED.server.socketio)
        RED.server.socketio = socketio(RED.server);
    var io = RED.server.socketio;
    
    function SocketIoOutputNode(config) {
        RED.nodes.createNode(this, config);
        this.on('input', function(msg) {
            var to = io;
            
            if (config.sendto === 'sender') {
                var socket = io.sockets.connected[msg.socketio_id];
                if (!socket)
                    throw new Error("web: trying to send message to a missing or closed socket");
                to = socket;
            }
            
            to.emit('msg', {
                event: msg.event || config.event, 
                data: msg.payload 
            });
        });
    }
    
    RED.nodes.registerType("web out", SocketIoOutputNode);
};