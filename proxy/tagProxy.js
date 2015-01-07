/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 4:05 PM
 * To change this template use File | Settings | File Templates.
 */

var TagService = require('../service/TagService');
var TagCache = require('../cache/tag');
var config = require('../config/base').config;
var labels = require('../config/base').labels;


exports.getRecommendTags = function(userId, callback){

    if(config.enableRedisCache){
        TagCache.getRecTags(userId, function(err, tags){
            if(err || !tags){
                //log err and query from mongodb
                TagService.getRecommendTags(userId, callback);
            }else{
                if(tags && tags.length == 0){
                    return callback(null, [{tagName:labels.Category, count:0}])
                }else{
                    return callback(null, tags);
                }
            }
        })
    }else{
        TagService.getRecommendTags(userId, callback);
    }

}