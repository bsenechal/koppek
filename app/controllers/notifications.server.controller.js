'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
  http = require('http'),
  io = require('socket.io')(http),
  _ = require('lodash'),
  User = mongoose.model('User');

/**
 * Get notifications from a user 
 */
exports.getUserNotifications = function(req,res) {
  console.log('getUserNotifications() : userId = ', req.param('userId'));
  User.find({'_id': req.param('userId')}).select('notifications').sort('-date')
  .exec(function(err, notifications) {
    if (err) {
      return res.status(500).json({
        error: 'getUserNotifications() : Cannot list the notifications'
      });
    }
    console.log('getUserNotifications() : list of notification = ', notifications);
    res.json(notifications);
  });
};
/**
 * Set to a user a notification 
 */
exports.setUserNotifications = function(userId,Content) {
  console.log('setUserNotifications() : userId = ', userId);
  console.log('setUserNotifications() : Content = ', Content);
  //update grade according to value :
  var now = new Date();
  var query = {'_id': userId};
  var update = {$push: {'notifications': {'date': now, 'content': Content}}};
  var options = {new: true};

  User.findOneAndUpdate(query, update, options, function(err, user) {
    if (err) {
      console.log('setUserNotifications() : findOneAndUpdate() : got an error');
    }
    else{
      console.log('setUserNotifications() : findOneAndUpdate() : new notifications = ', user.notifications);
      io.sockets.emit('Notifications:updated', team);
    }
  });
};
/**
 * Delete from a user a notification 
 */
exports.deleteUserNotifications = function(req, res) {
  var userId = req.userId, notificationId = req.notificationId;
  console.log('deleteUserNotifications() : userId = ', userId);
  console.log('deleteUserNotifications() : notificationId = ', notificationId);
  User.findOne({'_id': userId}, function(err, user){
    if (err) {
      console.log('deleteUserNotifications() : findOne() : got an error');
    }
    else{
      user.notifications.pull({_id: notificationId});
      // doc.subdocs.pull({ _id: 4815162342 }) // removed
      console.log('deleteUserNotifications() : findOne() : notification ',notificationId,' pulled');
      io.sockets.emit('Notifications:deleted', team);
    }    
  });
};
/**
 * Delete from a user all notifications 
 */
exports.deleteUserAllNotifications = function(userId) {
};
/**
 * Set to all user a notification 
 */
exports.setAllUserNotifications = function(content) {
};
/**
 * Delete from all user a notification 
 */
exports.deleteAllUserNotifications = function(notificationId) {
};
/**
 * Delete from all user all notifications 
 */
exports.deleteAllUserAllNotifications = function() {
};
