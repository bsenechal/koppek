'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'messageCenterService',
	function($scope, Authentication, messageCenterService ) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
        
        
        // EXEMPLE A RETIRER 
        messageCenterService.add('success', 'ceci est un test', { status: messageCenterService.status.unseen });
    }
]);