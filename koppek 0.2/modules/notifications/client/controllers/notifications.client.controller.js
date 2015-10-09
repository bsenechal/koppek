'use strict';

angular.module('notifications').controller('NotificationsController', ['$rootScope', '$scope', '$http',  '$stateParams','$resource', 'Socket', 'utils', 'Authentication', '$mdToast', '$anchorScroll',
  function($rootScope, $scope, $http,  $stateParams,$resource, Socket, utils, Authentication, $mdToast,$anchorScroll) {
    var notificationsSocket = io('http://localhost:3000');

    $scope.authentication = Authentication;
    $rootScope.searchText = '';
    if(!$rootScope.notifications)
    {
      $rootScope.notifications = [];
       //connect to server socket for notification:
       $resource('/notificationsConnect').get({},function(){
           console.log('NotificationsController(): connected to server socket !');
       });          
    }
    console.log('NotificationsController : init()');

    $scope.setSrchText = function(text){
      console.log('setSrchText() : text = ',text);
      $rootScope.searchText = text;
      console.log('setSrchText() : $scope.searchText = ',$rootScope.searchText);
      //set contact info :
      // $rootScope.getMatches();
      //move up :
      $anchorScroll();
    };

    $rootScope.getMessage = function(userTo) {
      var notificationsRessource = $resource(
        '/notifications/:userId/:userTo'
      );
      var notifications = notificationsRessource.get({'userId': Authentication.user._id, 'userTo': userTo},function(){
        // $rootScope.notifications = notifications;
      });
    };

    $scope.sendMessage = function(){
      var notificationsRessource = $resource(
        '/notifications/:userId',
          {'userId': Authentication.user._id, 'userTo': $scope.message.userTo, 'content': $scope.message.content},
          {
            query: {method:'POST',isArray: false }
          }
      );
      notificationsRessource.query(
        function(){
        // $rootScope.notifications = notifications;
      });
    };

    $scope.removeNotification = function(notificationId) {
      var notificationsRessource = $resource(
        '/notifications/:userId/:notificationId'
      );
	  
      notificationsRessource.delete({'userId': Authentication.user._id, 'notificationId': notificationId},
        function(){
        // $rootScope.notifications = notifications;
      });
    };
    $scope.removeAllNotification = function() {
      console.log('removeAllNotification : userId = ',Authentication.user._id);
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      notificationsRessource.delete({'userId': Authentication.user._id},
        function(){
        // $rootScope.notifications = notifications;
      });
    };
    
    $rootScope.getNotification = function() {
      var notificationsRessource = $resource(
        '/notifications/:userId'
      );
      var notifications = notificationsRessource.get({'userId': Authentication.user._id},function(){
        // $rootScope.notifications = notifications;
      });
    };
	
    $scope.filterByContact = function(notification) {
        if($rootScope.searchText !== ''){
          if(notification.userFrom && notification.userTo)
          {
            var regex = new RegExp($rootScope.searchText, 'gi');
            if(notification.userFrom.username.match(regex) || notification.userTo.username.match(regex))
            {
              return notification;
            }
          }
          else if('notification' === $rootScope.searchText && notification.type === 'notification'){
            return notification;
          }
        }
        else{
          return notification;
        }
    };

    notificationsSocket.on('notifications:updated', function (notifications) {
      $rootScope.notifications = notifications;
      $scope.$apply();
  });
}
]);
