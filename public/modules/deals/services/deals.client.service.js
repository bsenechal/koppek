'use strict';

//Deals service used for deals REST endpoint
angular.module('deals').factory('Deals', ['$resource',
  function($resource) {
    return $resource('deals/:dealId', {
      dealId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
])
.factory('DealsGrade', ['$resource',
  function($resource) {
    return $resource('updateGrade/:dealId', {
      dealId: '@_id'
      }, {  
	  update: {
        method: 'PUT'
	}
  });
  }
])
//socket factory that provides the socket service
.factory('Socket', ['socketFactory',
    function(socketFactory) {
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://localhost:3000')
        });
    }
]);