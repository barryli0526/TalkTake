var ArticleService = require('../service').ArticleService;
var EventProxy = require('EventProxy');
var CategoryService = require('../service').CategoryService;
var TagService = require('../service').TagService;
var config = require('../config/base').config;


exports.detail = function(req, res, next){

    var pagenum = req.query.page ? parseInt(req.query.page) : 0;
    var tag = req.params.tagname;
    var pagesize = config.list_post_count;

    var proxy = new EventProxy();
    var events = ['articles','count','hotarticles','categories','tags'];

    proxy.assign(events, function(articles, count, hotarticles,categories,tags){

        res.render('tag/detail',{
            articles:articles,
            pagenum:pagenum,
            count:count,
            hotarticles:hotarticles,
            categories:categories,
            tags:tags
        });
    }).fail(next);



    ArticleService.getArticlesByTag(tag, function(err, articles){
        proxy.emit('articles', articles);
    })

    ArticleService.getHotArticles(10, function(err, articles){
        proxy.emit('hotarticles', articles);
    });

    CategoryService.getAllCategory(function(err, categories){
        proxy.emit('categories', categories);
    });

    ArticleService.getArticleNumOfTag(tag,function(err, count){
        var pages = Math.ceil(count / pagesize);
        proxy.emit('count',pages);
    });

    TagService.getTags(function(err, resutls){
        proxy.emit('tags', resutls);
    })
}