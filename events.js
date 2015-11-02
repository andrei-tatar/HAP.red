module.exports = function (RED) {
    if (RED.server.hapEvents)
        return RED.server.hapEvents;

    var socketio = require('socket.io');
    var io = socketio(RED.server);
    var handlers = {};
    var state = {};
    var ignoreStateEvents = ['show-toast'];
    var forwardEvents = ['switch-changed', 'slider-changed', 'numeric-changed'];

    io.on('connection', function(socket) {
        replayStateEvents(socket);

        socket.on('ui', function (msg) {
            var eventHandlers = handlers[msg.event];
            if (eventHandlers)
                eventHandlers.forEach(function(handler) {
                    handler(msg.data, socket);
                });

            if (forwardEvents.indexOf(msg.event) !== -1) {
                storeEventAsState(msg.event, msg.data);
                io.emit('ui', msg);
            }
        });

        socket.on('disconnect', function(){
        });
    });

    function storeEventAsState(event, data) {
        if (ignoreStateEvents.indexOf(event) !== -1)
            return;

        var eventState = state[event];
        if (!eventState) state[event] = eventState = {};
        eventState[data.id] = data;
    }

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

        socket.emit('ui', {event: 'replay-done'});
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
            }

            storeEventAsState(event, data);

            to.emit('ui', {
                event: event,
                data: data
            });
        }
    };

    RED.server.hapEvents = instance;
    return instance;
};