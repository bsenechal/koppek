'use strict';

/* App Module */


var Maps = new angular.module('maps',[
  'ngRoute',
  'ui.router.compat'
  ]);
var Deals = new angular.module('deals',[
  'ngRoute',
  'ui.router.compat'
  ]);

var phonecatApp = angular.module('phonecatApp', [
  'ngRoute',
  'phonecatAnimations',
  'phonecatControllers',
  'phonecatFilters',
  'phonecatServices',
  'maps',
  'deals'
  ]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/phones', {
        templateUrl: 'partials/phone-list.html',
        controller: 'PhoneListCtrl'
      }).
      when('/deals', {
        templateUrl: 'partials/deal-list.html'
        // controller: 'DealsController'
      }). 
      when('/dealsbyradius', {
        templateUrl: 'partials/deal-list.html'
        // controller: 'DealsController'
      }).
      when('/phones/:phoneId', {
        templateUrl: 'partials/phone-detail.html',
        controller: 'PhoneDetailCtrl'
      }).
      otherwise({
        redirectTo: '/phones'
      });
  }]);
