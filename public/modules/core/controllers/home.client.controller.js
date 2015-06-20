'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$mdToast',
	function($scope, Authentication, $mdToast) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
       $mdToast.show(
        $mdToast.simple()
          .content('Ulysse !? Mais pourquoi pas UlFrisé ?')
          .position('top left right')
          .hideDelay(3000)
        );
    }
]);