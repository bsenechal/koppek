'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  async = require('async'),
  http = require('http'),
  // io = require('socket.io').listen(3000),
  io = require('socket.io')(http),
  _ = require('lodash'),
  Notification = mongoose.model('Notification'),
  User = mongoose.model('User');


var socketio;
/**
 * Get notifications from a user model
 */
function userNotifications(userTo, callback){
  console.log('userNotifications() : userTo = ', userTo);
  Notification.find({'userTo': userTo}).sort('-created')
  .exec(function(err, notifications) {
    if (err) {
      callback('userNotifications:error');
    }
    callback(notifications);
  });
}
/**
 * emit
 */
function emitUserNotifications (userId) {
  console.log('emitUserNotifications() : userId = ', userId);
  userNotifications(userId, function(notifications){
    if(notifications != 'UserNotifications:error'){
      console.log('emitUserNotifications() : notifications = ', notifications);
      socketio.sockets.emit('notifications:updated', notifications); // emit an event for all connected clients    console.log('setUserNotifications() : io.emit() : done');
    }
  });
};
/**
 * Get notifications from a user 
 */
exports.getUserNotifications = function (req,res) {
  var userId = req.param('userId');
  console.log('getUserNotifications() : userId = ', userId);
  socketio = req.app.get('socketio'); // tacke out socket instance from the app container
  emitUserNotifications(userId);
};
/**
 * Set to a user a notification 
 */
exports.setUserNotifications = function(userId,Content) {
  console.log('setUserNotifications() : userId = ', userId);
  console.log('setUserNotifications() : Content = ', Content);
  //update grade according to value :
  var Notif = new Notification();
  Notif.userTo = userId;
  Notif.content = Content;

  Notif.save(function (err) {
    if(err)
    {
      console.log('setUserNotifications() : findOneAndUpdate() : got an error');
    }
    else
    {
      emitUserNotifications(userId);
    }
  });
};
/**
 * Set to a user a notification mail
 */
exports.setUserMailNotifications = function(userId, userTo, Content) {
  console.log('setUserMailNotifications() : userId = ', userId);
  console.log('setUserMailNotifications() : Content = ', Content);
  console.log('setUserMailNotifications() : userTo = ', userTo);
  //update grade according to value :
  var Notif = new Notification();
  Notif.userTo = userTo;
  Notif.userFrom = userId;
  Notif.content = Content;

  Notif.save(function (err) {
    if(err)
    {
      console.log('setUserMailNotifications() : findOneAndUpdate() : got an error');
    }
    else
    {
      socketio = req.app.get('socketio'); // tacke out socket instance from the app container
      emitUserNotifications(userId);
    }
  });

};
/**
 * Delete from a user a notification 
 */
exports.deleteUserNotifications = function(req, res) {
  var userId = req.params.userId, notificationId = req.params.notificationId;
  console.log('deleteUserNotifications() : userId = ', userId);
  console.log('deleteUserNotifications() : notificationId = ', notificationId);
  Notification.findByIdAndRemove(notificationId,{}, function(err, notif){
    if (err) {
      console.log('deleteUserNotifications() : findOne() : got an error');
    }
    else{
      socketio = req.app.get('socketio'); // tacke out socket instance from the app container
      emitUserNotifications(userId);
    }    
  });
};
/**
 * Delete from a user all notifications 
 */
exports.deleteUserAllNotifications = function(req,res) {
  var userId = req.params.userId;
  console.log('deleteUserAllNotifications() : userId = ', userId);
  Notification.remove({'userTo': userId}, function(err, user) {
    if (err) {
      console.log('deleteUserAllNotifications() : findOne() : got an error');
    }
    else{
      socketio = req.app.get('socketio'); // tacke out socket instance from the app container
      emitUserNotifications(userId);
    }    
  });
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
