angular.module('hap').directive('hapControl', HapControl);

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

            ctrl.init();
        }
    };
}

ControlController.$inject = ['WebEvents'];
function ControlController(events) {

    this.buttonClick = function() {
        events.emit('button-click', {
            id: this.item.id
        });
    };

    this.switchChanged = function() {
        events.emit('switch-changed', {
            id: this.item.id,
            state: this.item.state
        });
    };

    this.init = function() {
        this.formatted = this.item.value;

        events.on('text-update', function (data) {
            if (this.item.id == data.id) {
                this.formatted = formatText(this.item.value, data.payload);
            }
        }.bind(this));
    };

    function formatText(text, valueSource) {
        return text.replace(/{([\w\s]+)}/gi, function (match, captured) {
            return valueSource[captured];
        });
    }
}