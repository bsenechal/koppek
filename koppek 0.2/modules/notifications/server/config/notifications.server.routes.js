'use strict';

/* 
 * Module dependancies
 */
var notifications = require('../controllers/notifications.server.controller'),
	notificationsPolicy = require('../policies/notifications.server.policy');
	
module.exports = function(app) {
  app.route('/api/notifications/:userId').all(notificationsPolicy.isAllowed)
    .get(notifications.getUserNotifications)
    .post(notifications.setUserMailNotifications)
    .delete(notifications.deleteUserAllNotifications);
  app.route('/api/notifications/:userId/:notificationId').all(notificationsPolicy.isAllowed)
    .delete(notifications.deleteUserNotifications);
  app.route('/api/notificationsConnect').all(notificationsPolicy.isAllowed)
    .get(notifications.connectNotificationsSocket);
  app.route('/api/notifications/:userId/:userTo').all(notificationsPolicy.isAllowed)
    .get(notifications.getUserMessages);

};
