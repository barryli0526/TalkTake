/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/11/14
 * Time: 1:24 PM
 * To change this template use File | Settings | File Templates.
 */

var requestCase = require('./request');



//requestCase.testUpdateUser();

//requestCase.postData();
//requestCase.getPhotoDetail();

//requestCase.testFollow();

//requestCase.testSyncContacts();

//requestCase.getGetInfo();

//var str = 'NTQzYTU4YjQzN2EyZTNIODZmNzBjYjY4O';
//var basicString = new Buffer(str, 'base64').toString().split(':');
//console.log(basicString);

var photos = [

    {
        name : 'test1.jpg',
        key : 'test1.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '啊啊啊啊啊',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce606f',
        name : 'test2.jpg',
        key : 'test2.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '鹅鹅鹅鹅鹅鹅',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6070',
        name : 'test3.jpg',
        key : 'test3.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '哇哇哇哇问问',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6070',
        name : 'test4.jpg',
        key : 'test4.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '亲亲亲亲亲亲亲',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6071',
        name : 'test5.jpg',
        key : 'test5.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '啧啧啧啧啧啧啧啧啧啧啧啧',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6071',
        name : 'test6.jpg',
        key : 'test6.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '弱弱弱弱弱弱',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6072',
        name : 'test7.jpg',
        key : 'test7.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '反反复复飞飞飞',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6072',
        name : 'test8.jpg',
        key : 'test8.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '痴痴缠缠痴痴缠缠存储',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test9.jpg',
        key : 'test9.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '哈哈哈哈哈哈哈哈哈和',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test10.jpg',
        key : 'test10.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '将建军节建军节建军节',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test11.jpg',
        key : 'test11.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '头疼头疼头疼头疼头疼',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test12.jpg',
        key : 'test12.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '某某某某某某某某某某某某',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test13.jpg',
        key : 'test13.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '难男男女女难男男女女男男女女',
        isPublic : true
    },
    {
        userId : '541930ce3466dde424ce6073',
        name : 'test14.jpg',
        key : 'test14.jpg',
        tags : '摄影',
        createTime : new Date(),
        location : '上海 浦东新区 郭守敬路',
        desc : '棒棒棒棒棒棒棒棒棒棒棒棒',
        isPublic : true
    }
]

//for (var i= 0,l=photos.length;i<l;i++){
//    requestCase.postPhoto(photos[i],function(err){
//             console.log(err);
//    })
//}

//requestCase.testUpdateUser();

requestCase.getPhotoDetail();

//requestCase.testInitClient();
