//var dbHelper = require('../dbHelper');
//var User = dbHelper.User;
//var UserInfo = dbHelper.UserInfo;
//var Message = require('../config/message').Message;
//var labels = require('../config/labels').labels;
//var EventProxy = require('EventProxy');
var util = require('../lib/util');
var lms = require('../lib/LMS');
var config = require('../config/base').config;
var labels = require('../config/base').labels;

var sampleData = require('../Sample/photos');

var dbHelper = require('../dbHelper');
var User = dbHelper.User;
var Photo = dbHelper.Photo;

var ObjectId = require('mongoose').Types.ObjectId;
var EventProxy = require('eventproxy');
var TagService = require('./TagService');


/**
 * user sign in
 * @param loginname
 * @param pass
 * @param callback
 * @constructor
 */
exports.SignIn = function(sid, uuid, callback){

    if(typeof sid === 'string'){
        sid = new ObjectId(sid);
    }

    User.checkIfExist(uuid, sid, callback);
}

/**
 * 创建一个新的客户端
 * @param uuid
 * @param callback
 */
exports.createClient = function(uuid, callback){
    User.getUserByUUID(uuid, function(err, doc){
        if(err){
            return callback(err,{});
        }else if(!doc){
            User.createNewUser(uuid, function(err,doc){
                if(err || !doc || doc.length == 0){
                    return callback(err, {});
                }else{
                    return callback(null, {userId:doc._id});
                }
            })
        }else{
            return callback(null, {userId : doc._id});
        }
    })

}

/**
 * 关注用户
 * @param followerId
 * @param uid
 * @param callback
 * @constructor
 */
exports.FollowUser = function(followerId, uid, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof followerId === 'string'){
        followerId = new ObjectId(followerId);
    }

    //更新被关注者的状态表
    User.addbFollowedRelation(followerId, uid,function(err,doc){
        //do nothing
    })

    //更新主动关注者的状态表
    User.addFollowRelation(followerId, uid, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
            return callback(null,doc);
        }
    })
}

/**
 * 取消关注
 * @param unFollowerId
 * @param uid
 * @param callback
 * @constructor
 */
exports.UnFollowUser = function(unFollowerId, uid, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(typeof unFollowerId === 'string'){
        unFollowerId = new ObjectId(unFollowerId);
    }

    User.removebFollowRelation(unFollowerId, uid, function(err, doc){
        //do nothing
    })

    User.removeFollowRelation(unFollowerId, uid, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
            return callback(null,doc);
        }
    })
}

/**
 * 获取用户个人信息
 * @param uid
 * @param callback
 */
exports.getUserDetail = function(uid,select, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }
    var proxy = new EventProxy(),
        events = ['user','followingCount','followerCount','likeCount','photoCount','Album'],
        userInfo = {};
    proxy.assign(events, function(user,followingCount, followerCount, likeCount, photoCount, Album){
        var firstName = user.first_name ? user.first_name : '',
            secondName = user.second_name ? user.second_name : '';
        userInfo.userId = user._id;
        userInfo.name = user.showName;
        user.sex ? userInfo.sex = user.sex : null;
        user.constellation ? userInfo.constellation = user.constellation : null;
        user.selfDesc ?  userInfo.selfDesc = user.selfDesc  : null;
        user.siteUrl ? userInfo.siteUrl = user.siteUrl: null;
        user.location ? userInfo.location = user.location : null;
        user.avatar ?  userInfo.avatar = user.avatar: null;
      //  userInfo.isFollowing = '';
        photoCount ? userInfo.photoCount = photoCount : null;
        followingCount ? userInfo.followingCount = followingCount : null;
        followerCount ? userInfo.followerCount = followerCount : null;
        likeCount ? userInfo.likedCount = likeCount : null;
        Album ? userInfo.album = Album : null;

        return callback(null, userInfo);
    }).fail(callback);

    (select['user'] || select['all']) ?  User.getUserDetailById(uid, proxy.done('user')) : proxy.emit('user', {});
    (select['followingCount'] || select['all']) ?User.countFollowing(uid, proxy.done('followingCount')) : proxy.emit('followingCount', null);
    (select['followerCount'] || select['all']) ? User.countFollower(uid, proxy.done('followerCount')) : proxy.emit('followerCount', null);
    (select['likeCount'] || select['all']) ? Photo.countLikePhotos(uid, proxy.done('likeCount')) : proxy.emit('likeCount', null);
    (select['photoCount'] || select['all']) ? Photo.countPhotos(uid, proxy.done('photoCount')) : proxy.emit('photoCount', null);
    (select['album'] || select['all']) ? TagService.getAlbumInfo(uid, proxy.done('Album')) : proxy.emit('Album', null);

//    User.countFollowing(uid, proxy.done('followingCount'));
//    User.countFollower(uid, proxy.done('followerCount'));
//    Photo.countLikePhotos(uid, proxy.done('likeCount'));
//    Photo.countPhotos(uid, proxy.done('photoCount'));
//
//    TagService.getAlbumInfo(uid, proxy.done('Album'));
//    return callback(null, sampleData.userInfo);
}


/**
 * 获取所有的关注列表
 * @param uid
 * @param page
 * @param size
 * @param callback
 */
exports.getAllFollowingUser = function(uid, page, size, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    var proxy = new EventProxy(),
        events = ['followingUsers','count'];
    proxy.assign(events, function(followingUsers, count){
        var count = count - (page+1) * size;
        count = count >=0 ? count : 0;
        return callback(null,{
            remain:count,
            items:followingUsers
        });
    }).fail(callback);

    User.getUserFollowings(uid, page, size, function(err, docs){
        if(err || docs.length == 0){
            return callback(err,[]);
        }else{
            var users = [], Ids = [];
            for(var i=0;i<docs.length;i++){
                users[i] = {};
                users[i].userId = docs[i].follow_id;
                Ids[i] = docs[i].follow_id;
                users[i].name = docs[i].remark_name;
            }
            User.getUserInfoByIds(Ids, function(err, results){
                if(err || users.length == 0){
                    return callback(err,[]);
                }else{
                    for(var i=0; i< results.length;i++){
                        if(!users[i].name){
                            users[i].name = results[i].showName;
                        }
                        results[i].avatar ? users[i].avatar = results[i].avatar : null;
                    }
                    proxy.emit('followingUsers', users);
                }
            })

        }
    })

    User.countFollowing(uid, proxy.done('count'));


  //  return callback(null, sampleData.followingList);
}


/**
 * 获取所有粉丝列表
 * @param uid
 * @param page
 * @param size
 * @param callback
 */
exports.getAllFollowerUser = function(uid, page, size, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    var proxy = new EventProxy(),
        events = ['followerUsers','count'];
    proxy.assign(events, function(followerUsers, count){
        var count = count - (page+1) * size;
        count = count >=0 ? count : 0;
        return callback(null,{
            remain:count,
            items:followerUsers
        });
    }).fail(callback);

    User.getUserFollowers(uid, page, size, function(err, docs){
        if(err || docs.length == 0){
            return callback(err,[]);
        }else{
            var users = [], Ids = [];
            for(var i=0;i<docs.length;i++){
                users[i] = {};
                users[i].userId = docs[i].follow_id;
                if(docs[i].status == 3){
                    users[i].isFollowing = true;
                }else{
                    users[i].isFollowing = false;
                }
                users[i].name = docs[i].remark_name;
                Ids[i] = docs[i].follow_id;
            }
            User.getUserInfoByIds(Ids, function(err, results){
                if(err || users.length == 0){
                    return callback(err,[]);
                }else{
                    for(var i=0; i< results.length;i++){
                        if(!users[i].name){
                            users[i].name = results[i].showName;
                        }
                        results[i].avatar ? users[i].avatar = results[i].avatar : null;
                    }
                    proxy.emit('followerUsers', users);
                }
            })
        }
    })

    User.countFollower(uid, proxy.done('count'));

   // return callback(null, sampleData.followerList);
}

/**
 * 获取所有的好友
 * @param uid
 * @param callback
 */
exports.getAllFriends = function(uid, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    User.getUserFriends(uid,function(err, docs){
        if(err || docs.length == 0){
            return callback(err,[]);
        }else{

            var users = [], Ids = [];
            for(var i=0;i<docs.length;i++){
                users[i] = {};
                users[i].userId = docs[i].follow_id;
                Ids[i] = docs[i].follow_id;
                var firstName = docs[i].remark_first_name ? docs[i].remark_first_name : '',
                    lastName = docs[i].remark_second_name ? docs[i].remark_second_name : '';
                users[i].name = firstName + lastName;
            }
            User.getUserInfoByIds(Ids, function(err, results){
                if(err || users.length == 0){
                    return callback(err,[]);
                }else{
                    for(var i=0; i< results.length;i++){
                        if(!users[i].name){
//                            var firstName =   results[i].first_name ?  results[i].first_name : '',
//                                lastName = results[i].second_name ? results[i].second_name : '';
                            users[i].name = results[i].showName;
                        }
                        results[i].avatar ? users[i].avatar = results[i].avatar : null;
                        results[i].telephone ? users[i].telephone = results[i].telephone : null;
                    }
                    return callback(err, users);
                }
            })

        }
    })
}


/**
 * 获取所有喜欢的图片列表
 * @param uid
 * @param page
 * @param size
 * @param callback
 */
exports.getAllLikedPhotoList = function(uid,page,size, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    var proxy = new EventProxy(),
        events = ['photos','count'];


    proxy.assign(events, function(photos, count){
        var count = count - (page+1) * size;
        count = count >=0 ? count : 0;
        return callback(null,{
            remain:count,
            items:photos
        });
    }).fail(callback);

    Photo.getLikePhotoList(uid, page, size, function(err, docs){

        if(err){
            return callback(err,[]);
        }else{

            var results = [];

            proxy.after('photo_ready', docs.length, function(){
                    proxy.emit('photos',results);
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
//                var firstName = user.first_name ? user.first_name : '',
//                    lastName = user.second_name ? user.second_name : '';
                results[i].uploader.name  = user.showName;
                proxy.emit('photo_ready');
            })
        }
    })

    Photo.countLikePhotos(uid, proxy.done('count'));

    //return callback(null, sampleData.likedList);
}


/**
 * 导入通讯录
 * @param uid
 * @param users
 * @param callback
 * @returns {*}
 * @constructor
 */
exports.HandleContactsRelation = function(uid, users, callback){

    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    if(!users || users.length == 0){
        return callback(null,[]);
    }


    var proxy = new EventProxy(),
         relations = [];

    proxy.after('relation_ready', users.length, function(){
        return callback(null, relations);
    }).fail(callback);

    var phoneObject = {};
//    for(var k=0;k<users.length;k++){
//        var phoneNumber = users[k].phoneNumber[0];
//        if(phoneNumber){
//            if(phoneNumber.indexOf('-') != -1){
//                users[k].syncPhone = phoneNumber ? phoneNumber.slice(phoneNumber.length-13,phoneNumber) : null;
//            }else{
//                users[k].syncPhone = phoneNumber ? phoneNumber.slice(phoneNumber.length-11,phoneNumber) : null;
//            }
//            phoneObject[users[k].syncPhone] = true;
//        }
//    }

    for(var k=0;k<users.length;k++){
        users[k].syncPhones = [];
        for(var j= 0,len=users[k].phoneNumber ? users[k].phoneNumber.length : 0; j< len ; j++){
            var phoneNumber = users[k].phoneNumber[j];
            if(phoneNumber){
                phoneNumber = phoneNumber.replace(/-/g,'');
                phoneNumber = phoneNumber.slice(phoneNumber.length-11, phoneNumber);
            }
            users[k].syncPhones[j] = phoneNumber;

            phoneObject[phoneNumber] = true;
        }
    }

    users.forEach(function(user, i){

        User.checkUserByNameAndPhones(user.syncPhones, user.lastName, user.firstName, function(err, doc){
            if(err){
               return proxy.emit('error');

            }else if(!doc || doc.length == 0){
                relations[i] = {};
                relations[i].userId = uid;
                relations[i].friendsId = null;
                relations[i].relationLevel = 0;   //无法在使用人群中找到好友
                proxy.emit('relation_ready');
            }else{
                if(doc.telephone && phoneObject[doc.telephone]/*doc.telephone == user.syncPhone*/){
                    User.addFriends(uid, doc._id,user.lastName, user.firstName,function(){});
                    User.addFriends(doc._id, uid,'','',function(){});
                    relations[i] = {};
                    relations[i].userId = uid;
                    relations[i].friendsId = doc._id;
                    relations[i].relationLevel = 3;   //已经成为用户
                    proxy.emit('relation_ready');
                }else{
                    relations[i] = {};
                    relations[i].userId = uid;
                    relations[i].friendsId = doc._id;

                    var friendsCount = 0;

                    exports.getAllFriends(doc._id, function(err, docs){
                        for(var j=0;j<docs.length;j++){
                            if(phoneObject[docs[j].telephone])
                                friendsCount++;
                        }
                        if(friendsCount >= 1){
                            relations[i].relationLevel = 2; //推荐用户
                            relations[i].jointlyFriendsCount = friendsCount; //共同好友数 ,只有在确定不了好友关系下会返回这个值
                        }else{
                            relations[i].relationLevel = 1; //无共同好友，但是存在同名的好友，不推荐用户
                            relations[i].jointlyFriendsCount = 0; //共同好友数
                        }
                        proxy.emit('relation_ready');
                    })

                }

            }
        })
    })
}


/**
 * 更新用户信息
 * @param uid
 * @param data
 * @param callback
 */
exports.updateUserProfile = function(uid, data, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    User.updateUserProfile(uid, data, callback);
}

//exports.setAvatar = function(uid, avatar, callback){
//    if(typeof uid === 'string'){
//        uid = new ObjectId(uid);
//    }
//    User.setAvatar(uid, avatar, callback);
//}

/**
 * 获取个人设置信息
 * @param uid
 * @param callback
 */
exports.getUserSetting = function(uid, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    User.getUserSetting(uid, function(err, doc){
        if(err){
            return callback(err,{});
        }else{
            var user = {};
            user.avatar = doc.avatar;
            user.nickName = doc.nick_name;
            user.firstName = doc.first_name;
            user.lastName = doc.second_name;
            user.mobilePhone = doc.telephone;
            user.sex = doc.sex;
            user.location = doc.location;
            user.constellation = doc.constellation;
            user.selfDesc = doc.selfDesc;
            user.qrCode = doc.qr_code;
            user.privacy = doc.privacy;
            return callback(null, user);
        }
    })

}


/**
 * 根据目录获取照片
 * @param uid
 * @param tagName
 * @param page
 * @param size
 * @param callback
 */
exports.getPhotosByAlbumInfo = function(uid, tagName, page, size, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }

    var proxy = new EventProxy(),
        events = ['photos','count'];

    proxy.assign(events, function(photos, count){
        var count = count - (page+1)*size;
        count = (count > 0) ? count : 0;
        return callback(null,{
            remain:count,
            items:photos
        });
    }).fail(callback);

    Photo.getPhotosByTag(uid, tagName, page, size, function(err, docs){
        var results = [];
        if(docs.length <=0){
            return proxy.emit('photos',results);
        }else{
            proxy.after('photo_ready', docs.length, function(){
                proxy.emit('photos', results);
            }).fail(callback);

            docs.forEach(function(doc, i){
                results[i] = {};
                var photo = doc.photo_id;
                results[i].photoId = photo._id;
                results[i].photoUrl = photo.source_url;
                if(config.qnConfig.compress){
                    results[i].photoUrl += config.qnConfig.quality;
                }
                results[i].upCount = doc.like ? doc.like.length : 0;
                results[i].commentCount = doc.reply_count;
                photo.location ? results[i].location = photo.location : null;
                results[i].uploadTime = util.getDateTime(photo.create_at);
                photo.description ? results[i].description = photo.description : null;
                proxy.emit('photo_ready');
            })
        }
    })

    Photo.countPhotosByTag(uid, tagName, proxy.done('count'));
}


/**
 * 获取某个时间段内里目录里的图片信息
 * @param uid
 * @param tagName
 * @param startDate
 * @param endDate
 * @param size
 * @param callback
 */
exports.getSegementPhotosByAlbumInfo = function(uid, tagName, startDate, endDate, size, callback){
    if(typeof uid === 'string'){
        uid = new ObjectId(uid);
    }


    if(typeof startDate == 'string'){
        startDate = new Date(startDate);
    }

    if(typeof endDate == 'string'){
        endDate = new Date(endDate);
    }

    var proxy = new EventProxy(),
        events = ['photos','count'];
    proxy.assign(events, function(photos, count){
        var count = count - photos.length;
        count = (count > 0) ? count : 0;
        return callback(null,{
            remain:count,
            items:photos
        });
    }).fail(callback);

    Photo.getSegementPhotosByTag(uid, tagName, startDate, endDate, size, function(err, docs){
        var results = [];

        if(docs.length <=0){
             proxy.emit('photos',results);
        }else{
            proxy.after('photo_ready', docs.length, function(){
                proxy.emit('photos', results);
            }).fail(callback);

            docs.forEach(function(doc, i){
                results[i] = {};
                var photo = doc.photo_id;
                results[i].photoId = photo._id;
                results[i].photoUrl = photo.source_url;
                if(config.qnConfig.compress){
                    results[i].photoUrl += config.qnConfig.quality;
                }
                results[i].upCount = doc.like ? doc.like.length : 0;
                results[i].commentCount = doc.reply_count;
                photo.location ? results[i].location = photo.location : null;
                results[i].uploadTime = util.getDateTime(doc.post_at);
                photo.description ? results[i].description = photo.description : null;
                proxy.emit('photo_ready');
            })
        }
    })

    Photo.countSegementPhotosByTag(uid, tagName, startDate, endDate, proxy.done('count'));
}