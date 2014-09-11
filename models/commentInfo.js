var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentInfoSchema = new Schema({
    comment_id:{ type: ObjectId },
    up_count:{ type: Number},
    down_count:{ type: Number}
});

mongoose.model('CommentInfo', CommentInfoSchema);
