﻿

var fs = require('fs');
var path = require('path');
var config = require('./config/base').config;

var util = require('./lib/util');

var UserService = require('./service/UserService');
var HelpService = require('./service/HelpService');

var server = require('./api/server');
var photos = require('./api/photos');
var user = require('./api/user');
var tag = require('./api/tag');


module.exports = function (app, client) {

    /**
     * HTTP 基础验证
     * @param req
     * @param res
     * @param next
     * @constructor
     */
    var BasicAuth = function(req, res, next){
        var basic=req.headers['authorization']||'';
        var basicString = new Buffer(basic, 'base64').toString().split(':');

        var SID = basicString[0];   //使用唯一的server ID当做用户名
        var UUID  = basicString[1]; //使用UUID当做密码,128位


        res.setHeader("Content-Type","application/json;charset='utf-8'");
        res.setHeader("date",util.getDateTime());
        if(!SID || !UUID){
            res.statusCode = 401;
            res.send({apiStatus:'failure',msg:'Forbidden! You do not have permission to use this API...'});
        }else{
            UserService.SignIn(SID,UUID, function(err,doc){
                if(err){
                    res.statusCode = 500;
                    res.send({apiStatus:'failure',msg:'Internal DB Error'});
                }else if(!doc || doc.length == 0){
                    res.statusCode = 401;
                    res.send({apiStatus:'failure',msg:'Forbidden! You do not have permission to use this API...'});
                }else{
                    req.session.user = doc;
                    return next();
                }
            })
        }
    }

//    var urlList = {
//        upload : {friendlyName : '上传图片模块'},
//        index : {friendlyName : '首页图片展示模块'},
//        like:{friendlyName :'社交模块(赞）'},
//        detail:{friendlyName:'查看图片详细模块'},
//        comment_view:{friendlyName : '查看评论模块'},
//        comment_post : {friendlyName : '参与评论模块'},
//        follow : {friendlyName : '社交模块（关注/取关)'},
//        followingInfo:{friendlyName :'查看关注模块'},
//        followerInfo:{friendlyName:'查看粉丝模块'},
//        likeInfo:{friendlyName : '查看喜欢模块'},
//        albumInfo : {friendlyName : '相册模块'},
//        userInfo : {friendlyName : '查看个人用户信息模块'},
//        user_post:{friendlyName :'修改个人信息模块'}
//    }
////        {baseUrl : '/TalkTake/InitClient', friendlyName : '新用户调用'},
////        {baseUrl : '/TalkTake/UploadToken', friendlyName : '获取上传凭证'},
////        {baseUrl : '/TalkTake/Photos/Latest', friendlyName : '获取最新图片列表'},
////        {baseUrl : '/TalkTake/Photos/Oldest', friendlyName : '获取过往图片列表'},
////        {baseUrl : '/TalkTake/Photos', friendlyName : '获取图片时间段列表'},
////        {baseUrl : '/TalkTake/Photos/:photoId/Like', friendlyName : '对某张图片点赞'},
////        {baseUrl : '/TalkTak/Photos/:photoId/UnLike', friendlyName : '取消对某张图片点赞'},
////        {baseUrl : '/TalkTake/Photos/:photoId', friendlyName : '获取图片信息'},
////        {baseUrl : '/TalkTake/Photos/:photoId/Comments', friendlyName : '获取评论列表'},
////        {baseUrl : '/TalkTake/Photos/:photoId/Comments', friendlyName : '提交图片评论'},
////        {baseUrl : '/TalkTake/User/SyncContacts', friendlyName : '导入通讯录'},
////        {baseUrl : '/TalkTake/User/:userId/follow', friendlyName : '关注用户'},
////        {baseUrl : '/TalkTake/User/:userId/unFollow', friendlyName : '取消关注用户'},
////        { friendlyName : '获取粉丝列表'},
////        { friendlyName : '获取所有喜欢的列表'},
////        { friendlyName : '获取个人相册内容'},
////        { friendlyName : '获取个人用户信息'},
////        { friendlyName : '上传'},
////        { friendlyName : '获取首页的推荐标签'},
////        { friendlyName : '获取首页的推荐标签'}


    var addVisit = function(req, res, next){
        HelpService.addApiCount(req.route.path,req.route.method,function(){});
        return next();
    }

    //初始化客户端,只在首次使用该APP时候调用  -done
    app.post('/TalkTake/InitClient',addVisit, server.InitClient);
    //获取上传凭证    -done
    app.get('/TalkTake/UploadToken',addVisit, BasicAuth, server.getUploadToken);
    //获取最新图片列表     -done
    app.get('/TalkTake/Photos/Latest',addVisit, BasicAuth, photos.getLatestPhotoList);
    //获取过往图片列表     -done
    app.get('/TalkTake/Photos/Oldest',addVisit, BasicAuth, photos.getOldestPhotoList);
    //获取图片时间段列表   -done
    app.get('/TalkTake/Photos',addVisit, BasicAuth, photos.getSegmentPhotoList);
    //对某张图片点赞    -done
    app.post('/TalkTake/Photos/:photoId/Like',addVisit, BasicAuth, photos.likePhoto);
    //取消对某张图片点赞   -done
    app.post('/TalkTake/Photos/:photoId/UnLike',addVisit, BasicAuth, photos.unLikePhoto);
    //获取图片信息     -done
    app.get('/TalkTake/Photos/:photoId',addVisit, BasicAuth, photos.getPhotoDetail);
    //获取评论列表     -done
    app.get('/TalkTake/Photos/:photoId/Comments',addVisit, BasicAuth, photos.getComments);
    //提交图片评论     -done
    app.post('/TalkTake/Photos/:photoId/Comments',addVisit, BasicAuth, photos.postComment);
    //导入通讯录    -done.
    app.post('/TalkTake/User/SyncContacts',addVisit, BasicAuth, user.syncContacts);
    //关注用户        -done.
    app.post('/TalkTake/User/:userId/follow',addVisit, BasicAuth, user.followUser);
    //取消关注用户     -done.
    app.post('/TalkTake/User/:userId/unFollow',addVisit, BasicAuth, user.unFollowUser);
    //获取关注列表   -done
    app.get('/TalkTake/User/AllFollowing',addVisit, BasicAuth, user.getAllFollowingUser);
    app.get('/TalkTake/User/:userId/AllFollowing',addVisit, BasicAuth, user.getAllFollowingUser);
    //获取粉丝列表   -done
    app.get('/TalkTake/User/AllFollowers',addVisit,BasicAuth, user.getAllFollowerUser);
    app.get('/TalkTake/User/:userId/AllFollowers',addVisit, BasicAuth, user.getAllFollowerUser);
    //获取所有喜欢的列表  -done
    app.get('/TalkTake/User/AllLiked', BasicAuth,addVisit, user.getAllLikedPhotoList);
    app.get('/TalkTake/User/:userId/AllLiked',addVisit, BasicAuth, user.getAllLikedPhotoList);
    //获取个人相册内容
    app.get('/TalkTake/User/Photos',addVisit, BasicAuth, user.getAlbumPhotos);
    app.get('/TalkTake/User/:userId/Photos',addVisit, BasicAuth, user.getAlbumPhotos);
    //获取个人设置信息
    app.get('/TalkTake/User/Setting',addVisit, BasicAuth, user.getUserSetting);
    //获取个人用户信息  -done
    app.get('/TalkTake/User',addVisit, BasicAuth, user.getUserDetail);
    app.get('/TalkTake/User/:userId',addVisit, BasicAuth, user.getUserDetail);
    //修改个人用户信息   -done
    app.post('/TalkTake/User',addVisit, BasicAuth, user.updateUserProfile);
    //上传回调     -done
    app.post('/TalkTake/Photo/Upload/CallBack',addVisit, BasicAuth, photos.uploadCallback);
    //获取首页的推荐标签   -done
    app.get('/TalkTake/Tags/Index',addVisit, BasicAuth, tag.Index);
    //获取首页的推荐标签   -done
    app.get('/TalkTake/Tags/Recommend',addVisit, BasicAuth, tag.Recommend);
};
