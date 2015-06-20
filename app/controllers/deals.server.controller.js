'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  s3Credentials = require('../../s3Credentials.json'), 
  Deal = mongoose.model('Deal'),
  async = require('async'),
  Tag = mongoose.model('Tag'),
  http = require('http'),
  io = require('socket.io')(http),
  Comment = mongoose.model('Comment'),
  config = require('../../config/config'),
  _ = require('lodash'),
  UserFunction = require('./users/users.role.server.controller'),
  DealModification = mongoose.model('DealModification');

var snowball_stemmer = require('../../node_modules/snowball-stemmer.jsx/dest/french-stemmer.common.js');
var keyword_extractor = require('keyword-extractor');

var dealByPage = parseInt(config.dealByPage);


function cleanText(text){
      var tmp_keywords = keyword_extractor.extract(text, {language:'french', remove_digits: true, return_changed_case:false, remove_duplicates: true });
      var FrenchStemmer = snowball_stemmer.FrenchStemmer,
          tmp, tmp2, keywords = new Array(), word;

      for(var i in tmp_keywords){
        tmp = tmp_keywords[i].split('’');

        if (tmp.length === 1){
          word = tmp[0];
        } else {
          word = tmp[1];
        }

        tmp2 = word.split('\'');
        if (tmp2.length === 1){
          word = tmp2[0];
        } else {
          word = tmp2[1];
        }

        word = word.toLowerCase();
        word = word.replace(new RegExp('\\s', 'g'),'')
                    .replace(new RegExp('[àáâãäå]', 'g'),'a')
                    .replace(new RegExp('æ', 'g'),'ae')
                    .replace(new RegExp('ç', 'g'),'c')
                    .replace(new RegExp('[èéêë]', 'g'),'e')
                    .replace(new RegExp('[ìíîï]', 'g'),'i')
                    .replace(new RegExp('ñ', 'g'),'n')
                    .replace(new RegExp('[òóôõö]', 'g'),'o')
                    .replace(new RegExp('œ', 'g'),'oe')
                    .replace(new RegExp('[ùúûü]', 'g'),'u')
                    .replace(new RegExp('[ýÿ]', 'g'),'y')
                    .replace(new RegExp('\\W', 'g'),'');

        word = (new FrenchStemmer()).stemWord(word);

        if (word.length > 0) {
          keywords.push(word);
        }
      }

      return keywords;
    }

function tagsManager(deal, action){
    var keywords = cleanText(deal.description + ' ' + deal.title);

    switch (action) {
      case 'create':
          async.forEachLimit(keywords, 5, function(keyword, callback) {

              // Ajout des liens vers les deals
              Tag.update({label: keyword}, {$set: { label: keyword}, $push : {deals: deal._id}}, {upsert: true}, callback);
          }, function(err) {
              if (err)
                return next(err);
          });
        break;

      case 'remove':
        for(var i in keywords){
          Tag.update({label: keywords[i]}, {$set: { label: keywords[i]}, $pull : {deals: deal._id}}, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
        Tag.remove().where('deals').size(0).exec( function(err) {
          if (err) {
            console.log(err);
          }
        });

      break;
      }
    }

/**
 * Find deal by id
 */
exports.deal = function(req, res, next, id) {
  Deal.load(id, function(err, deal) {
    if (err) return next(err);
    if (!deal) return next(new Error('Failed to load deal ' + id));
    req.deal = deal;
    next();
  });
};


exports.s3Credentials = function(req, res) {
	res.json(s3Credentials);
};

/**
 * TODO : succed in limiting the geoNear query...
 * Find deal by latitude + longitude + radius
 */
exports.dealsByRadiusLimited = function(req, res) {

  if(req.query.list_Id){
  // console.log(req);
  //Dont forget to cast in order to use it in the geoNear fct as numbers :
  var list_Id = [];
  if(typeof(req.query.list_Id) == "string"){
    list_Id.push(req.query.list_Id);

  }else{
    list_Id = req.query.list_Id;
  }

  var page = parseInt(req.query.page);
  // var srchLng = parseFloat(req.query.srchLng),
  //     srchLat = parseFloat(req.query.srchLat),
  //     srchRadius = parseFloat(req.query.srchRadius);

  console.log('dealsByRadiusLimited(): list_Id = ', list_Id );
  console.log('dealsByRadiusLimited(): type of list_Id: ', typeof(list_Id));
  // console.log('dealsByRadiusLimited(): page = ', page );
  console.log('dealsByRadiusLimited(): dealByPage = ', dealByPage );
  // console.log('limitStart:' + limitStart);
  // console.log('limitEnd:' + limitEnd);


  Deal
    .where('_id').in(list_Id)
    // .skip((page-1)*dealByPage)
    // .limit((page)*dealByPage)
    .exec(function(err, deals) {
      if (err) {
        return res.status(500).json({
          error: 'Cannot list the deals'
        });
      }
      console.log('dealsByRadiusLimited');
      console.log(deals);
      res.json(deals);
    });

  // Deal
  // // .find()
  // // .where('loc')
  // .geoNear(
  //   [srchLng,srchLat],
  //   {
  //     maxDistance : srchRadius/6378137,
  //     distanceMultiplier: 6378137,
  //     //change default limit output... to study !
  //     num : 2000,
  //     // query :
  //     spherical : true
  //   },
  //   function(err, results, stats) {
  //     if (err) throw err;

  //     results = results.map(function(x) {
  //       delete x.dis;
  //       var a = new Deal( x.obj );

  //       return a;
  //     });
  //     Deal.populate( results, { path: 'user', select: 'name username', options: {skip: limitStart, limit: limitEnd-limitStart} }, function(err,dealsByRadius) {
  //       if (err) throw err;

  //       console.log(dealsByRadius);
  //       res.json(dealsByRadius);

  //     });
  //   }
  // );
  }
  else{
      return res.status(500).json({
        error: 'Empty Search Parameters !'
      });  }
};
/*
*
* 
*
*/

exports.markersByRadius = function(req, res) {
  // console.log(req);
  //Dont forget to cast in order to use it in the geoNear fct as numbers :
  var srchLng = parseFloat(req.query.srchLng),
      srchLat = parseFloat(req.query.srchLat),
      srchRadius = parseFloat(req.query.srchRadius);

  console.log('Server Side: dealsByRadius');
  // console.log(req);
  console.log('srchLng:' + srchLng + ', srchLat: ' + srchLat + ', srchRadius: ' + srchRadius);

  if(srchLng && srchLat && srchRadius){


  Deal
  // .find()
  // .select('_id loc')
  // .where('loc')
  .geoNear(
    [srchLng,srchLat],
    {
      maxDistance : srchRadius/6378137,
      distanceMultiplier: 6378137,
      //change default limit output... to study !
      num : 2000,
      // query :
      spherical : true
    },
    function(err, results, stats) {
      if (err) throw err;

      results = results.map(function(x) {
        delete x.dis;

        // var a = new Deal( x.obj );
        var a = {_id: x.obj._id, loc: x.obj.loc};

        return a;
      });
      // Deal.populate( results, { path: 'user', select: 'name username' }, function(err,dealsByRadius) {
      //   if (err) throw err;

        // console.log(dealsByRadius);
        // res.json(dealsByRadius);
        res.json(results);

      // });
    }
  );
  // .where({ coordinates: ['longitude', 'latitude'], type: 'Point' })
  // .within().box( [0, -50], [50, 0])
  // .near({ center: { coordinates: [req.query.srchLng, req.query.srchLat], type: 'Point' }, maxDistance: req.body.srchRadius })
  // .sort('-created')
  // .populate('user', 'name username')
  // .exec(function(err, deals) {
  //   if (err) {
  //     console.log('Cannot list the deals -> error in find paramters');
  //     return res.status(500).json({
  //       error: 'Cannot list the deals'
  //     });
  //   }
  //   console.log('list the deals by radius -> Success !');
  //   res.json(deals);
  // });
  }
  else{
      return res.status(500).json({
        error: 'Empty Search Parameters !'
      });  }
};

/**
 * Create a deal
 */
exports.create = function(req, res) {
  var deal = new Deal(req.body);

  deal.user = req.user;

  async.parallel([
    function(callback) {
      tagsManager(deal, 'create');

      callback();
    },
    function(callback) {
      deal.save(function(err) {
        if (err) {
            error = true;
          return res.status(500).json({
            error: 'Cannot save the deal'
          });
      }
      else {
          res.json(deal);
      }
    });  
      callback();
    }
  ]);
};

// Pourrisseur de BDD :D
exports.generateDeals = function(req, res) {
  var long = -50;
  var lat = -50;
  var numberofdeals = 1000
  if(req.query.number)
  {
    numberofdeals = parseInt(req.query.number);
  }

  for (var i = 0 ; i < numberofdeals ; i++){
    var deal = new Deal(req.body);

    deal.user = req.user;
    deal.title = 'test' + i;
    deal.description = 'test description' + i;
    deal.initialPrice = 10;
    deal.salePrice = 1;

    // deal.latitude = long;
    // deal.longitude = lat;
    long = -180 + 180 * 2 * Math.random();
    lat = -85 + 85 * 2 * Math.random();

    deal.latitude = lat;
    deal.longitude = long;

    deal.loc = [long,lat];

    deal.save(function(err) {
      if (err) {
        return res.status(500).json({
          error: 'Cannot save the deal'
        });
      }
      res.status(200).json();
    });
  }
  console.log('Base pourrie avec ', numberofdeals, 'nouveau deal !');
};

/**
 * Update a deal
 */
exports.update = function(req, res) {
  var deal = req.deal;

  deal = _.extend(deal, req.body);

  async.parallel([
    function(callback) {
      tagsManager(deal, 'create');

      callback();
    },
    function(callback) {
      deal.save(function(err) {
        if (err) {
          return res.status(500).json({
            error: 'Cannot update the deal'
          });
      }
    });
      res.json(deal);
      callback();
    }
  ]);
};

exports.addModification = function(req, res) {
  var modif = req.body;

  DealModification.findOneAndUpdate({idDeal : modif.idDeal}, {$push : { user: req.user._id, salePrice: modif.salePrice, initialPrice: modif.initialPrice}}, {upsert: true}, function(err) {
	  console.log(err);
	  
  });
 };

exports.visited = function(req, res) {
console.log('visited() : init');
    //update grade according to value :
    var query = {"_id": req.deal._id};
    var update = {$inc: {'visited': 1}};
    var options = {new: true};

    Deal.findOneAndUpdate(query, update, options, function(err, deal) {
      if (err) {
        console.log('got an error');
      }
      else{
        
        console.log('updateGrade() : new visited = ', deal.visited);
        res.json(deal);        
      }
    });
};

function getVisited(idDeal, callback) {
  console.log('getVisited() : init');
  Deal.findOne({'_id': idDeal}).select('visited').exec(function (err, result) {
    if (err) {
      console.log('got an error');
    }
    else{
      console.log('getVisited() : findOne() : result= ', result);
      callback(result.visited);
    }
  });
};

exports.getVisited = getVisited;


function getAlert (idDeal, callback) {
  console.log('getAlert() : init');
  Deal.findOne({'_id': idDeal}).select('alert').exec(function (err, result) {
    if (err) {
      console.log('got an error');
    }
    else{
      console.log('getAlert() : findOne() : result= ', result);
      callback(result.alert);
    }
  });
};


function dealAlertManager (idDeal){
  getVisited(idDeal, function(visited){
    console.log('dealAlertManager() : visited = ',visited);
    getAlert(idDeal, function(alert){
      console.log('dealAlertManager() : alert = ',alert);
      //the threshold is higher for the deals than then comments
      //since comment deletion is also based on the deal visit
      //deal visit is higher than comment visit -> it needs to reflect on the threshold !
      var threshold = 0.20;
      if(alert>visited*threshold){
        //remove comment or at least banish !
        var query = {'_id': idDeal};
        var update = {'description': 'ce deal a été supprimé par la communauté !'};
        var options = {new: true};

        Deal.findOneAndUpdate(query, update, options, function(err, deal) {
          if (err) {
            console.log('dealAlertManager() : findOneAndUpdate(): got an error');
          }
          else{   
            console.log('dealAlertManager() : new body = ', deal.description);
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
  var value = 0;

  console.log('updateGrade() : _id :', _id);
  console.log('updateGrade() : idUser:', idUser);
  console.log('updateGrade() : action:', action);
  console.log('updateGrade() : type of action:', typeof(action));
  if(action && _id && idUser){ 
    console.log('updateGrade() : before updateUserPoints()');
    if(action == 'plus'){
      //here, we will be setting the value according to user role:
      UserFunction.updateUserPoints(idUser, 4);
      value = 1;      
    } 
    else if(action == 'minus')
    {
      // case 'minus':
      UserFunction.updateUserPoints(idUser, -2);
      value = -1;      
    }
    else if(action == 'alert')
    {
      // case 'minus':
      UserFunction.updateUserPoints(idUser, -4);
      dealAlertManager(_id);
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

      Deal.findOneAndUpdate(query, update, options, function(err, deal) {
        if (err) {
          console.log('got an error');
        }
        else{
          
          console.log('updateGrade() : new Grade = ', deal.grade);
          res.json(deal);        
        }
    });
  }else{
      return res.status(500).json({
        error: 'Cannot update the deal grade'
      });  
  }
  console.log("Je suis updaté :D");
};
 
/**
 * Update a article
 */
// exports.update = function(req, res) {
//   var deal = req.deal;

//   deal = _.extend(deal, req.body);

//   deal.save(function(err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.json(deal);
//     }
//   });
// };

/**
 * Delete a deal
 */
exports.destroy = function(req, res) {
  var deal = req.deal;

  async.parallel([
    function(callback) {
      tagsManager(deal, 'remove');

      callback();
    },
    function(callback) {
      Comment.find().remove({ parent: deal._id }).exec(function(err){
        if (err) {
          return res.json(500, {
            error: 'Cannot delete the comments'
          });
        }
      });

      callback();
    },
    function(callback) {
      deal.remove(function(err) {
        if (err) {
          return res.status(500).json({
            error: 'Cannot delete the deal'
          });
        }
      });
      res.json(deal);
      callback();
    }
  ]);
};

/**
 * Show a deal
 */
exports.show = function(req, res) {
  res.json(req.deal);
};

/**
 * List of Deals
 */
exports.all = function(req, res) {
  Deal.find().sort('-created').populate('user', 'name username')
  .exec(function(err, deals) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the deals'
      });
    }
    console.log('all');
    console.log(deals);
    res.json(deals);
  });
};
/**
 * List of DealsMarkers
 */
exports.allMarkers = function(req, res) {
  Deal.find().sort('-created').select('_id loc').exec(function(err, deals) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the deals'
      });
    }
    console.log('all');
    console.log(deals);

    res.json(deals);
  });
};

/**
 * List of Deals limited
 */
exports.limited = function(req, res) {
    var limitStart = parseFloat(req.query.limitStart),
      page = parseFloat(req.query.page),
      limitEnd = parseFloat(req.query.limitEnd);

  Deal.find()
      .skip((page-1)*dealByPage)
      .limit((page)*dealByPage)
      .sort('-created').populate('user', 'name username')
      .exec(function(err, deals) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the deals'
      });
    }
    console.log('all');
    console.log(deals);
    res.json(deals);
  });
};



    
/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.deals.user.id !== req.user.id) {
    return res.status(403).send({
      message: 'User is not authorized'
    });
  }
  next();
};