/**
 * config
 */

var path = require('path');

exports.config = {
    debug: true,
    name: 'Talk Take',
    version: '0.0.1',


    host: '',
    site_static_host: '', // 静态文件存储域名

    upload_dir: 'public/user_data/images',
    session_secret:'talktake',

    qnConfig:{
        scope:'talktake',
        ACCESS_KEY : 'NuAufwBA-BaCTCuDJ0P-PMSl3BvkFalvuSyN-qwL',
        SECRET_KEY : 'ZsW_9EPX4IIScrFo-2Gg3k3IB0-N_j0N2FDhQdcw',
        callbackUrl:'http://121.199.58.200:3001/TalkTake/Photo/Upload/CallBack',
        callbackBody:'tags=$(x:tags)&desc=$(x:desc)&createTime=$(x:createTime)&location=$(x:location)&userId=$(x:userId)&isPublic=$(x:isPublic)',
        expires:7200
    },

    db: 'mongodb://127.0.0.1/TalkTake',
    port: 3001
};

exports.labels = {
    Category : '新奇',
    PhotoListSize : 100,
    CommentListSize : 100,

    DBError : 'Internal DB Error!',
    AuthError : 'Forbidden! You do not have permission to use this API!',
    requestError : 'Not a Legal request, please check the request url and mandatory params!',
    sessionError : 'Oppps...Lost Session',
    generateTokenError : 'Generate Qiniu Token Issue, pls try to upload to Server directly...'
}
