var socketio = require('socket.io');

module.exports = function(RED) {
    if (RED.server.hapEvents)
        return RED.server.hapEvents;

    var io = socketio(RED.server);
    var handlers = {};
    var state = {};

    io.on('connection', function(socket) {

        replayStateEvents(socket);

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

    function replayStateEvents(socket) {
        var events = Object.getOwnPropertyNames(state);
        var count = 0;
        events.forEach(function (event) {
            var eventStates = state[event];
            var ids = Object.getOwnPropertyNames(eventStates);

            ids.forEach(function (id) {
                socket.emit('ui', {
                    event: event,
                    data: eventStates[id]
                });
                count ++;
            });
        });

        //console.log("Replayed " + count + " events");
    }

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
            } else {
                var eventState = state[event];
                if (!eventState) state[event] = eventState = {};

                eventState[data.id] = data;
            }

            to.emit('ui', {
                event: event,
                data: data
            });
        }
    };

    instance.on('switch-changed', function (data) {
        instance.emit('switch-changed', data);
    });

    instance.on('slider-changed', function (data) {
        instance.emit('slider-changed', data);
    });

    RED.server.hapEvents = instance;
    return instance;
};