/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/14/14
 * Time: 9:36 AM
 * To change this template use File | Settings | File Templates.
 */


var Photo = require('../models').Photo;
var PhotoInfo = require('../models').PhotoInfo;
var Helper = require('../lib/Helper');
var queryStringBuilder = Helper.queryStringBuilder;
var labels = require('../config/base').labels;


/**
 * 创建一个新的照片
 * @param userId
 * @param name
 * @param url
 * @param tags
 * @param createTime
 * @param location
 * @param desc
 * @param isPublic
 * @param callback
 */
exports.createNewPhoto = function(userId,name,url,thumbUrl, createTime, location, desc, callback){
    var photo = new Photo();
    photo.user_id = userId;
    photo.name = name;
    photo.source_url = url;
    photo.location = location;
    photo.description = desc;
    photo.thumbnail_url = thumbUrl;
   // photo.isPublic = isPublic;
    //photo.tags = tags;
    photo.create_at = createTime;
    photo.save(callback);
}

/**
 * 创建图片信息，添加tag等
 * @param userId
 * @param photoId
 * @param tags
 * @param createTime
 * @param callback
 */
exports.createNewPhotoInfo = function(userId, photoId, tags, createTime, isPublic, callback){
    var photoInfo = new PhotoInfo();
    photoInfo.author_id = userId;
    photoInfo.photo_id = photoId;
    photoInfo.tags = tags;
    photoInfo.post_at = createTime;
    photoInfo.isPublic = isPublic;
    photoInfo.save(callback);
}

/**
 * 添加点赞信息
 * @param userId     点赞的人
 * @param photoId    点赞的图片
 * @param likeTime   点赞的时间
 * @param callback
 */
exports.addLikePhotoInfo = function(userId, photoId, likeTime, callback){
    PhotoInfo.findOneAndUpdate({'photo_id':photoId},{
        $addToSet:{
           'like':{
               'like_at':likeTime,
               'liker_id':userId
           }
        }
    }, callback);
}

/**
 * 增加图片浏览计数
 * @param userId
 * @param photoId
 * @param visitTime
 * @param callback
 */
exports.addVisitPhotoInfo = function(userId, photoId, visitTime, callback){

    PhotoInfo.findOneAndUpdate({
        'photo_id':photoId,
        'visit.visiter_id' : userId
    },{
        $set:{
            "visit.$.visit_at" : visitTime
        },
        $inc:{
            "visit.$.visit_count" : 1
        }
    },function(err,doc){

        if(err){
            return callback(err,null);
        }

        if(!doc){
             PhotoInfo.findOneAndUpdate({'photo_id':photoId},{
                $addToSet:{
                    'visit':{
                        'visit_at':visitTime,
                        'visiter_id':userId ,
                        'visit_count' : 1
                    }
                }
            },callback)
        }else{
            return callback(null, doc);
        }
    });

//    PhotoInfo.findOneAndUpdate({'photo_id':photoId},{
//        $addToSet:{
//            'visit':{
//                'visit_at':visitTime,
//                'visiter_id':userId
//            }
//        }
//    }, callback);
}

/**
 * 取消点赞后触发
 * @param userId
 * @param photoId
 * @param callback
 */
exports.removeLikePhotoInfo = function(userId, photoId, callback){
    PhotoInfo.findOneAndUpdate({'photo_id':photoId}, {'$pull':{'like':{'liker_id':userId}}}).exec(callback);
}

/**
 * 添加转发信息
 * @param userId        转发的人
 * @param photoId       转发的图片
 * @param forwardText   转发的文字
 * @param forwardTime   转发的时间
 * @param callback
 */
exports.addForwardPhotoInfo = function(userId, photoId, forwardText, forwardTime, type, callback){
    PhotoInfo.findOneAndUpdate({'photo_id':photoId},{
        $addToSet:{
            'forward':{
                'forwarder_id':userId,
                'forward_text':forwardText,
                'forward_from' : type,
                'forward_at':forwardTime
            }
        }
    }, callback);
}


/**
 * 获取图片的标签
 * @param photoId
 * @param callback
 */
exports.getPhotoTags = function(photoId, callback){
    PhotoInfo.findOne({'photo_id':photoId},'tags', callback);
}


/**
 * 通过提供的用户ID组统计所有标签数
 * @param Ids
 * @param callback
 */
exports.countTagsByUserIds = function(Ids,callback){
    var o = {};
    o.map = function(){
        var arr = [];
        if(typeof(this.tags) === 'string')
            arr =   this.tags.split(',');
        else
            arr = this.tags;
        arr.forEach(function(value){
            emit(value,{count:1});
        })
    }
    o.reduce = function(k, vals){
        var total = 0;
        for ( var i=0; i<vals.length; i++ )
            total += vals[i].count;
        return { count : total };
    }
    //只提取出属于该用户发布和分享的
  //  o.query = {$and : [{'user_id':{$in:Ids}},{$or:[{'post_at' : {$ne:null}},{'share_at':{$ne:null}}]}]};
    o.query = {$or : [{'author_id':{$in:Ids}},{'forward.forwarder_id':{$in:Ids}}]};

    PhotoInfo.mapReduce(o,callback);
}

/**
 * 将所用标签降序排列
 * @param authorId
 * @param callback
 */
exports.getMyFavirouteTags = function(authorId,filterList,limit, callback){
        PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{
                '_id.author' : authorId,
                '_id.tag' : {$nin: filterList}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    )
}

/**
 * 获取直接好友的常用标签
 * @param friendList
 * @param callback
 */
exports.getMyFriendsFavirouteTags = function(friendList,filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tags:'$tags',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.author' : {$in:friendList}},
                {'_id.tags' : {$nin: filterList}}
            ]
            }
        },
        {
           $group:{
               _id:{
                   tag:'$_id.tags'
               },
               count:{$sum:'$count'}
           }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    )
}

/**
 * 获取二维朋友的常用标签
 * @param friendList
 * @param callback
 */
exports.getTwoDimensionFavirouteTags = function(authorId, friendList, filterList,limit, callback){
        PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {$unwind:'$forward'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    forwarder:'$forward.forwarder_id',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.tag' : {$nin:filterList}},
                { '_id.author' : {$ne:authorId}},
                { '_id.author' : {$nin:friendList}},
                { '_id.forwarder' : {$in:friendList}}
            ]
            }
        },{
           $group:{
               _id:'$_id.tag',
               count:{$sum:'$count'}
           }
        },
         {
             $sort:{'count':-1}
         },
         {
             $limit:limit
         },
        callback
    );
}

/**
 * 获取陌生人最喜欢的标签
 * @param authorId
 * @param friendList
 * @param filterList
 * @param limit
 * @param callback
 */
exports.getStrangerFavoriteTags = function(authorId, friendList, filterList,limit, callback){
        PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    forwarder:'$forward.forwarder_id',
                    author:'$author_id'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{ $and:[
                { '_id.tag' : {$nin:filterList}},
                { '_id.author' : {$ne:authorId}},
                { '_id.author' : {$nin:friendList}},
                { '_id.forwarder' : {$nin:friendList}}
            ]
            }
        },{
            $group:{
                _id:{tag:'$_id.tag'},
                count:{$sum:'$count'}
            }
        },
        {
            $sort:{'count':-1}
        },
        {
            $limit:limit
        },
        callback
    );
}

/**
 * 获取最新的标签
 * @param filterList
 * @param limit
 * @param callback
 */
exports.getLatestTags = function(filterList,limit, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags',
                    date:'$post_at'
                }
            }
        },
        {
            $sort:{'date':-1}
        },
        {
            $match:{
                '_id.tag' : {$nin:filterList}
            }
        },
        {
            $limit:limit
        },
       callback
    )
}

/**
 * 统计所有标签
 * @param tags
 * @param callback
 */
exports.countTags = function(tags, callback){
    PhotoInfo.aggregate(
        {$unwind:'$tags'},
        {
            $group:{
                _id:{
                    tag:'$tags'
                },
                count:{$sum:1}
            }
        },
        {
            $match:{
                '_id.tag' : {$in:tags}
            }
        },
        callback
    )
}

/**
 * 获取标签的封面
 * @param tagName
 * @param callback
 */
exports.getCoverForTag = function(tagName, callback){
    PhotoInfo.findOne({'tags':{$all:tagName}}).populate('photo_id').exec(callback);
}



/**
 * 添加回复评论
 * @param photoId
 * @param callback
 */
exports.increaseCommentCount = function(photoId, callback){
    PhotoInfo.findOneAndUpdate({'photo_id':photoId}, {$inc:{'reply_count' : 1}}, callback);
}


/**
 * 统计赞过的图片数
 * @param userId
 * @param callback
 */
exports.countLikePhotos = function(userId, callback){
    var query = {'like.liker_id':userId};
    PhotoInfo.count(query, callback);
}

/**
 * 统计发表的图片数目
 * @param userId
 * @param callback
 */
exports.countPhotos = function(userId, callback){
    var query = {'author_id':userId};
    PhotoInfo.count(query, callback);
}


/**
 * 获取用户的所有的标签
 * @param userId
 * @param callback
 */
exports.getUserAllTag = function(userId, callback){
    var o = {};
    o.map = function(){
        var arr = [];
        if(typeof(this.tags) === 'string')
            arr =   this.tags.split(',');
        else
            arr = this.tags;
        arr.forEach(function(value){
            emit(value,{count:1});
        })
    }
    o.reduce = function(k, vals){
        var total = 0;
        var photoList = [];
        for ( var i=0; i<vals.length; i++ ){
            total += vals[i].count;
        }
        return { count : total };
    }
    o.query = {'author_id':userId};

    PhotoInfo.mapReduce(o,callback);
}

/**
 * 获取用于展示tag的图片,目前使用最新三张层叠显示
 * @param userId
 * @param tagName
 * @param callback
 */
exports.getTagOnShowPhotos = function(userId, tagName, callback){
    var query = {'author_id':userId, 'tags':{$all:tagName}};

    PhotoInfo.find(query).sort({'post_at':'desc'}).limit(3).populate('photo_id').exec(callback);

}

/**
 * 获取个人相册中的对应tag图片
 * @param userId
 * @param tagName
 * @param page
 * @param size
 * @param callback
 */
exports.getPhotosByTag = function(userId, tagName, page, size, callback){
    var query = {'author_id':userId, 'tags':{$all:tagName}};

    PhotoInfo.find(query).populate('photo_id visit.visiter_id')
        .skip(page*size)
        .limit(size)
        .exec(callback);
}

/**
 * 获取某个时间段内的标签里的图片信息
 * @param userId
 * @param tagName
 * @param startDate
 * @param endDate
 * @param size
 * @param callback
 */
exports.getSegementPhotosByTag = function(userId, tagName, startDate, endDate, size, callback){
    var query = {'author_id':userId,'tags':{$all:tagName},'post_at':{$gte: startDate, $lte:endDate}};

    PhotoInfo.find(query).populate('photo_id visit.visiter_id')
        .limit(size)
        .exec(callback);

}


/**
 * 统计某个时间段的标签下的图片数量
 * @param userId
 * @param tagName
 * @param startDate
 * @param endDate
 * @param size
 * @param callback
 */
exports.countSegementPhotosByTag = function(userId, tagName, startDate, endDate, callback){
    var query = {'author_id':userId,'tags':{$all:tagName},$and:[{'post_at':{$gte: startDate}},{'post_at':{$lte: endDate}}]};
    PhotoInfo.count(query, callback);
}

/**
 * 根据标签计数
 * @param userId
 * @param tagName
 * @param callback
 */
exports.countPhotosByTag = function(userId, tagName, callback){
    var query = {'author_id':userId, 'tags':{$all:tagName}};
    PhotoInfo.count(query, callback);
}


/**
 * 获取喜欢的图片列表
 * @param userId
 * @param page
 * @param size
 * @param callback
 */
exports.getLikePhotoList = function(userId, page, size, callback){
    var query = {'like.liker_id':userId};

    PhotoInfo.find(query).populate('author_id photo_id')
        .skip(page*size)
        .limit(size)
        .exec(callback);
}

/**
 * 根据图片ID获取图片信息
 * @param photoId
 * @param callback
 */
exports.getPhotoById = function(photoId, callback){
    Photo.findOneById(photoId, callback);
}

/**
 * 根据图片ID获取图片的关联信息并且填充图片基本i型奶昔
 * @param photoId
 * @param callback
 */
exports.getPhotoInfoById = function(photoId, callback){
   PhotoInfo.findOne({'photo_id':photoId}).populate('photo_id author_id like.liker_id visit.visiter_id').exec(callback);
}

/**
 * 查看是否赞过图片
 * @param userId
 * @param photoId
 * @param callback
 */
exports.checkIfLiked = function(userId, photoId, callback){
    PhotoInfo.findOne({'photo_id':photoId,'like.liker_id':userId}, callback);
}



/**
 * 根据标签获取首页的图片列表
 * @param Ids
 * @param tags
 * @param startDate
 * @param endDate
 * @param size
 * @param type
 * "latest"
 * "oldest"
 * "segment"
 * @param isXQ
 * true 表示新奇的内容
 * false 普通标签
 * @param callback
 */
exports.getUserIndexPhotosByTag = function(Ids, tags , startDate, endDate, size, type,isXQ, callback){

    var query = {};
    if(type == labels.Latest){
        query = queryStringBuilder.buildLatestPhotosQuery(Ids, tags, startDate, isXQ);
    }else if(type == labels.Oldest){
        query = queryStringBuilder.buildOldestPhotosQuery(Ids, tags, startDate, isXQ);
    }else if(type == labels.Segment){
        query = queryStringBuilder.buildSegmentPhotosQuery(Ids, tags, startDate, endDate, isXQ);
    }

    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
        .limit(size)
        .exec(callback);
}

/**
 * 根据标签获取首页的图片列表数目
 * @param Ids
 * @param tags
 * @param startDate
 * @param endDate
 * @param size
 * @param type
 * "latest"
 * "oldest"
 * "segment"
 * @param isXQ
 * true 表示新奇的内容
 * false 普通标签
 * @param callback
 */
exports.getUserIndexPhotosCountByTag = function(Ids, tags , startDate, endDate, size, type,isXQ, callback){

    var query = {};
    if(type == labels.Latest){
        query = queryStringBuilder.buildLatestPhotosQuery(Ids, tags, startDate, isXQ);
    }else if(type == labels.Oldest){
        query = queryStringBuilder.buildOldestPhotosQuery(Ids, tags, startDate, isXQ);
    }else if(type == labels.Segment){
        query = queryStringBuilder.buildSegmentPhotosQuery(Ids, tags, startDate, endDate, isXQ);
    }

    PhotoInfo.count(query, callback);
}

//back up for old get photo logic
//todo remove after valid
///**
// * 获取新奇图片
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserXQOldestPhotosByTag = function(Ids, tagName, anchorTime, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$lt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//}
//
///**
// * 根据tag获取某个用户朋友圈的最新图片ID
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserLatestXQPhotosByTag = function(Ids, tagName, anchorTime, size, callback){
//
//
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$gt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//
//
//}
//
//
//
//
///**
// *  根据tag获取某个用户朋友圈的某个阶段的图片ID
// * @param Ids
// * @param tagName
// * @param startDate
// * @param endDate
// * @param size
// * @param callback
// */
//exports.getUserSegmentXQPhotosByTag = function(Ids, tagName, startDate,endDate, size, callback){
//
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{$and:[{'post_at':{$gte:startDate}},{'post_at':{$lte:endDate}}]}]},
//            {$and:[{'forward.forwarder_id' : {$in:Ids}},{$and:[{'forward.forward_at':{$gte:startDate}},{'forward.forward_at':{$lte:endDate}}]}]}]},
//        privacyQuery = {'isPublic':true};
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//
//}
//
//
///**
// * 获取过往的总数
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserOldestXQPhotoCount = function(Ids, tagName, anchorTime, size, callback){
//    //  var query = {$or:[{$and:[{'author_id':{$in:Ids}},{'tags':{$all:tagName}},{'post_at':{$lt: anchorTime}}]},{$and:[{'forward.forwarder_id':{$in:Ids}},{'tags':{$all:tagName}},{'forward.forward_at':{$lt: anchorTime}}]}]};
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$lt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query, callback);
//}
//
//
///**
// * 获取最新的总数
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserLatestXQPhotoCount  = function(Ids, tagName, anchorTime, size, callback){
//    // var query = {$or:[{$and:[{'author_id':{$in:Ids}},{'tags':{$all:tagName}},{'post_at':{$gt: anchorTime}}]},{$and:[{'forward.forwarder_id':{$in:Ids}},{'tags':{$all:tagName}},{'forward.forward_at':{$gt: anchorTime}}]}]};
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$gt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query,callback);
//}
//
//
///**
// * 获取某个阶段的总数
// * @param Ids
// * @param tagName
// * @param startDate
// * @param endDate
// * @param size
// * @param callback
// */
//exports.getUserSegementXQPhotoCount = function(Ids, tagName, startDate,endDate, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{$and:[{'post_at':{$gte:startDate}},{'post_at':{$lte:endDate}}]}]},
//            {$and:[{'forward.forwarder_id' : {$in:Ids}},{$and:[{'forward.forward_at':{$gte:startDate}},{'forward.forward_at':{$lte:endDate}}]}]}]},
//        privacyQuery = {'isPublic':true};
//
//    if(tagName){
//        var tagQuery = {'tags':{$nin:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query, callback);
//}
//
///**
// * 根据tag获取某个用户朋友圈的过往图片ID
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserOldestPhotosByTag = function(Ids, tagName, anchorTime, size, callback){
//
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$lt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//}
//
///**
// * 根据tag获取某个用户朋友圈的最新图片ID
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserLatestPhotosByTag = function(Ids, tagName, anchorTime, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$gt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//
//
//}
//
///**
// *  根据tag获取某个用户朋友圈的某个阶段的图片ID
// * @param Ids
// * @param tagName
// * @param startDate
// * @param endDate
// * @param size
// * @param callback
// */
//exports.getUserSegmentPhotosByTag = function(Ids, tagName, startDate,endDate, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{$and:[{'post_at':{$gte:startDate}},{'post_at':{$lte:endDate}}]}]},
//            {$and:[{'forward.forwarder_id' : {$in:Ids}},{$and:[{'forward.forward_at':{$gte:startDate}},{'forward.forward_at':{$lte:endDate}}]}]}]},
//        privacyQuery = {'isPublic':true};
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.find(query).sort({'post_at':'desc'}).populate('photo_id author_id forward.forwarder_id')
//        .limit(size)
//        .exec(callback);
//
//}
//
//
///**
// * 获取过往的总数
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserOldestPhotoCount = function(Ids, tagName, anchorTime, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$lt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query, callback);
//}
//
//
///**
// * 获取最新的总数
// * @param Ids
// * @param tagName
// * @param anchorTime
// * @param size
// * @param callback
// */
//exports.getUserLatestPhotoCount  = function(Ids, tagName, anchorTime, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:Ids}},{'forward.forward_at':{$gt:anchorTime}}]}]},
//        privacyQuery = {'isPublic':true};
//
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query,callback);
//}
//
//
///**
// * 获取某个阶段的总数
// * @param Ids
// * @param tagName
// * @param startDate
// * @param endDate
// * @param size
// * @param callback
// */
//exports.getUserSegementPhotoCount = function(Ids, tagName, startDate,endDate, size, callback){
//    var query = {},
//        basicQuery = {$or:[{$and:[{'author_id':{$in:Ids}},{$and:[{'post_at':{$gte:startDate}},{'post_at':{$lte:endDate}}]}]},
//            {$and:[{'forward.forwarder_id' : {$in:Ids}},{$and:[{'forward.forward_at':{$gte:startDate}},{'forward.forward_at':{$lte:endDate}}]}]}]},
//        privacyQuery = {'isPublic':true};
//
//    if(tagName){
//        var tagQuery = {'tags':{$all:tagName}};
//        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
//    }else{
//        query  = {$and:[basicQuery, privacyQuery]};
//    }
//
//    PhotoInfo.count(query, callback);
//}






