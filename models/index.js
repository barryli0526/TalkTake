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
require('./user');
require('./userRelation');
require('./comment');
require('./apiInfo');

exports.User = mongoose.model('User');
exports.Photo = mongoose.model('Photo');
exports.PhotoInfo = mongoose.model('PhotoInfo');
exports.UserRelation = mongoose.model('UserRelation');
exports.Comment = mongoose.model('Comment');
exports.ApiInfo = mongoose.model('ApiInfo');