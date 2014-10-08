var models = require('../models');
var labels = require('../config/base').labels;
var User = models.User;
var UserRelation = models.UserRelation;
var lms = require('../lib/LMS');


/**
 * 新建用户
 * @param uuid
 * @param callback
 */
exports.createNewUser = function(uuid, callback){
     var user = new User();
    user.uuid = uuid;
    user.avatar = labels.avatar;
    user.name = "";

    user.save(callback);
}

/**
 * 新建关联
 * @param followerId
 * @param uid
 * @param status
 * @param callback
 */
exports.createNewFollowRelation =  function(followId, uid, status, callback){
    var userRelation = new UserRelation();
    userRelation.user_id = uid;
    userRelation.follow_id = followId;
    userRelation.status = status;
    userRelation.save(callback);
}

/**
 * 查询某人与当前的关系
 * @param followId       被查询的用户
 * @param uid            当期用户
 * @param callback
 */
exports.getUserRelation = function(followId, uid, callback){
    UserRelation.findOne({'user_id':uid,'follow_id':followId}, callback);
}

/**
 * 关注
 * @param followId
 * @param uid
 * @param callback
 */
exports.addFollowRelation = function(followId, uid, callback){
    UserRelation.findOne({'user_id':uid,'follow_id':followId}, function(err, doc){
        if(err){
            return callback(err, []);
        }else if(!doc || doc.length == 0){
            var userRelation = new UserRelation();
            userRelation.user_id = uid;
            userRelation.follow_id = followId;
            userRelation.status = 2;
            userRelation.save(callback);
        }else{
            var newStatus = lms.analyzeRelation(doc.status, 'f');
            doc.status = newStatus;
            doc.save(callback);
        }
    });
}

/**
 * 被关注
 * @param followId
 * @param uid
 * @param callback
 */
exports.addbFollowedRelation = function(followId, uid, callback){
    UserRelation.findOne({'user_id':followId,'follow_id':uid}, function(err, doc){
        if(err){
            return callback(err, []);
        }else if(!doc || doc.length == 0){
            var userRelation = new UserRelation();
            userRelation.user_id = followId;
            userRelation.follow_id = uid;
            userRelation.status = 1;
            userRelation.save(callback);
        }else{
            var newStatus = lms.analyzeRelation(doc.status, 'bf');
            doc.status = newStatus;
            doc.save(callback);
        }
    });
}


/**
 * 取消关注
 * @param followId
 * @param uid
 * @param callback
 */
exports.removeFollowRelation = function(followId, uid, callback){
    UserRelation.findOne({'user_id':uid,'follow_id':followId}, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
            var newStatus = lms.analyzeRelation(doc.status, 'uf');
            doc.status = newStatus;
            doc.save(callback);
        }
    });
}

/**
 * 被取消关注
 * @param followId
 * @param uid
 * @param callback
 */
exports.removebFollowRelation = function(followId, uid, callback){
    UserRelation.findOne({'user_id':followId,'follow_id':uid}, function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err, []);
        }else{
            var newStatus = lms.analyzeRelation(doc.status, 'ubf');
            doc.status = newStatus;
            doc.save(callback);
        }
    });
}

/**
 * 添加好友
 * @param uid
 * @param friendId
 * @param firstName
 * @param lastName
 * @param callback
 */
exports.addFriends = function(uid, friendId, firstName, lastName, callback){
    UserRelation.findOne({'user_id':uid,'follow_id':friendId}, function(err, doc){
        if(err){
            return callback(err, []);
        }else if(!doc || doc.length == 0){
            var userRelation = new UserRelation();
            userRelation.user_id = uid;
            userRelation.follow_id = friendId;
            userRelation.status = 3;
            if(firstName){
                userRelation.remark_first_name = firstName;
            }
            if(lastName){
                userRelation.remark_second_name = lastName;
            }
            userRelation.save(callback);
        }else{
            var newStatus = 3;
            doc.status = newStatus;
            if(firstName){
                doc.remark_first_name = firstName;
            }
            if(lastName){
                doc.remark_second_name = lastName;
            }
            doc.save(callback);
        }
    });
}

/**
 * 获取用户信息
 * @param uid
 * @param callback
 */
exports.getUserDetailById = function(uid, callback){
    User.findOne({'_id':uid},callback);
}

/**
 * 通过id组获取用户信息
 * @param Ids
 * @param callback
 */
exports.getUserInfoByIds = function(Ids, callback){
    User.find({'_id':{$in:Ids}}, callback);
}

/**
 * 检查用户是否存在
 * @param uuid
 * @param sid
 * @param callback
 */
exports.checkIfExist = function(uuid, sid, callback){
    User.findOne({'_id':sid,'uuid':uuid}, callback);
}


/**
 * 获取当前用户的粉丝
 * @param uid         当前用户的ID
 * @param page        当前页
 * @param size        限制大小
 * @param callback
 */
exports.getUserFollowers = function(uid, page, size, callback){
    UserRelation.find({'user_id' : uid,$or:[{'status':1},{'status':3}]})
        .skip(page*size)
        .limit(size)
        .exec(callback);
}

/**
 * 获取当前用户的偶像
 * @param uid
 * @param page
 * @param size
 * @param callback
 */
exports.getUserFollowings = function(uid, page, size, callback){
    UserRelation.find({'user_id' : uid,$or:[{'status':2},{'status':3}]})
        .skip(page*size)
        .limit(size)
        .exec(callback);
}


/**
 * 获取纯关注用户的信息
 * @param uid
 * @param callback
 */
exports.getUserFollowingsExceptFriends = function(uid, callback){
    UserRelation.find({'user_id':uid,'status':2},'follow_id').exec(callback);
}

//获取当前用户的好友
exports.getUserFriends = function(uid, callback){
    UserRelation.find({'user_id':uid,'status' : 3}, callback);
}

/**
 * 获取当前用户的所有好友ID
 * @param uid
 * @param callback
 */
exports.getUserFriendsId = function(uid, callback){
    UserRelation.find({'user_id':uid,'status' : 3},'follow_id', callback);
}

/**
 * 获取当前用户的所有好友ID和昵称
 * @param uid
 * @param callback
 */
exports.getUserFriendsIdAndNickName = function(uid, callback){
    UserRelation.find({'user_id':uid,'status' : 3},'follow_id remark_first_name remark_second_name', callback);
}

//通过电话和姓名检索用户是否存在
exports.checkUserByNameAndPhone = function(phoneNumber, firstName, lastName, callback){

    User.findOne({$or:[{'telephone':phoneNumber, $and : [{'firstName':firstName,'lastName':lastName}]}]}, callback);
  //  User.findOne({$or:[{'telephone':phoneNumber}, {'first_name':firstName}]}, callback);
   // User.findOne({'first_name':firstName}, callback);
}


/**
 * 检查是否关注followId
 * @param uid
 * @param followId
 * @param callback
 */
exports.checkIsFollow = function(uid, followId, callback){
   User.findOne({'user_id':uid, 'follow_id':followId},'isFollowing', function(err, doc){
       if(err || !doc || doc.length == 0){
           return callback(err,false);
       }else{
           return callback(null, doc.isFollowing);
       }
   })
}

exports.getRelationInfo = function(uid, followId, callback){
    User.findOne({'user_id':uid, 'follow_id':followId},'isFollowing remark_name', function(err, doc){
        if(err || !doc || doc.length == 0){
            return callback(err,false);
        }else{
            return callback(null, doc);
        }
    })
}

/**
 * 统计关注的人数
 * @param uid
 * @param callback
 */
exports.countFollowing = function(uid, callback){
    var query = {'user_id' : uid,$or:[{'status':2},{'status':3}]};
    UserRelation.count(query, callback);
}

/**
 * 统计粉丝人数
 * @param uid
 * @param callback
 */
exports.countFollower = function(uid, callback){
    var query = {'user_id' : uid,$or:[{'status':1},{'status':3}]};
    UserRelation.count(query, callback);
}


/**
 * 更新用户信息
 * @param uid
 * @param data
 * @param callback
 */
exports.updateUserProfile = function(uid, data, callback){
    User.findOne({'_id':uid}, function(err, doc){
        if(err){
            return callback(err,[]);
        }else{
            data.nickName ? doc.nick_name = data.nickName : null;
            data.firstName ? doc.first_name = data.firstName : null;
            data.lastName ? doc.second_name = data.lastName : null;
            data.mobilePhone ? doc.telephone = data.mobilePhone : null;
            data.sex ? doc.sex = data.sex : null;
            if(data.location){
                data.location.country ? doc.address.country = data.location.country : null;
                data.location.city ? doc.address.city = data.location.city : null;
                data.location.county ? doc.address.county = data.location.county : null;
            }
            data.constellation ? doc.constellation = data.constellation : null;
            data.selfDesc ? doc.selfDesc = data.selfDesc : null;
            data.qrCode ? doc.qr_code = data.qrCode : null;
            data.privacy ? doc.privacy = data.privacy : null;
            doc.save(callback);
        }
    })
}

exports.testCreateUser = function(doc, callback){
    var user = new User();
    user.uuid = doc.uuid;
    user.first_name = doc.first_name;
    user.seconde_name = doc.seconde_name;
    user.telephone = doc.telephone;
    user.save(callback);
}

/**
 * 测试
 */
exports.deleteAll = function(){
    User.remove().exec();
    UserRelation.remove().exec();
}

