var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  uuid : {type:String, index:true, unique:true},
  nick_name:{type:String},
  first_name: { type: String },
  second_name : {type:String},
  sex: { type: String },
  constellation: { type: String },
  selfDesc:{type:String},
  siteUrl : {type:String},
  telephone : {type : String},
  location : {type : String},
//  address: {
//        country:{type:String},
//        city:{type:String},
//        county:{type:String}
//  },
  signature: { type: String },
  avatar: { type: String },
  qr_code:{type:String},
  privacy:{type:Number, default:0},

  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

UserSchema.virtual('realName').get(function(){
    var firstName = this.first_name ? this.first_name : '',
        secondName = this.second_name ? this.second_name : '';
    return firstName + secondName;
})

UserSchema.virtual('showName').get(function(){
    if(this.nick_name){
        return this.nick_name;
    }else{
        return this.realName;
    }
})




mongoose.model('User', UserSchema);
