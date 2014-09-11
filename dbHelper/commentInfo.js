var models = require('../models');
var CommentInfo = models.CommentInfo;
var Comment = models.Comment;



/*
 * 添加计数
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} userid 用户id
 * @param {String} typeName 如：post_count/reply_count/follower_count/following_count/collect_tag_count/collect_article_count
 * @param {Function} callback 回调函数
 * */

var addCount = function(commentid, typeName, callback){
    CommentInfo.findOne({comment_id: commentid}, function(err, commentinfo){
        if(err){
            return callback(err, null);
        }else if(!commentinfo){
            Comment.findOnebyid(commentid, function(err, comment){
                if(err || !comment){
                    return callback(err, null);
                }else{
                    var CommentInfo = new CommentInfo();
                    CommentInfo.article_id = commentid;
                    CommentInfo[typeName] = 1;
                    CommentInfo.save(callback);
                }

            })
        }else{
            articleinfo[typeName] += 1;
            articleinfo.save(callback);
        }
    })
}

/*
 * 减少计数
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {ObjectId} userid 用户id
 * @param {String} typeName 如：post_count/reply_count/follower_count/following_count/collect_tag_count/collect_article_count
 * @param {Function} callback 回调函数
 * */
var deleteCount = function(commentid, typeName, callback){
    CommentInfo.findOne({comment_id:commentid}, function(err, commentinfo){
        if(err || !commentinfo){
            return callback(err, null);
        }else{
            commentinfo[typeName] -= 1;
            commentinfo.save(callback);
        }
    })
}


/*
 * 以下6个函数分别为添加相应的计数函数
 * */

exports.addUpCount = function(commentid, callback){
    addCount(commentid,"up_count",callback);
}

exports.addDownCount = function(commentid, callback){
    addCount(commentid,"down_count",callback);
}

/*
 * 以下6个函数分别为减少相应的计数函数
 * */

exports.deleteUpCount = function(commentid, callback){
    deleteCount(commentid,"up_count",callback);
}

exports.deleteDownCount = function(commentid, callback){
    deleteCount(commentid,"down_count",callback);
}

exports.findOneById = function(commentid, callback){
    CommentInfo.findOne({comment_id:commentid}, callback);
}

exports.newAndSave = function(commentid, callback){
	var commentInfo = new CommentInfo();
	commentInfo.comment_id = commentid;
	commentInfo.save(callback);
}