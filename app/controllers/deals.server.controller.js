'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Deal = mongoose.model('Deal'),
  async = require('async'),
  Tag = mongoose.model('Tag'),
  http = require('http'),
  io = require('socket.io')(http),
  Comment = mongoose.model('Comment'),
  _ = require('lodash');

var snowball_stemmer = require('../../node_modules/snowball-stemmer.jsx/dest/french-stemmer.common.js');
var keyword_extractor = require('keyword-extractor');


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

  // var srchLng = parseFloat(req.query.srchLng),
  //     srchLat = parseFloat(req.query.srchLat),
  //     srchRadius = parseFloat(req.query.srchRadius);

  console.log('Server Side: dealsByRadiusLimited');
  console.log('list_Id:' + list_Id);
  console.log('type of list_Id:' + typeof(list_Id));
  // console.log('limitStart:' + limitStart);
  // console.log('limitEnd:' + limitEnd);


  Deal
    .where('_id').in(list_Id)
    // .skip(limitStart)
    // .limit(limitEnd-limitStart)
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
          return res.status(500).json({
            error: 'Cannot save the deal'
          });
      }
    });
      res.json(deal);
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
      limitEnd = parseFloat(req.query.limitEnd);

  Deal.find().skip(limitStart).limit(limitEnd-limitStart).sort('-created').populate('user', 'name username').exec(function(err, deals) {
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