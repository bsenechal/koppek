'use strict';

//Setting up route
angular.module('deals').config(['$stateProvider',
  function($stateProvider) {
    // states for my app
    $stateProvider
	  .state('deals', {
        abstract: true,
        url: '/deals',
        template: '<ui-view/>'
      })
      .state('deals.list', {
        url: '',
        templateUrl: 'modules/deals/client/views/list.client.view.html'
      })
      .state('deals.dealsByRadius', {
        url: '/dealsbyradius',
        templateUrl: 'modules/deals/client/views/list.client.view.html'
      })
      .state('deals.create', {
        url: '/create',
        templateUrl: 'modules/deals/client/views/create.client.view.html',
		data: {
          roles: ['user', 'admin']
        }
      })
      .state('deals.edit', {
        url: '/:dealId/edit',
        templateUrl: 'modules/deals/client/views/edit.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('deals.dealById', {
        url: '/:dealId',
        templateUrl: 'modules/deals/client/views/detail.client.view.html',
      });
  }
]);
