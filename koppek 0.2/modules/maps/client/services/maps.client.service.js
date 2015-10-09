'use strict';

angular.module('maps').factory('Maps', [
  function() {
    return {
      name: 'maps'
    };
  }
])
.factory('Initializer', function($window, $q) {

    //Google's url for async maps initialization accepting callback function
    var asyncUrl = 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,places&callback=',
        mapsDefer = $q.defer();

    //Callback function - resolving promise after maps successfully loaded
    $window.googleMapsInitialized = mapsDefer.resolve; // removed ()

    //Async loader
    var asyncLoad = function(asyncUrl, callbackName) {
        var script = document.createElement('script');
        //script.type = 'text/javascript';
        script.src = asyncUrl + callbackName;
        document.body.appendChild(script);           
    };
    //Start loading google maps
    asyncLoad(asyncUrl, 'googleMapsInitialized');

    //Usage: Initializer.mapsAPInitialized.then(callback)
    return {
        mapsAPInitialized: mapsDefer.promise
    };
});
