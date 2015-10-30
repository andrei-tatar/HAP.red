angular.module('hap').service('UiLoader', UiLoader);

UiLoader.$inject = ['$http', '$q'];
function UiLoader($http, $q) {
    this.load = function() {
        return loadXmlFirstChild('root.xml').then(function (ui) {
            if (!ui || ui.tagName != 'ui')
                throw new Error("Only one <ui> root node must exist");

            return getXmlObjects(ui, getTab).then(function (tabs) {
                return {
                    title: ui.getAttribute('title') || 'Title',
                    tabs: tabs
                };
            });
        });
    };

    var getId = function() {
        this.id++;
        return "____id" + this.id;
    }.bind({id: 0});

    function loadXmlFirstChild(url) {
        return $http.get('/ui/'+ url).then(function (resp) {
            var parser = new DOMParser();
            var xml = parser.parseFromString(resp.data, "text/xml");
            return xml.firstChild;
        });
    }

    function getXmlObjects(xmlroot, transform) {
        var promises = [];
        for (var i=0; i<xmlroot.children.length; i++) {
            var child = xmlroot.children[i];
            var transformed = transform(child);
            if (transformed)
                promises.push(transformed);
        }
        return $q.all(promises);
    }

    function getTab(xmlroot) {
        if (xmlroot.tagName != 'tab')
            throw new Error("Expected tab tag");

        var url = xmlroot.getAttribute('url');
        if (url)
            return loadXmlFirstChild(url).then(getTab);

        return getXmlObjects(xmlroot, getGroup).then(function (groups) {
            return {
                header: xmlroot.getAttribute('header') || 'Unnamed',
                icon: xmlroot.getAttribute('icon') || 'dashboard',
                groups: groups
            };
        });
    }

    function getGroup(xmlroot) {
        if (xmlroot.tagName != 'group')
            throw new Error("Expected group tag");

        var url = xmlroot.getAttribute('url');
        if (url)
            return loadXmlFirstChild(url).then(getGroup);

        return getXmlObjects(xmlroot, getControl).then(function (controls) {
            return {
                header: xmlroot.getAttribute('header') || '',
                items: controls
            };
        });
    }

    function getControl(xmlroot) {
        var control = { type: xmlroot.tagName };

        for (var i=0; i<xmlroot.attributes.length; i++) {
            var attr = xmlroot.attributes[i];
            control[attr.name] = attr.value;
        }

        if (!control.id)
            control.id = getId();

        switch (control.type) {
            case 'row':
                control.alignment = control.alignment || 'start';
                return getXmlObjects(xmlroot, getControl).then(function (items) {
                    control.items = items;
                    return control;
                });
                break;
            case 'text':
                control.value = xmlroot.innerHTML;
                break;
            case 'switch':
                break;
            case 'button-icon':
                break;
            case 'button':
                control.value = xmlroot.innerHTML;
                break;
            case 'slider':
                control.min = control.min || 0;
                control.max = control.max || 100;
                control.value = control.value || control.min;
                break;
        }

        return control;
    }
}