/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 11/18/14
 * Time: 3:29 PM
 * To change this template use File | Settings | File Templates.
 */

var User = require('../models').User;
var ObjectId = require('mongoose').Types.ObjectId;

/**
 *
 * @param sourceUUID 需要保留的这一条用户记录,也就是之前的版本的用户
 * @param targetUUID 新生成的用户的uuid，需要被删除记录
 * @param callback
 */
var updateUserWithUID = function(sourceUUID, targetUUID, callback){
    User.findOne({uuid: sourceUUID}, function(err,doc){
        User.remove({uuid:targetUUID}, function(err,removed){
            doc.uuid = targetUUID;
            doc.save(function(err,newDoc){
                console.log(newDoc);
                return callback(null,{});
            });
        });

    })
}

updateUserWithUID(1,2,function(){})