'use strict';

angular.module('notifications').controller('NotificationsController', ['$rootScope', '$scope', '$http',  '$stateParams','$resource', 'Socket', 'utils', 'Authentication', '$mdToast',
  function($rootScope, $scope, $http,  $stateParams,$resource, Socket, utils, Authentication, $mdToast) {
    

    var notificationsSocket = io('http://localhost:3000');

    //connect to server socket for notification:
    $resource('/notificationsConnect').get({},function(){
      // if(err){
      //   console.log('NotificationsController(): connexion error !(socket)');
      // }
      // else
      // {
        console.log('NotificationsController(): connected to server socket !');
      // }
    });
      

    $scope.authentication = Authentication;
    $rootScope.searchText = '';

    $scope.notifications = [];
    console.log('NotificationsController : init()');

    $rootScope.getMessage = function(userTo) {
      console.log('getMessage : userId = ',Authentication.user._id);
      console.log('getMessage : userTo = ',userTo);
      // console.log('getNotification : contact = ',contact);
      var notificationsRessource = $resource(
        '/notifications/:userId/:userTo'
      );
      var notifications = notificationsRessource.query({'userId': Authentication.user._id, 'userTo': userTo},function(){
        // console.log('getNotification : notifications = ', notifications);
        // $scope.notifications = notifications;
      });
    }

    $scope.sendMessage = function(){
      console.log('sendMessage : userFrom = ',Authentication.user._id);
      console.log('sendMessage : userTo = ',$scope.message.userTo);
      console.log('sendMessage : content = ',$scope.message.content);
      var notificationsRessource = $resource(
        '/notifications/:userId',
          {'userId': Authentication.user._id, 'userTo': $scope.message.userTo, 'content': $scope.message.content},
          {
            query: {method:'POST',isArray: false }
          }
      );
      notificationsRessource.query(
        function(){
        console.log('sendMessage : message sent');
        // $scope.notifications = notifications;
      });
    }

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
    
    $rootScope.getNotification = function() {
      console.log('getNotification : userId = ',Authentication.user._id);
      // console.log('getNotification : contact = ',contact);
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      var notifications = notificationsRessource.query({'userId': Authentication.user._id},function(){
        // console.log('getNotification : notifications = ', notifications);
        // $scope.notifications = notifications;
      });

    }
    $scope.filterByContact = function(notification) {
      
        console.log('filterByContact(): notification = ', notification);
        if($rootScope.searchText != ''){
          if(notification.userFrom && notification.userTo)
          {
            var regex = new RegExp($rootScope.searchText, 'gi');
            if(
                (
                  notification.userFrom.username.match(regex)
                )
                ||
                (
                  notification.userTo.username.match(regex)
                )
              )
            {
              console.log('filterByContact(): $rootScope.searchText = ', $rootScope.searchText);
              console.log('filterByContact(): notification.userTo = ', notification.userTo);
              console.log('filterByContact(): notification.userFrom = ', notification.userFrom);
              return notification;
            }
          }
          else if('notification' == $rootScope.searchText && notification.type == 'notification'){
            return notification;
          }
        }
        else{
          return notification;
        }
    }


    // $scope.toastPosition = {
    //   bottom: false,
    //   top: true,
    //   left: false,
    //   right: true
    // };

    // $scope.getToastPosition = function() {
    //   return Object.keys($scope.toastPosition)
    //     .filter(function(pos) { return $scope.toastPosition[pos]; })
    //     .join(' ');
    // };

    notificationsSocket.on('notifications:updated', function (notifications) {
      console.log('NotificationsController : notificationsSocket.on : notifications:updated for userId : ',Authentication.user._id);
      console.log('NotificationsController : notificationsSocket.on : notifications = ',notifications);
      // console.log('NotificationsController : notificationsSocket.on : notifications = ',notificationsObj[0].notifications);
      // $scope.getNotification();
      // $scope.notifications = notifications;
      $scope.notifications = notifications;
      $scope.$apply();
      // for(var i=0; i<notifications.length; i++){
      //   console.log('NotificationsController : notificationsSocket.on : showing a toast ! : content = ',notifications[i].content)
        // var toast = $mdToast.simple()
        //   .content(notifications[i].content)
        //   .action('remove')
        //   .highlightAction(false)
        //   .hideDelay(10000)
        //   .position('top right');
        // $mdToast.show(toast);
      // }

      // $http.get('/notifications').success(function(data) {
      //   $scope.notifications = data;
      // });
  });
}
]);
