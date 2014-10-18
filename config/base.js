/**
 * config
 */

var path = require('path');

exports.config = {
    debug: true,
    name: 'Talk Take',
    version: '0.0.1',


    host: '121.199.58.200',
    site_static_host: '', // 静态文件存储域名

    upload_dir: 'public/user_data/images',
    session_secret:'talktake',

    qnConfig:{
        scope:'talktake',
        ACCESS_KEY : 'NuAufwBA-BaCTCuDJ0P-PMSl3BvkFalvuSyN-qwL',
        SECRET_KEY : 'ZsW_9EPX4IIScrFo-2Gg3k3IB0-N_j0N2FDhQdcw',
        callbackUrl:'http://121.199.58.200:3003/TalkTake/Photo/Upload/CallBack',
        callbackBody:'name=${fname}&key=${key}&tags=$(x:tags)&desc=$(x:desc)&createTime=$(x:createTime)&location=$(x:location)&userId=$(x:userId)&isPublic=$(x:isPublic)',
        persistentOps:'avthumb/imageView2/2/w/320',
        expires:7200,
        domain:'http://talktake.qiniudn.com',
        compress:true,
        quality:'?imageView2/2/w/640/format/jpg/q/50'
    },

    db: 'mongodb://127.0.0.1/TalkTake',
    port: 3003
};

exports.labels = {
    Category : '新奇',
    PhotoListSize : 20,
    CommentListSize : 100,
    UserList : 100,
    tagRecommendCount:5,

    avatar:'http://www.gravatar.com/avatar?size=48',

    qnDomain:'',

    DBError : 'Internal DB Error!',
    AuthError : 'Forbidden! You do not have permission to use this API!',
    requestError : 'Not a Legal request, please check the request url and mandatory params!',
    qnCallbackError :'Something wrong in Qiniu Server',
    sessionError : 'Oppps...Lost Session',
    generateTokenError : 'Generate Qiniu Token Issue, pls try to upload to Server directly...'
}
