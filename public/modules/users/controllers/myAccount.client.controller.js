'use strict';

angular.module('users').controller('MyAccountController', ['$scope', 'Authentication', '$resource',
	function($scope, Authentication, $resource) {
        $scope.authentication = Authentication;
        $scope.myImage='';
        $scope.myCroppedImage='';

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
        };
        
        $scope.editUser = function() {
            updateUser($scope.authentication.user);
        };
        
        function updateUser(user){
            $resource('/users', null,
            {
                'update': { method:'PUT' }
            }).update(user);
        }
    }
]);