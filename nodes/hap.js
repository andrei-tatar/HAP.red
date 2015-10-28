var socketio = require('socket.io');

module.exports = function(RED) {
    if (RED.server.hapEvents)
        return RED.server.hapEvents;

    var io = socketio(RED.server);
    var handlers = {};

    io.on('connection', function(socket) {
        socket.on('ui', function (msg) {
            var eventHandlers = handlers[msg.event];
            if (!eventHandlers) return;
            eventHandlers.forEach(function(handler) {
                handler(msg.data, socket);
            });
        });

        socket.on('disconnect', function(){
        });
    });

    var instance = {
        on: function (event, handler) {
            var eventHandlers = handlers[event];
            if (!eventHandlers) handlers[event] = eventHandlers = [];
            eventHandlers.push(handler);

            return function () {
                var index = eventHandlers.indexOf(handler);
                eventHandlers.splice(index, 1);
            };
        },
        emit: function (event, data, socketid) {
            var to = io;

            if (socketid) {
                var socket = io.sockets.connected[socketid];
                if (!socket)
                    throw new Error("trying to send message to a missing or closed socket");
                to = socket;
            }

            to.emit('ui', {
                event: event,
                data: data
            });
        }
    };

    RED.server.hapEvents = instance;
    return instance;
};