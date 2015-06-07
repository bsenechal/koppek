'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Comment = mongoose.model('Comment'),
  User = mongoose.model('User'),
  UserFunction = require('./users/users.role.server.controller'),
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

 exports.updateGrade = function(req, res) {
  console.log('updateGrade() : init');
  var _id = req.query._id;
  var action = req.query.action;
  var idUser = req.query.idUser;
  var value = 0;

  console.log('updateGrade() : _id :', _id);
  console.log('updateGrade() : action:', action);
  console.log('updateGrade() : type of action:', typeof(action));
  if(action){ 
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

    console.log('updateGrade() : value = ', value)
    //get deal actual grade :
    var actualGrade;
    Comment.findOne({'_id': _id}).select('grade').exec(function (err, result) {
      console.log('updateGrade() : findOne() : result= ', result);
      actualGrade = result.grade;

      console.log('updateGrade() : actualGrade = ', actualGrade);

      //update grade according to value :
      var query = {"_id": _id};
      var update = {grade: actualGrade + value};
      var options = {new: true};

      Comment.findOneAndUpdate(query, update, options, function(err, comment) {
        if (err) {
          console.log('got an error');
        }
        else{
          
          console.log('updateGrade() : new Grade = ', comment.grade);
          res.json(comment);        
        }
      });
    })
  }else{
      return res.status(500).json({
        error: 'Cannot update the comment grade'
      });  
  }
  console.log("Je suis updaté :D");
 };