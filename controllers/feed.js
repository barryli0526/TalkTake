var parser = require('../service/Parser');
var request = require('request');
var iconv = require('iconv-lite');
var Buffer = require('Buffer');
var utils = require('../lib/util');
var feedconfig = require('../config/feeds').feedlist;


exports.index = function(req, res, next){

  //  parser.ParseRequest(function(err, docs){
  //      res.render('feeds/index',{
  //          feeds:docs
  //      })
  //  })

    res.render('feeds/index');

}

exports.getFeed = function(req, res){
    var fd_name = req.query.fdname;

    var feedOption = feedconfig[fd_name];
    if(!feedOption)
        return res.end('还未加入该请求源');

    parser.ParseRequest(feedOption,function(err, docs){
        res.render('feeds/detail',{
            feeds:docs,
            layout:null
        })
    })

}


exports.getDetail = function(req, res){

    var url = req.query.url;
    var fd_name = req.query.fdname;
    var feedOption = feedconfig[fd_name];
    if(!feedOption)
        return res.end('还未加入该请求源');

    parser.getContentByUrl(url,feedOption.filterOption, function(err, content){
        res.send(content);
    })

}


exports.downLoadImg = function(req, res){

    var url = req.query.u;

    if(!url || !utils.isImage(url)){
        return res.end('');
    }

   // console.log(url);
    //似乎这边容易出现getaddrinfo ENOENT错误，偶尔发生。。。

    //直接打出到界面吧。。没这么大地儿存储
    request(url).pipe(res);

}