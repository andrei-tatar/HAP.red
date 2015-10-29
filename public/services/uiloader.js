angular.module('hap').service('UiLoader', UiLoader);

UiLoader.$inject = ['$http'];
function UiLoader($http) {
    this.load = function() {
        return $http.get('/ui.xml').then(function (resp) {
            var parser = new DOMParser();
            var xml = parser.parseFromString(resp.data, "text/xml");
            if (xml.children.length != 1 || xml.children[0].tagName != 'ui')
                throw new Error("Only one <ui> root node must exist");

            var ui = xml.children[0];
            return {
                title: ui.getAttribute('title') || 'Title',
                tabs: getXmlObjects(ui, function (c) {
                    if (c.tagName != 'tab') return;
                    return getTab(c);
                })
            };
        });
    };

    var getId = function() {
        this.id++;
        return "____id" + this.id;
    }.bind({id: 0});

    function getXmlObjects(xmlroot, transform) {
        var result = [];
        for (var i=0; i<xmlroot.children.length; i++) {
            var child = xmlroot.children[i];
            var transformed = transform(child);
            if (transformed) result.push(transformed);
        }
        return result;
    }

    function getTab(xmlroot) {
        return {
            header: xmlroot.getAttribute('header') || 'Unnamed',
            icon: xmlroot.getAttribute('icon') || 'dashboard',
            groups: getXmlObjects(xmlroot, function (c) {
                if (c.tagName != 'group') return;
                return {
                    header: c.getAttribute('header') || '',
                    items: getXmlObjects(c, getControl)
                };
            })
        };
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
                control.items =  getXmlObjects(xmlroot, getControl);
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