'use strict';

angular.module('core')
.controller('MenuCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('menu').close();
    };
  })
.controller('HeaderController', ['$scope', '$rootScope', 'Authentication', 'Menus', '$mdSidenav', '$mdUtil',
	function($scope, $rootScope, Authentication, Menus, $mdSidenav, $mdUtil) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');
        
        $rootScope.toggleMenu = buildToggler('menu');
        
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