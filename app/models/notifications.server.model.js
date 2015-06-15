'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Post Schema
 */
var NotificationSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  content: {
    type: String,
    trim: true,
    required: true
  },
  userFrom: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  userTo: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  }
});

/**
 * Validations
 */
NotificationSchema.path('content').validate(function(message) {
  return message.length;
}, 'Comment cannot be blank');

/**
 * Statics
 */
// CommentSchema.statics.load = function(id, cb) {
//   this.findOne({
//     _id: id
//   }).populate('user', 'name username picture').exec(cb);
// };

// NotificationSchema.set('versionKey', false);

mongoose.model('Notification', NotificationSchema);
