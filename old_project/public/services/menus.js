'use strict';

angular.module('system').factory('Menus', ['$resource',
  function($resource) {
    return $resource('admin/menu/:name', {
      name: '@name',
      defaultMenu: '@defaultMenu'
    });
  }
]);
