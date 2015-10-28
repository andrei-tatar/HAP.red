angular.module('hap').directive('hapControls', HapControls);
angular.module('hap').directive('hapControl', HapControl);

function HapControls() {
    return {
        restrict: 'E',
        templateUrl: 'templates/controls.html',
        bindToController: {
            items: '='
        },
        controller: ControlsController,
        controllerAs: "me",
        scope: true
    };
}

function ControlsController() {
}

HapControl.$inject = ['$http', '$compile'];
function HapControl($http, $compile) {
    var templateCache = {};

    return {
        restrict: 'E',
        bindToController: {
            item: '='
        },
        controller: ControlController,
        controllerAs: "me",
        scope: true,
        link: function (scope, element, attributes, ctrl) {
            var template = templateCache[ctrl.item.type];
            if (!template) templateCache[ctrl.item.type] = template = $http.get('/templates/controls/' + ctrl.item.type +'.html');

            template.then(function (resp) {
                element.html(resp.data);
                $compile(element.contents())(scope);
            });
        }
    };
}

ControlController.$inject = ['WebEvents'];
function ControlController(events) {
    this.buttonClick = function() {
        events.emit('button-click', this.item.id);
    }
}