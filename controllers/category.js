var ArticleService = require('../service').ArticleService;
var TagService = require('../service').TagService;
var CategoryService = require('../service').CategoryService;
var config = require('../config/base').config;
var EventProxy = require('EventProxy');


exports.detail = function(req, res, next){

    var pagenum = req.query.page ? parseInt(req.query.page) : 0;
    var id = req.params.categoryid;
    var pagesize = config.list_post_count;

    var proxy = new EventProxy();
    var events = ['articles','count','hotarticles','categories','tags'];

    proxy.assign(events, function(articles, count, hotarticles,categories,tags){
        res.render('category/detail',{
            articles:articles,
            pagenum:pagenum,
            count:count,
            hotarticles:hotarticles,
            categories:categories,
            tags:tags
        });
    }).fail(next);


    ArticleService.getArticlesByCategory(id,pagesize, pagenum, function(err, articles){
        proxy.emit('articles',articles);
    })

    ArticleService.getHotArticles(10, function(err, articles){
        proxy.emit('hotarticles', articles);
    });

    CategoryService.getAllCategory(function(err, categories){
        proxy.emit('categories', categories);
    });

    CategoryService.getCountofCategory(id,function(err, count){
        var limit = config.list_post_count;
        var pages = Math.ceil(count / limit);
        proxy.emit('count',pages);
    });

    TagService.getTags(function(err, resutls){
        proxy.emit('tags', resutls);
    })
}