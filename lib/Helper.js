/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 11/18/14
 * Time: 11:08 AM
 * To change this template use File | Settings | File Templates.
 */


var queryStringBuilder  = function(){

}

/**
 * 判断图片是否公开
 * @param privacy
 * @returns {{isPublic: *}}
 */
queryStringBuilder.prototype.buildPrivacyQuery = function(privacy){
    return {'isPublic' : privacy} ;
}

/**
 * 判断拥有tagName的图片
 * @param tagName
 * @returns {{tags: {$all: *}}}
 */
queryStringBuilder.prototype.buildInTagQuery = function(tagName){
    return {'tags' : {$all : tagName}};
}

/**
 * 判断不在tags数组里面的图片
 * @param tags
 * @returns {{tags: {$nin: *}}}
 */
queryStringBuilder.prototype.buildNotInTagQuery = function(tags){
    return {'tags' : {$nin : tags}};
}

/**
 * 常规的图片列表信息的query string组成
 * @param basicQuery
 * @param tag
 * @param isXQ
 * @returns {{}}
 */
queryStringBuilder.prototype.buildCommonPhotoListQuery = function(basicQuery,tag, isXQ){
    var query = {};
    var privacyQuery = this.buildPrivacyQuery(true); //只取privacy为true的图片
    if(tag){
        //如果是获取的新奇内容,则传进来的tag将会是一个数组，包括所有的推荐tag
        //否则传进来的是具体的tag名称
        var tagQuery = {};
        if(isXQ){
            tagQuery = this.buildNotInTagQuery(tag);
        }else{
            tagQuery = this.buildInTagQuery(tag);
        }
        query  = {$and:[basicQuery, privacyQuery, tagQuery]};
    }else{
        query  = {$and:[basicQuery, privacyQuery]};
    }
    return query;
}


/**
 * 返回查询最新图片的查询语句
 * @param friendsList
 * @param tag
 * @param anchorTime
 * @param isXQ
 * @returns {{}}
 */
queryStringBuilder.prototype.buildLatestPhotosQuery = function(friendsList, tag, anchorTime, isXQ){
//    var  basicQuery = {$or:[{$and:[{'author_id':{$in:friendsList}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:friendsList}},
//        {'forward.forward_at':{$gt:anchorTime}}]}]};
    var  basicQuery = {$or:[{$and:[{'author_id':{$in:friendsList}},{'post_at':{$gt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:friendsList}},
        {'forward.forward_at':{$gt:anchorTime}},{$nor:[{$and:[{'author_id':{$in:friendsList}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:friendsList}},
            {'forward.forward_at':{$lt:anchorTime}}]}]}]}]};
    return this.buildCommonPhotoListQuery(basicQuery, tag, isXQ);
}

/**
 * 返回查询过往图片的查询语句
 * @param friendsList
 * @param tag
 * @param anchorTime
 * @param isXQ
 * @returns {{}}
 */
queryStringBuilder.prototype.buildOldestPhotosQuery = function(friendsList, tag, anchorTime, isXQ){
    basicQuery = {$or:[{$and:[{'author_id':{$in:friendsList}},{'post_at':{$lt:anchorTime}}]},{$and:[{'forward.forwarder_id' : {$in:friendsList}},
        {'forward.forward_at':{$lt:anchorTime}}]}]};
    return this.buildCommonPhotoListQuery(basicQuery, tag, isXQ);
}

/**
 * 返回查询某个时间段的查询语句
 * @param friendsList
 * @param tag
 * @param startDate
 * @param endDate
 * @param isXQ
 * @returns {{}}
 */
queryStringBuilder.prototype.buildSegmentPhotosQuery = function(friendsList, tag, startDate,endDate, isXQ){
    var    basicQuery = {$or:[{$and:[{'author_id':{$in:friendsList}},{$and:[{'post_at':{$gte:startDate}},{'post_at':{$lte:endDate}}]}]},
            {$and:[{'forward.forwarder_id' : {$in:friendsList}},{$and:[{'forward.forward_at':{$gte:startDate}},{'forward.forward_at':{$lte:endDate}}]}]}]};
    return this.buildCommonPhotoListQuery(basicQuery, tag, isXQ);
}

var queryStringBuilderInstance = null;//单例


//暴露出queryStringBuilderInstance
exports.queryStringBuilder = (function(){
      if(!queryStringBuilderInstance){
          return new queryStringBuilder();
      }else{
          return queryStringBuilderInstance;
      }
})();
