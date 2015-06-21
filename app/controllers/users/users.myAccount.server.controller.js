'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
   errorHandler = require('../errors.server.controller.js'),
   config = require('../../../config/config'),
   mongoose = require('mongoose'),
   passport = require('passport'),
   User = mongoose.model('User'),
   Deal = mongoose.model('Deal'),
   Comment = mongoose.model('Comment');

/*
*      Get sum of user UserPoints :
*/
exports.getNumberOfDeal = function (req, res, next){
   Deal.count({ 'user': req.user._id },function (err, count) {
      if (err) return handleError(err);
        res.json(count);
    });
}

exports.getNumberOfComment = function (req, res, next){
   Comment.count({ 'user': req.user._id },function (err, count) {
      if (err) return handleError(err);
        res.json(count);
    });
}