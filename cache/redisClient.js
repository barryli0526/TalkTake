/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 10/23/14
 * Time: 4:13 PM
 * To change this template use File | Settings | File Templates.
 */

var redisClient = function(){

}

redisClient.prototype.Init = function(client){
    this.client = client;
}

redisClient.prototype.addToSet = function(key, value, expires){
    this.client.sadd(key, value);
    this.client.expires(key,expires);
}