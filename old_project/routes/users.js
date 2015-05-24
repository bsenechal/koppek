'use strict';

// User routes use users controller
var users = require('../controllers/users');
var express = require('express');
var passport = require('passport');
var router = express.Router();

  router.route('/logout')
    .get(users.signout);
  router.route('/me')
    .get(users.me);

  // Setting up the users api
  router.route('/register')
    .post(function(req, res) {
		users.create();
  });

  router.route('/forgot-password')
    .post(function(req, res) {
		users.forgotpassword();
  });

  router.route('/reset/:token')
    .post(function(req, res) {
		users.resetpassword();
  });


  // Setting up the userId param
  router.param('userId', users.user);

  // AngularJS route to check for authentication
  router.route('/loggedin')
    .get(function(req, res) {
      res.send(req.isAuthenticated() ? req.user : '0');
    });

  // Setting the local strategy route
  router.route('/login')
    .post(passport.authenticate('local', {
      failureFlash: true
    }), function(req, res) {
      res.send({
        user: req.user,
        redirect: (req.user.roles.indexOf('admin') !== -1) ? req.get('referer') : false
      });
    });

  // AngularJS route to get config of social buttons
  router.route('/get-config')
    .get(function (req, res) {
      // To avoid displaying unneccesary social logins
      var clientIdProperty = 'clientID';
      var defaultPrefix = 'DEFAULT_';
      var socialNetworks = ['facebook','linkedin','twitter','github','google']; //ugly hardcoding :(
      var configuredApps = {};
      for (var network in socialNetworks){
        var netObject = config[socialNetworks[network]];
        if ( netObject.hasOwnProperty(clientIdProperty) ) {
              if (netObject[clientIdProperty].indexOf(defaultPrefix) === -1 ){
                configuredApps[socialNetworks[network]] = true ;
              }
        }
      }
      res.send(configuredApps);
    });

  // Setting the facebook oauth routes
  router.route('/auth/facebook')
    .get(passport.authenticate('facebook', {
      scope: ['email', 'user_about_me'],
      failureRedirect: '#!/login'
    }), users.signin);

  router.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the github oauth routes
  router.route('/auth/github')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.signin);

  router.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the twitter oauth routes
  router.route('/auth/twitter')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.signin);

  router.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the google oauth routes
  router.route('/auth/google')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }), users.signin);

  router.route('/auth/google/callback')
    .get(passport.authenticate('google', {
      failureRedirect: '#!/login'
    }), users.authCallback);

  // Setting the linkedin oauth routes
  router.route('/auth/linkedin')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login',
      scope: ['r_emailaddress']
    }), users.signin);

  router.route('/auth/linkedin/callback')
    .get(passport.authenticate('linkedin', {
      failureRedirect: '#!/login'
    }), users.authCallback);

module.exports = router;
