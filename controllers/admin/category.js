var CategoryService = require('../../service').CategoryService;
var EventProxy = require('EventProxy');


exports.ShowAdd = function(req, res){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }
    var user = req.session.user;
    CategoryService.getCategoryByAuthorid(user._id, function(err, docs){
        res.render('admin/category/add',{
            categories:docs,
            layout:'admin/layout'
        });
    })
}



exports.Add = function(req, res, next){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }
    var data = req.body;
    var user = req.session.user;

    CategoryService.createACategory(user._id, data, function(err, category,message){

        if(err ){
            return next(err);
        }

     //   if(!category){
     //       return res.redirect('/admin/category/add');
     //   }

        if(!category){

        CategoryService.getCategoryByAuthorid(user._id, function(err, docs){
            res.render('admin/category/add',{
                categories:docs,
                layout:'admin/layout',
                error:message
            });
        })
        }else{
            res.redirect('/admin/category/edit');
        }
    })
}

exports.showEdit = function(req, res, next){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }

    var user = req.session.user;

    CategoryService.getCategoyListByAuthorId(user._id, function(err, categories){
        if(err){
          return next(err);
        }

        res.render('admin/category/edit',{
            categories:categories,
            layout:'admin/layout'
        })
    })
}

exports.Delete = function(req, res, next){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }

    var user = req.session.user;
    var categoryId = req.body.dataIds;
    if(!categoryId || categoryId.length === 0)
        categoryId =  req.params.categoryid;


    if(!categoryId){
        return res.redirect('/admin/category/edit');
    }



    CategoryService.deleteCategoryOfUser(user._id, categoryId, function(err){
        if(err){
            return next(err);
        }
        return res.redirect('/admin/category/edit');
    })
}


exports.showUpdate = function(req, res, next){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }

    var user = req.session.user;
    var categoryId = req.params.categoryid;

    var proxy = new EventProxy();
    var events = ['category','categorylist'];

    proxy.assign(events, function(category, list){


        res.render('admin/category/update',{
            categories:list,
            curcategory:category,
            layout:'admin/layout'
        })
    })

    CategoryService.getOneCategoryOfUser(user._id, categoryId, function(err, category){
        if(err){
            return next(err);
        }

         proxy.emit('category',category);

    })


    CategoryService.getCategoryByAuthorid(user._id, function(err, docs){
       if(err){
           return next(err);
       }

       proxy.emit('categorylist',docs);
    })

}

exports.Update = function(req, res, next){
    if(!req.session.user){
        return res.redirect('sign/signin');
    }

    var categoryId = req.params.categoryid;
    var data = req.body;
    var user = req.session.user;

    CategoryService.UpdateCategory(user._id, categoryId, data, function(err, category){
        if(err || !category){
            return next(err || '无权限或者异常');
        }
        return res.redirect('/admin/category/edit');
    })
}




