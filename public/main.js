var app = angular.module('hap', ['ngMaterial', 'ngNewRouter']);

app.controller('MainController', ['$mdSidenav', '$window', '$router', '$location', MainController]);

function MainController($mdSidenav, $window, $router, $location) {
  $router.config([
    { path: '/', redirectTo: '/home' },
    { path: '/home', component: 'home' },
    { path: '/editor', component: 'editor' }
  ]);
  
  this.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  this.go = function(where) {
    $location.path(where);
  }
}
