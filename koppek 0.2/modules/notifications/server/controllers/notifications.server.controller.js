'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  async = require('async'),
  http = require('http'),
  io = require('socket.io')(http),
  _ = require('lodash'),
  Notification = mongoose.model('Notification'),
  User = mongoose.model('User');


var socketio;
/**
 * connect socket notification !
 */
exports.connectNotificationsSocket = function (req,res) {
  console.log('connectNotificationsSocket: connection...');
  socketio = req.app.get('socketio'); // tacke out socket instance from the app container
  if(req.app){
    console.log('connectNotificationsSocket: OK');
    res.send('connectNotificationsSocket: OK');
  }
  else
  {
    console.log('connectNotificationsSocket: Error');
    res.send('connectNotificationsSocket: Error');
  }
};

/**
 * Get notifications from a user model
 */
function userNotifications(user, callback){
  console.log('userNotifications() : query : start...');
  Notification
  .find({$or : [{'userTo': user},{'userFrom': user}]})
  .populate('userTo', 'username avatar')
  .populate('userFrom', 'username avatar')
  .sort('created')
  .exec(function(err, notifications) {
    if (err) {
      console.log('userNotifications() : query : error !');
      callback('userNotifications:error');
    }
    console.log('userNotifications() : query : done !');
    callback(notifications);
  });
}
/**
 * Get messages from a user model in relation to another user
 */
function userMessages(user, userTo, callback){
  console.log('userMessages() : query : start...');
  Notification
  .find({$or : [{$and :[{'userTo': user},{'userFrom': userTo}]},{$and :[{'userTo': userTo},{'userFrom': user}]}]})
  .populate('userTo', 'username')
  .populate('userFrom', 'username')
  .sort('created')
  .exec(function(err, notifications) {
    if (err) {
      console.log('userMessages() : query : error !');
      callback('userNotifications:error');
    }
    console.log('userMessages() : query : done !');
    callback(notifications);
  });
}
/**
 * emit
 */
function emitUserNotifications (userId) {
  userNotifications(userId, function(notifications){
    if(notifications !== 'UserNotifications:error' && socketio){
      socketio.sockets.emit('notifications:updated', notifications); // emit an event for all connected clients  
      console.log('emitUserMessages() : sockets.emit : ', notifications.length, ' notifications emisent');
    }
  });
}

/**
 * emit
 */
function emitUserMessages (userId, userTo) {
  userMessages(userId,userTo, function(notifications){
    if(notifications !== 'UserNotifications:error'){
      socketio.sockets.emit('notifications:updated', notifications); // emit an event for all connected clients    console.log('setUserNotifications() : io.emit() : done');
      console.log('emitUserMessages() : sockets.emit : ', notifications.length, ' notifications emisent');
    }
  });
}

/**
 * Get notifications from a user 
 */
exports.getUserNotifications = function (req,res) {
  var userId = req.param('userId');
  emitUserNotifications(userId);
  res.send('getUserNotifications: OK');
};
/**
 * Get message from a user in relation to another 
 */
exports.getUserMessages = function (req,res) {
  var userId = req.param('userId');
  var userTo = req.param('userTo');
  emitUserMessages(userId, userTo);
  res.send('getUserMessages: OK');
};
/**
 * Set to a user a notification 
 */
exports.setUserNotifications = function(userId,Content) {
  //update grade according to value :
  console.log('setUserNotifications() : setting user notification...');
  var Notif = new Notification();
  Notif.userTo = userId;
  Notif.content = Content;
  Notif.type = 'notification';

  Notif.save(function (err) {
    if(err)
    {
      console.log('setUserNotifications() : findOneAndUpdate() : got an error');
    }
    else
    {
      if(socketio){
        emitUserNotifications(userId);
      }
      console.log('setUserNotifications() : findOneAndUpdate() : ok');
    }
  });
};
/**
 * Set to a user a notification mail
 */
exports.setUserMailNotifications = function(req, res) {
  var userId = req.params.userId, content = req.query.content, userTo = req.query.userTo;

  //update grade according to value :
  var Notif = new Notification();
  Notif.userTo = userTo;
  Notif.userFrom = userId;
  Notif.content = content;
  Notif.type = 'message';

  Notif.save(function (err) {
    if(err)
    {
      console.log('setUserMailNotifications() : findOneAndUpdate() : got an error');
      res.render('error', {
        status: 500
      });    
    }
    else
    {
      // socketio = req.app.get('socketio'); // tacke out socket instance from the app container
      emitUserNotifications(userId);
      res.send('setUserMailNotifications: OK');
    }
  });

};
/**
 * Delete from a user a notification 
 */
exports.deleteUserNotifications = function(req, res) {
  var userId = req.params.userId, notificationId = req.params.notificationId;
  Notification.findByIdAndRemove(notificationId,{}, function(err, notif){
    if (err) {
      console.log('deleteUserNotifications() : findOne() : got an error');
    }
    else{
      // console.log("socketio contient :",req.app.get('socketio'));
      emitUserNotifications(userId);
      res.send('deleteUserNotifications: OK');
    }    
  });
};
/**
 * Delete from a user all notifications 
 */
exports.deleteUserAllNotifications = function(req,res) {
  var userId = req.params.userId;

  Notification.remove({'userTo': userId}, function(err, user) {
    if (err) {
      console.log('deleteUserAllNotifications() : findOne() : got an error');
      res.render('error', {
        status: 500
      });    
    }
    else{
      emitUserNotifications(userId);
      res.send('deleteUserNotifications: OK');
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
