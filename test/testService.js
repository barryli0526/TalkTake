/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/16/14
 * Time: 10:45 AM
 * To change this template use File | Settings | File Templates.
 */


var userService = require('../service/UserService');
var photoService = require('../service/PhotoService');
var userDB = require('../dbHelper/user');
var photoDB = require('../dbHelper/photo');
var ObjectId = require('mongoose').Types.ObjectId;
var tagService = require('../service/TagService');

var models = require('../models');
var User = models.User;
var UserRelation = models.UserRelation;

//userService.getAllFriends('54179178ee4075701e2d0533', function(err, docs){
//    console.log(docs);
//})

//var data = {
//    uuid:'985698',
//    first_name:'clark',
//    seconde_name:'',
//    telephone:6569569
//};

//var users = [];
//for(var i=0;i<10;i++){
//    users[i] = {};
//    users[i].uuid = '' + i;
//    users[i].first_name = 'A'+ i;
//    users[i].second_name = '';
//    //users[i].telephone = i;
//}
//
//
//users.forEach(function(user, i){
//    userDB.testCreateUser(user, function(err, doc){
//     //   console.log(doc);
//    })
//})

//userDB.checkUserByNameAndPhone(110,'A3','',function(err, doc){
//    console.log(doc);
//})


/**************************Tag操作的分割线*****************************************************/
//
   var userId = '541930ce3466dde424ce606f';
//   var photoId = '12229178fe4275701e1d2539';
//   var tags = ['工作'];
//
   userId = new ObjectId(userId);
//   photoId = new ObjectId(photoId);
//   var createTime = new Date('2014/09/17 03:46:31');
////   photoDB.createNewPostPhotoRelation(userId,photoId,tags,createTime,function(err, docs){
////       console.log(docs);
////   })
////   photoDB.createNewSharePhotoRelation(userId,photoId,tags,createTime,function(err, docs){
////       console.log(docs);
////   })
//////var arr = [];
//////arr[0] = new ObjectId('54179178ee4075701e2d0533');
//////arr[1] = new ObjectId('54179178ee4075701e2d0534');
////
//////    photoDB.countTagsByUserIds(arr, function(err, docs){
//////        console.log(docs);
//////    })
////
//tagService.getIndexTags(userId, function(err, docs){
//    console.log(docs);
//})

//tagService.getAlbumInfo(userId, function(err, docs){
//    console.log(docs[2].photos);
//})

//tagService.getRecommendTags(userId, function(err, docs){
//    console.log(docs);
//})



/**************************Tag操作的分割线*****************************************************/


/**************************Photo操作的分割线*****************************************************/

//var userId = '541930ce3466dde424ce606f',
//    name='photo1.jpg',
//    key='',
//    tags='新奇，摄影',
//    createTime = new Date(),
//    location = '上海 环球金融',
//    desc = '你是我的小呀小苹果',
//    isPublic = true;
//userId = new ObjectId(userId);

//var photos = [
//
//    {
//        userId : '541930ce3466dde424ce606f',
//        name : 'photo1.jpg',
//        key : 'photo1.jpg',
//        tags : '新奇,摄影,工作',
//        createTime : new Date(),
//        location : '?? ?? ????',
//        desc : '????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce606f',
//        name : 'photo2.jpg',
//        key : 'photo2.jpg',
//        tags : '新奇,摄影,工作',
//        createTime : new Date(),
//        location : '?? ??? ???',
//        desc : '????????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6070',
//        name : 'photo3.jpg',
//        key : 'photo3.jpg',
//        tags : '新奇,摄影,学习',
//        createTime : new Date(),
//        location : '?? ???? ??',
//        desc : '????????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6070',
//        name : 'photo4.jpg',
//        key : 'photo4.jpg',
//        tags : '新奇,摄影',
//        createTime : new Date(),
//        location : '?? ??',
//        desc : '????,????,????,???????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6071',
//        name : 'photo5.jpg',
//        key : 'photo5.jpg',
//        tags : '新奇,摄影,学习',
//        createTime : new Date(),
//        location : '?? ??',
//        desc : '????,????,????,???????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6071',
//        name : 'photo6.jpg',
//        key : 'photo6.jpg',
//        tags : '学习',
//        createTime : new Date(),
//        location : '?? ??',
//        desc : '????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6072',
//        name : 'photo7.jpg',
//        key : 'photo7.jpg',
//        tags : '新奇,工作,学习',
//        createTime : new Date(),
//        location : '?? ???',
//        desc : '?????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6072',
//        name : 'photo8.jpg',
//        key : 'photo8.jpg',
//        tags : '新奇,工作',
//        createTime : new Date(),
//        location : '??',
//        desc : '???????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6073',
//        name : 'photo9.jpg',
//        key : 'photo9.jpg',
//        tags : '工作',
//        createTime : new Date(),
//        location : '??',
//        desc : '??',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6073',
//        name : 'photo10.jpg',
//        key : 'photo10.jpg',
//        tags : '工作',
//        createTime : new Date(),
//        location : '????',
//        desc : '????',
//        isPublic : true
//    },
//    {
//        userId : '541930ce3466dde424ce6073',
//        name : 'photo11.jpg',
//        key : 'f86664b7ae82f1191a3e10b1276db7d5.jpg',
//        tags : '工作',
//        createTime : new Date(),
//        location : '?? ????',
//        desc : '????',
//        isPublic : true
//    }
//
//
//]
//
//photos.forEach(function(photo, i){
//    photoService.createNewPhoto(photo.userId,photo.name,photo.key,photo.tags,photo.createTime,photo.location,photo.desc,photo.isPublic, function(err, docs){
//        console.log(docs);
//    })
//})

//photoService.createNewPhoto(userId,name,key,tags,createTime,location,desc,isPublic, function(err, docs){
//    console.log(docs);
//})

//photoService.getLatestPhotos('541930ce3466dde424ce606f','工作',new Date('2013/09/09 12:12:12'),10, function(err, docs){
//    console.log(docs);
//})

var userId = '541930ce3466dde424ce6070',
    s = '541930ce3466dde424ce6073',
    photoId = '5420e5d48e6dc10430ca3368';

    userId = new ObjectId(userId);
s = new ObjectId(s);
photoId = new ObjectId(photoId);


//var photo =
//
//    {
//        userId : '541930ce3466dde424ce6070',
//        name : 'photo1.jpg',
//        key : 'photo1.jpg',
//        tags : '新奇',
//        createTime : new Date(),
//        location : '上海',
//        desc : '风景不错',
//        isPublic : true
//    }
//
//
//photoService.createNewPhoto(photo.userId,photo.name,photo.key,photo.tags,photo.createTime,photo.location,photo.desc,photo.isPublic, function(err, docs){
//        console.log(docs);
//    })
//
//photoDB.addForwardPhotoInfo(userId, photoId,'很好d啊',new Date(), function(err, doc){
//    console.log(doc);
//})

//photoService.getSegmentPhoto('541930ce3466dde424ce606f','工作',new Date('2014/09/18 16:16:19'),new Date('2015/09/18 16:16:20'),10, function(err, docs){
//    console.log(docs);
//})

//photoDB.deleteAll();

//photoService.likePhoto(userId, photoId, new Date(), function(err, doc){
//    console.log(doc);
//})
//photoService.unlikePhoto(userId, photoId, function(err, doc){
//    console.log(doc);
//})

//photoDB.getUserAlbumInfo(userId, function(err, doc){
//    console.log(doc);
//})

//photoDB.getTagOnShowPhotos(userId, '新奇', function(err, docs){
//    console.log(docs);
//})

//photoService.getPhotoDetail(userId, photoId, function(err, docs){
//    console.log(docs);
//})

//photoDB.getRecommendTags(userId, [userId],[], function(err, docs){
//    console.log(docs);
//})

var comments = '风景这边独好';

//photoService.postComments(photoId, userId, comments, new Date(), function(err, docs){
//    console.log(err);
//    console.log(docs);
//})

//photoService.getComments(userId,photoId, 0, 10, function(err,docs){
//    console.log(err);
//    console.log(docs);
//})

//photoDB.deleteAll();


/**************************Photo操作的分割线*****************************************************/



/**************************User操作的分割线*****************************************************/

var userId = '541930ce3466dde424ce606f',
    photoId = '5420e5d48e6dc10430ca3368';

userId = new ObjectId(userId);
photoId = new ObjectId(photoId);

var data = {
    nickName:'理查德抽',
    firstName:'周',
    lastName:'铭叶',
    mobilePhone:15602352325,
    sex:'男',
    location:{
        country:'中国',
        city:'上海',
        county:'黄浦区'
    },
    constellation:'天蝎',
    selfDesc:'我就是我，颜色不一样的烟火',
    qrCode:'http://www.example.com',
    privacy:0
};

//userDB.deleteAll();

//userService.getAllLikedPhotoList(userId,0,10, function(err, docs){
//    console.log(docs);
//})

//userService.updateUserProfile(userId, data, function(err, doc){
//    console.log(doc);
//})

//userService.getUserDetail(userId, function(err, doc){
//    console.log(doc);
//})


/**************************User操作的分割线*****************************************************/

/**************************综合操作*****************************************************/





var arr = [];

for(var i=5000;i<10000;i++){
    arr.push({uuid:i});
}

//arr.forEach(function(value,i){
//    User.findOne(value,function(err,doc){
//        for(var j=0;j<10;j++){
//            var photo =
//
//            {
//                userId : '541930ce3466dde424ce6070',
//                name : 'photo1.jpg',
//                key : 'photo1.jpg',
//                tags : '新奇',
//                createTime : new Date(),
//                location : '上海',
//                desc : '风景不错',
//                isPublic : true
//            }
//            photo.userId = doc._id;
//            photo.desc = '风景'+j+':'+doc._id;
//            //   console.log(photo);
//            photoService.createNewPhoto(photo.userId,photo.name,photo.key,photo.tags,photo.createTime,photo.location,photo.desc,photo.isPublic, function(err, docs){
//                console.log(doc._id +":" + j);
//            })
//        }
//    })
//})

var userId = new ObjectId('5428d860a185436c240ca611');

arr.forEach(function(value,i){
    User.findOne(value,function(err,doc){
        var s = parseInt(10*Math.random());
        if(s>5){
            userDB.addFriends(userId,doc._id,doc._id,'',function(){});
            userDB.addFriends(doc._id,userId,'','',function(){
                console.log('done')
            });
        }
    })
})



//var addOnePhoto = function(i){
//    User.find({uuid:k},function(err, docs){
//        console.log(docs.length);
//        docs.forEach(function(doc,i){
//
//            for(var j=0;j<100;j++){
//
//                photo.userId = doc._id;
//                photo.desc = '风景'+j+':'+doc._id;
//                //   console.log(photo);
//                photoService.createNewPhoto(photo.userId,photo.name,photo.key,photo.tags,photo.createTime,photo.location,photo.desc,photo.isPublic, function(err, docs){
//
//                })
//            }
//        })
//    })
//}
//
//for(var k=0;k<100000;k++){
//    User.find({uuid:k},function(err, docs){
//        console.log(docs.length);
//        docs.forEach(function(doc,i){
//
//            for(var j=0;j<100;j++){
//
//                photo.userId = doc._id;
//                photo.desc = '风景'+j+':'+doc._id;
//                //   console.log(photo);
//                photoService.createNewPhoto(photo.userId,photo.name,photo.key,photo.tags,photo.createTime,photo.location,photo.desc,photo.isPublic, function(err, docs){
//                    console.log(doc._id +":" + j);
//                })
//            }
//        })
//    })
//}
