'use strict';
//Deals service used for deals REST endpoint
angular.module('admin').factory('adminDeals', ['$resource',
    function($resource) {
        return $resource('/admin/deals/:dealId', {
            dealId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
