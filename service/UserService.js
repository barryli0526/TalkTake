var dbHelper = require('../dbHelper');
var User = dbHelper.User;
var UserInfo = dbHelper.UserInfo;
var Message = require('../config/message').Message;
var labels = require('../config/labels').labels;
var EventProxy = require('EventProxy');
var util = require('../lib/util');

var sampleData = require('../Sample/photos');


/**
 * user sign in
 * @param loginname
 * @param pass
 * @param callback
 * @constructor
 */
exports.SignIn = function(loginname, pass, callback){
//    User.getUserByLoginInfo(loginname, pass, function(err, user){
//
//        if(err){
//            return callback(Message.Db.default);
//        }
//
//        if(!user){
//            return callback(null,null,Message.User.signin_error);
//        }
//
//        //不处理更新成功或失败
//        User.UpdateLoginTime(user);
//
//        //直接返回信息,不需要等待更新完成
//        return callback(null, user);
//    })
    return callback(null,{_id:'4e7020cb7cac81af7136233b'})
}


exports.createClient = function(uuid, callback){
    return callback(null,{_id:'4e7020cb7cac81af7136233b'});
}

exports.FollowUser = function(followerId, uid, callback){
    return callback(null,[]);
}

exports.UnFollowUser = function(unFollowerId, uid, callback){
    return callback(null,[]);
}

exports.getUserDetail = function(uid, callback){
    return callback(null, sampleData.userInfo);
}

exports.getAllFollowingUser = function(uid, callback){
    return callback(null, sampleData.followingList);
}

exports.getAllFollowerUser = function(uid, callback){
    return callback(null, sampleData.followerList);
}

exports.getAllLikedPhotoList = function(uid, callback){
    return callback(null, sampleData.likedList);
}