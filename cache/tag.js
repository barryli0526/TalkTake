/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 1/7/15
 * Time: 3:58 PM
 * To change this template use File | Settings | File Templates.
 */

var redis = require('redis');

var client = redis.createClient();

//从redis中获取推荐标签
exports.getRecTags = function(uid, callback){
    var RecTags = 'talktake:user:' + uid + ':recTags';
    client.get(RecTags, callback);
}