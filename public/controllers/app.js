'use strict';

/* App Module */
var Maps = new angular.module('maps',[
  'ui.router.compat',
  'ngResource'
  ]);
var Deals = new angular.module('deals',[
  'ui.router.compat',
  'ngResource'
  ]);

var koppekApp = angular.module('koppekApp', [
  'ngRoute',
  'maps',
  'deals'
  ]);

koppekApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/deals', {
        templateUrl: 'views/deals/deals-list.html'
      }). 
      when('/test', {
        templateUrl: 'error.html'
      }). 
      otherwise({
        redirectTo: '/test'
      });
  }]);
