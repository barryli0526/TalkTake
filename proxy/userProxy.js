/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 12/9/14
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

var config = require('../config/base').config;
var UserService = require('../service/UserService');

var enableRedisCache = config.enableRedisCache;

var UserProxy = {

    queryClient : function(uuid, callback){
        if(enableReidsCache){

        }
    },

    createClient : function(uuid, callback){

        if(enableRedisCache){

        }
    }
}