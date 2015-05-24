'use strict';
angular.module('admin').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('adminDeals', {
                url: '/admin/deals',
                templateUrl: 'modules/admin/views/deals.client.view.html'
            });
	}	
]);
