'use strict';

var comments = require('../controllers/comments');
var auth = require('./authorization');
var express = require('express');
var router = express.Router();

// Comment authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.comment.user.id !== req.user.id) {
    return res.send(401, 'User is not authorized');
  }
  next();
};

router.route('/')
  .post(auth.requiresLogin, comments.create);

router.route('/parent/:parentId')
  .get(comments.fetchByParent);

router.route('/:commentId')
  .get(comments.show)
  .put(auth.requiresLogin, hasAuthorization, comments.update)
  .delete(auth.requiresLogin, hasAuthorization, comments.destroy);

// Fetch User With query params
router.get('/tag/users/', comments.allUsers);

// Finish with setting up the postId param
router.param('commentId', comments.comment);

module.exports = router;