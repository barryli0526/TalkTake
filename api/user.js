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
                    res.statusCode = 200;
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
                    res.statusCode = 200;
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
                    res.statusCode = 200;
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
        var uid = req.params.userId ? req.params.userId : req.session.user._id ,
            query = req.query;
        var startIndex = query.startIndex ? query.startIndex : 0,
            size = query.size ? query.size : labels.UserList;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllFollowingUser(uid,startIndex,size, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 * 获取所有粉丝列表
 * @param req
 * @param res
 */
exports.getAllFollowerUser = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.params.userId ? req.params.userId : req.session.user._id,
            query = req.query;
        var startIndex = query.startIndex ? query.startIndex : 0,
            size = query.size ? query.size : labels.UserList;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllFollowerUser(uid,startIndex,size, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 * 获取所有喜欢的图片列表
 * @param req
 * @param res
 */
exports.getAllLikedPhotoList = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.params.userId ? req.params.userId : req.session.user._id,
            query = req.query;
        var startIndex = query.startIndex ? query.startIndex : 0,
            size = query.size ? query.size : labels.UserList;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            UserService.getAllLikedPhotoList(uid, startIndex, size, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}


/**
 * 同步通讯录
 * @param req
 * @param res
 */
exports.syncContacts = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            var rqData = req.body.contactlist;
//            rqData = [
//                { phoneNumber: [ '15921853464' ], lastName: 'test1' },
//            { phoneNumber: [ '+8613818890852' ], lastName: 'test2¸)' },
//            { phoneNumber: [ '13816156904' ], lastName: 'test3)' },
//            { phoneNumber: [ '02133576073' ], lastName: 'test4' },
//            { phoneNumber: [ '13918819954' ], lastName: 'test5' },
//                { phoneNumber: [ '07562312157' ], lastName: 'test6' },
//                { phoneNumber: [ '18221571877' ], lastName: 'test7' },
//                { phoneNumber: [ '13918938324' ], lastName: 'test8' },
//                { phoneNumber: [ '18778158616' ], lastName: 'test9' },
//                { phoneNumber: [ '18651376980' ], lastName: 'test10' },
//                { phoneNumber: [ '15900522623' ], lastName: 'Tony' },
//                { phoneNumber: [ '4008895543' ], lastName: 'test11' },
//                { phoneNumber: ['15896228422', '189-0629-8512' ], lastName: 'test12' },
//                { phoneNumber: [ '152-5132-6433' ], lastName: 'test13)' },
//                { phoneNumber: [ '+8618221576973' ], lastName: 'test14' }
//            ];
            UserService.HandleContactsRelation(uid,rqData, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}


/**
 * 完善个人信息
 * @param req
 * @param res
 */
exports.updateUserProfile = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.params.userId ? req.params.userId : req.session.user._id;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            var rqData = req.body;
            UserService.updateUserProfile(uid,rqData, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}


/**
 * 获取某个目录下的图片信息
 * @param req
 * @param res
 */
exports.getAlbumPhotos = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.params.userId ? req.params.userId : req.session.user._id;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            var uid = req.params.userId ? req.params.userId : req.session.user._id,
                query = req.query;
            var tagName = query.category,
                startDate = query.startDate ,
                endDate = query.endDate ,
                startIndex = query.startIndex ? query.startIndex : 0,
                size = query.size ? query.size : labels.PhotoListSize;

            if(endDate && endDate.length < 11){
                endDate += ' 23:59:59:999';
            }

            if(!uid){
                res.statusCode = 503;
                res.end(util.combineFailureRes(labels.sessionError));
                return;
            }else if(!tagName){
                res.statusCode = 412;
                res.end(util.combineFailureRes(labels.requestError));
                return;
            }else{
                if(startDate && endDate){
                    UserService.getSegementPhotosByAlbumInfo(uid, tagName, startDate, endDate, size, function(err,docs){
                        if(err){
                            res.statusCode = 500;
                            res.end(util.combineFailureRes(labels.DBError));
                        }else{
                            res.statusCode = 200;
                            res.end(util.combineSuccessRes(docs));
                        }
                    })
                }else{
                    UserService.getPhotosByAlbumInfo(uid, tagName, startIndex, size, function(err,docs){
                        if(err){
                            res.statusCode = 500;
                            res.end(util.combineFailureRes(labels.DBError));
                        }else{
                            res.statusCode = 200;
                            res.end(util.combineSuccessRes(docs));
                        }
                    })
                }
            }
        }
    }
}