'use strict';

angular.module('deals')
  .directive('file', function() {
  return {
    restrict: 'AE',
    scope: {
      file: '@'
    },
    link: function(scope, el, attrs){
      el.bind('change', function(event){
        var files = event.target.files;
        var file = files[0];
        scope.file = file;
        scope.$parent.file = file;
        scope.$apply();
      });
    }
  };
})
  .directive('iuimage', function($q) {
      'use strict'

      var URL = window.URL || window.webkitURL;

      var getResizeArea = function () {
          var resizeAreaId = 'fileupload-resize-area';

          var resizeArea = document.getElementById(resizeAreaId);

          if (!resizeArea) {
              resizeArea = document.createElement('canvas');
              resizeArea.id = resizeAreaId;
              resizeArea.style.visibility = 'hidden';
              document.body.appendChild(resizeArea);
          }

          return resizeArea;
      }

      var iuresizeImage = function (iuorigImage, options) {
          var maxHeight = options.resizeMaxHeight || 300;
          var maxWidth = options.resizeMaxWidth || 250;
          var quality = options.resizeQuality || 0.7;
          var type = options.resizeType || 'image/jpg';

          var canvas = getResizeArea();

          var height = iuorigImage.height;
          var width = iuorigImage.width;

          // calculate the width and height, constraining the proportions
          if (width > height) {
              if (width > maxWidth) {
                  height = Math.round(height *= maxWidth / width);
                  width = maxWidth;
              }
          } else {
              if (height > maxHeight) {
                  width = Math.round(width *= maxHeight / height);
                  height = maxHeight;
              }
          }

          canvas.width = width;
          canvas.height = height;

          //draw iuimage on canvas
          var ctx = canvas.getContext("2d");
          ctx.drawImage(iuorigImage, 0, 0, width, height);

          // get the data from canvas as 70% jpg (or specified type).
          return canvas.toDataURL(type, quality);
      };

      var iucreateImage = function(url, callback) {
          var iuimage = new Image();
          iuimage.onload = function() {
              callback(iuimage);
          };
          iuimage.src = url;
      };

      var fileToDataURL = function (file) {
          var deferred = $q.defer();
          var reader = new FileReader();
          reader.onload = function (e) {
              deferred.resolve(e.target.result);
          };
          reader.readAsDataURL(file);
          return deferred.promise;
      };


      return {
          restrict: 'A',
          scope: {
              iuimage: '=',
              resizeMaxHeight: '@?',
              resizeMaxWidth: '@?',
              resizeQuality: '@?',
              resizeType: '@?',
          },
          link: function postLink(scope, element, attrs, ctrl) {

              var doResizing = function(iuimageResult, callback) {
                  iucreateImage(iuimageResult.url, function(iuimage) {
                      var dataURL = iuresizeImage(iuimage, scope);
                      iuimageResult.resized = {
                          dataURL: dataURL,
                          type: dataURL.match(/:(.+\/.+);/)[1],
                      };
                      callback(iuimageResult);
                  });
              };

              var applyScope = function(iuimageResult) {
                  scope.$apply(function() {
                      //console.log(iuimageResult);
                      if(attrs.multiple)
                          scope.iuimage.push(iuimageResult);
                      else
                          scope.iuimage = iuimageResult; 
                  });
              };


              element.bind('change', function (evt) {
                  //when multiple always return an array of iuimages
                  if(attrs.multiple)
                      scope.iuimage = [];

                  var files = evt.target.files;
                  for(var i = 0; i < files.length; i++) {
                      //create a result object for each file in files
                      var iuimageResult = {
                          file: files[i],
                          url: URL.createObjectURL(files[i])
                      };

                      fileToDataURL(files[i]).then(function (dataURL) {
                          iuimageResult.dataURL = dataURL;
                      });

                      if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize iuimage
                          doResizing(iuimageResult, function(iuimageResult) {
                              applyScope(iuimageResult);
                          });
                      }
                      else { //no resizing
                          applyScope(iuimageResult);
                      }
                  }
              });
          }
      };
  });
