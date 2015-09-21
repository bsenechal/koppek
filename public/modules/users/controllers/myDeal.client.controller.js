'use strict';

angular.module('users').controller('MyDealController', ['$scope', 'Authentication', '$resource', '$location', '$mdToast', '$http', 
   function($scope, Authentication, $resource, $location, $mdToast, $http) {
        $scope.authentication = Authentication;
        $scope.active = true;



        
        $scope.getUserDeal = function(active) {
            var user = $scope.authentication.user,
            activeQuery = {};

            activeQuery['active'] = active;

            var userDealRessource = $resource(
              '/userDeal/:active'
            );
            var deals = userDealRessource.query(activeQuery,function(){
              // console.log('getNotification : notifications = ', notifications);
              // $rootScope.notifications = notifications;
              $scope.deals = deals;
            });
            
            // displayToast('Votre avatar a correctement été modifié.');
        };
                
        function displayToast(content){
            $mdToast.show(
                $mdToast.simple()
                  .content(content)
                  .position('top right')
                  .hideDelay(2000)
             );
        }
    }
]);