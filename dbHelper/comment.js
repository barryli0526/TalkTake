var models = require('../models');
var Comment = models.Comment;


/**
 * 根据回复ID，获取回复
 * Callback:
 * - err, 数据库异常
 * - reply, 回复内容
 * @param {String} id 回复ID
 * @param {Function} callback 回调函数
 */
exports.findOnebyid = function (id, callback) {
  Comment.findOne({_id: id}, function (err, comment) {
    if (err) {
      return callback(err);
    }
    if (!reply) {
      return callback(err, null);
    }
    return callback(err, comment);
  });
};

/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} postId 主题ID
 * @param {String} authorId 回复作者
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (articleid, authorid, content , replyid, callback) {
  if (typeof replyid === 'function') {
    callback = replyid;
      replyid = null;
  }
  var comment = new Comment();
    comment.content = content;
    comment.article_id = articleid;
    comment.author_id = authorid;
  if (replyid) {
      comment.reply_id = replyid;
  }
    comment.save(callback);
};

/**
 * 根据用户Id查看评论
 * @param {ObjectId} authorId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getCommentsByAuthorId = function (authorId, callback) {
  exports.getCommentsByQuery({author_id:authorId},callback);
};

/**
 * 根据查询语句获取所有评论
 * @param {{article_id: ObjectId}} query  查询语句
 * @param {Function} callback 回调函数
 */
exports.getCommentsByQuery = function(query, callback){
	Comment.find(query).sort({create_at:'desc'}).exec(function(err, comments){
    if (err) {
      return callback(err);
    }
    
    if (comments.length === 0) {
      return callback(err, []);
    }
      return callback(null, comments);
    });
}

/**
 * 根据评论获取所有2级评论
 * @param {Function} callback 回调函数
 * @param {ObjectId} replyid
 */
exports.getReply2ByReplyId = function (replyid, callback) {
    exports.getCommentsByQuery({reply_id: replyid}, callback);
};

/**
 * 根据文章ID获取所有评论
 * @param {ObjectId} articleid 文章ID
 * @param {Function} callback 回调函数
 */
exports.getCommentsByArticleId = function(articleid, callback){
	exports.getCommentsByQuery({article_id: articleid},callback);
}

/**
 *获取最新的count条评论
 * @param {Int} count 获取的数目
 * @param {Function} callback  回掉函数
 */
exports.getLatestComents = function(count, callback){
    Comment.find({}).sort({date:'desc'}).limit(count).exec(function(err, comments){
        if(err){
            return callback(err,null);
        }else if(comments.length === 0){
            return callback(null, []);
        }else{
            return callback(null, comments);
        }
    })
}

exports.removeCommentsOfArticle = function(articleid, callback){
    Comment.remove({article_id:articleid}, callback);
}


exports.removeCommentsOfMultiArticles = function(articleIds, callback){
    Comment.remove({article_id:{$in:articleIds}}, callback);
}


//移除commentInfo


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
      Comment.findOne({comment_id: commentid}, function(err, comment){
        if(err || !comment){
            return callback(err, null);
        }else{
            if(typeof(comment[typeName]) === 'undefined'){
                comment[typeName] = 1;
            }else{
                comment[typeName] += 1;
            }
            comment.save(callback);
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
    Comment.findOne({comment_id:commentid}, function(err, comment){
        if(err || !comment){
            return callback(err, null);
        }else{
            if(!comment[typeName]){
                comment[typeName] = 0;
            }else{
            comment[typeName] -= 1;
            }
            comment.save(callback);
        }
    })
}

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