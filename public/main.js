var app = angular.module('hap', ['ngMaterial', 'ngMdIcons']);

app.controller('MainController', MainController);

MainController.$inject = ['$mdSidenav', '$window', 'UiLoader', 'ControlSync'];
function MainController($mdSidenav, $window, loader, controlSync) {
  var main = this;

  this.tabs = [];
  this.selectedTab = null;
  this.title = '';

  this.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  this.select = function(tab) {
    main.selectedTab = tab;
  };
  
  this.openEditor = function() {
    $window.open('/red', '_blank');
  };

  loader.load().then(function(result) {
    main.tabs = result.tabs;
    main.title = result.title;
    main.select(main.tabs[0]);
    controlSync.sync(main.tabs);
  });
}
