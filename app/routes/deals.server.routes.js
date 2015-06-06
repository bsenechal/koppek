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
  app.route('/generateDeals')
    .get(deals.generateDeals); 
  app.route('/dealsbyradius')
    .post(deals.dealsByRadius);
  app.route('/dealslimited')
    .post(deals.limited);
  app.route('/deals/:dealId')
    .get(deals.show)
    .put(users.requiresLogin, users.hasAuthorization(['admin']), deals.update)
    // .put(deals.update)
    .delete(users.requiresLogin, users.hasAuthorization(['admin']), deals.destroy);
    // .delete(deals.destroy);

  // Finish with setting up the dealId param
  app.param('dealId', deals.deal);
};
