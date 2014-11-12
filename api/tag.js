/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/17/14
 * Time: 2:19 PM
 * To change this template use File | Settings | File Templates.
 */

var TagService = require('../service/TagService');
var util = require('../lib/util');

var config = require('../config/base').config;
var labels = require('../config/base').labels;

/**
 * 首页推荐标签
 * @param req
 * @param res
 * @constructor
 */
exports.Index = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            TagService.getIndexTags(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    if(docs.length == 0){
                        var doc = {};
                        doc.tagName = labels.Category;
                        doc.count = 0;
                        docs[0] = doc;
                    }
                    res.statusCode = 200;
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}

/**
 * 打标签推荐标签
 * @param req
 * @param res
 * @constructor
 */
exports.Recommend = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var uid = req.session.user._id;
        if(!uid){
            res.statusCode = 503;
            res.end(util.combineFailureRes(labels.sessionError));
            return;
        }else{
            TagService.getRecommendTags(uid, function(err,docs){
                if(err){
                    res.statusCode = 500;
                    res.end(util.combineFailureRes(labels.DBError));
                }else{
                    res.statusCode = 200;
                    if(docs.length == 0){
                        var doc = {};
                        doc.tagName = labels.Category;
                        doc.count = 0;
                        docs[0] = doc;
                    }
                    res.end(util.combineSuccessRes(docs));
                }
            })
        }
    }
}