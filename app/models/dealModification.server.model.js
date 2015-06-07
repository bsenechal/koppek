'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * DealModification Schema
 */
var DealModificationSchema = new Schema({
  idDeal: {
    type: String,
    required: true,
    trim: true
  },
  initialPrice: [{
    type: Number,
    required: true,
    trim: true
  }],
  salePrice: [{
    type: Number,
    required: true,
    trim: true
  }],
  user: [{
    type: Schema.ObjectId,
    ref: 'User'
  }]
});

/**
 * Validations
 */

DealModificationSchema.path('initialPrice').validate(function(initialPrice) {
  return !!initialPrice;
}, 'Le prix initial ne peut pas être vide');

DealModificationSchema.path('salePrice').validate(function(salePrice) {
  return !!salePrice;
}, 'Le prix de vente ne peut pas être vide');

/**
 * Statics
 */
DealModificationSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};
// DealSchema.statics.loadByRadius = function(latitude,longitude,radius,cb) {
//   this.findByRadius({
//     _id: id
//   }).populate('user', 'name username').exec(cb);
// };


mongoose.model('DealModification', DealModificationSchema);
