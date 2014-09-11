var ArticleService = require('../../service').ArticleService;
var CommentService = require('../../service').CommentService;
var CategoryService = require('../../service').CategoryService;
var config = require('../../config/base').config;
var EventProxy = require('EventProxy');

exports.Add = function(req, res, next){

    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }
    var user = req.session.user;

     var article = req.body;

    article.top = article.top ? true : false;
    article.enable_comment = article.enable_comment ? true : false;

    ArticleService.CreateArticle(user._id, article, function(err, article){
        if(err){
            return next(err);
        }

        if(!article){
            return next("添加失败");
        }

        res.redirect('/admin');
    })
}

exports.showAdd = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }else{
        var user =  req.session.user;
        var proxy = new EventProxy();
        var events = ['category'];
        proxy.assign(events, function(category){

            res.render('admin/article/add',{
                categories:category,
                layout:'admin/layout'
            });
        }).fail(next);

        CategoryService.getCategoryByAuthorid(user._id,function(err, category){
            proxy.emit("category",category);
        });
    }
}

exports.Delete = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }

    var user = req.session.user;
    var articleIds = req.body.dataIds;

    ArticleService.deleteMultiArticlesOfUser(articleIds, user._id, function(err){
        if(err){
            return next(err);
        }
        res.end();
    })

}

exports.DeleteOne = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }

    var user = req.session.user;
    var articleid = req.params.articleid;

    ArticleService.deleteOneArticleOfUser(articleid, user._id, function(err){
        if(err){
            return next(err);
        }
        res.redirect('/admin/article/edit');
    })
}

exports.showEdit = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }

    var user = req.session.user;
    var pagenum = req.query.page ? parseInt(req.query.page) : 0;
    var pagesize = req.query.listcount ? parseInt(req.query.listcount) : 10;
  //  var action = req.query.action;
    var proxy = new EventProxy();
    var events = ['articles','count'];
    proxy.assign(events, function(articles,count){
        res.render('admin/article/edit',{
            articles:articles,
            pagenum:pagenum,
            count:count,
            layout:'admin/layout'
        });
    });

    ArticleService.getArticleOfUser(user.loginname,pagesize, pagenum, function(err,articles){
        proxy.emit('articles',articles);
    })

    ArticleService.getArticleNumOfUser(user._id, function(err, count){
        var pages = Math.ceil(count / pagesize);
        proxy.emit('count',pages);
    });

}

exports.showUpdte = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }

    var articleid = req.params.articleid;

    var user =  req.session.user;
    var proxy = new EventProxy();
    var events = ['category','article'];
    proxy.assign(events, function(category,article){

        res.render('admin/article/update',{
            article:article,
            categories:category,
            layout:'admin/layout'
        })
    })

    CategoryService.getCategoryByAuthorid(user._id,function(err, category){
        proxy.emit("category",category);
    });

    ArticleService.getDetailsofArticle(articleid, function(err, article){
      if(err){
          return next(err);
      }

      var arr =[];
      article.category.forEach(function(doc){
          arr.push(doc._id.toString());
      })
        article.categoryIds = arr;
      proxy.emit('article',article);
    })
}


exports.Update = function(req, res, next){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }
    var user = req.session.user;
    var articleid = req.params.articleid;

    var article = req.body;


    article.top = article.top ? true : false;
    article.enable_comment = article.enable_comment ? true : false;

    ArticleService.UpdateArticle(articleid,article, function(err, article){
        if(err || !article){
            return next(err || '添加失败');
        }

        res.end();
       // res.redirect('/admin');
    })

}


