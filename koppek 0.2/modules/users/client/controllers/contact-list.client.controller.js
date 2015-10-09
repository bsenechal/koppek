'use strict';

angular.module('users').controller('ContactListController', ['$rootScope', '$scope', '$http', 'Authentication', '$resource',
  function($rootScope, $scope, $http, Authentication, $resource) {
    $scope.authentication = Authentication;
    $rootScope.message={};

    $scope.getContactList = function (){
      console.log('getContactList: init');
      var contactListRessource = $resource(
          '/users'
      );
      contactListRessource.query(function(contacts) {
        $scope.LIST = contacts;
      });
    };

    $scope.getNotificationIfEmpty = function()
    {
      if($scope.searchText === ''){
        $rootScope.getNotification();
        $rootScope.message.userTo = null;
        $rootScope.message.userToName = null;      
      }
    };
    $scope.setSearchText = function()
    {
      $rootScope.searchText = $scope.searchText;
    };


    function createFilterFor (contact){
      var res = false;
      var matchRes = String(contact.value).match(new RegExp(this, 'gi'));
	  
      if(matchRes !== null){
        res = true;
      }
      return res;
    }

    $scope.getMatches = function (searchText){
     var tmp = $scope.LIST.map(
            function (contact) {
              return {
                value: contact.username.toLowerCase(),
                display: contact.username,
                _id: contact._id
              };
            }
          );
		  
      var results = tmp;
      if(searchText !== ''){
        results = tmp.filter( createFilterFor, searchText);

        //set userTO dans le message :
        if(results[0]){
          $rootScope.message.userTo = results[0]._id;
          $rootScope.message.userToName = results[0].display;
        }
      }
      else
      {
        $rootScope.message.userTo = null;
        $rootScope.message.userToName = null;
      }
      return results;
	  };


  }
]);

