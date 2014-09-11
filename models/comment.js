var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
	content: { type: String },
	photo_id: { type: ObjectId, index: true },
	user_id: { type: ObjectId },
//	reply_id : { type: ObjectId },
	create_at: { type: Date, default: Date.now }

//    up_count:{ type: Number, default:0},
//    down_count:{ type: Number, default:0}
});

mongoose.model('Comment', CommentSchema);
