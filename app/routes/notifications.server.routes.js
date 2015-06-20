'use strict';

var notifications = require('../controllers/notifications.server.controller'),
    users = require('../controllers/users.server.controller');



module.exports = function(app) {

  app.route('/notifications/:userId')
    // .get(deals.all)
    .get(users.requiresLogin, notifications.getUserNotifications)
    .post(users.requiresLogin, notifications.setUserMailNotifications)
    .delete(users.requiresLogin, notifications.deleteUserAllNotifications);
  app.route('/notifications/:userId/:notificationId')
    .delete(users.requiresLogin, notifications.deleteUserNotifications);
  app.route('/notificationsConnect')
    .get(users.requiresLogin, notifications.connectNotificationsSocket);
  app.route('/notifications/:userId/:userTo')
    .get(users.requiresLogin, notifications.getUserMessages);
    // .post(deals.create);
  // app.route('/Markers')
  //   .get(deals.allMarkers);
  // app.route('/MarkersByRadius')
  //   .post(deals.markersByRadius);
  // app.route('/DealsByRadius')
  //   .post(deals.dealsByRadiusLimited);
  // app.route('/updateGrade')
  //   .post(users.requiresLogin, deals.updateGrade);
  // app.route('/generateDeals')
  //   .get(deals.generateDeals); 
  // app.route('/getS3Credentials')
  //   .get(users.requiresLogin, deals.s3Credentials);
  // app.route('/dealslimited')
  //   .post(deals.limited);
  // app.route('/addModification')
  //  .post(users.requiresLogin, deals.addModification);
  // app.route('/deals/:dealId')
  //   .get(deals.visited, deals.show)
  //   .put(users.requiresLogin, users.hasAuthorization(['admin']), deals.update)
  //   .delete(users.requiresLogin, users.hasAuthorization(['admin']), deals.destroy);

  // Finish with setting up the dealId param
  // app.param('dealId', deals.deal);
};
