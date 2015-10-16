var app = angular.module('hap', ['ngMaterial', 'ngNewRouter']);

app.controller('MainController', ['$mdSidenav', '$window', '$router', MainController]);

function MainController($mdSidenav, $window, $router) {
  $router.config([
    { path: '/', redirectTo: '/home' },
    { path: '/home', component: 'home' }
  ]);
  
  this.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  this.openEditor = function() {
    $window.open('/red', '_blank');
  };
}
