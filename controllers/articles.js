var ArticleService = require('../service').ArticleService;
var CommentService = require('../service').CommentService;
var CategoryService = require('../service').CategoryService;
var TagService = require('../service').TagService;
var config = require('../config/base').config;
var EventProxy = require('EventProxy');


exports.index = function(req, res, next){	
    var pagenum = req.query.page ? parseInt(req.query.page) : 0;
    var pagesize = config.list_post_count;
    var proxy = new EventProxy();
    var events = ['articles','count','hotarticles','categories','tags'];
    proxy.assign(events, function(articles, count, hotarticles,categories,tags){
    	res.render('article/index',{
    		articles:articles,
    		pagenum:pagenum,
    		count:count,
    		hotarticles:hotarticles,
    		categories:categories,
            tags:tags
    	});
    }).fail(next);

    ArticleService.getArticles(pagesize, pagenum, function(err,articles){
    proxy.emit('articles',articles);
    })
    
    ArticleService.getCountOfArticles(function(err, count){
    	var limit = config.list_post_count;
    	var pages = Math.ceil(count / limit);
    	proxy.emit('count',pages);
    });
    
    ArticleService.getHotArticles(10, function(err, articles){
    	proxy.emit('hotarticles', articles);
    });
    
    CategoryService.getAllCategory(function(err, categories){
    	proxy.emit('categories', categories);
    });

    TagService.getTags(function(err, resutls){
        proxy.emit('tags', resutls);
    })
}

exports.detail = function(req, res, next){
	var articleid = req.params.articleid;
	var proxy = new EventProxy();
	var events = ['article','hotarticles','categories','tags'];
	proxy.assign(events, function(article, hotarticles, categories,tags){
		res.render('article/detail',{
			article:article,
			hotarticles:hotarticles,
            categories:categories,
            tags:tags
		});
	});

	ArticleService.getDetailsofArticle(articleid, function(err, article){
		proxy.emit('article',article);
	});
	
	 ArticleService.getHotArticles(10, function(err, articles){
    	proxy.emit('hotarticles', articles);
   });
    
   CategoryService.getAllCategory(function(err, categories){
    	proxy.emit('categories', categories);
   });

    TagService.getTags(function(err, resutls){
        proxy.emit('tags', resutls);
    })
	
}

exports.comment = function(req, res, next){

	var articleid = req.params.articleid;
	var commentid = req.params.commentid;
	if(!commentid)
		commentid = null;
	var content = req.body.t_content;

	CommentService.addCommentsOfArticle(articleid,null,content,commentid,function(err,comment){
		res.redirect('/articles/detail/'+articleid);
	});
}
