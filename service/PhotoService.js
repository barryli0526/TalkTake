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
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('../lib/util');
var EventProxy = require('eventproxy');


var queryPhotoInfoAndMapToOutPut = function(friends,Ids,category,startDate, endDate,listSize, type, isXQ, callback){
    var proxy = new EventProxy(),
        events = ['photos','count'];

    proxy.assign(events, function(photos, count){
        var count = count - photos.length;
        return callback(null,{
            remain:count,
            items:photos
        });
    }).fail(callback);

    //根据type和isXQ参数动态执行对应语句获取数据
    Photo.getUserIndexPhotosByTag(Ids,category,startDate, endDate,listSize, type, isXQ, function(err, docs){
        if(err || !docs || docs.length == 0){
            return callback(err,[]);
        }else{              //抓取到数据
            var results = [];

            proxy.after('photo_ready', docs.length, function(){
                proxy.emit('photos', results);
            }).fail(callback);
            //遍历图片列表
            docs.forEach(function(doc, i){
                results[i] = {};
                var photo = doc.photo_id,   //图片信息
                    user = doc.author_id;   //用户信息
                results[i].photoId = photo._id;
                results[i].photoUrl = photo.source_url;
                if(config.qnConfig.compress){
                    results[i].photoUrl += config.qnConfig.quality;
                }
                results[i].upCount = doc.like ? doc.like.length : 0;
                results[i].commentCount = doc.reply_count;
                photo.location ? results[i].location = photo.location : null;
                results[i].uploadTime = util.getDateTime(photo.create_at);
                results[i].uploader = {};
                results[i].uploader.userId = user._id;
                user.avatar ? results[i].uploader.avatar = user.avatar : null;
                //如果图片作者与当前app用户为好友关系
                if(!friends[user._id] || !friends[user._id].name){
                    results[i].uploader.name  = user.showName;
                }else{
                    results[i].uploader.name = friends[user._id].name;
                }
                results[i].forwarder = [];
                var obj = {}, fwCount = 0;
                //遍历图片的forward列表
                for(var j=0;j<doc.forward.length;j++){
                    var forwarder = doc.forward[j].forwarder_id;
                    //确保没有重复的forwarder存在在列表中
                    if(!obj[forwarder._id]){
                        results[i].forwarder[fwCount] ={};
                        results[i].forwarder[fwCount].userId = forwarder._id;
                        forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                        if(friends[forwarder._id] && friends[forwarder._id].name){
                            results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                            results[i].forwarder[fwCount].isFollowing = true;
                        }else{
                            results[i].forwarder[fwCount].name = forwarder.showName;
                            if(friends[forwarder._id] && friends[forwarder._id].isExist){
                                results[i].forwarder[fwCount].isFollowing = true;
                            }else{
                                results[i].forwarder[fwCount].isFollowing = false;
                            }
                        }
                        obj[forwarder._id] = true;
                    }
                }
                proxy.emit('photo_ready');
            })
        }
    });

    Photo.getUserIndexPhotosCountByTag(Ids,category,startDate, endDate,listSize, type, isXQ,function(err, count){
        if(err){
            proxy.emit('error');
        }else{
            proxy.emit('count',count);
        }
    });
}

/**
 * 根据目录获取用户的图片
 * @param userId
 * @param category
 * @param startDate
 * @param endDate
 * @param listSize
 * @param type
 * "latest" 取startDate之后生成的图片
 * "oldest" 取startDate之前生成的图片
 * "segment" 取startDate和endDate之间生成的图片
 * @param callback
 */
exports.getIndexPhotosByTag = function(userId, category, startDate, endDate, listSize, type, callback){

    if( typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    if(typeof startDate === 'string'){
        startDate = new Date(startDate);
    }

    if(type == 'segment' && typeof endDate === 'string'){
        endDate = new Date(endDate);
    }

    var isXQ = false;
    //如果是新奇则不按照常规标签处理
    if(category == labels.Category){
        isXQ = true;
    }
    //根据用户ID获取好友列表
    User.getUserFriendsIdAndNickName(userId, function(err, docs){
        if(err){
            return callback(err,[]);   //若有错误返回空
        }else{
            var Ids = [],friends = {};
            Ids[0] = userId;   //将自己也加入用户列表，因为也需要拿出自己发表转发的图片
            //存储好友信息，方便接下来使用
            for(var i=1;i<=docs.length;i++){
                var doc = docs[i-1];
                var followId = doc.follow_id;
                friends[followId] = {};
                friends[followId].name = doc.remark_name;
                friends[followId].isExist = true;
                Ids[i] = doc.follow_id;
            }
            //如果获取新奇的内容，则需要先获取已经存在的标签
            if(isXQ){
                Photo.countTagsByUserIds(Ids, function(err, tags){
                    if(err){
                        return callback(err,[]);
                    }else{
                        var ExistTags = [],count = 0, maxCount = labels.tagRecommendCount;
                        for(var i=0;i<tags.length;i++){

                            if(tags[i].value.count >= maxCount){
                                ExistTags[count] = tags[i]._id;
                                count++;
                            }
                        }
                        queryPhotoInfoAndMapToOutPut(friends,Ids, ExistTags, startDate, endDate, listSize, type, isXQ, callback);
                    }
                })
            }else{
                var tag = category;
                queryPhotoInfoAndMapToOutPut(friends,Ids, tag, startDate, endDate, listSize, type, isXQ, callback);
            }

        }
    })
}





/**
 * 首页获取最新图片，不包括新奇的内容
 * @param uid
 * @param category
 * @param anchorTime
 * @param listSize
 * @param callback
 */
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
                        if(config.qnConfig.compress){
                            results[i].photoUrl += config.qnConfig.quality;
                        }
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
                        var obj = {}, fwCount = 0;
                        for(var j=0;j<doc.forward.length;j++){
                            var forwarder = doc.forward[j].forwarder_id;
                            if(!obj[forwarder._id]){
                                results[i].forwarder[fwCount] ={};
                                results[i].forwarder[fwCount].userId = forwarder._id;
                                forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                if(friends[forwarder._id] && friends[forwarder._id].name){
                                    results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                    results[i].forwarder[fwCount].isFollowing = true;
                                }else{
                                    results[i].forwarder[fwCount].name = forwarder.showName;
                                    results[i].forwarder[fwCount].isFollowing = false;
                                }
                                obj[forwarder._id] = true;
                            }
                        }
                        proxy.emit('photo_ready');

                    })
                }
            });

            Photo.getUserLatestPhotoCount(Ids,category,anchorTime,listSize,function(err, count){
                if(err){
                    proxy.emit('error');
                }else{
                    proxy.emit('count',count);
                }
            });




        }
    })

  //  return callback(null,sampleData.LatestList);
}

/**
 * 首页获取过往图片，不包括新奇的内容
 * @param uid
 * @param category
 * @param anchorTime
 * @param listSize
 * @param callback
 */
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
                        if(config.qnConfig.compress){
                            results[i].photoUrl += config.qnConfig.quality;
                        }
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
                        var obj = {}, fwCount = 0;
                        for(var j=0;j<doc.forward.length;j++){
                            var forwarder = doc.forward[j].forwarder_id;
                            if(!obj[forwarder._id]){
                                results[i].forwarder[fwCount] ={};
                                results[i].forwarder[fwCount].userId = forwarder._id;
                                forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                if(friends[forwarder._id] && friends[forwarder._id].name){
                                    results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                    results[i].forwarder[fwCount].isFollowing = true;
                                }else{
                                    results[i].forwarder[fwCount].name = forwarder.showName;
                                    results[i].forwarder[fwCount].isFollowing = false;
                                }
                                obj[forwarder._id] = true;
                            }
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
}


/**
 * 首页获取某个时间段的图片，不包括新奇
 * @param uid
 * @param category
 * @param startDate
 * @param endDate
 * @param listSize
 * @param callback
 */
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
                        if(config.qnConfig.compress){
                            results[i].photoUrl += config.qnConfig.quality;
                        }
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
                        var obj = {}, fwCount = 0;
                        for(var j=0;j<doc.forward.length;j++){
                            var forwarder = doc.forward[j].forwarder_id;
                            if(!obj[forwarder._id]){
                                results[i].forwarder[fwCount] ={};
                                results[i].forwarder[fwCount].userId = forwarder._id;
                                forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                if(friends[forwarder._id] && friends[forwarder._id].name){
                                    results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                    results[i].forwarder[fwCount].isFollowing = true;
                                }else{
                                    results[i].forwarder[fwCount].name = forwarder.showName;
                                    results[i].forwarder[fwCount].isFollowing = false;
                                }
                                obj[forwarder._id] = true;
                            }
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

            //添加路过信息
            if(author._id.toString() !== userId.toString()){
                Photo.addVisitPhotoInfo(userId, photoId, Date.now(), function(){})
            }

            photo.photoId = photoDetail._id;
            photo.photoUrl = photoDetail.source_url;
            if(config.qnConfig.compress){
                photo.photoUrl += config.qnConfig.quality;
            }
            photo.upCount = doc.like ? doc.like.length : 0;
            photo.commentCount  = doc.reply_count ? doc.reply_count : 0;
            photoDetail.location ? photo.location = photoDetail.location : null;
            photo.uploadTime = util.getDateTime(doc.post_at);
            photo.bLiked = false;
            photoDetail.description ? photo.Description =photoDetail.description : null;
            photo.uploader = {};
            photo.uploader.userId = author._id;
            photo.uploader.name = author.showName;
            photo.tags = doc.tags;
            author.avatar ? photo.uploader.avatar = author.avatar : null;
            //photo.uploader.isFollowing = '';
            photo.likedUserList = [];

            var photoProxy = new EventProxy(),
                events = ['relation','likeList'];

            photoProxy.assign(events, function(relation, likeList){
                photo.uploader.isFollowing = relation.isfollowing;
                relation.remark_name ? photo.uploader.name = relation.remark_name : null;
                photo.likedUserList = likeList;
//                photo.visitList = visitList;
                return callback(null,photo);
            }).fail(callback);

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

            //添加路过信息
//            var visitList = [];
//            if(doc.visit && doc.visit.length > 0){
//                var filter = {},
//                    j=0;
//                for(var i= 0,j=0;(i<doc.visit.length && j< 10);i++){
//                    var visiter = doc.visit[i].visiter_id;
//                    var uid = visiter._id;
//                    if(!filter[uid]){
//                        visitList[j] = {};
//                        visitList[j].userId = uid;
//                        visitList[j].avatar = visiter.avatar ? visiter.avatar : null;
//                        j++;
//                    }
//                }
//            }
//            photoProxy.emit('visitList', visitList);

        }
    })
}

/**
 * 获取评论
 * @param userId
 * @param photoId
 * @param startIndex
 * @param size
 * @param callback
 */
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
                comment.replyTime = util.getDateTime(doc.create_at);
                User.getRelationInfo(userId, doc.author_id._id, function(err, relation){
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
        }
    })

    Comment.countCommentsOfPhoto(photoId, function(err, count){
        if(err){
            proxy.emit('error');
        }else{
            proxy.emit('count',count);
        }
    })
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

    //如果进行评论的话则加入转发列表并自动扩散到朋友圈
    Photo.addForwardPhotoInfo(uid, photoId, data.comment,data.replyTime, 'comments', function(){});

    Comment.newAndSave(uid, photoId, data, callback);
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
    var thumbUrl = url + config.qnConfig.quality;

    if(typeof tags ==='string'){
        tags = tags.split(',');
    }

    var createTime = new Date(createTime);

    Photo.createNewPhoto(userId, name, url, thumbUrl, createTime, location, desc, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
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

    //如果进行评论的话则加入转发列表并自动扩散到朋友圈
    Photo.addForwardPhotoInfo(userId, photoId, 'like',likeTime, 'like', function(){});

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
//exports.sharePhoto = function(userId, photoId,shareTime, callback){
//
//    if(typeof userId === 'string'){
//        userId = new ObjectId(userId);
//    }
//
//    if(typeof photoId === 'string'){
//        photoId = new ObjectId(photoId);
//    }
//
//    var shareTime = new Date(shareTime);
////
////    Photo.getPhotoTags(photoId, function(err, doc){
////        if(err){
////            return callback(err,[]);
////        }else{
////            var tags = [];
////            if(!doc || doc.length == 0){
////                tags[0] = labels.Category;
////            }else{
////                tags = doc.tags;
////            }
////            Photo.createNewSharePhotoRelation(userId, photoId, tags, shareTime, function(){});
////        }
////    })
//
//    return callback(null,[]);
//
//}


/**
 * 转发图片
 * @param userId
 * @param photoId
 * @param forwardText
 * @param forwardTime
 * @param callback
 * @returns {*}
 */
//exports.forwardPhoto = function(userId, photoId, forwardText, forwardTime, callback){
//    if(typeof userId === 'string'){
//        userId = new ObjectId(userId);
//    }
//
//    if(typeof photoId === 'string'){
//        photoId = new ObjectId(photoId);
//    }
//
//    forwardTime = new Date(forwardTime);
//
//    Photo.addForwardPhotoInfo(userId, photoId, forwardText, forwardTime, function(){});
//
//    return callback(null,[]);
//
//}

/**
 * 获取最新的新奇的图片
 * @param uid
 * @param category
 * @param anchorTime
 * @param listSize
 * @param callback
 */
exports.getLatestXQPhotos = function(uid, anchorTime, listSize, callback){


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

            Photo.countTagsByUserIds(Ids, function(err, tags){
                if(err){
                    return callback(err,[]);
                }else{
                    var category = [],count = 0, maxCount = labels.tagRecommendCount;
                    for(var i=0;i<tags.length;i++){

                        if(tags[i].value.count >= maxCount){
                            category[count] = tags[i]._id;
                            count++;
                        }
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


                    Photo.getUserLatestXQPhotosByTag(Ids,category,anchorTime,listSize, function(err, docs){
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
                                if(config.qnConfig.compress){
                                    results[i].photoUrl += config.qnConfig.quality;
                                }
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
                                var obj = {}, fwCount = 0;
                                for(var j=0;j<doc.forward.length;j++){
                                    var forwarder = doc.forward[j].forwarder_id;
                                    if(!obj[forwarder._id]){
                                        results[i].forwarder[fwCount] ={};
                                        results[i].forwarder[fwCount].userId = forwarder._id;
                                        forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                        if(friends[forwarder._id] && friends[forwarder._id].name){
                                            results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                            results[i].forwarder[fwCount].isFollowing = true;
                                        }else{
                                            results[i].forwarder[fwCount].name = forwarder.showName;
                                            results[i].forwarder[fwCount].isFollowing = false;
                                        }
                                        obj[forwarder._id] = true;
                                    }
                                }
                                proxy.emit('photo_ready');

                            })
                        }
                    });

                    Photo.getUserLatestXQPhotoCount(Ids,category,anchorTime,listSize,function(err, count){
                        if(err){
                            proxy.emit('error');
                        }else{
                            proxy.emit('count',count);
                        }
                    });

                }
            })
        }
    })
}

/**
 * 获取过往的新奇图片
 * @param uid
 * @param anchorTime
 * @param listSize
 * @param callback
 */
exports.getOldestXQPhotos = function(uid, anchorTime, listSize, callback){

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


            Photo.countTagsByUserIds(Ids, function(err, tags){
                if(err){
                    return callback(err,[]);
                }else{
                    var category = [],count = 0, maxCount = labels.tagRecommendCount;
                    for(var i=0;i<tags.length;i++){

                        if(tags[i].value.count >= maxCount){
                            category[count] = tags[i]._id;
                            count++;
                        }
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

                    Photo.getUserXQOldestPhotosByTag(Ids,category,anchorTime,listSize, function(err, docs){
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
                                if(config.qnConfig.compress){
                                    results[i].photoUrl += config.qnConfig.quality;
                                }
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
                                var obj = {}, fwCount = 0;
                                for(var j=0;j<doc.forward.length;j++){
                                    var forwarder = doc.forward[j].forwarder_id;
                                    if(!obj[forwarder._id]){
                                        results[i].forwarder[fwCount] ={};
                                        results[i].forwarder[fwCount].userId = forwarder._id;
                                        forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                        if(friends[forwarder._id] && friends[forwarder._id].name){
                                            results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                            results[i].forwarder[fwCount].isFollowing = true;
                                        }else{
                                            results[i].forwarder[fwCount].name = forwarder.showName;
                                            results[i].forwarder[fwCount].isFollowing = false;
                                        }
                                        obj[forwarder._id] = true;
                                    }
                                }
                                proxy.emit('photo_ready');

                            })
                        }
                    });

                    Photo.getUserOldestXQPhotoCount(Ids,category,anchorTime,listSize,function(err, count){
                        if(err){
                            proxy.emit('error');
                        }else{
                            proxy.emit('count',count);
                        }
                    })

                }
            })

        }
    })
}

/**
 * 获取某个时间段的新奇图片
 * @param uid
 * @param startDate
 * @param endDate
 * @param listSize
 * @param callback
 */
exports.getSegmentXQPhoto = function(uid, startDate, endDate, listSize, callback){

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

            Photo.countTagsByUserIds(Ids, function(err, tags){
                if(err){
                    return callback(err,[]);
                }else{
                    var category = [],count = 0, maxCount = labels.tagRecommendCount;
                    for(var i=0;i<tags.length;i++){

                        if(tags[i].value.count >= maxCount){
                            category[count] = tags[i]._id;
                            count++;
                        }
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

                    Photo.getUserSegmentXQPhotosByTag(Ids,category,startDate,endDate,listSize, function(err, docs){
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
                                if(config.qnConfig.compress){
                                    results[i].photoUrl += config.qnConfig.quality;
                                }
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
                                var obj = {}, fwCount = 0;
                                for(var j=0;j<doc.forward.length;j++){
                                    var forwarder = doc.forward[j].forwarder_id;
                                    if(!obj[forwarder._id]){
                                        results[i].forwarder[fwCount] ={};
                                        results[i].forwarder[fwCount].userId = forwarder._id;
                                        forwarder.avatar ? results[i].forwarder[fwCount].avatar = forwarder.avatar : null;
                                        if(friends[forwarder._id] && friends[forwarder._id].name){
                                            results[i].forwarder[fwCount].name = friends[forwarder._id].name;
                                            results[i].forwarder[fwCount].isFollowing = true;
                                        }else{
                                            results[i].forwarder[fwCount].name = forwarder.showName;
                                            results[i].forwarder[fwCount].isFollowing = false;
                                        }
                                        obj[forwarder._id] = true;
                                    }
                                }
                                proxy.emit('photo_ready');
                            })
                        }
                    });

                    Photo.getUserSegementXQPhotoCount(Ids,category,startDate,endDate,listSize,function(err, count){
                        if(err){
                            proxy.emit('error');
                        }else{
                            proxy.emit('count',count);
                        }
                    })

                }
            })

        }
    })
}










