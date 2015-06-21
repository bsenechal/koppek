'use strict';

angular.module('users').controller('MyAccountController', ['$scope', 'Authentication', '$resource', '$location', '$mdToast',
	function($scope, Authentication, $resource, $location, $mdToast) {
        $scope.authentication = Authentication;
        $scope.myImage='';
        $scope.myCroppedImage='';
        console.log($scope.authentication);
        var handleFileSelect=function(evt) {
          var file=evt.currentTarget.files[0];
          var reader = new FileReader();
          reader.onload = function (evt) {
            $scope.$apply(function($scope){
              $scope.myImage=evt.target.result;
            });
          };
          reader.readAsDataURL(file);
        };
        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
        
        
        $scope.editAvatar = function() {
            var user = $scope.authentication.user;
            user.avatar = $scope.myCroppedImage;
            updateUser($scope.authentication.user);
            
            displayToast('Votre avatar a correctement été modifié.');
        };
        
        $scope.editUser = function() {
          
            updateUser($scope.authentication.user);
            
            displayToast('Votre profil a correctement été modifié.');
        };
        
        function updateUser(user){
            $resource('/users', null,
            {
                'update': { method:'PUT' }
            }).update(user);
        }
        
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