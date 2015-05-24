'use strict';

angular.module('maps').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('maps example page', {
      url: '/maps/example',
      templateUrl: 'modules/maps/views/index.html'
    });
  }
]);
