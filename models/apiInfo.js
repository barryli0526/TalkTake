/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 11/7/14
 * Time: 4:06 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ApiInfoSchema = new Schema({
    url:{type : String},
    method : {type : String},
//    area : {type : String},
    count : { type : Number, default : 0},
    create_at: { type: Date, default: Date.now }
});

mongoose.model('ApiInfo', ApiInfoSchema);
