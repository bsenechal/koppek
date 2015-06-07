'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Comment = mongoose.model('Comment'),
  User = mongoose.model('User'),
  UserFunction = require('./users/users.role.server.controller'),
  DealFunction = require('./deals.server.controller'),
  _ = require('lodash');


/**
 * Find Comment by id
 */
exports.comment = function(req, res, next, id) {
  Comment.load(id, function(err, Comment) {
    if (err) return next(err);
    if (!Comment) return next(new Error('Failed to load Comment ' + id));
    req.comment = Comment;
    next();
  });
};

/**
 * Show a comment
 */
exports.show = function(req, res) {
  res.json(req.comment);
};

/**
 * Create a Comment
 */
exports.create = function(req, res) {
  var comment = new Comment(req.body);
  comment.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot save the comment'
      });
    } else {
      comment.populate({
        path: 'mentionsUsers',
        select: 'name username'
      }, function(err, doc) {
        res.json(doc);
      });
    }
  });
};

/**
 * Update a comment
 */
exports.update = function(req, res) {
  var comment = req.Comment;
  var mentions = [];
  var tagged_Users = [];
  if (req.body.mentionsUsers.length > 0) {

    _.map(req.body.mentionsUsers, function(mu) {
      // push client id (converted from string to mongo object id) into clients
      if (mu._id !== undefined) {
        tagged_Users.push(mu);
        mentions.push(mongoose.Types.ObjectId(mu._id));
      } else
        mentions.push(mongoose.Types.ObjectId(mu));
    });
    req.body.mentionsUsers = mentions;
  }
  comment = _.extend(comment, req.body);
  comment.save(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot update the comment'
      });
    } else {
      comment.populate({
        path: 'mentionsUsers',
        select: 'name username'
      }, function(err, doc) {
        res.json(doc);
      });
    }
  });
};

/**
 * Delete an Comment
 */
exports.destroy = function(req, res) {
  var comment = req.Comment;

  comment.remove(function(err) {
    if (err) {
      return res.json(500, {
        error: 'Cannot delete the comment'
      });
    } else {
      res.json(comment);
    }
  });
};

/**
 * Fetching comments for a post
 */
exports.fetchByParent = function(req, res) {
  var parentId = req.params.parentId;
  var limit = req.query.limit;
  var query = Comment.find({
      parent: parentId
    })
    .sort({
      _id: -1
    })
    .populate('user', 'name username')
    .populate('mentionsUsers', 'name username')
    .populate('likes', 'name username');
  if (limit) {
    query.limit(limit);
  }
  query.exec(function(err, comments) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.json(comments);
    }
  });
};

exports.allUsers = function(req, res) {
  User.find({
    name: {
      $regex: req.query.term,
      $options: '-i'
    }
  }).limit(5).exec(function(err, users) {
    res.json(users);
  });
};

/**
 * Comment middleware
 */
exports.commentByID = function(req, res, next, id) {
	Comment.findById(id).populate('user', 'displayName').exec(function(err, Comment) {
		if (err) return next(err);
		if (!Comment) return next(new Error('Failed to load comment ' + id));
		req.Comment = Comment;
		next();
	});
};

exports.hasAuthorization = function(req, res, next) {
	if (req.Comment.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};

function getAlert (idComment, callback) {
  console.log('getAlert() : init');
  Comment.findOne({'_id': idComment}).select('alert').exec(function (err, result) {
    if (err) {
      console.log('got an error');
    }
    else{
      console.log('getAlert() : findOne() : result= ', result);
      callback(result.alert);
    }
  });
};


/*
* Manage alert on comment -> banish if necessary
*/
function commentAlertManager (idComment, idDeal){
  DealFunction.getVisited(idDeal, function(visited){
    console.log('commentAlertManager() : visited = ',visited);
    getAlert(idComment, function(alert){
      console.log('commentAlertManager() : alert = ',alert);
      var threshold = 0.10;
      if(alert>visited*threshold){
        //remove comment or at least banish !
        var query = {'_id': idComment};
        var update = {'body': 'ce commentaire a été supprimé par la communauté !'};
        var options = {new: true};

        Comment.findOneAndUpdate(query, update, options, function(err, comment) {
          if (err) {
            console.log('commentAlertManager() : findOneAndUpdate(): got an error');
          }
          else{   
            console.log('commentAlertManager() : new body = ', comment.body);
          }
        });
      }
    });
  });
}

exports.updateGrade = function(req, res) {
  console.log('updateGrade() : init');
  var _id = req.query._id;
  var action = req.query.action;
  var idUser = req.query.idUser;
  var parentDeal = req.query.parent;
  var value = 0;

  console.log('updateGrade() : _id :', _id);
  console.log('updateGrade() : idUser:', idUser);
  console.log('updateGrade() : parentDeal:', parentDeal);
  console.log('updateGrade() : action:', action);
  console.log('updateGrade() : type of action:', typeof(action));
  if(action && _id && idUser){ 
    console.log('updateGrade() : before updateUserPoints()');
    if(action == 'plus'){
      //here, we will be setting the value according to user role:
      UserFunction.updateUserPoints(idUser, 2);
      value = 1;      
    } 
    else if(action == 'minus')
    {
      // case 'minus':
      UserFunction.updateUserPoints(idUser, -1);
      value = -1;      
    }
    else if(action == 'alert')
    {
      // case 'minus':
      UserFunction.updateUserPoints(idUser, -2);
      commentAlertManager(_id, parentDeal);
      value = 1;

    }

    console.log('updateGrade() : value = ', value)

      //update grade according to value :
      var query = {"_id": _id};
      var update = {$inc: {'grade': value}};
      if(action == 'alert'){
        update = {$inc: {'alert': value}};        
      }
      var options = {new: true};

      Comment.findOneAndUpdate(query, update, options, function(err, comment) {
        if (err) {
          console.log('updateGrade(): findOneAndUpdate() : got an error');
        }
        else{
          
          console.log('updateGrade() : new Grade = ', comment.grade);
          res.json(comment);        
        }
      });
  }else{
      return res.status(500).json({
        error: 'Cannot update the comment grade'
      });  
  }
  console.log("updateGrade() : Je suis updaté :D");
};