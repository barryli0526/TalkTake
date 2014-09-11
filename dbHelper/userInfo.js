var models = require('../models');
var UserInfo = models.UserInfo;
var User = require('./user');
var util = require('../lib/util');


/*
 * 添加计数（帖子数/评论数/关注数/被关注数等）
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} userid 用户id
 * @param {String} typeName 如：post_count/reply_count/follower_count/following_count/collect_tag_count/collect_article_count
 * @param {Function} callback 回调函数
* */

var addCount = function(userid, typeName, callback){
    UserInfo.findOne({user_id: userid}, function(err, userinfo){
        if(err){
            return callback(err, null);
        }else if(!userinfo){
            User.getUserById(userid, function(err, user){
                if(err || !user){
                    return callback(err, null);
                }else{
                  var userinfo = new UserInfo();
                   userinfo.user_id = userid;
                   userinfo[typeName] = 1;
                   userinfo.save(callback);
                }

            })
        }else{
             userinfo[typeName] += 1;
            userinfo.save(callback);
        }
    })
}

/*
 * 减少论数/关注数/被关注数等）
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} userid 用户id
 * @param {String} typeName 如：post_count/reply_count/follower_count/following_count/collect_tag_count/collect_article_count
 * @param {Function} callback 回调函数
 * */
var deleteCount = function(userid, typeName, callback){
    UserInfo.findOne({user_id:userid}, function(err, userinfo){
        if(err || !userinfo){
            return callback(err, null);
        }else{
            userinfo[typeName] -= 1;
            userinfo.save(callback);
        }
    })
}

/*
* 以下6个函数分别为添加相应的计数函数
* */
exports.addPostCount = function(userid, callback){
    addCount(userid,"post_count",callback);
}

exports.addReplyCount = function(userid, callback){
    addCount(userid,"reply_count",callback);
}

exports.addFollowerCount = function(userid, callback){
    addCount(userid,"follower_count",callback);
}

exports.addFollowingCount = function(userid, callback){
    addCount(userid,"following_count",callback);
}

exports.addCollectTagCount = function(userid, callback){
    addCount(userid,"collect_tag_count",callback);
}

exports.addCollectArticleCount = function(userid, callback){
    addCount(userid,"collect_article_count",callback);
}


exports.addMultiFiledCount = function(userid, filednames, values, callback){
    UserInfo.findOne({user_id:userid}, function(err, userinfo){
        if(err || !userinfo){
            return callback(err, null);
        }else{
            var fileds = filednames.split(',');
            var vals = values.split(',');
            var value = 0;
            for(var i=0;i<fileds.length;i++){
                if(vals[i]){
                    value = parseInt(vals[i]);
                }else{
                    value = 1;
                }
                if(userinfo[fileds[i]])
                     userinfo[fileds[i]] += value;
                else
                    userinfo[fileds[i]] = value;
            }
            userinfo.save(callback);
        }
    })
}



/*
 * 以下6个函数分别为减少相应的计数函数
 * */
exports.deletePostCount = function(userid, callback){
    deleteCount(userid,"post_count",callback);
}

exports.deleteReplyCount = function(userid, callback){
    deleteCount(userid,"reply_count",callback);
}

exports.deleteFollowerCount = function(userid, callback){
    deleteCount(userid,"follower_count",callback);
}

exports.deleteFollowingCount = function(userid, callback){
    deleteCount(userid,"following_count",callback);
}

exports.deleteCollectTagCount = function(userid, callback){
    deleteCount(userid,"collect_tag_count",callback);
}

exports.deleteCollectArticleCount = function(userid, callback){
    deleteCount(userid,"collect_article_count",callback);
}

exports.deleteMultiFiledCount = function(userid, filednames,values, callback){
    UserInfo.findOne({user_id:userid}, function(err, userinfo){
        if(err || !userinfo){
            return callback(err, null);
        }else{
            var fileds = filednames.split(',');
            var vals = values.split(',');
            var value = 0;
            for(var i=0;i<fileds.length;i++){
                if(vals[i]){
                    value = parseInt(vals[i]);
                }else{
                    value = 1;
                }

                if(userinfo[fileds[i]])
                    userinfo[fileds[i]] -= value;
                else
                    userinfo[fileds[i]] = 0;
            }

            userinfo.save(callback);
        }
    })
}

exports.newAndSave = function(userid, callback){

    UserInfo.findOne({user_id: userid},function(err, userInfo){
        if(err){

            return callback(err, null);
        }else if(userInfo){

            return callback(null,userInfo,"用户信息已经存在");
        }else{

            var userinfo = new UserInfo();
            userinfo.user_id = userid;
            userinfo.save(callback);
        }
    })
}