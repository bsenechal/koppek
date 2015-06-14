'use strict';

angular.module('notifications').controller('NotificationsController', ['$scope', '$http',  '$stateParams','$resource', 'Socket', 'utils', 'Authentication', '$mdToast',
  function($scope, $http,  $stateParams,$resource, Socket, utils, Authentication, $mdToast) {
    

    var socket = io('http://localhost:3000');
      

    $scope.authentication = Authentication;

    $scope.notifications = [];
    console.log('NotificationsController : init()');

    $scope.removeNotification = function(notificationId) {
      console.log('removeNotification : userId = ',Authentication.user._id);
      console.log('removeNotification : notificationId = ',notificationId);
      var notificationsRessource = $resource(
        '/notifications/:userId/:notificationId'
      );
      notificationsRessource.delete({'userId': Authentication.user._id, 'notificationId': notificationId},
        function(){
        // console.log('getNotification : notifications = ', notifications);
        // $scope.notifications = notifications;
      });
    };
    $scope.removeAllNotification = function() {
      console.log('removeAllNotification : userId = ',Authentication.user._id);
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      notificationsRessource.delete({'userId': Authentication.user._id},
        function(){
        // console.log('getNotification : notifications = ', notifications);
        // $scope.notifications = notifications;
      });
    };
    
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

    $scope.toastPosition = {
      bottom: false,
      top: true,
      left: false,
      right: true
    };

    $scope.getToastPosition = function() {
      return Object.keys($scope.toastPosition)
        .filter(function(pos) { return $scope.toastPosition[pos]; })
        .join(' ');
    };

    Socket.on('notifications:updated', function (notifications) {
      console.log('NotificationsController : Socket.on : notifications:updated for userId : ',Authentication.user._id);
      console.log('NotificationsController : Socket.on : notifications = ',notifications);
      // console.log('NotificationsController : Socket.on : notifications = ',notificationsObj[0].notifications);
      // $scope.getNotification();
      // $scope.notifications = notifications;
      $scope.notifications = notifications;
      for(var i=0; i<notifications.length; i++){
        console.log('NotificationsController : Socket.on : showing a toast ! : content = ',notifications[i].content)
        var toast = $mdToast.simple()
          .content(notifications[i].content)
          .action('remove')
          .highlightAction(false)
          .hideDelay(10000)
          .position('top right');
        $mdToast.show(toast);
      }

      // $http.get('/notifications').success(function(data) {
      //   $scope.notifications = data;
      // });
  });
}
]);
