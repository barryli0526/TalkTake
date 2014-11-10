/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 11/7/14
 * Time: 4:30 PM
 * To change this template use File | Settings | File Templates.
 */
var dbHelper = require('../dbHelper');
var APIInfo = dbHelper.APIInfo;

exports.addApiCount = function(url,method, callback){
    APIInfo.addCount(url,method, callback);
}