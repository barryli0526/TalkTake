var crypto = require('crypto');
var ObjectId = require('mongoose').Types.ObjectId;
var fs = require('fs');
var childProcess = require('child_process');


exports.makeErrorResponse = function(){

}

/**
 * 获取标准时间
 * @returns {string}
 */
exports.getDateTime = function() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec;

}


/**
 * 格式化成功返回信息
 * @param data
 * @returns {*}
 */
exports.combineSuccessRes = function(data){
//    var resData = [];
//    if(!(data instanceof Array)){
//        resData.push(data);
//    }else{
//        resData = data;
//    }
    var libert = {apiStatus:"success",msg:''};
    libert.data = data;
    return JSON.stringify(libert);
}

/**
 * 格式化错误返回信息
 * @param err
 * @returns {*}
 */
exports.combineFailureRes = function(err){
    var libert = {apiStatus:"failure"};
    libert.msg = err;
    return JSON.stringify(libert);
}


exports.format_date = function (date, friendly) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if (friendly) {
    var now = new Date();
    var mseconds = -(date.getTime() - now.getTime());
    var time_std = [ 1000, 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000 ];
    if (mseconds < time_std[3]) {
      if (mseconds > 0 && mseconds < time_std[1]) {
        return Math.floor(mseconds / time_std[0]).toString() + ' ??';
      }
      if (mseconds > time_std[1] && mseconds < time_std[2]) {
        return Math.floor(mseconds / time_std[1]).toString() + ' ???';
      }
      if (mseconds > time_std[2]) {
        return Math.floor(mseconds / time_std[2]).toString() + ' ???';
      }
    }
  }

  //month = ((month < 10) ? '0' : '') + month;
  //day = ((day < 10) ? '0' : '') + day;
  hour = ((hour < 10) ? '0' : '') + hour;
  minute = ((minute < 10) ? '0' : '') + minute;
  second = ((second < 10) ? '0': '') + second;

 // var thisYear = new Date().getFullYear();
  //year = (thisYear === year) ? '' : (year + '-');
    year =  year + '-';
  return year + month + '-' + day + ' ' + hour + ':' + minute;
};


/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

exports.escape = function(html) {
    return String(html)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};


exports.transformToJSON = function(filedname, value){

    var fileds = filedname.split(',');
    var values = value.split(',');

    var len = fileds.length > values.length ? (values.length) : (fileds.length);

    var jsonstr = '{';

    for(var i=0;i<len;i++){
        if(i > 0)
            jsonstr += ',';
        jsonstr += '"' + fileds[i] + '":"' + values[i] +'"';
    }
    jsonstr += '}';

    try{
        return JSON.parse(jsonstr);
    }catch(e){
        return jsonstr;
    }

}

exports.encrypt = function(str, secret){
    var cipher = crypto.createCipher('aes192', secret);
    var enc = cipher.update(str, 'utf8', 'hex');
    enc += cipher.final('hex');
    return enc;
}

exports.decrypt = function(str, secret){
    var decipher = crypto.createDecipher('aes192', secret);
    var dec = decipher.update(str, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

exports.transToArray = function(str){
    if(typeof(str) === 'string')
        return str.split(',');
    return str;
}

exports.transtoObjectArray = function(str){
    var arr = [];
    if(typeof(str) === 'string'){
       arr = str.split(',');
       return exports.transToObjectId(arr);
    }else{
        return str;
    }
}

exports.transToObjectId = function(param){
    if(!param){
        return null;
    }
    if(typeof(param) === 'string')
        return new ObjectId(param);
    else if(param instanceof Array){
        var arr = new Array();

        for(var i=0;i<param.length;i++){
            var id = param[i];
            if(typeof(id) === 'string' && id !== ''){
                arr[i] = new ObjectId(id);
            }else if(id !== ''){
                arr[i] = id;
            }
        }
        return arr;
    }
    return param;
}

exports.isImage = function(str){
    var ext = str.split('.');
    ext = ext[ext.length-1];
    return /^(jpg|png|jpeg|gif)$/i.test(ext);
}


exports.parseCookie = function(cookie){
    var cookies = {};
    cookie.split(';').forEach(function(cookie){
        var parts = cookie.split('=');
        cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
    return cookies;
}

function deleteFolderRecursice(path){
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursice(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

exports.deleteFolderRecursice = deleteFolderRecursice;


var pth = require('path');

exports.createSnapShot = function(content, type, path, callback){

    var snapshot = pth.resolve('lib/snapshot.js');

    var cmd = 'phantomjs ' + snapshot + ' ' + type + ' ' + content + ' ' + path;

    childProcess.exec(cmd, function(err, stdout, stderr) {
        return callback();
    });



}