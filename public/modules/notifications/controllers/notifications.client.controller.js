'use strict';

angular.module('notifications').controller('NotificationsController', ['$scope', '$http',  '$stateParams','$resource', 'Socket', 'utils', 'Authentication',
  function($scope, $http,  $stateParams,$resource, Socket, utils, Authentication) {
    var socket = Socket;
    $scope.authentication = Authentication;

    $scope.notifications = [];
    console.log('NotificationsController : init()');

    $scope.getNotification = function() {
      console.log('getNotification : userId = ',Authentication.user._id);
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      var notifications = notificationsRessource.query({'userId': Authentication.user._id},function(){
        console.log('getNotification : notifications = ', notifications);
        $scope.notifications = notifications;
      });
    }

  Socket.on('notifications:updated', function () {
    console.log('NotificationsController : Socket.on : notifications:updated for userId : ',Authentication.user._id);
    $scope.getNotification();
    // $http.get('/notifications').success(function(data) {
    //   $scope.notifications = data;
    // });
  });
}
]);
