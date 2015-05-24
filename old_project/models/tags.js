'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Tag Schema
 */
var TagSchema = new Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  deals: [{
    type: Schema.ObjectId,
    ref: 'Deal'
  }]
});

/**
 * Validations
 */
TagSchema.path('label').validate(function(label) {
  return !!label;
}, 'Le titre ne peut pas être vide');

/**
 * Statics
 */
TagSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('deal', 'deals title').exec(cb);
};

mongoose.model('Tag', TagSchema);
