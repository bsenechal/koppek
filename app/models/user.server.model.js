'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function(property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function(password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		default: '',
		validate: [validateLocalStrategyProperty, 'Please fill in your email'],
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true
	},
	password: {
		type: String,
		default: '',
		validate: [validateLocalStrategyPassword, 'Password should be longer']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	notifications: [{
		date: Date,
		content: String
	}],
    votes: [{
		date: Date,
		type: Schema.ObjectId
	}],
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	},
   userPoints: {
     type: Number,
     default: 0,
     trim: true
   },
	userRole: {
		type: Number,
    	default: 0,
		trim: true
	},
    avatar: {
		type: String,
		trim: true,
		default: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Mzk2QzU2NzM5QUU4MTFFM0IzNEE5RUI1NEFFNEZDNDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Mzk2QzU2NzQ5QUU4MTFFM0IzNEE5RUI1NEFFNEZDNDMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozOTZDNTY3MTlBRTgxMUUzQjM0QTlFQjU0QUU0RkM0MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozOTZDNTY3MjlBRTgxMUUzQjM0QTlFQjU0QUU0RkM0MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pk5xsisAAB1tSURBVHja7F17cJzV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'
	},
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function(next) {
	if (this.password && this.password.length > 6) {
		this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function(password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function(err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);