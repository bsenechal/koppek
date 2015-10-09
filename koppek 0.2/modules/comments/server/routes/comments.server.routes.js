'use strict';

var comments = require('../controller/comments.server.controller');

// The Package is past automatically as first parameter
module.exports = function(app) {

  app.route('/api/comments')
    .post(comments.create);

  app.route('/api/comments/updateGrade')
    .post(comments.updateGrade);

  app.route('/api/comments/parent/:parentId')
    .get(comments.fetchByParent);

  app.route('/api/comments/:commentId')
    .get(comments.show)
    .put(comments.hasAuthorization, comments.update)
    .delete(comments.hasAuthorization, comments.destroy);

  // Fetch User With query params
  app.get('/api/tag/users/', comments.allUsers);

  // Finish with setting up the postId param
  app.param('commentId', comments.commentByID);
};
