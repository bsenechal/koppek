'use strict';

angular.module('deals').run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 
})
.controller('DealsController', ['$scope','$rootScope','$controller','$q', '$stateParams', '$resource', '$location', 'Deals', 'Socket', 'DealsGrade', '$window', 'uuid4', '$mdToast',
  function($scope,$rootScope, $controller,$q, $stateParams,$resource, $location, Deals, Socket, DealsGrade, $window, uuid4, $mdToast) {
	console.log();
    
    $scope.windowHeight = angular.element($window).height() - 64;
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
    $scope.urlWebSite = "";
	  $scope.imageName="default";

    //pagination parameters :
      $scope.currentPage = 1;
    
	// Nécessaire pour la création de deal
	$scope.onlineDeal = false;
	$scope.validate = false;
	
    function displayToast(content){
       $mdToast.show(
            $mdToast.simple()
                .content(content)
                .position('top right')
                .hideDelay(2000)
         );
    };
    
	$scope.editDeal = function() {
		var dealModification = {
		idDeal: this.deal._id,
		initialPrice : this.deal.initialPrice,
		salePrice : this.deal.salePrice};
		console.log(dealModification);
	 
        $resource('/addModification').save(dealModification, function(response) {
			// TODO : METTRE UN MESSAGE OK :D
          console.log(response);
        });
	}  

	$scope.upload = function(event) {
        event.preventDefault();
	  if($scope.file) {
          
         $resource('/getS3Credentials').get(function(credential) {
          // Configure The S3 Object 
          AWS.config.update({ accessKeyId: credential.access_key, secretAccessKey: credential.secret_key});
          AWS.config.region = credential.region;
          $scope.imageName = uuid4.generate();
          var bucket = new AWS.S3({ params: { Bucket: credential.bucket } });
		var params = { Key: $scope.imageName, ContentType: $scope.file.type, Body: $scope.file, ServerSideEncryption: 'AES256' };
        
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

            $scope.disableUpload = true;
            $scope.$apply();
		  }
		})
		.on('httpUploadProgress',function(progress) {
			  // Log Progress Information
			  $scope.$apply(function() { 
				$scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
			  });
			  
			});
          });
	  }
      
	  else {
		displayToast('Veuillez selectionner un fichier svp');
	  }
	  
	}
		
    $scope.create = function(isValid) {
      if (isValid) {
         
        var deal = new Deals({
          title: this.title,
          initialPrice: this.initialPrice,
          salePrice: this.salePrice,
          loc : this.loc,
          description: this.description,
		  image: $scope.imageName,
		  onlineDeal: this.onlineDeal,
          urlWebSite : this.urlWebSite
        });
        console.log('create: Tmp deal');
        console.log(deal);
        deal.$save(function(response) {
            displayToast('Le deal a correctement été ajouté.');
            $location.path('deals/' + response._id);
        });
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
          displayToast('Le deal a correctement été supprimé.');
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

      var userId = deal.user;
      if(typeof(userId) != 'string'){
        userId = userId._id;
      }

      $resource('/updateGrade', {_id: deal._id, idUser:userId , action: action}).save(function(dealResult) {
          if(action == 'alert')
            {
              deal.alert = dealResult.alert; 
              deal.description = dealResult.description;          
            }
            else
            {
              deal.grade = dealResult.grade;        
            }
      });
      displayToast('Votre vote a bien été pris en compte.');
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
    $scope.queryAll = function(page){
          page = page || 1;
      // if(okscroll == 1){
      //   if($scope.limitEnd >= ($scope.dealMarkers.length)){
      //     $scope.limitEnd = $scope.dealMarkers.length;
      //     okscroll = 0;
      //   };
        $scope.resultIsByRadius = false;

        //only ask from server the deal between the limits
        var DealsLimited = $resource(
            '/dealslimited',
            {limitStart: $scope.limitStart,limitEnd: $scope.limitEnd, page: page},
            {
              query: {method:'POST',isArray: true }
            }
          );
        DealsLimited.query(function(deals) {
          // console.log('queryall(): server results limited');
          // console.log(deals);
          // for (var j = 0; j < deals.length; j++) {
      //         $scope.deals.push(deals[j]);
      //     }
      //     $scope.limitStart = $scope.limitEnd;
      //     $scope.limitEnd += limitDelta;

      //     //enable scrolling again :
      //     $scope.busyLoadingData = false;
              $scope.deals = deals;
        });
      // }
      // else{
      //   console.log('no more deals to show !');
      // }       

    };



    /*
    * queryAllMarkers:
    * get all loc only to be displayed on the map
    */
    $scope.queryAllMarkers = function(){
      console.log('queryAllMarkers(): init');
      var MarkersRessource = $resource(
          '/Markers'
          // ,
          // {
          //   query: {method:'GET',isArray: true }
          // }
        );
      MarkersRessource.query(function(markers) {
        console.log('queryAllMarkers(): Markers = ', markers);
        $scope.dealMarkers = markers;
        console.log('queryAllMarkers(): $scope.dealMarkers = ', $scope.dealMarkers);
        $scope.numberOfDeals = markers.length;
        $scope.currentPage = 1;
        console.log('queryAllMarkers(): markers.length = ', markers.length);
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

    $scope.dealsByRadius = function(page){
        page = page || 1;     
      // if(okscroll == 1){
        //limitEnd can't exeed dealMarkers size :    
        // if($scope.limitEnd >= ($scope.dealMarkers.length)){
        //   $scope.limitEnd = $scope.dealMarkers.length;
        //   okscroll = 0;
        // };
        $scope.resultIsByRadius = true;
        list_Id = [];
        var limitEnd = page*20;
        if(limitEnd > $scope.dealMarkers.length){
          limitEnd = $scope.dealMarkers.length;
        }
        for (var j = (page-1)*20; j < limitEnd; j++) {
          list_Id.push($scope.dealMarkers[j]._id);            
        }
        console.log('dealsByRadius(): list_Id :');
        console.log(list_Id);
        console.log('dealsByRadius(): page : ', page);
        var dealsByRadius = $resource(
            '/DealsByRadius',
            {
              // srchLng: $rootScope.srchLng,
              // srchLat: $rootScope.srchLat, 
              // srchRadius: $rootScope.srchRadius,
              list_Id: list_Id,
              // page: page
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
            $scope.deals = deals
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
      
      // else
      // {
      //   console.log('no more deals to show !');
      // }       
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
          console.log('markersByRadius(): markers = ', markers);
          $scope.dealMarkers = markers;
          $scope.numberOfDeals = markers.length;
          $scope.currentPage = 1;
          console.log('markersByRadius(): markers.length = ', markers.length);
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