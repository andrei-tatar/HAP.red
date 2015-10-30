var app = angular.module('hap', ['ngMaterial', 'ngMdIcons']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('light-green')
        .accentPalette('red');
});

app.controller('MainController', MainController);

MainController.$inject = ['$mdSidenav', '$window', 'UiLoader', 'ControlSync', 'WebEvents', '$mdToast', '$location', '$document'];
function MainController($mdSidenav, $window, loader, controlSync, events, $mdToast, $location, $document) {
    var main = this;

    this.tabs = [];
    this.selectedTab = null;
    this.loaded = false;

    this.toggleSidenav = function() {
        $mdSidenav('left').toggle();
    };

    this.select = function(index) {
        main.selectedTab = main.tabs[index];
        $mdSidenav('left').close();
        $location.path(index);
    };

    this.openEditor = function() {
        $window.open('/red', '_blank');
        $mdSidenav('left').close();
    };

    loader.load().then(function(result) {
        main.tabs = result.tabs;
        $document[0].title = result.title;

        var prevTabIndex = parseInt($location.path().substr(1));
        if (!isNaN(prevTabIndex) && prevTabIndex < main.tabs.length)
            main.selectedTab = main.tabs[prevTabIndex];
        else
            main.select(0);

        controlSync.sync(main.tabs);

        events.connect();
        events.on('show-toast', function (msg) {
            var toast = $mdToast.simple()
                .content(msg.message)
                .position('top right')
                .hideDelay(3000);

            $mdToast.show(toast);
        });

        events.on('replay-done', function() {
            main.loaded = true;
        });
    });
}
