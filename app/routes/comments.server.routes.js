'use strict';

var users = require('../../app/controllers/users.server.controller'),
	comments = require('../../app/controllers/comments.server.controller');

// The Package is past automatically as first parameter
module.exports = function(app) {

  app.route('/comments')
    .post(users.requiresLogin, comments.create);

  app.route('/comments/parent/:parentId')
    .get(comments.fetchByParent);

  app.route('/comments/:commentId')
    .get(comments.show)
    .put(users.requiresLogin, comments.hasAuthorization, comments.update)
    .delete(users.requiresLogin, comments.hasAuthorization, comments.destroy);

  // Fetch User With query params
  app.get('/tag/users/', comments.allUsers);

  // Finish with setting up the postId param
  app.param('commentId', comments.commentByID);
};
