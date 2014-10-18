

var fs = require('fs');
var path = require('path');
var config = require('./config/base').config;

var util = require('./lib/util');

var UserService = require('./service/UserService');

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

        //add for test
        //SID = '5428d860a185436c240ca611';UUID='99955';


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
              //      req.session.user = {a:1};
               //     return next();
                }else{
                    req.session.user = doc;
                    return next();
                }
            })
        }
    }

    //初始化客户端,只在首次使用该APP时候调用  -done
    app.post('/TalkTake/InitClient', server.InitClient);
    //获取上传凭证    -done
    app.get('/TalkTake/UploadToken', BasicAuth, server.getUploadToken);
    //获取最新图片列表     -done
    app.get('/TalkTake/Photos/Latest', BasicAuth, photos.getLatestPhotoList);
    //获取过往图片列表     -done
    app.get('/TalkTake/Photos/Oldest', BasicAuth, photos.getOldestPhotoList);
    //获取图片时间段列表   -done
    app.get('/TalkTake/Photos', BasicAuth, photos.getSegmentPhotoList);
    //对某张图片点赞    -done
    app.post('/TalkTake/Photos/:photoId/Like', BasicAuth, photos.likePhoto);
    //取消对某张图片点赞   -done
    app.post('/TalkTak/Photos/:photoId/UnLike', BasicAuth, photos.unLikePhoto);
    //获取图片信息     -done
    app.get('/TalkTake/Photos/:photoId', BasicAuth, photos.getPhotoDetail);
    //获取评论列表     -done
    app.get('/TalkTake/Photos/:photoId/Comments', BasicAuth, photos.getComments);
    //提交图片评论     -done
    app.post('/TalkTake/Photos/:photoId/Comments', BasicAuth, photos.postComment);
    //导入通讯录    -done.
    app.post('/TalkTake/User/SyncContacts', BasicAuth, user.syncContacts);
    //关注用户        -done.
    app.post('/TalkTake/User/:userId/follow', BasicAuth, user.followUser);
    //取消关注用户     -done.
    app.post('/TalkTake/User/:userId/unFollow', BasicAuth, user.unFollowUser);
    //获取关注列表   -done
    app.get('/TalkTake/User/AllFollowing', BasicAuth, user.getAllFollowingUser);
    app.get('/TalkTake/User/:userId/AllFollowing', BasicAuth, user.getAllFollowingUser);
    //获取粉丝列表   -done
    app.get('/TalkTake/User/AllFollowers', BasicAuth, user.getAllFollowerUser);
    app.get('/TalkTake/User/:userId/AllFollowers', BasicAuth, user.getAllFollowerUser);
    //获取所有喜欢的列表  -done
    app.get('/TalkTake/User/AllLiked', BasicAuth, user.getAllLikedPhotoList);
    app.get('/TalkTake/User/:userId/AllLiked', BasicAuth, user.getAllLikedPhotoList);
    //获取个人相册内容
    app.get('/TalkTake/User/Photos', BasicAuth, user.getAlbumPhotos);
    app.get('/TalkTake/User/:userId/Photos', BasicAuth, user.getAlbumPhotos);
    //获取个人用户信息  -done
    app.get('/TalkTake/User', BasicAuth, user.getUserDetail);
    app.get('/TalkTake/User/:userId', BasicAuth, user.getUserDetail);
    //修改个人用户信息   -done
    app.post('/TalkTake/User', BasicAuth, user.updateUserProfile);
    //上传回调     -done
    app.post('/TalkTake/Photo/Upload/CallBack',photos.uploadCallback);
    //获取首页的推荐标签   -done
    app.get('/TalkTake/Tags/Index', BasicAuth, tag.Index);
    //获取首页的推荐标签   -done
    app.get('/TalkTake/Tags/Recommend', BasicAuth, tag.Recommend);
};
