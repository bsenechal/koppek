'use strict';

var path = require('path'),
    dealsPolicy = require('../policies/deals.server.policy'),
    deals = require('../controllers/deals.server.controller');

module.exports = function(app) {

 app.route('/api/deals').all(dealsPolicy.isAllowed)
   .get(deals.all)
   .post(deals.create);
  app.route('/api/Markers')
    .get(deals.allMarkers);
  app.route('/api/MarkersByRadius/:srchLng/:srchLat/:srchRadius')
    .get(deals.markersByRadius);
  app.route('/api/DealsByRadius')
    .get(deals.dealsByRadiusLimited);
  app.route('/api/DealsSearch')
    .get(deals.dealsByRadiusLimited);
  app.route('/api/updateGrade')
    .post(deals.updateGrade);
  app.route('/api/generateDeals')
    .get(deals.generateDeals); 
  app.route('/api/generateDealsFrance')
    .get(deals.generateDealsFrance); 
  app.route('/api/deals/getS3Credentials').all(dealsPolicy.isAllowed)
    .get(deals.s3Credentials);
  app.route('/api/dealslimited/:page')
    .get(deals.limited);
  app.route('/api/addModification').all(dealsPolicy.isAllowed)
	.post(deals.addModification);
  app.route('/api/deals/:dealId').all(dealsPolicy.isAllowed)
    .get(deals.visited, deals.show)
    .put(deals.update)
    .delete(deals.destroy);

  // Finish with setting up the dealId param
  app.param('dealId', deals.deal);
};
