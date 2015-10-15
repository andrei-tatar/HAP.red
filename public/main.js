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

