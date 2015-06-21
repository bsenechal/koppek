'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
   errorHandler = require('../errors.server.controller.js'),
   notificationHandler = require('../notifications.server.controller.js'),
   config = require('../../../config/config'),
   mongoose = require('mongoose'),
   User = mongoose.model('User');
   Deal = mongoose.model('Deal');

/*
*      Get sum of user UserPoints :
*/
function getMyStatistics(callback){
   console.log(Deal.find({ 'some.value': 5 })
}
