'use strict';

var deals = require('../controllers/deals');

// Deal authorization helpers
/*var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.deal.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

module.exports = function(Deals, app, auth) {

  app.route('/deals')
    .get(deals.all)
    .post(auth.requiresLogin, deals.create);
  app.route('/generateDeals')
    .get(deals.generateDeals); 
  app.route('/dealsbyradius')
    .post(deals.dealsByRadius);
  app.route('/deals/:dealId')
    .get(auth.isMongoId, deals.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, deals.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, deals.destroy);

  // Finish with setting up the dealId param
  app.param('dealId', deals.deal);
};
*/

var express = require('express');
var router = express.Router();

/* Marche :D */
router.get('/', function(req, res, next) {
  deals.all(req, res);
})
.get('/:dealId', function(req, res) {
  deals.deal(req, res, req.params.dealId);
});



module.exports = router;
