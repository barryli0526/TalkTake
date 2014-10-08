/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 8/28/14
 * Time: 4:42 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PhotoSchema = new Schema({
    user_id: { type: ObjectId , index:true },
    name : {type:String},
    description: { type: String},
    source_url : {type : String},
    location: {type : String},
    thumbnail_url : {type : String},

    isPublic: { type: Boolean, default: true },
    reply_count: { type: Number, default: 0 },
    shared_count: { type: Number, default: 0 },
    up_count: { type: Number, default: 0 },
    create_at: { type: Date, default: Date.now }
});

mongoose.model('Photo', PhotoSchema);
