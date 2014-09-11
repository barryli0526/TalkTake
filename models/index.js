var mongoose = require('mongoose');
var config = require('../config/base').config;

mongoose.connect(config.db, function(err){
	if(err){
		console.error('connect to %s error: ', config.db, err.message);
		process.exit(1);
	}
});

require('./photo');
require('./photoInfo');
require('./photoRelation');
require('./user');
require('./userInfo');
require('./userRelation');
require('./category');
require('./comment');
require('./commentInfo');

exports.User = mongoose.model('User');
exports.Photo = mongoose.model('Photo');
exports.PhotoRelation = mongoose.model('PhotoRelation');
exports.User = mongoose.model('User');
exports.UserInfo = mongoose.model('UserInfo');
exports.UserRelation = mongoose.model('UserRelation');
exports.Category = mongoose.model('Category');
exports.Comment = mongoose.model('Comment');
exports.CommentInfo = mongoose.model('CommentInfo');