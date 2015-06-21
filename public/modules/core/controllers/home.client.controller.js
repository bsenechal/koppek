'use strict';


angular.module('core').controller('HomeController', ['$scope','$resource', 'Authentication', '$window', 
	function($scope,$resource, Authentication, $window) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

    }
]);