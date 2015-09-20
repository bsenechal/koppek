'use strict';

angular.module('users').controller('MyAccountController', ['$scope', 'Authentication', '$resource', '$location', '$mdToast', '$http', 'uuid4',
	function($scope, Authentication, $resource, $location, $mdToast, $http, uuid4) {
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
        
        $http.get("/getNumberOfComment").success(function(response) { $scope.nbOfComment = response; });
        
        $http.get("/getNumberOfDeal").success(function(response) { $scope.nbOfDeal = response; });

		function base64ToFile(base64Data, tempfilename, contentType) {
			contentType = contentType || '';
			var sliceSize = 1024;
			var byteCharacters = atob(base64Data);
			var bytesLength = byteCharacters.length;
			var slicesCount = Math.ceil(bytesLength / sliceSize);
			var byteArrays = new Array(slicesCount);

			for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
				var begin = sliceIndex * sliceSize;
				var end = Math.min(begin + sliceSize, bytesLength);

				var bytes = new Array(end - begin);
				for (var offset = begin, i = 0 ; offset < end; ++i, ++offset) {
					bytes[i] = byteCharacters[offset].charCodeAt(0);
				}
				byteArrays[sliceIndex] = new Uint8Array(bytes);
			}
			var file = new File(byteArrays, tempfilename, { type: contentType });
			return file;
		}

        $scope.editAvatar = function() {
            var user = $scope.authentication.user;
			var base64 = $scope.myCroppedImage.replace(/^[^,]+,/, '');
			
			user.avatar = uuid4.generate();

			$resource('/users/getS3Credentials').get(function(credential) {
				  // Configure The S3 Object 
				  AWS.config.update({ accessKeyId: credential["access_key"], secretAccessKey: credential["secret_key"]});
				  AWS.config.region = credential.region;
				  var bucket = new AWS.S3({ params: { Bucket: credential["bucket"] } });
				  var contentType = 'image/jpg';
				  var params = { Key: user.avatar, ContentType: contentType, Body: base64ToFile(base64, user.avatar, contentType), ServerSideEncryption: 'AES256' };
				
				bucket.putObject(params, function(err, data) {
				  if(err) {
				  // There Was An Error With Your S3 Config
				  displayToast('Erreur lors de la modification de votre avatar')
				  return false;
				  }
				  else {
					   // Success!
					   updateUser(user);
					   
					   $scope.authentication.user = user;
				  }
				})
			  });
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