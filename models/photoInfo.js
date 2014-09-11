/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 8/28/14
 * Time: 4:43 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PhotoInfoSchema = new Schema({
    photo_id:{ type: ObjectId },
    reply_count: { type: Number, default: 0 },
    shared_count: { type: Number, default: 0 },
    up_count: { type: Number, default: 0 }
});

mongoose.model('PhotoInfo', PhotoInfoSchema);
