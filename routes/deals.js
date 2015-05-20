'use strict';

var deals = require('../controllers/deals');
var express = require('express');
var auth = require('./authorization');
var router = express.Router();

// Deal authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.deal.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

router.route('/')
  .get(deals.all)
  .post(auth.requiresLogin, deals.create);
router.route('/generateDeals')
  .get(deals.generateDeals); 
router.route('/dealsbyradius')
  .post(deals.dealsByRadius);
router.route('/:dealId')
  .get(auth.isMongoId, deals.show)
  .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, deals.update)
  .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, deals.destroy);

// Finish with setting up the dealId param
router.param('dealId', deals.deal);

module.exports = router;
