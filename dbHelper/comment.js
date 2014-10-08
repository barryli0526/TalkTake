var models = require('../models');
var Comment = models.Comment;


/**
 *新增评论
 * @param userId
 * @param photoId
 * @param data
 * @param callback
 */
exports.newAndSave = function(userId, photoId, data, callback){
    var comment = new Comment();
    comment.author_id = userId;
    comment.photo_id = photoId;
    comment.content = data.comment;
    comment.create_at = data.replyTime;
    comment.save(callback);
}


/**
 * 获取评论
 * @param photoId
 * @param page
 * @param size
 * @param callback
 */
exports.getCommentsByPhotoId = function(photoId, page, size, callback){
    Comment.find({'photo_id': photoId})
            .skip(page*size)
            .limit(size)
            .populate('author_id')
            .exec(callback);
}

/**
 * 获取评论总数
 * @param photoId
 * @param callback
 */
exports.countCommentsOfPhoto = function(photoId, callback){
    Comment.count({'photo_id':photoId}, callback);
}