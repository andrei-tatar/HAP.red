angular.module('hap')
  .controller('HomeController', ['webEvents', function (events) {
    this.send = function() {
      events.emit("message", "It Works!");
    };
  
    events.on("message", function (msg) {
      console.log(msg);
    });
  }]);