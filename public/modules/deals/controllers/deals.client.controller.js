'use strict';

angular.module('deals').controller('DealsController', ['$scope','$rootScope','$controller','$q', '$stateParams', '$resource', '$location', 'Deals', 'Socket',
  function($scope,$rootScope, $controller,$q, $stateParams,$resource, $location, Deals, Socket) {
	
    // $scope.hasAuthorization = function(deal) {
    //   if (!deal || !deal.user){
    //     return false;
    //   }
    //   return $scope.global.isAdmin || deal.user._id === $scope.global.user._id;
    // };
    var limitDelta = 10;
    $scope.deals = [];
    $scope.limitStart = 0;
    $scope.limitEnd = limitDelta;

    $scope.create = function(isValid) {
      if (isValid) {
        this.loc = [this.longitude,this.latitude];
        var deal = new Deals({
          title: this.title,
          initialPrice: this.initialPrice,
          salePrice: this.salePrice,
          latitude: this.latitude,
          longitude: this.longitude,
          loc : this.loc,
          description: this.description
        });
        console.log('create: Tmp deal');
        console.log(deal);
        deal.$save(function(response) {
          $location.path('deals/' + response._id);
        });
        console.log('create: reinit scope');
        this.title = '';
        this.initialPrice = '';
        this.salePrice = '';
        this.latitude = '';
        this.longitude = '';
        this.loc = [];
        this.description = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(deal) {
      if (deal) {
        deal.$remove(function(response) {
          for (var i in $scope.deals) {
            if ($scope.deals[i] === deal) {
        $scope.deals.splice(i,1);
            }
          }
          $location.path('deals');
        });
      } else {
        $scope.deal.$remove(function(response) {
          $location.path('deals');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var deal = $scope.deal;
        if(!deal.updated) {
          deal.updated = [];
  }
        deal.updated.push(new Date().getTime());

        deal.$update(function() {
          $location.path('deals/' + deal._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.updateAlert = function(deal) {
       if (deal) {
         if (deal.alert === 5) {
           deal.$remove();
           $location.path('deals');
         } else {
           deal.alert++;
           deal.$update();
         }
       }
    };

   $scope.updateGradePlus = function(deal) {
      if (deal) {
        deal.grade++;
        deal.$update();
      }
    };

    $scope.updateGradeMinus = function(deal) {
      if (deal) {
        deal.grade--;
        deal.$update();
      }
    };

    $scope.queryAll = function(){
      // Deals.query(function(deals) {
      //     console.log('queryAll() : server results');
      //     console.log(deals);

      var DealsLimited = $resource(
          '/dealslimited',
          {limitStart: $scope.limitStart,limitEnd: $scope.limitEnd},
          {
            query: {method:'POST',isArray: true }
          }
        );
        DealsLimited.query(function(deals) {
          console.log('queryall(): server results limited');
          console.log(deals);
          for (var j = 0; j < deals.length; j++) {
              $scope.deals.push(deals[j]);
          }
        });
          $scope.limitStart = $scope.limitEnd;
          //TODO : remove hard coded max :
          if($scope.limitEnd + limitDelta < 200){
            $scope.limitEnd += limitDelta;
          }
          // $scope.deals = deals;
          // if($scope.queryExecuted){
          //   $scope.queryExecuted = false;
          // }else{
          //   $scope.queryExecuted = true;
          // }
      // });
    };
    $scope.queryAllMarkers = function(){
      // Deals.query(function(deals) {
      //     console.log('queryAll() : server results');
      //     console.log(deals);

      var MarkersRessource = $resource(
          '/Markers',
          {
            query: {method:'GET',isArray: true }
          }
        );
        MarkersRessource.query(function(markers) {
          console.log('queryAllMarkers(): server results Markers');
          console.log(markers);
          $scope.dealMarkers = markers;
          if($scope.queryExecuted){
            $scope.queryExecuted = false;
          }else{
            $scope.queryExecuted = true;
          }
        });
          // }
          // $scope.deals = deals;
      // });
    };

    $scope.queryByRadius = function(){
      console.log('queryByRadius(): limite parameters : ' + 
         $scope.limitStart + ';' +
         $scope.limitEnd
      );
      // console.log('queryByRadius(): search parameters : ' + 
      //    $rootScope.srchLng + ';' +
      //    $rootScope.srchLat + ';' +
      //    $rootScope.srchRadius
      // );
      console.log('queryByRadius(): begin update list'); 
      console.log($scope.dealMarkers);       
      // var DealsByRadius = $resource(
      //     '/dealsbyradius',
      //     {srchLng: $rootScope.srchLng,srchLat: $rootScope.srchLat, srchRadius: $rootScope.srchRadius},
      //     {
      //       query: {method:'POST',isArray: true }
      //     }
      //   );
      //   console.log('queryByRadius(): ressource created');
        // DealsByRadius.query(function(deals) {
        //   console.log('queryByRadius(): server results');
        //   console.log(deals);
          //infinite scroll modif :
          if($scope.limitEnd > ($scope.dealMarkers.length)){
            $scope.limitEnd = $scope.dealMarkers.length;
          };
          console.log('queryByRadius(): limite parameters before for: ' + 
             $scope.limitStart + ';' +
             $scope.limitEnd
          );

          for (var j = $scope.limitStart; j < $scope.limitEnd; j++) {
              $scope.deals.push($scope.dealMarkers[j]);
          };
          console.log('queryByRadius(): updated deal list'); 
          console.log($scope.deals);       
        // });
          $scope.limitStart = $scope.limitEnd;
          if($scope.limitEnd + limitDelta < $scope.dealMarkers.length){
            $scope.limitEnd += limitDelta;
          };

      console.log('queryByRadius(): end update list');        

          // $scope.deals = deals;
          // if($scope.queryExecuted){
          //   $scope.queryExecuted = false;
          // }else{
          //   $scope.queryExecuted = true;
          // }
          // $controller('MapDisplayController',{$scope: $scope});
        // });    
    };
    $scope.markersByRadius = function(){
      console.log('markersByRadius(): search parameters : ' + 
         $rootScope.srchLng + ';' +
         $rootScope.srchLat + ';' +
         $rootScope.srchRadius
      );      
              $scope.limitStart = 0;
        $scope.limitEnd = limitDelta;
        $scope.deals = [];
  
      var markersByRadius = $resource(
          '/MarkersByRadius',
          {srchLng: $rootScope.srchLng,srchLat: $rootScope.srchLat, srchRadius: $rootScope.srchRadius},
          {
            query: {method:'POST',isArray: true }
          }
        );
        console.log('markersByRadius(): ressource created');
        markersByRadius.query(function(markers) {
          console.log('markersByRadius(): server results');
          console.log(markers);
          $scope.dealMarkers = markers;
          $scope.queryByRadius();
          if($scope.queryExecuted){
            $scope.queryExecuted = false;
          }else{
            $scope.queryExecuted = true;
          }
          // $controller('MapDisplayController',{$scope: $scope});
        });    
    };

    $scope.findByRadius = function() {
      console.log('findByRadius(): start query choice');
      console.log('findByRadius(): search parameters : ' +
         $rootScope.srchLng + ';' +
         $rootScope.srchLat +';' +
         $rootScope.srchRadius
      );
        if ($rootScope.srchLng && $rootScope.srchLat && $rootScope.srchRadius){
        console.log('findByRadius() : with paramaters');
        //A mettre dans une factory de services ?
        //$scope.queryByRadius();

        //Basic scheme :
        //1: init an empty map
        // $controller('MapInitController',{$scope: $scope});
        //2: query the deals according to search parameters
        $scope.markersByRadius();
        //$scope.queryByRadius();
        //3: update the map
        // $controller('MapDisplayController', {$scope, $scope});
        //Final: Watch search parameters change, if so -> do 2 and 3 again
        // $scope.$watch('srchRadius',function(){
        //   $scope.queryByRadius();
        //   $controller('MapDisplayController', {$scope, $scope});
        // },true)
      }
      else{
        console.log('findByRadius() : find : without paramaters');
        // $controller('MapInitController',{$scope: $scope});
        $scope.queryAllMarkers();
        $scope.queryAll();
        // $controller('MapDisplayController', {$scope, $scope});
        
      }


    };

    $scope.findByLimited = function() {
      console.log('findByLimited(): start query choice');
      console.log('findByLimited(): search parameters : ' +
         $rootScope.srchLng + ';' +
         $rootScope.srchLat +';' +
         $rootScope.srchRadius
      );
      if ($rootScope.srchLng && $rootScope.srchLat && $rootScope.srchRadius){
        console.log('findByLimited() : with paramaters');
        $scope.queryByRadius();
      }
      else{
        console.log('findByLimited() : find : without paramaters');
        $scope.queryAll();
      }

    };

    $scope.findOne = function() {
      Deals.get({
        dealId: $stateParams.dealId
      }, function(deal) {
        $scope.deal = deal;
      });
    };

    $scope.loadMoreDeal = function(){
      Deals.query(function(deals) {
          console.log('queryAll() : server results');
          console.log(deals);
          $scope.deals = deals;
          if($scope.queryExecuted){
            $scope.queryExecuted = false;
          }else{
            $scope.queryExecuted = true;
          }
      });
      };
  }
]);
