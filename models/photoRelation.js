/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 8/28/14
 * Time: 4:46 PM
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PhotoRelationSchema = new Schema({
    photo_id: { type: ObjectId },
    category_id: { type: ObjectId },
    create_at: { type: Date, default: Date.now }
});

mongoose.model('PhotoRelation', PhotoRelationSchema);