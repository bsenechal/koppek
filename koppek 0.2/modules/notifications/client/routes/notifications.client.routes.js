


'use strict';

//Setting up route
angular.module('notifications').config(['$stateProvider',
  function($stateProvider) {
    // states for my app
    $stateProvider
     .state('notifications', {
         url: '/notifications',
         templateUrl: 'modules/notifications/client/views/notifications.client.view.html'
      });
  }
]);
