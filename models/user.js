var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  nickname: { type: String, index: true },
  login_id: { type: String, unique: true },
  pass: { type: String },
  email: { type: String, unique: true },
  telephone : {type : Number},
  location: { type: String },
  signature: { type: String },
  from : {type : String},
  avatar: { type: String },

  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now }
});

mongoose.model('User', UserSchema);
