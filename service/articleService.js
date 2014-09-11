var ObjectId = require('mongoose').Types.ObjectId;
var dbHelper = require('../dbHelper');
var Article = dbHelper.Article;
var Comment = dbHelper.Comment;
var ArticleInfo = dbHelper.ArticleInfo;
var User = dbHelper.User;
var UserInfo = dbHelper.UserInfo;
var CategoryInfo = dbHelper.CategoryInfo;
var CategoryRelation = dbHelper.CategoryRelation;
var Tag = dbHelper.Tag;
var Message = require('../config/message').Message;
var util = require('../lib/util');
var CategoryService = require('./CategoryService');
var CommentService = require('./CommentService');
var EventProxy = require('EventProxy');


/*exports.CreateArticle = function(authorid, title, summary, content, categories, tags, mkeywords, mdesc, callback){

    if(typeof(authorid) === "string"){
        authorid =  new ObjectId(authorid);
    }

    Article.newAndSave(authorid, title, summary, content, tags,mkeywords,mdesc,function(err, article){
        if(err){
            return callback(Message.Db.default, null);
        }

        if(!article){
            return callback(Message.Article.post_error,null);
        }

        //更新articleInfo
        ArticleInfo.newAndSave(article._id,function(err,info){
				///		console.log(info);
        })

        //更新userInfo,postCount +1, scrote+5
        UserInfo.addMultiFiledCount(authorid, 'score,post_count','5',function(err){

        })

        //更新categoryRelation   和 categoryInfo
        var category = categories.split(',');

        for(var i=0;i<category.length;i++){
            var categoyid = new ObjectId(category[i]);
            CategoryRelation.newAndSave(article._id,categoyid);
            CategoryInfo.addArticleCount(categoyid);
        }

        //更新tag

        //返回更新结果，忽视掉其他的更新
        return callback(null, article);
    })
}   */


exports.CreateArticle = function(authorid, data, callback){
    if(typeof(authorid) === "string"){
        authorid =  new ObjectId(authorid);
    }

    var doc = data;
    var categories = data.categories;
    doc.categories = null;
    //add
    if(doc.tags){
        doc.tags = doc.tags.split(',');
    }

    Article.newAndSave(authorid, doc, function(err, article){
        if(err || !article){
            return callback(err, null);
        }

        //更新articleInfo
        ArticleInfo.newAndSave(article._id,function(err,info){
            ///		console.log(info);
        })

        //更新userInfo,postCount +1, scrote+5
        UserInfo.addMultiFiledCount(authorid, 'score,post_count','5',function(err){

        })

        //更新categoryRelation   和 categoryInfo
        if(categories.length !== 0){
        var category = categories.split(',');

        for(var i=0;i<category.length;i++){
            var categoyid = new ObjectId(category[i]);
            CategoryRelation.newAndSave(article._id,categoyid);
            CategoryInfo.addArticleCount(categoyid);
        }
        }

        //更新tag

        //返回更新结果，忽视掉其他的更新
        return callback(null, article);
    })

}

/**
 * update article
 * @param articleid
 * @param data
 * @param callback
 * @returns {*}
 * @constructor
 */
exports.UpdateArticle = function(articleid, data, callback){
    if(typeof(data) === "string"){
        try{
            data = JSON.parse(data);
        }catch(e){
            return callback(Message.wrong_format + '.Data is:'+ data);
        }
    }

    if(typeof(articleid) === "string"){
        articleid = new ObjectId(articleid);
    }

    data.categories = null;
    var removed = util.transtoObjectArray(data.category_removed);
    var added = util.transtoObjectArray(data.category_added);

    data.category_removed = null;
    data.category_added = null;

    if(data.tags){
        data.tags = data.tags.split(',');
    }


    Article.updateArticle(articleid, data, function(err, article){
        if(err || !article){
            return callback(err, null);
        }


        if(removed && removed.length != 0){
            CategoryRelation.removeCategoriesOfArticle(articleid, removed,function(err){
                if(err){
                    return callback(err);
                }
            })
            removed.forEach(function(removedId){
                if(typeof(removedId) === 'string')
                    removedId = new ObjectId(removedId);
                console.log(removedId);
                 CategoryInfo.deleteArticleCount(removedId,function(err){
                     if(err)
                        return callback(err);
                 })
            })
        }
        if(added && added.length != 0){
            added.forEach(function(addId){
                if(typeof(addId) === 'string')
                    addId = new ObjectId(addId);

                console.log(addId);
                CategoryRelation.newAndSave(articleid,addId);
                CategoryInfo.addArticleCount(addId);
            })
        }

        return callback(null, article);
    })
}

/**
 * 根据用户名获取用户的文章
 * @param loginname
 * @param pageSize
 * @param pageIndex
 * @param callback
 */
exports.getArticleOfUser = function(loginname, pageSize, pageIndex, callback){

    var proxy = new EventProxy();

    User.getUserByLoginName(loginname, function(err, user){
        if(err){
            return callback(Message.Db.default, null);
        }

        if(!user){
            return callback(Message.User.is_exsits);
        }

        var username = user.nickname;

        Article.getArticlesByAuthorId(user._id, pageSize, pageIndex, function(err, docs){
            if(err){
                return callback(Message.Db.default, null);
            }

            FillContent(docs, callback);
        })
    })
}


/**
 * 根据返回的文章列表一次获取文章相关信息，如作者等
 * callback:
 *  -articles  文章列表
 * @param docs
 * @param callback
 * @returns {*}
 * @constructor
 */
var FillContent = function(docs, callback){
    if(!docs || docs.length === 0){
        return callback(null, []);
    }

    var proxy = new EventProxy();
    
    var articles = [];

    //文章内容填充完毕，返回
    proxy.after('article_ready',docs.length,function(){
        return callback(null, articles);
    });

    docs.forEach(function(article, i){
        //一篇文章信息获取完毕,计数加1   
        var events = ['user'+i,'articleinfo'+i,'category'+i];
        proxy.assign(events, function(user,articleinfo,category){
            article.post_time = util.format_date(article.create_at,false);
            article.user = user;
            article.info = articleinfo;
            article.category = category;
            articles[i] = article;
            proxy.emit('article_ready');
        });
        //获取文章作者信息
       User.getUserById(article.author_id, function(err, doc){
           if(err || !doc){
               //log error here
               proxy.emit('user'+i,null);
           }

           proxy.emit('user'+i,doc);
       });
       //获取文章统计信息
       ArticleInfo.getArticleInfoById(article._id, function(err, doc){
           if(err || !doc){
               //log error here
               proxy.emit('articleinfo'+i,{});
           }
           //article.info = doc;
           proxy.emit('articleinfo'+i,doc);
       })

       CategoryService.getCategoryByArticleId(article._id, proxy.done('category'+i));

    })


}

/**
 * 获取最新的文章
 * callback:
 *  -articles  文章列表
 * @param count
 * @param callback
 */
exports.getLatestArticles = function(count, callback){
     if(typeof(count) !== "number"){
         count = parseInt(count);
     }

    Article.findlatestArticles(count, function(err, docs){
        FillContent(docs,callback);
    })
}

/**
 * 获取最热门评论的文章
 * callback:
 *  -articles  文章列表
 * @param count
 * @param callback
 */
exports.getHotArticles = function(count, callback){
    if(typeof(count) !== "number"){
        count = parseInt(count);
    }

    ArticleInfo.getArticlesSortByReply(count, function(err, docs){
    		
    		var proxy = new EventProxy();
    		var articlesid = [];

    		proxy.assign('article_ready',function(){
    			
    		});
    		
    		docs.forEach(function(doc,i){
					articlesid.push(doc.article_id);
    		});
    		
    		Article.getArticlesByIds(articlesid,count,0,function(err, articles){
    			  FillContent(articles,callback);
    		});
    		
      
    })
}



exports.getArticles = function(pageSize, pageIndex, callback){
    Article.getArticles(pageSize, pageIndex, function(err, docs){
        if(err){
            return callback(Message.Db.default, null);
        }

        FillContent(docs, callback);
    })

}

var FillDetailInfo = function(doc, callback){

    var proxy = new EventProxy();
    var events = ['user','articleinfo','category','tags','comments'];

    proxy.assign(events, function(user, articleinfo, category, tags, comments){
        doc.post_time = util.format_date(doc.create_at,false);
        doc.user = user;
        doc.info = articleinfo;
        doc.info.visit_count += 1;
        doc.category = category;
      //  doc.tags = tags;
        doc.comments = comments;
        return callback(null,doc);
    })

    User.getUserById(doc.author_id, proxy.done('user'));
    ArticleInfo.getArticleInfoById(doc._id, proxy.done('articleinfo'));
    CategoryService.getCategoryByArticleId(doc._id, proxy.done('category'));
    CommentService.geCommentsOfArticle(doc._id,10,0, function(err,comments){
    	proxy.emit('comments',comments);
    });
    proxy.emit('tags');
    //TagService.getTagByArticleid(doc._id,proxy.done('tags'));
}

/**
 * 获取文章的详细信息
 * @param articleid
 * @param callback
 */
exports.getDetailsofArticle = function(articleid, callback){
    if(typeof(articleid) === "String"){
        articleid = new ObjectId(articleid);
    }

    Article.findOneById(articleid, function(err, doc){
        if(err){
            return callback(Message.Db.default);
        }

        if(!doc){
             return callback(Message.Article.not_exsits);
        }
        FillDetailInfo(doc, callback);
        ArticleInfo.addVisitCount(articleid,function(){});
    })
}


exports.getArticlesByCategory = function(categoryid, pageSize, pageIndex, callback){

    if(typeof(categoryid) === 'string'){
        categoryid = new ObjectId(categoryid);
    }


   CategoryRelation.getArticlesByCategoryId(categoryid,pageSize, pageIndex, function(err, ids){
       Article.getArticlesByIds(ids,function(err, docs){



           FillContent(docs, callback);
       });
   })
}

exports.getCountOfArticles = function(callback){
    Article.getCountByQuery({},callback);
}

exports.getArticleNumOfUser = function(userId, callback){
    if(typeof(userId) === 'string'){
        userId = new ObjectId(userId);
    }
    Article.getCountByQuery({author_id : userId},callback);
}

exports.getArticlesByTag = function(tags, callback){
     if(typeof(tags) === 'string'){
         tags = tags.split(',');
     }

    Article.getArticlesByTag(tags, function(err, docs){
        FillContent(docs, callback);
    });
}

exports.getArticleNumOfTag = function(tags, callback){
    if(typeof(tags) === 'string'){
        tags = tags.split(',');
    }
    Article.getCountByQuery({tags : {$all:tags}},callback);
}

exports.deleteOneArticleOfUser = function(articleid, userid, callback){
    if(typeof(articleid) === "String"){
        articleid = new ObjectId(articleid);
    }
    if(typeof(userid) === "String"){
        userid = new ObjectId(userid);
    }

    Article.deleteArticleOfUser(articleid, userid,function(err){
        if(err){
            return callback(err);
        }
        //进行一系列的连带删除操作
        //删除info表
        ArticleInfo.removeInfoByArticleId(articleid, function(err){

        })
        //删除评论
        Comment.removeCommentsOfArticle(articleid, function(err, num){
            if(err){
                return callback(err);
            }
            //删除评论数和文章数
            UserInfo.deleteMultiFiledCount(userid,'reply_count,post_count',num+',1',function(err){

            });
        })
        //删除目录相关
        CategoryRelation.getCategoryByArticleId(articleid, function(err, docs){
            if(err){
                return callback(err);
            }

            CategoryRelation.removeCategoriesOfArticle(articleid, docs, function(err){
                if(err){
                    return callback(err);
                }
            })
            //依次删除目录信息
            docs.forEach(function(doc){
                doc = new ObjectId(doc);
                CategoryInfo.deleteArticleCount(doc,function(){});
            })
        })

        //无视删除结果,直接响应
        return callback(null);
    });
}

exports.deleteMultiArticlesOfUser = function(articleIds,userId, callback){
    Article.deleteMultiArticlesOfUser(articleIds, userId, function(err){
        if(err){
            return callback(err);
        }

        ArticleInfo.removeMultiInfo(articleIds, function(err){
            if(err)
                return callback(err);
        })

        Comment.removeCommentsOfMultiArticles(articleIds, function(err){
            if(err)
                return callback(err);
        })

        CategoryService.removeCategoryRelationOfMultiArticle(articleIds,function(err){
            if(err)
                return callback(err);
        })

        return callback();
    })
}

//for test
exports.deleteAllArticles = function(callback){
    Article.deleteAll(callback);
}
