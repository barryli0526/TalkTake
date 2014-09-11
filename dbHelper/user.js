var models = require('../models');
var User = models.User;

/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
  User.findOne({'loginname': loginName}, callback);
};

exports.getUserByLoginInfo = function(loginname, pass, callback){
    User.findOne({loginname:loginname,pass:pass},callback);
}

exports.getUsersByNames = function(names, callback){
	 User.find({'nickname': {'$in': names}}, callback);
}

/**
 * 根据登录ID获取用户信息
 * @param loginID
 * @param callback
 */
exports.getUserByLoginID = function(loginID, callback){
    User.find({'login_id' : loginID}, callback);
}



/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};

/**
 * 根据用户名，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 用户名
 * @param {Function} callback 回调函数
 */
exports.getUserByName = function (name, callback) {
  User.findOne({name: name}, callback);
};

/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({'_id': {'$in': ids}}, callback);
};

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Object} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, callback) {
  User.find(query, callback);
};

exports.getOneByQuery = function(query, callback){
    User.findOne(query,callback);
}

/**
 * 根据id跟新用户属性
 * Callback:
 * - err, 数据库异常
 * - users, 更改后的用户
 * @param {objectid} id 
 * @param {json} data 更新的值{score:100}
 * @param {Function} callback 回调函数
 */
exports.UpdateUserProfileById = function(id, data, callback){
	exports.getUserById(id, function(err, user){
		if(err || !user){
			return callback(err,null);
		}

		for(var key in data){
			user[key] = data[key]
		}
		user.update_at = new Date();
		user.save(callback);
	});
}


exports.UpdateUserProfile  = function(user, data, callback){
    if(!user){
        return callback(new Error('参数为空'), null);
    }

    if(data.length === 0){
        return callback(null, user);
    }


    for(var key in data){
        user[key] = data[key]
    }
    user.update_at = new Date();
    user.save(callback);
}

exports.UpdateLoginTime = function(user){
    if(!user){
        return;
    }
    user.last_login_at = new Date();
  //  console.log(user.last_login_at);
   // user.active = true;
    user.save();
}


/**
 * 根据查询条件，删除一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} id 用户id
 * @param {Function} callback 回调函数
 */
exports.deleteAUser = function(id, callback){
	exports.getUserById(id, function(err, user){
		if(err || !user){
			return callback(err, null);
		}
		
		user.remove(callback);
		
	});
}

/**
 * 添加帖子数
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} id 用户id
 * @param {Booleadn} isRepost 是否是转发的帖子
 * @param {Function} callback 回调函数
 */
exports.addPostCount = function(id, isRepost, callback){
	
	exports.getUserById(id, function(err, user){
		if(err || !user){
			return callback(err, null);
		}
		
		user.post_count += 1;
		if(isRepost)
			user.repost_count += 1;
		user.save(callback);
		
	});
	
};

/**
 * 添加回复数
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} id 用户id
 * @param {Function} callback 回调函数
 */
exports.addReplyCount = function(id, callback){
	exports.getUserById(id, function(err, user){
		if(err || !user){
			return callback(err, null);
		}
		user.reply_count += 1;	
		user.save(callback);
	});
};

/**
 *  激活用户
 *  Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} id 用户id
 * @param {Function} callback 回调函数
 */
exports.activeUser = function(id, callback){
    exports.getUserById(id, function(err, user){
        if(err || !user){
            return callback(err, null);
        }
        user.active = true;
        user.save(callback);
    })
}

/*exports.newAndSave = function (nickname, loginname, pass, email, avatar_url, callback) {
  var user = new User();
  user.nickname = nickname;
  user.loginname = loginname;
  user.pass = pass;
  user.email = email;
  user.avatar = avatar_url;
  user.active = false;
  user.save(callback);
};*/

exports.newAndSave = function(data, callback){
    var user = new User();
    for(var i in data){
        user[i] = data[i];
    }
    if(!user.nickname)
    	user.nickname = user.loginname;

    user.active = true;//暂时不支持邮件激活，方便测试
    user.save(callback);
};
