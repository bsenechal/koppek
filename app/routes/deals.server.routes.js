'use strict';

var deals = require('../../app/controllers/deals.server.controller'),
    users = require('../../app/controllers/users.server.controller');



module.exports = function(app) {

  app.route('/deals')
    .get(deals.all)
    .post(users.requiresLogin, deals.create);
    // .post(deals.create);
  app.route('/Markers')
    .get(deals.allMarkers);
  app.route('/MarkersByRadius')
    .post(deals.markersByRadius);
  app.route('/DealsByRadius')
    .post(deals.dealsByRadiusLimited);
  app.route('/updateGrade')
    .put(users.requiresLogin, deals.updateGrade);
  app.route('/generateDeals')
    .get(deals.generateDeals); 
  app.route('/dealslimited')
    .post(deals.limited);
  app.route('/addModification')
    .put(users.requiresLogin, deals.addModification)
	.post(users.requiresLogin, deals.addModification);
  app.route('/deals/:dealId')
    .get(deals.show)
    .put(users.requiresLogin, users.hasAuthorization(['admin']), deals.update)
    // .put(deals.update)
    .delete(users.requiresLogin, users.hasAuthorization(['admin']), deals.destroy);
    // .delete(deals.destroy);

  // Finish with setting up the dealId param
  app.param('dealId', deals.deal);
};
