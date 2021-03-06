'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Deal Schema
 */
var DealSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  initialPrice: {
    type: Number,
    required: true,
    trim: true
  },
  salePrice: {
    type: Number,
    required: true,
    trim: true
  },
  loc: {
    type: [Number], 
    index: '2dsphere'
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  alert: {
    type: Number,
    default: 0,
    trim: true
  },
  grade: {
    type: Number,
    default: 0,
    trim: true
  },
  visited: {
    type: Number,
    default: 0,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  image: {
    type: String,
    default: 'default',
    trim: true
  },
  onlineDeal: {
	type: Boolean,
    required: true
  },
  urlWebSite: {
    type: String,
    trim: true
  },
  active: {
  type: Boolean,
    default: true,
  }
});

/**
 * Validations
 */
DealSchema.path('title').validate(function(title) {
  return !!title;
}, 'Le titre ne peut pas être vide');

DealSchema.path('initialPrice').validate(function(initialPrice) {
  return !!initialPrice;
}, 'Le prix initial ne peut pas être vide');

DealSchema.path('salePrice').validate(function(salePrice) {
  return !!salePrice;
}, 'Le prix de vente ne peut pas être vide');

DealSchema.path('description').validate(function(description) {
  return !!description;
}, 'La description ne peut pas être vide');

/**
 * Statics
 */
DealSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};
// DealSchema.statics.loadByRadius = function(latitude,longitude,radius,cb) {
//   this.findByRadius({
//     _id: id
//   }).populate('user', 'name username').exec(cb);
// };


mongoose.model('Deal', DealSchema);
