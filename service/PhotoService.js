/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/9/14
 * Time: 3:51 PM
 * To change this template use File | Settings | File Templates.
 */

var sampleData = require('../Sample/photos');

exports.getLatestPhotos = function(category, anchorTime, listSize, callback){

    return callback(null,sampleData.LatestList);

}

exports.getOldestPhotos = function(category, anchorTime, listSize, callback){

    return callback(null,sampleData.OldestList);

}


exports.getSegmentPhoto = function(category, startDate, endDate, listSize, callback){
    return callback(null, sampleData.SegmentList) ;
}

exports.addLikeForThePhoto = function(uid, photoId, callback){
    return callback(null,[]);
}

exports.unLikeForThePhoto = function(uid, photoId, callback){
    return callback(null,[]);
}

exports.getPhotoDetail = function(photoId, callback){
    return callback(null, sampleData.photoDetail);
}

exports.getComments = function(photoId, startIndex, size, callback){
    return callback(null, sampleData.comments);
}

exports.postComments = function(photoId, uid, comments, replyTime, callback){
    return callback(null,[]);
}

exports.createNewPhoto = function(userId, tags, createTime, location, desc, isPublic, callback){
    return callback(null,[]);
}