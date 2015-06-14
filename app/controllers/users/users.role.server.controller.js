'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
   errorHandler = require('../errors.server.controller.js'),
   notificationHandler = require('../notifications.server.controller.js'),
   config = require('../../../config/config'),
   mongoose = require('mongoose'),
   passport = require('passport'),
   User = mongoose.model('User');

/*
*      Get sum of user UserPoints :
*/
function getTotalUserPoints(callback){
   User.aggregate([
     {
         $group: {
             _id: null,
             total: {$sum: '$userPoints'}
         }
     }
   ], function (err, result) {
     if (err) {
         callback(err);
     } else {
           console.log('getTotalUserPoints() : result[0].total= ',result[0].total);
         callback(result[0].total);
     }
   });
}
/*
*      Update user role if needed
*/
function checkRole(id, points){
  //check role for every user and update if necessary
  notificationHandler.setUserNotifications(id,'test');                  
	console.log('checkRole() : init');
	console.log('checkRole() : id= ',id);
	console.log('checkRole() : points= ',points);
   getTotalUserPoints(function(totalUserPoints){
      console.log('checkRole() : totalUserPoints= ',totalUserPoints);
      console.log('checkRole() : thresholdCheckRole= ',config.thresholdCheckRole);
      //does this only sometime :
      if(totalUserPoints%config.thresholdCheckRole == 0)
      {
        // !!! this array holds the threshold values of the different user role !!!
        //store in config all file
        var thresholdArray = config.thresholdArrayRole;
        var thresholdRole = config.ArrayRole;
        //if points>thresholdArray[i]*totalUserPoints then ...

        //update for all so :
        User.find({},function(err, AllUser) {
          if(err) { console.log('checkRole() : find() : error'); return; }
          //Will check role for every user and modify it according to its points and the sum of every points in the system
          AllUser.forEach(function(U){

            //small bool variable to see if a user has been modified :
            var change = false;

            console.log('checkRole() : user ',U.username,' is being updated');
            for(var i = 1; i < thresholdArray.length; i++){
               if(U.userPoints > thresholdArray[i-1]*totalUserPoints && U.userPoints <= thresholdArray[i]*totalUserPoints){
                  //update user role :
                  var query = {'_id': U._id};
                  var update = {'userRole': i};
                  var options = {new: true};
                  //check if user role has changed :
                  if(U.userRole != i){
                    change = true;
                    User.findOneAndUpdate(query, update, options, function(err, user) {
                      if (err) {
                        console.log('checkRole() : findOneAndUpdate() : got an error');
                      }
                      else{
                          if(user){
                            console.log('checkRole() : findOneAndUpdate() : new roles = ', user.userRole);
                            notificationHandler.setUserNotifications(user._id,'Your role has change ! You are now : ' + user.userRole);                  
                          }
                          else{
                            console.log('checkRole() : findOneAndUpdate() : the user already has this role');                                       
                          }
                      }
                    });
                  }
               }
            }
            if(!change){
              console.log('checkRole() : user ', U.username, ' remains unchanged.');              
            }
          });
        });
      }
      else
      {
        console.log('checkRole() : Not time to update !');
      }
   });
}

/*
*      update grade :
*/
exports.updateUserPoints = function (_id, points) {
  console.log('updateUserPoints() : init');
  console.log('updateUserPoints() : _id :', _id);
  console.log('updateUserPoints() : points:', points);
  console.log('updateUserPoints() : type of points:', typeof(points));
  if(_id && points){ 

    //get user actual userPoints :
    var actualUserPoints = -1;
    User.findOne({'_id': _id}).select('userPoints').exec(function (err, result) {
      console.log('updateUserPoints() : findOne() : result= ', result);
      actualUserPoints = result.userPoints;

      console.log('updateUserPoints() : actualUserPoints = ', actualUserPoints);

      //update grade according to value :
      var query = {'_id': _id};
      var update = {userPoints: actualUserPoints + points};
      var options = {new: true};

      User.findOneAndUpdate(query, update, options, function(err, user) {
        if (err) {
          console.log('updateUserPoints() : findOneAndUpdate() : got an error');
        }
        else{
          console.log('updateUserPoints() : findOneAndUpdate() : new userPoints = ', user.userPoints);
		    //async check if role change :
		    checkRole(_id, user.userPoints);
        }
      });
    });
  }else{
        console.log('Cannot update the user userPoints');
  }
  console.log("updateUserPoints() : end");
 };