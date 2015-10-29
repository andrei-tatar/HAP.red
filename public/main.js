var app = angular.module('hap', ['ngMaterial', 'ngMdIcons']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('red');
});

app.controller('MainController', MainController);

MainController.$inject = ['$mdSidenav', '$window', 'UiLoader', 'ControlSync', 'WebEvents', '$mdToast'];
function MainController($mdSidenav, $window, loader, controlSync, events, $mdToast) {

    var main = this;

    this.tabs = [];
    this.selectedTab = null;
    this.title = '';

    this.toggleSidenav = function() {
        $mdSidenav('left').toggle();
    };

    this.select = function(tab) {
        main.selectedTab = tab;
        $mdSidenav('left').close()
    };

    this.openEditor = function() {
        $window.open('/red', '_blank');
        $mdSidenav('left').close()
    };

    loader.load().then(function(result) {
        main.tabs = result.tabs;
        main.title = result.title;
        main.select(main.tabs[0]);
        controlSync.sync(main.tabs);
    });

    events.on('show-toast', function (msg) {
        $mdToast.show(
            $mdToast.simple()
                .content(msg.message)
                .position('top right')
                .hideDelay(3000)
        );
    });
}
