var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CommentSchema = new Schema({
	content: { type: String },
	photo_id: { type: ObjectId, ref:'Photo', index: true },
	author_id: { type: ObjectId, ref:'User' },
    ups:[{ type: ObjectId}],
	create_at: { type: Date, default: Date.now }
});

mongoose.model('Comment', CommentSchema);
