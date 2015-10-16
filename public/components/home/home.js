angular.module('hap')
  .controller('HomeController', ['WebEvents', HomeController]);
  
function HomeController(events) {
  this.send = function() {
    events.emit("message", "It Works!");
  };

  events.on("message", function (msg) {
    console.log(msg);
  });
}