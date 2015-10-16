angular.module('hap')
  .controller('EditorController', EditorController);
  
function EditorController() {
  this.canReactivate = function() {
    return true;
  };
}