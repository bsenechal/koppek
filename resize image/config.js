'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'koppek';
	var applicationModuleVendorDependencies = ['infinite-scroll','ngResource', 'ngCookies',  'ngAnimate',  'ngTouch', 'once', 'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils', 'btford.socket-io', 'yaru22.angular-timeago', 'xeditable', 'ngAria', 'ngMaterial', 'ngMessages', 'imageupload', 'base64'];

	// repe a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();