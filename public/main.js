

var app = angular.module('hap', ['ngMaterial']);

app.controller('MainCtrl', ['$mdSidenav', 'webEvents', function($mdSidenav, events) {
  this.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  this.send = function() {
	  events.emit("message", "It Works!");
  };
  
  events.on("message", function (msg) {
    console.log(msg);
  });
}]);

app.service('webEvents', function() {
  var socket = io();
  var handlers = {};
  
  socket.on('msg', function (msg) {
    var eventHandlers = handlers[msg.event];
    if (!eventHandlers) return;
    eventHandlers.forEach(function (handler) {
      handler(msg.data);
    });
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
});