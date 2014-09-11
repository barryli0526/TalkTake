var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CategorySchema = new Schema({
//    parent_id: { type: ObjectId},
    category_name: { type: String},
    category_description:{ type: String},
    cover_image : {type : String},
    user_id:{type:ObjectId},

    create_at:{ type: Date, default: Date.now}
});

mongoose.model('Category', CategorySchema);