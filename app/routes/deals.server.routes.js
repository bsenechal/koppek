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
  app.route('/MarkersByRadius/:srchLng/:srchLat/:srchRadius')
    .get(deals.markersByRadius);
  app.route('/dealsbyradius')
    .get(deals.dealsByRadiusLimited);
  app.route('/userDeal/:active')
    .get(deals.dealsByUser);
  app.route('/DealsSearch')
    .get(deals.dealsByRadiusLimited);
  app.route('/updateGrade')
    .post(users.requiresLogin, deals.updateGrade);
  app.route('/generateDeals')
    .get(deals.generateDeals); 
  app.route('/generateDealsFrance')
    .get(deals.generateDealsFrance); 
  app.route('/deals/getS3Credentials')
    .get(users.requiresLogin, deals.s3Credentials);
  app.route('/dealslimited/:page')
    .get(deals.limited);
  app.route('/addModification')
	.post(users.requiresLogin, deals.addModification);
  app.route('/deals/:dealId')
    .get(deals.visited, deals.show)
    // .put(users.requiresLogin, users.hasAuthorization(['admin']), deals.update) -> authorization needs to be done inside : each user can update its deals.
    .put(users.requiresLogin, deals.update)
    .delete(users.requiresLogin, users.hasAuthorization(['admin']), deals.destroy);

  // Finish with setting up the dealId param
  app.param('dealId', deals.deal);
};
