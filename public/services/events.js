angular.module('hap').service('WebEvents', WebEvents);

WebEvents.$inject = ['$timeout'];
function WebEvents($timeout) {
  var socket = io();
  var handlers = {};
  
  socket.on('msg', function (msg) {
    var eventHandlers = handlers[msg.event];
    if (!eventHandlers) return;
    
    $timeout(function() {
      eventHandlers.forEach(function (handler) {
        handler(msg.data);
      });
    }, 0);
  });
  
  this.emit = function (event, data) {
    socket.emit('msg', {event: event, data: data});
  };
  
  this.on = function (event, handler) {
    var eventHandlers = handlers[event];
    if (!eventHandlers)
      handlers[event] = eventHandlers = [];
    eventHandlers.push(handler);
  };
}