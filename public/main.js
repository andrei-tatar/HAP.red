var app = angular.module('hap', ['ngMaterial', 'ngMdIcons']);

app.controller('MainController', MainController);

MainController.$inject = ['$mdSidenav', '$window', '$http', 'WebEvents'];
function MainController($mdSidenav, $window, $http, events) {
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

  $http.get('/ui.xml').then(function (resp) {
    var parser = new DOMParser();
    var xml = parser.parseFromString(resp.data, "text/xml");
    if (xml.children.length != 1 || xml.children[0].tagName != 'ui')
      throw new Error("Only one <ui> root node must exist");

    var ui = xml.children[0];
    main.title = ui.getAttribute('title') || 'Title';
    main.tabs = getXmlObjects(ui, function (c) {
      if (c.tagName != 'tab') return;
      return getTab(c);
    });

    main.selectedTab = main.tabs[0];
  });

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
      groups: getXmlObjects(xmlroot, function (c) {
        if (c.tagName != 'group') return;
        return {
          header: c.getAttribute('header') || 'Unnamed',
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

    switch (control.type) {
      case 'row':
        control.alignment = control.alignment || start;
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
    }

    return control;
  }
}
