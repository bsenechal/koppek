'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
   path = require('path'),
   config = require(path.resolve('./config/config')),
   mongoose = require('mongoose'),
   Deal = mongoose.model('Deal'),
   Comment = mongoose.model('Comment'),
   errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/*
*      Get sum of user UserPoints :
*/
exports.getNumberOfDeal = function (req, res, next){
   Deal.count({ 'user': req.user._id },function (err, count) {
      if (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
		} else {
		  res.json(count);
		}
    });
};

/*
 * Get number of comment for an user
 */ 
exports.getNumberOfComment = function (req, res, next){
   Comment.count({ 'user': req.user._id },function (err, count) {
      if (err) {
		return res.status(400).send({
			message: errorHandler.getErrorMessage(err)
		});
		} else {
		  res.json(count);
		}
    });
};