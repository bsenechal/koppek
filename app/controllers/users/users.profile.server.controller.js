'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

exports.updateVote = function(req, res) {
    User.findOneAndUpdate({_id : req.user.id}, {$push : { votes: req.body._id}}, {upsert: true}, function(err) {
        if(err) {
            return res.status(500).json({
                error: 'Problème lors du vote'
            });
        }
        res.status(200);
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};

/**
 * List of Users
 */
exports.all = function(req, res) {
  User.find().sort('username').select('username displayName')
  .exec(function(err, users) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the users'
      });
    }
    console.log('user : all() : OK');
    // console.log(users);
    res.json(users);
  });
};
