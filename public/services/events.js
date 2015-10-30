angular.module('hap').service('WebEvents', WebEvents);

WebEvents.$inject = ['$timeout'];
function WebEvents($timeout) {
    var handlers = {};
    this.socket = {emit:function(){}};

    this.connect = function() {
        this.socket = io();
        this.socket.on('ui', function (msg) {
            var eventHandlers = handlers[msg.event];
            if (!eventHandlers) return;

            $timeout(function() {
                eventHandlers.forEach(function (handler) {
                    handler(msg.data);
                });
            }, 0);
        });
    };

    this.emit = function (event, data) {
        this.socket.emit('ui', {event: event, data: data});
    };

    this.on = function (event, handler) {
        var eventHandlers = handlers[event];
        if (!eventHandlers) handlers[event] = eventHandlers = [];
        eventHandlers.push(handler);

        return function() {
            var index = eventHandlers.indexOf(handler);
            if (index < 0) return;
            eventHandlers.splice(index, 1);
        }
    };
}