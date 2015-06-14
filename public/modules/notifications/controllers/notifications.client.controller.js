'use strict';

angular.module('notifications').controller('NotificationsController', ['$scope', '$http',  '$stateParams','$resource', 'notificationsSocket', 'utils', 'Authentication',
  function($scope, $http,  $stateParams,$resource, notificationsSocket, utils, Authentication) {
    

    $scope.authentication = Authentication;

    $scope.notifications = [];
    console.log('NotificationsController : init()');

    $scope.getNotification = function() {
      console.log('getNotification : userId = ',Authentication.user._id);
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      var notifications = notificationsRessource.query({'userId': Authentication.user._id},function(){
        // console.log('getNotification : notifications = ', notifications);
        // $scope.notifications = notifications;
      });
    }

  notificationsSocket.on('notifications:updated', function (ev, notifications) {
    console.log('NotificationsController : Socket.on : notifications:updated for userId : ',Authentication.user._id);
    // $scope.getNotification();
    $scope.notifications = notifications;

    // $http.get('/notifications').success(function(data) {
    //   $scope.notifications = data;
    // });
  });
}
]);
