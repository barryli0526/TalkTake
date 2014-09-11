/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/9/14
 * Time: 3:33 PM
 * To change this template use File | Settings | File Templates.
 */

var labels = require('../config/base').labels;
var util = require('../lib/util');
var PhotoService = require('../service/PhotoService');


/**
 * 根据时间锚点获取最新的图片列表
 * @param req
 * @param res
 */
exports.getLatestPhotoList = function(req, res){

    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var query = req.query;
        var anchorTime = query.anchorTime ? query.anchorTime : util.getDateTime();
        var listSize = query.listSize ? query.listSize : labels.PhotoListSize;
        var category = query.category ? query.category : labels.Category;

        PhotoService.getLatestPhotos(category, anchorTime, listSize, function(err, docs){
            if(err){
                res.statusCode = 500;
                res.end(util.combineFailureRes(labels.DBError));
            }else{
                res.end(util.combineSuccessRes(docs));
            }
        })

    }

}

/**
 * 根据时间锚点获取过往的图片列表
 * @param req
 * @param res
 */
exports.getOldestPhotoList = function(req, res){

    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var query = req.query;
        var anchorTime = query.anchorTime ? query.anchorTime : util.getDateTime();
        var listSize = query.listSize ? query.listSize : labels.PhotoListSize;
        var category = query.category ? query.category : labels.Category;

        PhotoService.getOldestPhotos(category, anchorTime, listSize, function(err, docs){
            if(err){
                res.statusCode = 500;
                res.end(util.combineFailureRes(labels.DBError));
            }else{
                res.end(util.combineSuccessRes(docs));
            }
        })
    }

}

/**
 * 获取某个时间段内的图片列表
 * @param req
 * @param res
 */
exports.getSegmentPhotoList = function(req, res){
 //   console.log('segment');
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var query = req.query;
        var startDate = query.startDate ;
        var endDate = query.endDate ;
        var days = query.days ;
        var listSize = query.listSize ? query.listSize : labels.PhotoListSize;
        var category = query.category ? query.category : labels.Category;

        if(!startDate ||!endDate){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else{
            PhotoService.getSegmentPhoto(category, startDate, endDate, listSize, function(err, docs){
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
 * 对某张图片点赞
 * @param req
 * @param res
 */
exports.likePhoto = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var photoId = req.params.photoId;
        var uid = req.session.user._id;
        if(!photoId){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
             PhotoService.addLikeForThePhoto(uid, photoId, function(err, docs){
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
 * 取消对某张图片点赞
 * @param req
 * @param res
 */
exports.unLikePhoto = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var photoId = req.params.photoId;
        var uid = req.session.user._id;
        if(!photoId){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            PhotoService.unLikeForThePhoto(uid, photoId, function(err, docs){
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
 * 获取图片详细信息
 * @param req
 * @param res
 */
exports.getPhotoDetail = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var photoId = req.params.photoId;
        if(!photoId){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else{
            PhotoService.getPhotoDetail(photoId, function(err, doc){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.end(util.combineSuccessRes(doc));
                }
            })
        }
    }
}

/**
 * 获取图片评论
 * @param req
 * @param res
 */
exports.getComments = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var photoId = req.params.photoId;
        if(!photoId){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else{
            var query = req.query;
            var startIndex = query.startIndex ? query.startIndex : 0,
                size = query.size ? query.size : labels.CommentListSize;
            PhotoService.getComments(photoId, startIndex, size, function(err, docs){
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
 * 发表一条评论
 * @param req
 * @param res
 */
exports.postComment = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var photoId = req.params.photoId,
            uid = req.session.user._id,
            comments = req.body.comments,
            date = req.body.replyTime ? req.body.replyTime : req.headers['date'];
        if(!photoId || !comments || comments.length <= 0){
            res.statusCode = 412;
            res.end(util.combineFailureRes(labels.requestError));
            return;
        }else if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            PhotoService.postComments(photoId, uid, comments, date, function(err, docs){
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