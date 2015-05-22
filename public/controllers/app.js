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
  'deals',
  'ui.router'
  ]);
/*
koppekApp.config(function($stateProvider) {
	$stateProvider.state('all deals', {
        url: '/deals',
        templateUrl: 'views/deals/deals-list.html'
      })
	  .state('deal by id', {
        url: '/deals/:dealId',
        templateUrl: 'views/deals/deals-view.html'
	  });
  });
*/