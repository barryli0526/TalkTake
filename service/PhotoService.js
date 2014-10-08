/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/9/14
 * Time: 3:51 PM
 * To change this template use File | Settings | File Templates.
 */

var dbHelper = require('../dbHelper');
var Photo = dbHelper.Photo;
var User = dbHelper.User;
var Comment = dbHelper.Comment;
var labels = require('../config/base').labels;
var config = require('../config/base').config;
var sampleData = require('../Sample/photos');
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('../lib/util');
var EventProxy = require('eventproxy');

exports.getLatestPhotos = function(uid,category, anchorTime, listSize, callback){


    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof anchorTime === 'string'){
        anchorTime = new Date(anchorTime);
    }

    User.getUserFriendsIdAndNickName(uid, function(err, docs){

        if(err){
            return callback(err,[]);
        }else{
            var Ids = [],friends = {};
            Ids[0] = uid;

            for(var i=1;i<=docs.length;i++){
                var doc = docs[i-1];
                var followId = doc.follow_id;
                friends[followId] = {};
               // friends[followId].isExist = true;
                friends[followId].name = doc.remark_name;
                Ids[i] = doc.follow_id;
            }

            var proxy = new EventProxy(),
                events = ['photos','count'];

            proxy.assign(events, function(photos, count){
                var count = count - photos.length;
                return callback(null,{
                    remain:count,
                    items:photos
                });
            }).fail(callback);

            Photo.getUserLatestPhotosByTag(Ids,category,anchorTime,listSize, function(err, docs){
                if(err || !docs || docs.length == 0){
                    return callback(err,[]);
                }else{
                    var results = [];
                    proxy.after('photo_ready', docs.length, function(){
                        proxy.emit('photos', results);
                    }).fail(callback);

                    docs.forEach(function(doc, i){
                        results[i] = {};
                        var photo = doc.photo_id,
                            user = doc.author_id;
                        results[i].photoId = photo._id;
                        results[i].photoUrl = photo.source_url;
                        results[i].upCount = doc.like ? doc.like.length : 0;
                        results[i].commentCount = doc.reply_count;
                        photo.location ? results[i].location = photo.location : null;
                        results[i].uploadTime = util.getDateTime(photo.create_at);
                        results[i].uploader = {};
                        results[i].uploader.userId = user._id;
                        user.avatar ? results[i].uploader.avatar = user.avatar : null;

                         if(!friends[user._id] || !friends[user._id].name){
                             results[i].uploader.name  = user.showName;
                         }else{
                             results[i].uploader.name = friends[user._id].name;
                         }
                        results[i].forwarder = [];
                        for(var j=0;j<doc.forward.length;j++){
                            results[i].forwarder[j] ={};
                            results[i].forwarder[j].userId = doc.forward[j].forwarder_id._id;
                            doc.forward[j].forwarder_id.avatar ? results[i].forwarder[j].avatar = doc.forward[j].forwarder_id.avatar : null;
                        }
                        proxy.emit('photo_ready');

//                        if(friends[user._id].isExist){
//                            var name = "";
//                            if(!friends[user._id].name){
//                                var firstName = user.first_name ? user.first_name : '',
//                                    lastName = user.second_name ? user.second_name : '';
//                                name = firstName + lastName;
//                            }else{
//                                name = friends[user._id].name;
//                            }
//                            results[i].uploader.name = name;
//                            results[i].uploader.bFollowed = true;
//                            proxy.emit('photo_ready');
//                        }else{
//                            User.checkIsFollow(uid, user._id, function(err, isFollow){
//                                if(err){
//                                    return proxy.emit('error');
//                                }else{
//                                    if(isFollow){
//                                        results[i] = true;
//                                    }else{
//                                        results[i] = false;
//                                    }
//                                }
//                                proxy.emit('photo_ready');
//                            })
//                        }
                    })
                }
            });

            Photo.getUserLatestPhotoCount(Ids,category,anchorTime,listSize,function(err, count){
                if(err){
                    proxy.emit('error');
                }else{
                    proxy.emit('count',count);
                }
            })
        }
    })

  //  return callback(null,sampleData.LatestList);

}

exports.getOldestPhotos = function(uid,category, anchorTime, listSize, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof anchorTime === 'string'){
        anchorTime = new Date(anchorTime);
    }

    User.getUserFriendsIdAndNickName(uid, function(err, docs){

        if(err){
            return callback(err,[]);
        }else{
            var Ids = [],friends = {};
            Ids[0] = uid;

            for(var i=1;i<=docs.length;i++){
                var doc = docs[i-1];
                var followId = doc.follow_id;
                friends[followId] = {};
              //  friends[followId].isExist = true;
                friends[followId].name =  doc.remark_name;
                Ids[i] = doc.follow_id;
            }

            var proxy = new EventProxy(),
                events = ['photos','count'];

            proxy.assign(events, function(photos, count){
                  var count = count - photos.length;
                  return callback(null,{
                      remain:count,
                      items:photos
                  });
            }).fail(callback);

            Photo.getUserOldestPhotosByTag(Ids,category,anchorTime,listSize, function(err, docs){
                if(err || !docs || docs.length == 0){
                    return callback(err,[]);
                }else{
                    var results = [];
                    proxy.after('photo_ready', docs.length, function(){
                              proxy.emit('photos', results);
                    }).fail(callback);

                    docs.forEach(function(doc, i){
                        results[i] = {};
                        var photo = doc.photo_id,
                            user = doc.author_id;
                        results[i].photoId = photo._id;
                        results[i].photoUrl = photo.source_url;
                        results[i].upCount = doc.like ? doc.like.length : 0;
                        results[i].commentCount = doc.reply_count;
                        photo.location ? results[i].location = photo.location : null;
                        results[i].uploadTime = util.getDateTime(photo.create_at);
                        results[i].uploader = {};
                        results[i].uploader.userId = user._id;
                        user.avatar ? results[i].uploader.avatar = user.avatar : null;

                        if(!friends[user._id] || !friends[user._id].name){
                            results[i].uploader.name  = user.showName;
                        }else{
                            results[i].uploader.name = friends[user._id].name;
                        }
                        results[i].forwarder = [];
                        for(var j=0;j<doc.forward.length;j++){
                            results[i].forwarder[j] ={};
                            results[i].forwarder[j].userId = doc.forward[j].forwarder_id._id;
                            doc.forward[j].forwarder_id.avatar ? results[i].forwarder[j].avatar = doc.forward[j].forwarder_id.avatar : null;
                        }
                        proxy.emit('photo_ready');

                    })
                }
            });

            Photo.getUserOldestPhotoCount(Ids,category,anchorTime,listSize,function(err, count){
                if(err){
                    proxy.emit('error');
                }else{
                    proxy.emit('count',count);
                }
            })
        }
    })

   // return callback(null,sampleData.OldestList);

}


exports.getSegmentPhoto = function(uid,category, startDate, endDate, listSize, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof startDate === 'string'){
        startDate = new Date(startDate);
    }

    if(typeof endDate === 'string'){
        endDate = new Date(endDate);
    }

    User.getUserFriendsIdAndNickName(uid, function(err, docs){

        if(err){
            return callback(err,[]);
        }else{
            var Ids = [],friends = {};
            Ids[0] = uid;

            for(var i=1;i<=docs.length;i++){
                var doc = docs[i-1];
                var followId = doc.follow_id;
                friends[followId] = {};
               // friends[followId].isExist = true;
                friends[followId].name =  doc.remark_name;
                Ids[i] = doc.follow_id;
            }

            var proxy = new EventProxy(),
                events = ['photos','count'];

            proxy.assign(events, function(photos, count){
                var count = count - photos.length;
                return callback(null,{
                    remain:count,
                    items:photos
                });
            }).fail(callback);

            Photo.getUserSegmentPhotosByTag(Ids,category,startDate,endDate,listSize, function(err, docs){
                if(err || !docs || docs.length == 0){
                    return callback(err,[]);
                }else{
                    var results = [];
                    proxy.after('photo_ready', docs.length, function(){
                        proxy.emit('photos', results);
                    }).fail(callback);

                    docs.forEach(function(doc, i){
                        results[i] = {};
                        var photo = doc.photo_id,
                            user = doc.author_id;
                        results[i].photoId = photo._id;
                        results[i].photoUrl = photo.source_url;
                        results[i].upCount = doc.like ? doc.like.length : 0;
                        results[i].commentCount = doc.reply_count;
                        photo.location ? results[i].location = photo.location : null;
                        results[i].uploadTime = util.getDateTime(photo.create_at);
                        results[i].uploader = {};
                        results[i].uploader.userId = user._id;
                        user.avatar ? results[i].uploader.avatar = user.avatar : null;

                        if(!friends[user._id] || !friends[user._id].name){
                            results[i].uploader.name  = user.showName;
                        }else{
                            results[i].uploader.name = friends[user._id].name;
                        }
                        results[i].forwarder = [];
                        for(var j=0;j<doc.forward.length;j++){
                            results[i].forwarder[j] ={};
                            results[i].forwarder[j].userId = doc.forward[j].forwarder_id._id;
                            doc.forward[j].forwarder_id.avatar ? results[i].forwarder[j].avatar = doc.forward[j].forwarder_id.avatar : null;
                        }
                        proxy.emit('photo_ready');
                    })
                }
            });

            Photo.getUserSegementPhotoCount(Ids,category,startDate,endDate,listSize,function(err, count){
                if(err){
                    proxy.emit('error');
                }else{
                    proxy.emit('count',count);
                }
            })
        }
    })

  //  return callback(null, sampleData.SegmentList) ;
}


/**
 * todo 首页关注列表的获取
 * @param uid
 * @param listSize
 * @param callback
 */
exports.getFollowPhotos = function(uid, listSize, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    var proxy = new EventProxy(),
        events = ['friends','following'];

    proxy.assign(events, function(friends, following){

    }).fail(callback);

    User.getUserFriendsId(uid, function(err, docs){
          if(err){
              proxy.emit('error');
          }else{
              proxy.emit('friends',docs);
          }
    })

    User.getUserFollowingsExceptFriends(uid, function(err, docs){
        if(err){
            proxy.emit('error');
        }else{
            proxy.emit('following',docs);
        }
    })
}

/**
 * 获取图片详细信息
 * @param userId
 * @param photoId
 * @param callback
 */
exports.getPhotoDetail = function(userId,photoId, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    Photo.getPhotoInfoById(photoId, function(err, doc){
        if(err){
            return callback(err,[]);
        }else{
            var photo = {},
                photoDetail = doc.photo_id,
                author = doc.author_id;
            photo.photoId = photoDetail._id;
            photo.photoUrl = photoDetail.source_url;
            photo.upCount = photoDetail.like ? photoDetail.like.length : 0;
            photo.commentCount  = photoDetail.reply_count;
            photoDetail.location ? photo.location = photoDetail.location : null;
            photo.uploadTime = util.getDateTime(doc.post_at);
            photo.bLiked = false;
            photoDetail.description ? photo.Description =photoDetail.description : null;
            photo.uploader = {};
            photo.uploader.userId = author._id;
            photo.uploader.name = author.showName;
            author.avatar ? photo.uploader.avatar = author.avatar : null;
            //photo.uploader.isFollowing = '';
            photo.likedUserList = [];

            var photoProxy = new EventProxy(),
                events = ['relation','likeList'];

            photoProxy.assign(events, function(relation, likeList){
                photo.uploader.isFollowing = relation.isfollowing;
                relation.remark_name ? photo.uploader.name = relation.remark_name : null;
                photo.likedUserList = likeList;
            })

            User.getRelationInfo(userId, author._id, photoProxy.done('relation'));

            if(doc.like && doc.like.length > 0){
                var proxy = new EventProxy(),
                    likeList = [];
                proxy.after('like_ready',doc.like.length, function(){
                    photoProxy.emit('likeList', likeList);
                });

                doc.like.forEach(function(liker,i){
                    likeList[i] = {};
                    likeList[i].userId = liker.liker_id._id;
                    liker.liker_id.avatar ? likeList[i].avatar = liker.liker_id.avatar : null;
                    if( userId.equals(liker.liker_id._id)){
                        photo.bLiked = true;
                    }
                    proxy.emit('like_ready');
                })

            }else{
             //   return callback(null, photo) ;
                photoProxy.emit('likeList', []);
            }
        }
    })

   // return callback(null, sampleData.photoDetail);
}

exports.getComments = function(userId, photoId, startIndex, size, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    var proxy = new EventProxy(),
        events = ['comments','count'];

    proxy.assign(events, function(comments, count){
        var remain = count - (startIndex+1)*size;
        remain = (remain >=0) ? remain : 0;
        return callback(null,{
                 remain:remain,
                 items:comments
            })
    }).fail(callback);

    Comment.getCommentsByPhotoId(photoId, startIndex, size, function(err, docs){
        if(err){
            proxy.emit('error');
        }else{
            var comments = [];
            var proxy1 = new EventProxy();
            proxy1.after('comment_ready', docs.length, function(){
               proxy.emit('comments',comments);
            });

            docs.forEach(function(doc,i){
                var comment = {};
                comment.userId = doc.author_id._id;
                doc.author_id.avatar ? comment.avatar = doc.author_id.avatar : null;
                comment.isFollowing = false;
                doc.content ? comment.comments = doc.content : null;
                comment.replyTime = doc.create_at;
                User.getRelationInfo(userId, doc.author_id, function(err, relation){
                    if(err){
                        proxy1.emit('error');
                    }else{
                        comment.isFollowing = relation.isFollowing;
                        comment.name = relation.remark_name ? relation.remark_name : doc.author_id.nick_name;
                    }
                    comments[i] = comment;
                    proxy1.emit('comment_ready');
                })
            })

            //return callback(null, docs);
        }
    })

    Comment.countCommentsOfPhoto(photoId, function(err, count){
        if(err){
            proxy.emit('error');
        }else{
            proxy.emit('count',count);
        }
    })


    //return callback(null, sampleData.comments);
}

/**
 * 发表评论
 * @param photoId
 * @param uid
 * @param comments
 * @param replyTime
 * @param callback
 */
exports.postComments = function(photoId, uid, comments, replyTime, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    var data = {};
    data.comment = comments;
    data.replyTime = new Date(replyTime);

    Photo.increaseCommentCount(photoId, function(){});

    Comment.newAndSave(uid, photoId, data, callback);

    //return callback(null,[]);
}

/**
 * 上传图片
 * @param userId
 * @param name
 * @param key
 * @param tags
 * @param createTime
 * @param location
 * @param desc
 * @param isPublic
 * @param callback
 */
exports.createNewPhoto = function(userId,name,key, tags, createTime, location, desc, isPublic, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }
    var url = config.qnConfig.domain + '/' + key;

    if(typeof tags ==='string'){
        tags = tags.split(',');
    }

    var createTime = new Date(createTime);

    Photo.createNewPhoto(userId, name, url,createTime, location, desc, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
//            Photo.createNewPostPhotoRelation(userId, doc._id, tags, createTime, function(){}) ;
            Photo.createNewPhotoInfo(userId, doc._id, tags, createTime, isPublic, function(){});
            return callback(null, {photoId:doc._id, photoUrl:doc.source_url});
        }
    });
}


/**
 * 赞一张图片
 * @param userId
 * @param photoId
 * @param callback
 * @returns {*}
 */
exports.likePhoto = function(userId, photoId,likeTime, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    likeTime = new Date(likeTime);

    Photo.addLikePhotoInfo(userId, photoId, likeTime, function(){});

    return callback(null,[]);

}

/**
 * 取消点赞
 * @param userId
 * @param photoId
 * @param callback
 */
exports.unlikePhoto = function(userId, photoId, callback){
    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    Photo.removeLikePhotoInfo(userId, photoId, callback);

}

/**
 * 分享一张图片
 * @param userId
 * @param photoId
 * @param shareTime
 * @param callback
 * @returns {*}
 */
exports.sharePhoto = function(userId, photoId,shareTime, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    var shareTime = new Date(shareTime);
//
//    Photo.getPhotoTags(photoId, function(err, doc){
//        if(err){
//            return callback(err,[]);
//        }else{
//            var tags = [];
//            if(!doc || doc.length == 0){
//                tags[0] = labels.Category;
//            }else{
//                tags = doc.tags;
//            }
//            Photo.createNewSharePhotoRelation(userId, photoId, tags, shareTime, function(){});
//        }
//    })

    return callback(null,[]);

}


/**
 * 转发图片
 * @param userId
 * @param photoId
 * @param forwardText
 * @param forwardTime
 * @param callback
 * @returns {*}
 */
exports.forwardPhoto = function(userId, photoId, forwardText, forwardTime, callback){
    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof photoId === 'string'){
        photoId = new ObjectId(photoId);
    }

    forwardTime = new Date(forwardTime);

    Photo.addForwardPhotoInfo(userId, photoId, forwardText, forwardTime, function(){});

    return callback(null,[]);

}