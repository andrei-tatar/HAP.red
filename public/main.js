

var app = angular.module('hap', ['ngMaterial']);

app.controller('MainCtrl', function($mdSidenav, Events) {
  this.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  this.send = function() {
	  Events.emit("message", "It Works!");
  };
  
  Events.on("message", function (msg) {
    console.log(msg);
  });
});

app.service('Events', function() {
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