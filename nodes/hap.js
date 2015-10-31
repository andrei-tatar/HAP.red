var socketio = require('socket.io');
var hapmosca = require('./hap_mosca');

module.exports = function(RED) {
    if (RED.server.hapEvents)
        return RED.server.hapEvents;

    hapmosca(RED.log);

    var io = socketio(RED.server);
    var handlers = {};
    var state = {};
    var ignoreStateEvents = ['show-toast'];
    var forwardEvents = ['switch-changed', 'slider-changed'];

    io.on('connection', function(socket) {
        replayStateEvents(socket);

        socket.on('ui', function (msg) {
            var eventHandlers = handlers[msg.event];
            if (!eventHandlers) return;
            eventHandlers.forEach(function(handler) {
                handler(msg.data, socket);
            });

            if (forwardEvents.indexOf(msg.event) != -1)
                io.emit('ui', msg);
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
            } else if (ignoreStateEvents.indexOf(event) === -1) {
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

    RED.server.hapEvents = instance;
    return instance;
};