var Tags = require('../dbHelper/tag');


exports.getTags = function(callback){
    Tags.getTags(callback);
}