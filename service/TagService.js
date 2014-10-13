/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/17/14
 * Time: 2:17 PM
 * To change this template use File | Settings | File Templates.
 */
var dbHelper = require('../dbHelper');
var User = dbHelper.User;
var Photo = dbHelper.Photo;
var labels = require('../config/base').labels;
var config = require('../config/base').config;
var sampleData = require('../Sample/photos');
var ObjectId = require('mongoose').Types.ObjectId;
var EventProxy = require('eventproxy');
var util = require('../lib/util');

exports.getIndexTags = function(userId, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    User.getUserFriendsId(userId, function(err, docs){
        if(err){
            return callback(err,[]);
        }else{
           var Ids = [];
           Ids[0] = userId;

           for(var i=1;i<=docs.length;i++){
               Ids[i] = docs[i-1].follow_id;
           }
           Photo.countTagsByUserIds(Ids, function(err, tags){
               if(err){
                   return callback(err,[]);
               }else if(!tags || tags.length == 0){
                   return callback(null,{items:[{'tagName':labels.Category}]});
               }else{
                   var results = [],count = 0, maxCount = labels.tagRecommendCount;
                   for(var i=0;i<tags.length;i++){

                       if(tags[i].value.count >= maxCount){
                           results[count] = {};
                           results[count].tagName = tags[i]._id;
                           count++;
                       }
                   }
                   return callback(null, {items:results});
               }
           })
        }
    })
}


/**
 * 获取打标签页面
 * @param userId
 * @param callback
 */
exports.getRecommendTags = function(userId, callback){
    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    User.getUserFriendsId(userId, function(err, docs){
        if(err){
            return callback(err,[]);
        }else{
            var Ids = [];

            for(var i=0;i<docs.length;i++){
                Ids[i] = docs[i].follow_id;
            }
            var filterList = [], results = [], count= 0,limit=3;
            Photo.getMyFavirouteTags(userId,filterList,limit, function(err, tags){
                if(err){
                    return callback(err,results);
                }else{

                    for(var i=0;i<tags.length;i++){
                        filterList.push(tags[i]._id.tag);
                    }
                    Photo.getMyFriendsFavirouteTags(Ids, filterList,limit, function(err, tags){
                        if(err){
                            return callback(err,results);
                        }else{

                            for(var i=0;i<tags.length;i++){
                                filterList.push(tags[i]._id.tag);
                            }
                            Photo.getTwoDimensionFavirouteTags(userId, Ids, filterList,limit, function(err, tags){
                                if(err){
                                    return callback(err,results);
                                }else{

                                    for(var i=0;i<tags.length;i++){
                                        filterList.push(tags[i]._id.tag);
                                    }
                                    Photo.getStrangerFavoriteTags(userId, Ids, filterList,limit, function(err, tags){
                                        if(err){
                                            return callback(err,results);
                                        }else{

                                            for(var i=0;i<tags.length;i++){
                                                filterList.push(tags[i]._id.tag);
                                            }

                                            Photo.getLatestTags(filterList,limit, function(err, tags){
                                                if(err){
                                                    return callback(err,results);
                                                }else{
                                                    for(var i=0;i<tags.length;i++){
                                                        filterList.push(tags[i]._id.tag);
                                                    }
                                                    Photo.countTags(filterList, function(err, tags){
                                                        if(err){
                                                            return callback(err,results);
                                                        }else{
                                                            var proxy = new EventProxy();
                                                            proxy.after('tag_ready', tags.length, function(){
                                                                return callback(null, {items:results});
                                                            })

                                                            tags.forEach(function(tag, i){
                                                                results[i] = {};
                                                                results[i].tagName = tag._id.tag;
                                                                results[i].count = tag.count;
                                                                Photo.getCoverForTag(tag._id.tag, function(err, doc){
                                                                    if(err){
                                                                        proxy.emit('error');
                                                                    }else{
                                                                        results[i].cover = doc.photo_id.photoUrl;
                                                                        proxy.emit('tag_ready');
                                                                    }
                                                                })
                                                            })
                                                        }
                                                    })
                                                }
                                            })

                                        }
                                    })

                                }
                            })
                        }
                    })
                }
            })
        }
    })
}



exports.getAlbumInfo = function(userId, callback){

    if(typeof userId === 'string'){
        userId = new ObjectId(userId);
    }

    Photo.getUserAllTag(userId, function(err, docs){
        if(err){
            return callback(err,[]);
        }else{
            var proxy = new EventProxy(),
                tags = [];
            proxy.after('tag_ready',docs.length, function(){
                   callback(null,tags);
            }).fail(callback);

            docs.forEach(function(doc, i){
                tags[i] = {};
                tags[i].tagName = doc._id;
                tags[i].totalCount = doc.value.count;
                tags[i].photos =[]
                Photo.getTagOnShowPhotos(userId, doc._id, function(err, photos){
                    if(err){
                        proxy.emit('error');
                    }
                        for(var j=0;j<photos.length;j++){
                            tags[i].photos[j] = {};
                            tags[i].photos[j].photoUrl = photos[j].photo_id.source_url;
                            tags[i].photos[j].uploadDate = util.getDateTime(photos[j].post_at);
                        }
                    proxy.emit('tag_ready');
                })
            })

        }
    })
}