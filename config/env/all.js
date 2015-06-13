'use strict';

module.exports = {
	app: {
		title: 'koppek',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/angular-xeditable/dist/css/xeditable.css',
				'public/lib/angular-material/angular-material.min.css',
			],
			js: [	
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/socket.io-client/socket.io.js',
				'public/lib/angular-socket-io/socket.min.js',
				'public/lib/Autolinker.js/dist/Autolinker.min.js',
				'public/lib/angular-timeago/src/timeAgo.js',
				'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
				'public/lib/aws-sdk-js/dist/aws-sdk.min.js',
				'public/lib/angular-xeditable/dist/js/xeditable.js',
				'public/lib/angular-aria/angular-aria.min.js',
				'public/lib/angular-material/angular-material.min.js',
                'public/lib/angular-messages/angular-messages.min.js',
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	},
	//Koppek variables config : 
	//used in user.role controller : help determine the distance between two update role
	thresholdCheckRole: 10,
	thresholdArrayRole: [0,0.25,0.5,0.75,1],
	ArrayRole: ['manant','écuyer', 'sir', 'cavalier de l\'apocalypse']
};