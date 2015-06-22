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
var submitBeforeModif = parseInt(config.submitBeforeModif);

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

  console.log('dealsByRadiusLimited(): dealByPage = ', dealByPage );

  var srchLng = parseFloat(req.param('srchLng')),
      srchLat = parseFloat(req.param('srchLat')),
      srchRadius = parseFloat(req.param('srchRadius')),
      srchText = req.param('srchText'),
      srchOrder = String(req.param('srchOrder')),
      page = parseInt(req.param('page'));

  //set correct srchOrder :
  if(srchOrder == 'date')
  {
    srchOrder = 'created';
  }
  if(srchOrder == 'success')
  {
    srchOrder = 'grade';
  }

  console.log('dealsByRadiusLimited() :');
  //define srchText as '' if not existe ('' -> will match every deal, it is essentialy canceling the search)
  if(!srchText)
  {
    srchText=''
  };

  // console.log(req);
  console.log('srchLng:' + srchLng + ', srchLat: ' + srchLat + ', srchRadius: ' + srchRadius + ', srchText: ' + srchText + ', srchOrder: ' + srchOrder + ', page: ' + page);
  //dynamic sort :


  if(srchLng && srchLat && srchRadius && page){
    if(srchOrder == 'created' || srchOrder == 'grade'){
      //prepare sort query :
      var queryOrder = {};
      queryOrder[srchOrder] = -1;
    console.log('dealsByRadiusLimited() : queryOrder = ', queryOrder);

      //main sorted mongoose query :
      Deal.where('loc')
      .near({ center: [srchLng, srchLat], maxDistance: srchRadius/6378137, spherical: true })
      .sort(queryOrder)
      .where({description: new RegExp('^.*'+srchText+'.*$', "i")})
      .skip((page-1)*dealByPage).limit(page*dealByPage)
      .exec(function(err, deals) {
        if (err) {
          res.render('error', {
            status: 500
          });
        } else {
          // console.log('dealsByRadiusLimited(): find() : deals = ', deals);
          console.log('dealsByRadiusLimited(): find() : OK');
          res.json(deals);
        }
      }); 
    }
    else
    {
      //main unsorted mongoose query :
      Deal.where('loc')
      .near({ center: [srchLng, srchLat], maxDistance: srchRadius/6378137, spherical: true })
      .where({description: new RegExp('^.*'+srchText+'.*$', "i")})
      .skip((page-1)*dealByPage).limit(page*dealByPage)
      .exec(function(err, deals) {
        if (err) {
          res.render('error', {
            status: 500
          });
        } else {
          // console.log('dealsByRadiusLimited(): find() : deals = ', deals);
          console.log('dealsByRadiusLimited(): find() : OK');
          res.json(deals);
        }
      }); 
    }
  }
  else{
      return res.status(500).json({
        error: 'Empty Search Parameters !'
      });  
  }
};
/*
*
* 
*
*/

exports.markersByRadius = function(req, res) {
  // console.log(req);
  //Dont forget to cast in order to use it in the geoNear fct as numbers :
  var srchLng = parseFloat(req.param('srchLng')),
      srchLat = parseFloat(req.param('srchLat')),
      srchRadius = parseFloat(req.param('srchRadius'));

  console.log('markersByRadius: ');
  // console.log(req);
  console.log('srchLng:' + srchLng + ', srchLat: ' + srchLat + ', srchRadius: ' + srchRadius);

  if(srchLng && srchLat && srchRadius){

  Deal.where('loc').near({ center: [srchLng, srchLat], maxDistance: srchRadius/6378137, spherical: true }).select('_id loc').
  exec(function(err, deals) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      // console.log('dealsByRadiusLimited(): find() : deals = ', deals);
      console.log('dealsByRadiusLimited(): find() : OK');
      res.json(deals);
    }
  }); 

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
    deal.onlineDeal = false;

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
// magnigique !
exports.generateDealsFrance = function(req, res) {
  //all those variables can be passed as arguments :
  var numberofdeals = parseInt(req.query.number) || 1000;
  var poslat = parseFloat(req.query.poslat) || 49.41781599999999;
  var poslng = parseFloat(req.query.poslng) || 2.826144999999997;
  var delta = parseFloat(req.query.delta) || 1;

  var userArray = ["5561f7933de31bc837a99243","55623dbfe24760741453dc5b","5561f7933de31bc837a99240","5586eadce02345d83022b191"];
  var objectArray = ["Chaussure","Voiture","Papier Toilette","Cartable","Table","Chaise","TV","Ordinateur portable","Jante Alu","Citrouille","Macbook"];
  var complementArray = ["Superbe ","Magnique ","Comme neuf : ","En superbe état : ","Maxi promo sur ","A vendre : ","Aujourd'hui seulement : ","Gratuit : ","Baisse massive sur ","Excellente affaire : "];
  var verbArray = [" a vendre "," pour pas cher "," dans un suberbe état "," à venir chercher sur place"," à prix cassé "," à bas prix"," disponible en quantité limitée"," sur commande"," dans l'état"," à prix ridicule "];
  var reasonArray = ["car nous en avons trop "," grâce aux promos de févrié !"," car nous sommes en liquidation !"," faute de trouver preneur."," car je dois m'en séparer."," car ils changent de collection"," car ils arrêtent de vendre ce produit."," dans la mesure des stocks disponibles"," car il s'agit d'une semaine de soldes"," car il s'agit des fêtes"];

  for (var i = 0 ; i < numberofdeals ; i++){
    var deal = new Deal(req.body);

    var randUser = userArray[Math.round(Math.random()*(userArray.length-1))];
    var randObject = objectArray[Math.round(Math.random()*(objectArray.length-1))];
    var randVerb = verbArray[Math.round(Math.random()*(verbArray.length-1))];
    var randComplement = complementArray[Math.round(Math.random()*(complementArray.length-1))];
    var randReason = reasonArray[Math.round(Math.random()*(reasonArray.length-1))];

    var initialPrice = Math.round(Math.random()*1000+10);
    var salePrice = Math.round(Math.random()*(initialPrice-10) + 1);

    deal.user = randUser;
    deal.title = randComplement + ' ' + randObject + '!';
    deal.description = randObject + ' ' + randVerb + ' ' + randReason + ' (' + i + ')';
    deal.initialPrice = initialPrice;
    deal.salePrice = salePrice;
    deal.onlineDeal = false;

    // deal.latitude = long;
    // deal.longitude = lat;
    var long = (poslng-delta) + 2 * delta * Math.random();
    var lat = (poslat-delta) + 2 * delta * Math.random();

    deal.latitude = lat;
    deal.longitude = long;

    deal.loc = [long,lat];

    deal.save(function(err) {
      if (err) {
        // return res.status(500).json({
        //   error: 'Cannot save the deal'
        console.log('generateDealsFrance() : cannot save the deal !');
        // });
      }
      // res.status(200).json();
      // console.log('Base magnifiée avec ', numberofdeals, 'nouveaux deals !');
    });
  }
  console.log('Base magnifiée avec ', numberofdeals, 'nouveaux deals !');
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
	  if (err) {
        return res.status(500).json({
        error: 'Impossible de prendre en compte la modification'
      });  
      }
      else{       
        res.json(modif);        
      }
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
         res.json(deal);        
      }
    });
};

function getVisited(idDeal, callback) {
  Deal.findOne({'_id': idDeal}).select('visited').exec(function (err, result) {
    if (err) {
      console.log('got an error');
    }
    else{
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
  var _id = req.body._id;
  var action = req.body.action;
  var idUser = req.body.idUser;
  var value = 0;

  // console.log('updateGrade() : req: ', req);
  if(action && _id && idUser){ 

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
      //update grade according to value :
      var query = {"_id": _id};
      var update = {$inc: {'grade': value}};
      if(action == 'alert'){
        update = {$inc: {'alert': value}};        
      }
      var options = {new: true};

      Deal.findOneAndUpdate(query, update, options, function(err, deal) {
        if (err) {
          return res.status(500).json({
            error: 'updateGrade() : findOneAndUpdate : error'
          });          
        }
        else{
          res.json(deal);        
        }
    });
  }else{
      return res.status(500).json({
        error: 'Cannot update the deal grade'
      });  
  }
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
    console.log('deal : all(): ok');
    // console.log(deals);
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
    console.log('allMarkers() : ok');
    // console.log(deals);

    res.json(deals);
  });
};

/**
 * List of Deals limited
 */
exports.limited = function(req, res) {
    var page = parseFloat(req.param('page'));

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
    console.log('deal : limited(): OK');
    // console.log(deals);
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