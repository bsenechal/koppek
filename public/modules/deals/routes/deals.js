'use strict';

//Setting up route
angular.module('deals').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    // var checkLoggedin = function($q, $timeout, $http, $location) {
    //   // Initialize a new promise
    //   var deferred = $q.defer();

    //   // Make an AJAX call to check if the user is logged in
    //   $http.get('/loggedin').success(function(user) {
    //     // Authenticated
    //     if (user !== '0') $timeout(deferred.resolve);

    //     // Not Authenticated
    //     else {
    //       $timeout(deferred.reject);
    //       $location.url('/login');
    //     }
    //   });

    //   return deferred.promise;
    // };

    // states for my app
    $stateProvider
      .state('all deals', {
        url: '/deals',
        templateUrl: 'modules/deals/views/list.html'
      })
      .state('deals by radius', {
        url: '/dealsbyradius',
        templateUrl: 'modules/deals/views/list.html'
      })
      .state('create deal', {
        url: '/deals/create',
        templateUrl: 'modules/deals/views/create.html',
        // resolve: {
        //   loggedin: checkLoggedin
        // }
      })
      .state('edit deal', {
        url: '/deals/:dealId/edit',
        templateUrl: 'modules/deals/views/edit.html',
        // resolve: {
        //   loggedin: checkLoggedin
        // }
      })
      .state('deal by id', {
        url: '/deals/:dealId',
        templateUrl: 'modules/deals/views/view.html',
        // resolve: {
        //   loggedin: checkLoggedin
        // }
      });
  }
]);
