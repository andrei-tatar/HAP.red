angular.module('hap').service('ControlSync', ControlSync);

ControlSync.$inject = ['WebEvents'];
function ControlSync(events) {
    var uitabs = [];
    var cachedSearches = {};

    this.sync = function(tabs) {
        uitabs = tabs;
    };

    events.on('text-update', function (data) {
        var controls = findControls(data.id, 'text');
        controls.forEach(function (ctrl) {
            ctrl.formatted = formatText(ctrl.value, data.payload);
        });
    });

    events.on('switch-changed', function (data) {
        var controls = findControls(data.id, 'switch');
        controls.forEach(function (ctrl) {
            ctrl.state = data.state;
        });
    });

    events.on('slider-changed', function (data) {
        var controls = findControls(data.id, 'slider');
        controls.forEach(function (ctrl) {
            ctrl.value = data.value;
        });
    });

    function findControls(id, type) {
        var key = id + '-' + type;
        var cached = cachedSearches[key];
        if (cached) return cached;

        var result = [];
        uitabs.forEach(function (tab) {
            tab.groups.forEach(function (group) {
                findRecursive(group, id, type, result);
            });
        });

        cachedSearches[key] = result;
        return result;
    }

    function findRecursive(root, id, type, result) {
        if (root.id === id && root.type === type)
            result.push(root);

        if (root.items) {
            root.items.forEach(function (item) {
                findRecursive(item, id, type, result);
            });
        }
    }

    function formatText(text, valueSource) {
        return text.replace(/\{payload(?:.([\w\s]+))?}/gi, function (match, captured) {
            if (!captured || !captured.length) return valueSource;
            return valueSource[captured];
        });
    }
}