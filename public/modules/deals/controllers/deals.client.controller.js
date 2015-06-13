'use strict';

angular.module('deals').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 
})

.controller('DealsController', ['$scope','$rootScope','$controller','$q', '$stateParams', '$resource', '$location', 'Deals', 'Socket', 'DealsGrade',
  function($scope,$rootScope, $controller,$q, $stateParams,$resource, $location, Deals, Socket, DealsGrade) {
	
    // $scope.hasAuthorization = function(deal) {
    //   if (!deal || !deal.user){
    //     return false;
    //   }
    //   return $scope.global.isAdmin || deal.user._id === $scope.global.user._id;
    // };
    var okscroll = 1;
    var limitDelta = 10;
    $scope.deals = [];
    var list_Id = [];
    $scope.limitStart = 0;
    $scope.limitEnd = limitDelta;
    $scope.busyLoadingData = true;
	$scope.uploadProgress = 0;
	
	// Nécessaire pour la création de deal
	$scope.onlineDeal = false;
	$scope.validate = false;
	$scope.longitude = 0;
	$scope.latitude = 0;
	  
	$scope.editDeal = function() {
		var dealModification = {
		idDeal: this.deal._id,
		initialPrice : this.deal.initialPrice,
		salePrice : this.deal.salePrice};
		console.log(dealModification);
		
	    var modifResource = $resource('/addModification');
	 
        modifResource.save(dealModification, function(response) {
			// TODO : METTRE UN MESSAGE OK :D
          console.log(response);
        });
	}  
  
	$scope.upload = function() {
		
		var creds = $resource(
          '/getS3Credentials',
          {
            query: { method:'GET', isArray: true }
          }
        );
		
	  creds.get(function(credential) {
	  // Configure The S3 Object 
	  AWS.config.update({ accessKeyId: credential.access_key, secretAccessKey: credential.secret_key });
	  AWS.config.region = credential.region;
	  var bucket = new AWS.S3({ params: { Bucket: credential.bucket } });
	 
	  if($scope.file) {
		var params = { Key: $scope.file.name, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };
	 
		bucket.putObject(params, function(err, data) {
		  if(err) {
			// There Was An Error With Your S3 Config
			alert(err.message);
			return false;
		  }
		  else {
			  $scope.$apply(function() { 
				$scope.validate = true;
			  });
			// Success!
			alert('Upload ok :D');
		  }
		})
		.on('httpUploadProgress',function(progress) {
			  // Log Progress Information
			  $scope.$apply(function() { 
				$scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
			  });
			  
			});
	  }
	  else {
		// No File Selected
		alert('No File Selected');
	  }
	  });
	}
		
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
          description: this.description,
		  image: $scope.file.name,
		  onlineDeal: this.onlineDeal,
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

    $scope.updateAlert = function(comment) {
     if (comment) {
        updateGrade(comment, 'alert');
       }
    };

    function updateGrade(deal,action) {
      console.log('updateGrade() : got a deal');
      console.log('updateGrade() : action = ',action);

      var userId = deal.user;
      if(typeof(userId) != 'string'){
        userId = userId._id;
      }

      var updateGrade = $resource(
          '/updateGrade',
          {_id: deal._id, idUser:userId , action: action},
          {
            query: {method:'POST',isArray: false }
          }
        );
      updateGrade.query(function(dealResult) {
        console.log('updateGrade(): server results limited');
        if(action == 'alert')
        {
          console.log('updateGrade(): new Deal Alert : ', dealResult.alert);
          deal.alert = dealResult.alert; 
          deal.description = dealResult.description;          
        }
        else
        {
          console.log('updateGrade(): new Deal Grade : ', dealResult.grade);
          deal.grade = dealResult.grade;        
        }
      });
      console.log('updateGrade() : deal updated');
    };


   $scope.updateGradePlus = function(deal) {
      if (deal) {
        updateGrade(deal, 'plus');
      }
    };

    $scope.updateGradeMinus = function(deal) {
      if (deal) {
        updateGrade(deal, 'minus');
      }
    };

    /*
    * queryAll:
    * get all deals with restriction, but limited to improve ng-repeat performance
    */
    $scope.queryAll = function(){
      if(okscroll == 1){
        if($scope.limitEnd >= ($scope.dealMarkers.length)){
          $scope.limitEnd = $scope.dealMarkers.length;
          okscroll = 0;
        };
        //only ask from server the deal between the limits
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
          $scope.limitStart = $scope.limitEnd;
          $scope.limitEnd += limitDelta;

          //enable scrolling again :
          $scope.busyLoadingData = false;
        });
      }
      else{
        console.log('no more deals to show !');
      }       

    };

    /*
    * queryAllMarkers:
    * get all loc only to be displayed on the map
    */
    $scope.queryAllMarkers = function(){
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
        $scope.queryAll();
      });
    };

    /*
    * dealsByRadius :
    * UPDATE the list of deals in the ngreapet using the liste used to display the map markers
    */

    $scope.dealsByRadius = function(){     
      if(okscroll == 1){
        //limitEnd can't exeed dealMarkers size :    
        if($scope.limitEnd >= ($scope.dealMarkers.length)){
          $scope.limitEnd = $scope.dealMarkers.length;
          okscroll = 0;
        };

        list_Id = [];
        for (var j = $scope.limitStart; j < $scope.limitEnd; j++) {
          list_Id.push($scope.dealMarkers[j]._id);            
        }
        console.log('dealsByRadius(): list_Id :');
        console.log(list_Id);
        var dealsByRadius = $resource(
            '/DealsByRadius',
            {
              // srchLng: $rootScope.srchLng,
              // srchLat: $rootScope.srchLat, 
              // srchRadius: $rootScope.srchRadius,
              list_Id: list_Id
              // limitStart: $scope.limitStart,
              // limitEnd: $scope.limitEnd
            },
            {
              query: {method:'POST',isArray: true }
            }
          );
          console.log('dealsByRadius(): ressource created');
          dealsByRadius.query(function(deals) {
            console.log('dealsByRadius(): server results');
            console.log(deals);
            for (var j = 0; j < deals.length; j++) {
                $scope.deals.push(deals[j]);
            }
            console.log('dealsByRadius(): limite parameters before for: ' + 
               $scope.limitStart + ';' +
               $scope.limitEnd
            );

            //update limit
            $scope.limitStart = $scope.limitEnd;
            $scope.limitEnd += limitDelta;

            //enable scrolling again :
            $scope.busyLoadingData = false;
        });


        console.log('dealsByRadius(): end update list'); 
      }
      else
      {
        console.log('no more deals to show !');
      }       
    };

    $scope.markersByRadius = function(){
      console.log('markersByRadius(): search parameters : ' + 
         $rootScope.srchLng + ';' +
         $rootScope.srchLat + ';' +
         $rootScope.srchRadius
      );      
  
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
          if($scope.queryExecuted){
            $scope.queryExecuted = false;
          }else{
            $scope.queryExecuted = true;
          }
          // $controller('MapDisplayController',{$scope: $scope});
          $scope.dealsByRadius();
        });    
    };

    /*
    * findByRadius():
    * this "selector" will, depending if it's a search or not, query the initial markers and deals
    */
    $scope.findByRadius = function() {
      okscroll = 1;
      $scope.limitStart = 0;
      $scope.limitEnd = limitDelta;
      $scope.deals = [];      
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
      //$scope.queryAll();
      // $controller('MapDisplayController', {$scope, $scope});
      
    }

  };

    /*
    * findByLimited():
    * this "selector" will, depending if it's a search or not, query the markers and deals on scroll only
    */
    $scope.findByLimited = function() {
      //to prevent multiple call :
      if ($scope.busyLoadingData){
        console.log('findByLimited is already loading !');
        return;
      } 
      $scope.busyLoadingData = true;
      console.log('findByLimited(): start query choice');
      console.log('findByLimited(): search parameters : ' +
         $rootScope.srchLng + ';' +
         $rootScope.srchLat +';' +
         $rootScope.srchRadius
      );
      if ($rootScope.srchLng && $rootScope.srchLat && $rootScope.srchRadius){
        console.log('findByLimited() : with paramaters');
        $scope.dealsByRadius();
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
