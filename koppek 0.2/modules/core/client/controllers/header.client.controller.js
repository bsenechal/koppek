'use strict';

angular.module('core')
.controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close();
    };
  })
.controller('HeaderController', ['$scope', '$rootScope','$resource', 'Authentication', 'Menus', '$mdSidenav', '$mdUtil',
	function($scope, $rootScope,$resource, Authentication, Menus, $mdSidenav, $mdUtil) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

        $scope.toggleLeft = buildToggler('left');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
        
        function buildToggler(navID) {
          var debounceFn =  $mdUtil.debounce(function(){
                $mdSidenav(navID)
                  .toggle();
              },300);
          return debounceFn;
        }
	}
]);