/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 11/7/14
 * Time: 4:22 PM
 * To change this template use File | Settings | File Templates.
 */
var models = require('../models');
var APIInfo = models.ApiInfo;


/**
 * 增加url的统计
 * @param url
 * @param callback
 */
exports.addCount = function(url, method, callback){
    APIInfo.findOne({url : url, method : method}, function(err, doc){
        if(err){
            return callback(err);
        }else if(!doc){
          var info = new APIInfo();
            info.url = url;
            info.method = method;
            info.count = 1;
            info.save(callback);
        }else{
            doc.count += 1;
            doc.save(callback);
        }
    })
}