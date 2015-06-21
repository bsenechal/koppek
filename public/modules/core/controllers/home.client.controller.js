'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$window', 
	function($scope, Authentication, $window) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        $scope.mapHeight = (angular.element($window).height() + 100) / 2;
    }
]);