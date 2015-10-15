var socketio = require('socket.io');
var EventEmitter = require('events');

module.exports = function(RED) {
    var events = new EventEmitter();
    var io = socketio(RED.server);
    var connectedCount = 0;
    io.on('connection', function(socket) {
        connectedCount++;
        events.emit('connections');
        socket.on('msg', function (msg) {
            events.emit('msg', msg, socket);
        });
        socket.on('disconnect', function(){
            connectedCount--;
            events.emit('connections');
        });
    });
    
    function updateNodeStatus(node) {
        node.status({
            fill: (connectedCount == 0 ? "grey":"blue"), 
            shape: "dot",
            text: connectedCount + " connected"
        });
    }
    
    function SocketIoInputNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        var event = config.event;
        var handler = function(msg, socket) {
            if (msg.event === event)
                node.send({payload: msg.data, socketio_id: socket.id});
        }; 
        
        updateNodeStatus(node);
        events.on('connections', function() {updateNodeStatus(node);});
        
        events.on('msg', handler);
        node.on("close", function (done) {
            events.removeListener('msg', handler);
            done();
        });
    }
    
    RED.nodes.registerType("web in", SocketIoInputNode);
    
    function SocketIoOutputNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        updateNodeStatus(node);
        events.on('connections', function() {updateNodeStatus(node);});
        
        this.on('input', function(msg) {
            var to;
            
            if (config.sendto === 'sender') {
                var socket = io.sockets.connected[msg.socketio_id];
                if (!socket)
                    throw new Error("web: trying to send message to a missing or closed socket");
                to = socket;
            } 
            else if (config.sendto === 'all') {
                to = io;
            } 
            else return;
            
            to.emit('msg', {
                event: msg.event || config.event, 
                data: msg.payload 
            });
        });
    }
    
    RED.nodes.registerType("web out", SocketIoOutputNode);
};