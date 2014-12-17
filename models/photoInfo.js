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
    photo_id:{ type: ObjectId , ref : 'Photo'},
    author_id:{type:ObjectId, ref : 'User'},
    tags:{type:Array},
    isPublic:{type:Boolean, default:true},
    forward:[
        {
            forward_at:{type:Date},
            forwarder_id:{type:ObjectId, ref:'User'},
            forward_text:{type:String} ,
            forward_from : {type:String},
            _id:false
        }
    ],
    like:[
        {
            like_at:{type:Date},
            liker_id:{type:ObjectId, ref:'User'},
            _id:false
        }
    ],
    visit:[
        {
            visit_at:{type:Date},
            visiter_id:{type:ObjectId, ref:'User'},
            visit_count:{type:Number, default:1},
            _id:false
        }
    ],
    reply_count: { type: Number, default: 0 },
    post_at:{type:Date, default:Date.now()},
    last_update:{type:Date, default:Date.now()}
});

mongoose.model('PhotoInfo', PhotoInfoSchema);
