var socketio = require('socket.io');
var EventEmitter = require('events');

module.exports = function(RED) {
    if (!RED.server.socketio)
        RED.server.socketio = socketio(RED.server);
    var io = RED.server.socketio;
    
    var events = new EventEmitter();
    io.on('connection', function(socket){
        socket.on('msg', events.emit.bind(events, ['msg']));
    });
    
    function SocketIoInputNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        var event = config.event;
        var handler = function(msg) {
            if (msg.event === event)
            node.send({payload: msg.data});
        }; 
        
        events.on('msg', handler);
        node.on("close", function (done) {
            events.removeListener('msg', handler);
            done();
        });
    }
    
    RED.nodes.registerType("socketio-input", SocketIoInputNode);
};