'use strict';

angular.module('users').controller('ContactListController', ['$rootScope', '$scope', '$http', '$location', 'Authentication', '$resource',
  function($rootScope, $scope, $http, $location, Authentication, $resource) {
    $scope.authentication = Authentication;
    $rootScope.message={};

    $scope.getContactList = function (){
      console.log('getContactList: init');
      var contactListRessource = $resource(
          '/users'
      );
      contactListRessource.query(function(contacts) {
        console.log('contactList(): server results');
        console.log(contacts);
        $scope.LIST = contacts;
      });
    };

    // function createFilterFor(query) {
    //   var lowercaseQuery = angular.lowercase(query);
    //   return function filterFn(state) {
    //     return (state.value.indexOf(lowercaseQuery) === 0);
    //   };
    // }

    function createFilterFor (contact){
      var res = false;
      console.log('createFilterFor():this=searchText= ', this);
      console.log('createFilterFor():contact= ', contact);
      var matchRes = String(contact.value).match(String(this));
      if(matchRes != null){
        res = true;
      }
      console.log('createFilterFor():matchRes= ', matchRes);
      
      return res;
    }

    $scope.getMatches = function (searchText){
      console.log('getMatches: searchText', searchText);
      // getContactList(function(contactList){
      // console.log('getMatches: contactList', contactList);
     var tmp = $scope.LIST.map(
            function (contact) {
              return {
                value: contact.username.toLowerCase(),
                display: contact.username,
                _id: contact._id
              }
            }
          );
      var results = tmp;
      if(searchText){
        results = tmp.filter( createFilterFor, searchText);
      }
      console.log('getMatches: tmp mapped', results);
      // var results = searchText ? contactList.filter( createFilterFor(searchText) ) : contactList;
      //set userTO dans le message :
      if(results[0]){
        $rootScope.message.userTo = results[0]._id;
      }
      else
      {
        $rootScope.message.userTo = null;
      }
      return results;
      // });
    }


  }
]);

