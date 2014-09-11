var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserInfoSchema = new Schema({
    user_id: { type: ObjectId, index:true, unique: true},

    post_count: { type: Number, default: 0 },
    reply_count: { type: Number, default: 0 },
    follower_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
    collect_tag_count: { type: Number, default: 0 }
});

mongoose.model('UserInfo', UserInfoSchema);
