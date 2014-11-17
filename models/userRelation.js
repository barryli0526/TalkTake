var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/**
 * @type {Schema}
 * status
 *      0    陌生人
 *      1    粉丝
 *      2    偶像
 *      3    好友
 *      4    亲密好友
 */
var UserRelationSchema = new Schema({
  user_id: { type: ObjectId },
  follow_id: { type: ObjectId , ref:'User'},
  status:{type:Number, default:0},
  remark_first_name:{type:String},
  remark_second_name:{type:String},
  create_at: { type: Date, default: Date.now }
});

UserRelationSchema.virtual('isFollowing').get(function(){
    var isFollowing = (this.status >= 2) ? true :false;
    return isFollowing;
})

UserRelationSchema.virtual('remark_name').get(function(){
    var firstName = this.remark_first_name ? this.remark_first_name : '',
        lastName = this.remark_second_name ? this.remark_second_name : '';
    return firstName + lastName;
})

mongoose.model('UserRelation', UserRelationSchema);
