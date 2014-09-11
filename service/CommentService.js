var ObjectId = require('mongoose').Types.ObjectId;
var dbHelper = require('../dbHelper');
var Comment = dbHelper.Comment;
var CommentInfo = dbHelper.CommentInfo;
var User = dbHelper.User;
var UserInfo = dbHelper.UserInfo;
var ArticleInfo = dbHelper.ArticleInfo;
var Tag = dbHelper.Tag;
var Message = require('../config/message').Message;
var util = require('../lib/util');
var EventProxy = require('EventProxy');
var at = require('../extensions/at');

exports.geCommentsOfArticle = function(articleid, pageSize, pageIndex, callback){

    if(typeof(articleid) === "string"){
        articleid = new ObjectId(articleid);
    }

    var proxy = new EventProxy();

    Comment.getCommentsByArticleId(articleid, function(err, docs){
        if(err){
            return callback(Message.Db.default);
        }
        
        if(docs.length === 0){
        	
            return callback(null, []);
        }

        var comments = [];
        proxy.after('comment_ready',docs.length, function(){
            return callback(null, comments);
        })
					
        docs.forEach(function(comment,i){
        	var events = ['user'+i,'@user'+i];
        	proxy.assign(events, function( user,content){
        		//comment.info = commentinfo;
        		comment.user = user;
        		comment.content = content;
        		comments[i] = comment;
        		proxy.emit('comment_ready');
        	});
         /* CommentInfo.findOneById(comment._id, function(err, commentinfo){
                if(err || !commentinfo){
                    //log error here
                    proxy.emit('commentinfo'+i,{});
                }else{
                    proxy.emit('commentinfo'+i,commentinfo);
                }
          }) */
          if(comment.author_id){
            User.getUserById(comment.author_id, function(err, user){
            	  if(err || !user){
                    proxy.emit('user'+i,{});
                }else{
                    proxy.emit('user'+i,user);
                }
            });     
          }else{
          	proxy.emit('user'+i,{nickname:'匿名'});
          }
          //处理评论中@符号
    			at.linkUsers(comment.content, proxy.done(function (content) {
      			proxy.emit('@user'+i,content);
    			}));           
        })
    })
}

exports.addCommentsOfArticle = function(articleid,authorid,content,replyid, callback){
	
	if(typeof(articleid) === "string"){
		articleid = new ObjectId(articleid);
	}

	Comment.newAndSave(articleid, authorid, content, replyid,function(err, comment){
		if(err){
			return callback(Message.Db.default);
		}
		//添加评论信息
        //已经移除commentInfo
		/*CommentInfo.newAndSave(comment._id, function(){
			
		});*/
		//更新用户评论数
		if(authorid){
		UserInfo.addReplyCount(authorid,function(){
			
		});
		}
		
		ArticleInfo.addReplyCount(articleid,function(){
			
		});
		return callback(null, comment);
	});
}


exports.removeCommentsOfArticle = function(articleid, callback){
    if(typeof(articleid) === "string"){
        articleid = new ObjectId(articleid);
    }

    Comment.removeCommentsOfArticle(articleid, function(err, num){
        if(err){
            return callback(err);
        }

        return callback(null, num);

    })
}