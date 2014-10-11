/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/9/14
 * Time: 12:49 PM
 * To change this template use File | Settings | File Templates.
 */
var express = require("express");
var util = require('../lib/util');
var UserService = require('../service/UserService');

var config = require('../config/base').config;
var labels = require('../config/base').labels;

var sampleData = require('../Sample/photos');

var qn = require('qiniu');


/**
 * 初始化App
 * @param req
 * @param res
 * @constructor
 */
exports.InitClient = function(req, res){

    res.setHeader("Content-Type","application/json;charset='utf-8'");
  //  res.setHeader("Access-Control-Allow-Origin", "*");

    var rqData = req.body;

    var UUID = rqData.UUID;

    UserService.createClient(UUID, function(err, doc){
        if(err || !doc || doc.length == 0){
            console.log(err);
            res.statusCode = 500;
            res.end(util.combineFailureRes(labels.DBError));
        }else{
            res.statusCode = 200;

            var resData = {
                UUID:UUID,
                SID:doc.userId
            }
            res.end(util.combineSuccessRes(resData));
        }
    })
}

/**
 * 获取用户上传凭证
 * @param req
 * @param res
 */
exports.getUploadToken = function(req, res){
    if(!req.session.user){
        res.statusCode = 401;
        res.end(util.combineFailureRes(labels.AuthError));
    }else{
        var qnConfig = config.qnConfig;
        qn.conf.ACCESS_KEY = qnConfig.ACCESS_KEY;
        qn.conf.SECRET_KEY = qnConfig.SECRET_KEY;
        var expires = req.query.expires ? req.query.expires : qnConfig.expires;
        var putPolicy = new qn.rs.PutPolicy(qnConfig.scope,qnConfig.callbackUrl,qnConfig.callbackBody,null,null,null,null,expires);
//        var putPolicy = new qn.rs.PutPolicy(qnConfig.scope,qnConfig.callbackUrl,qnConfig.callbackBody,null,null,null,null,expires,qnConfig.persistentOps);
        var token = putPolicy.token();
        if(!token){
            res.statusCode = 500;
            res.end(util.combineFailureRes(labels.AuthError));
        }else{
            res.statusCode = 200;
            var resData = {
                uploadToken : token
            }
            res.end(util.combineSuccessRes(resData));
        }
    }
}