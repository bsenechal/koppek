'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
   errorHandler = require('../errors.server.controller.js'),
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
	console.log('checkRole() : init');
	console.log('checkRole() : id= ',id);
	console.log('checkRole() : points= ',points);
   getTotalUserPoints(function(totalUserPoints){

      console.log('checkRole() : totalUserPoints= ',totalUserPoints);
      // !!! this array holds the threshold values of the different user role !!!
      //store elsewhere ?
      var thresholdArray = [0,0.25,0.5,0.75,1];
      var thresholdRole = ['manant','écuyer', 'sir', 'cavalier de l\'apocalypse'];
      //if points>thresholdArray[i]*totalUserPoints then ...
      for(var i = 1; i < thresholdArray.length; i++){
         if(points > thresholdArray[i-1]*totalUserPoints && points <= thresholdArray[i]*totalUserPoints){
            //update user role :
            console.log('checkRole() : user roles are being updated');
            var query = {'_id': id, 'roles':{$ne: thresholdRole[i-1]}};
            var update = {$push: {'roles': thresholdRole[i-1]}};
            var options = {new: true};

            User.findOneAndUpdate(query, update, options, function(err, user) {
              if (err) {
                console.log('checkRole() : findOneAndUpdate() : got an error');
              }
              else{
              		if(user){
                		console.log('checkRole() : findOneAndUpdate() : new roles = ', user.roles);             			
              		}
              		else{
                		console.log('checkRole() : findOneAndUpdate() : the user already has this role');             			              			
              		}
              }
            });
         }
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