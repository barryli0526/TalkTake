

var fs = require('fs');
var path = require('path');
var ndir = require('ndir');
var config = require('./config/base').config;

var util = require('./lib/util');

var UserService = require('./service/UserService');

var server = require('./api/server');
var photos = require('./api/photos');
var user = require('./api/user');


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

        //add for test
//        SID = 1;UUID=2;


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

    //初始化客户端,只在首次使用该APP时候调用
    app.post('/TalkTake/InitClient', server.InitClient);
    //获取上传凭证
    app.get('/TalkTake/UploadToken', BasicAuth, server.getUploadToken);
    //获取最新图片列表
    app.get('/TalkTake/Photos/Latest', BasicAuth, photos.getLatestPhotoList);
    //获取过往图片列表
    app.get('/TalkTake/Photos/Oldest', BasicAuth, photos.getOldestPhotoList);
    //获取图片时间段列表
    app.get('/TalkTake/Photos', BasicAuth, photos.getSegmentPhotoList);
    //对某张图片点赞
    app.post('/TalkTake/Photos/:photoId/Like', BasicAuth, photos.likePhoto);
    //取消对某张图片点赞
    app.post('/TalkTak/Photos/:photoId/UnLike', BasicAuth, photos.unLikePhoto);
    //获取图片信息
    app.get('/TalkTake/Photos/:photoId', BasicAuth, photos.getPhotoDetail);
    //获取评论列表
    app.get('/TalkTake/Photos/:photoId/Comments', BasicAuth, photos.getComments);
    //提交图片评论
    app.post('/TalkTake/Photos/:photoId/Comments', BasicAuth, photos.postComment);
    //关注用户
    app.post('/TalkTake/User/:userId/follow', BasicAuth, user.followUser);
    //取消关注用户
    app.post('/TalkTake/User/:userId/unFollow', BasicAuth, user.unFollowUser);
    //获取关注列表
    app.get('/TalkTake/User/:userId/AllFollowing', BasicAuth, user.getAllFollowingUser);
    //获取粉丝列表
    app.get('/TalkTake/User/:userId/AllFollowers', BasicAuth, user.getAllFollowerUser);
    //获取所有喜欢的列表
    app.get('/TalkTake/User/:userId/AllLiked', BasicAuth, user.getAllLikedPhotoList);
    //获取个人用户信息
    app.get('/TalkTake/User', BasicAuth, user.getUserDetail);
    app.get('/TalkTake/User/:userId', BasicAuth, user.getUserDetail);

    app.post('/TalkTake/Photo/Upload/CallBack',function(req, res){
        console.log(req.headers['authorization']);
        console.log(req.body);
    });

};
