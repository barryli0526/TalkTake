/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/10/14
 * Time: 5:39 PM
 * To change this template use File | Settings | File Templates.
 */
var labels = require('../config/base').labels;
var util = require('../lib/util');
var UserService = require('../service/UserService');

/**
 * 关注用户
 * @param req
 * @param res
 */
exports.followUser = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var followerId = req.params.userId,
            uid = req.session.user._id;
        if(!followerId){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.FollowUser(followerId, uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 * 取消关注用户
 * @param req
 * @param res
 */
exports.unFollowUser = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var followerId = req.params.userId,
            uid = req.session.user._id;
        if(!followerId){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.UnFollowUser(followerId, uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 * 获取用户个人详细信息
 * @param req
 * @param res
 */
exports.getUserDetail = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var userId = req.params.userId;
        var isSelf = userId ? false : true;
        var uid = (isSelf == true) ? req.session.user._id : userId;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getUserDetail(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 *获取所有关注的用户列表
 * @param req
 * @param res
 */
exports.getAllFollowingUser = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id ;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllFollowingUser(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

exports.getAllFollowerUser = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id ;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllFollowerUser(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

exports.getAllLikedPhotoList = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id ;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllLikedPhotoList(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}