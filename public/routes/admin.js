'use strict';
angular.module('admin').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('adminDeals', {
                url: '/admin/deals',
                templateUrl: '/views/admin/deals.html'
            });
	}	
]);
