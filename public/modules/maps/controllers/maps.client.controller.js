'use strict';
var google;
//geolocation function :
function geolocalize(map, navigator) {
    var uPos;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            uPos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            map.setCenter(uPos);
            console.log('geolocalize: it works');
        }, function(error) {
            console.log('geolocalize: Error occurred. Error code: ' + error.code);
        }, {
            timeout: 5000
        });
    } else {
        console.log('geolocalize: no geolocation support');
        uPos = new google.maps.LatLng(-28.643387, 153.612224);
        map.setCenter(uPos);
    }

}



/* jshint -W098 */
angular.module('maps')
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
    })
    .controller('MapsController', ['$rootScope', '$scope', '$window', '$q', 'Maps', 'Initializer',
        function($rootScope, $scope, $window,$q, Maps, Initializer) {
            //init base variables :
            $scope.package = {
                name: 'maps'
            };
            markers = [];
            //no need to be in the scope :
            var map,autocomplete,markers,circle,markerCluster;
            var place_changedListener,dragendListener,bounds_changedListener,radius_changedListener,center_changedListener;
            var singleton_cluster = 1;

            console.log('In MapDisplayController');

            // 3 (+1) main functions :
            //MAP INIT
            //MAP listeners (+ listener createDeal page)
            //MAP update

            $scope.initMap = function() {

                // $scope.initMapDeferred = $q.defer();

                console.log('initMap(): start initializing map');

                //Map options  :
                var mapOptions = {
                    zoom: 5,
                    streetViewControl: false,
                    // mapTypeControl: true,
                    mapTypeControl: false,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.BOTTOM_CENTER
                    },
                    zoomControl: true,
                    zoomControlOptions: {
                        style: google.maps.ZoomControlStyle.LARGE,
                        position: google.maps.ControlPosition.LEFT_CENTER
                    },
                    scaleControl: true,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                if (!map) {
                    map = new google.maps.Map(document.getElementById('map-canvas'),
                        mapOptions);
                }


                console.log('initMap(): Map created');

                // ****************************
                // ****************************
                //      Set AUTOCOMPLETE
                // ****************************
                // ****************************
                if (!$scope.input) {
                    $scope.input = /** @type {HTMLInputElement} */ (
                        document.getElementById('pac-input'));
                    console.log('initMap(): Input :' + $scope.input);

                    map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

                    console.log('initMap(): Put input in map');
                }


                var options = {
                    //types: ['(cities)']//,
                    //componentRestrictions: {country: 'us'}
                };
                if (!autocomplete) {
                    autocomplete = new google.maps.places.Autocomplete($scope.input, options);
                }

                console.log('initMap(): autocomplete created');

                console.log('initMap() : map initialized');

                //usage : call $scope.initMap.mapsInitialized.then
                // return {
                //     mapsInitialized: $scope.initMapDeferred.promise
                // };            
            };

            //Map function for Create Deal Page :
            $scope.createDealMap = function(){
                //if posible use localization to center the map:
                geolocalize(map, navigator);
                // Listen for the event fired when the user selects an item from the
                // pick list. Retrieve the matching places for that item.
                if (place_changedListener) {
                    google.maps.event.removeListener(place_changedListener);
                }

                place_changedListener = google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    console.log('Create autocomplete Listener');
                    var place = autocomplete.getPlace();

                    console.log('Search result :');
                    console.log(place);

                    if (!place.geometry) {
                        alert('no result !');
                        return;
                    }

                    // For each place, get the icon, place name, and location.

                    var bounds = new google.maps.LatLngBounds();

                    var image = {
                        url: place.icon,
                        size: new google.maps.Size(10, 10),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(0, 0),
                        scaledSize: new google.maps.Size(40, 40)
                    };

                    // Create a marker for each place.
                    var marker = new google.maps.Marker({
                        map: map,
                        //icon: image,
                        title: place.name,
                        draggable: true,
                        // animation: google.maps.Animation.DROP,
                        position: place.geometry.location
                    });
                    console.log('marker 1rst position:');
                    console.log(marker.position);

                    $rootScope.latitude = marker.getPosition().lat();
                    $rootScope.longitude = marker.getPosition().lng();

                    $scope.$apply();
                    // console.log('resultPosition after affectation : '  + resultPosition);

                    //remove old marker :
                    for (var j = 0; j < markers.length; j++) {
                        markers[j].setMap(null);
                    }

                    markers.push(marker);

                    if (dragendListener) {
                        google.maps.event.removeListener(dragendListener);
                    }

                    dragendListener = google.maps.event.addListener(marker, 'dragend', function() {
                        console.log('marker dragged');

                        $rootScope.latitude = marker.getPosition().lat();
                        $rootScope.longitude = marker.getPosition().lng();

                        //done in the deal controller :
                        // $scope.loc = [marker.getPosition().lng(),marker.getPosition().lat()];

                        $scope.$apply();

                        console.log(marker.getPosition());
                        map.setCenter(marker.getPosition());
                    });

                    // bounds.extend(place.geometry.location);

                    //setmap center on marker :
                    if (marker) {
                        map.setCenter(marker.getPosition());
                    }
                });

                if (bounds_changedListener) {
                    google.maps.event.removeListener(bounds_changedListener);
                }
                // Bias the autocomplete results towards places that are within the bounds of the
                // current map's viewport.
                bounds_changedListener = google.maps.event.addListener(map, 'bounds_changed', function() {
                    var bounds = map.getBounds();
                    //limit the search on the specific displayed map :
                    //autocomplete.setBounds(bounds);
                });            
            };


            //Map set listener :
            $scope.listenMap = function() {
                console.log('listenMap(): start setting map listener');
                // Listen for the event fired when the user selects an item from the
                // pick list. Retrieve the matching places for that item.
                if (place_changedListener) {
                    google.maps.event.removeListener(place_changedListener);
                }

                console.log('listenMap(): Create autocomplete Listener');
                place_changedListener = google.maps.event.addListener(autocomplete, 'place_changed', function() {
                    
                    console.log('listenMap(): place_changed');
                    var place = autocomplete.getPlace();

                    console.log('listenMap(): Search result :');
                    console.log(place);

                    if (!place.geometry) {
                        console.log('listenMap(): no place result !');
                        $rootScope.srchLng = null;
                        $rootScope.srchLat = null;
                        $scope.queryAll();
                        return;
                    }
                    console.log('listenMap(): init search circle :');
                    //clean old circle !
                    if (circle) {
                        circle.setMap(null);
                    }
                    if(!$rootScope.srchRadius){
                        $rootScope.srchRadius = 1000000;                        
                    }
                    else
                    {
                       $rootScope.srchRadius = +$rootScope.srchRadius; 
                    }
                    var circleOptions = {
                        center: place.geometry.location,
                        radius: $rootScope.srchRadius,
                        map: map,
                        editable: true
                    };
                    circle = new google.maps.Circle(circleOptions);

                    $rootScope.srchLng = circle.getCenter().lng();
                    $rootScope.srchLat = circle.getCenter().lat();


                    if (radius_changedListener) {
                        google.maps.event.removeListener(radius_changedListener);
                    }
                    radius_changedListener = google.maps.event.addListener(circle, 'radius_changed', function() {
                        console.log('listenMap(): radius_changed');
                        $rootScope.srchRadius = circle.getRadius();
                        // $rootScope.srchLng = circle.getCenter().lng();
                        // $rootScope.srchLat = circle.getCenter().lat();
                        //Clear listener :
                        // mapChanged = true;
                        // map.fitBounds(circle.getBounds()% 2400000);
                        $scope.$apply();
                        $scope.queryByRadius();
                    });

                    if (center_changedListener) {
                        google.maps.event.removeListener(center_changedListener);
                    }
                    center_changedListener = google.maps.event.addListener(circle, 'center_changed', function() {
                        console.log('listenMap(): center_changed');
                        // $rootScope.srchRadius = circle.getRadius();
                        $rootScope.srchLng = circle.getCenter().lng();
                        $rootScope.srchLat = circle.getCenter().lat();
                        //Clear listener :
                        // mapChanged = true;
                        $scope.$apply();
                        $scope.queryByRadius();

                    });

                    map.fitBounds(circle.getBounds());
                    //Clear listener :
                    // mapChanged = true;
                    $scope.$apply();
                    $scope.queryByRadius();
                });
                console.log('listenMap(): listener set');
            };

            //update markers :

            $scope.markerMap = function () {
                console.log('markerMap(): cleaning old circle');
                //clean old circle !
                if (circle && !($rootScope.srchLng && $rootScope.srchLat && $rootScope.srchRadius)) {
                    circle.setMap(null);
                }
                console.log('markerMap(): start updating map markers');

                //clear cluster :
                if(markerCluster){
                    markerCluster.removeMarkers(markers, true);
                }
                //remove old marker :
                for (var j = 0; j < markers.length; j++) {
                    markers[j].setMap(null);
                }
                markers = [];

                console.log('markerMap(): deals');
                console.log($scope.deals);

                if($scope.deals.length > 0){
                    for (var i = 0; i < $scope.deals.length; i++) {

                        // Create a marker for each place.
                        var marker = new google.maps.Marker({
                            map: map,
                            //icon: image,
                            title: $scope.deals[i].title,
                            draggable: false,
                            // animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng($scope.deals[i].latitude, $scope.deals[i].longitude)
                        });

                        console.log('markerMap(): marker ' + i + '; position:');
                        console.log(marker.position);
                        // console.log('resultPosition before affectation : ' + resultPosition);
                        // resultPosition = marker.getPosition();
                        // console.log('resultPosition after affectation : '  + resultPosition);
                        markers.push(marker);
                    }
                    //TODO : clear marker once load !
                    if(singleton_cluster == 1){
                        markerCluster = new MarkerClusterer(map, markers, {
                          averageCenter: true
                        });
                        singleton_cluster = 0;
                    }
                    else
                    {
                        //clean before, now update :
                        markerCluster.addMarkers(markers);
                    }
                    // }
                    //recenter on result :
                    //already done on search circle ! -> not yet!
                    // if(!circle){
                        var bounds = new google.maps.LatLngBounds();
                        for (i = 0; i < markers.length; i++) {
                            bounds.extend(markers[i].getPosition());
                        }

                        map.fitBounds(bounds);
                    // }
                    console.log('markerMap(): markers updated');
                }
                else{
                    console.log('markerMap(): $scope.deals is not yet set !');
                    if(circle){
                        map.setCenter(circle.getCenter());
                    }
                }


            };


            $scope.Map = function () {
                Initializer.mapsAPInitialized.
                then(function() {
                    $scope.initMap();
                    $scope.listenMap();
                    $scope.findByRadius();
                    $scope.$watch('queryExecuted',function(newValue, oldValue){
                        // $scope.listenMap();
                        if(newValue === oldValue){
                            return;
                        }
                        else{                        
                            $scope.markerMap();
                        }
                    });
                    // $scope.markerMap();
                    // $scope.$watch('deals',function(){
                    //     $scope.markerMap();
                    // })
                });                
            };
            $scope.MapCreateDeal = function () {
                Initializer.mapsAPInitialized.
                then(function() {
                    // $scope.initMap().then(
                    $scope.initMap();
                    // $scope.initMap().mapsInitialized.then(
                    $scope.createDealMap();
                    // )
                });                
            };
        }
    ]);