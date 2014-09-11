var ObjectId = require('mongoose').Types.ObjectId;
var dbHelper = require('../dbHelper');
var Category = dbHelper.Category;
var CategoryInfo = dbHelper.CategoryInfo;
var CategoryRelation = dbHelper.CategoryRelation;
var Message = require('../config/message').Message;
var EventProxy = require('EventProxy');
var util = require('../lib/util');

/*exports.createACategory = function(parentid,authorid, name,searchname, desc, imgpath, callback){

    if(!parentid){
        parentid = null;
    }else if(typeof(parentid) === "string"){
        parentid = new Object(parentid);
    }

    if(!authorid){
        authorid = null;
    }else if(typeof(authorid) === "string"){
        authorid = new Object(authorid);
    }

    Category.newAndSave(parentid,authorid, name,searchname, desc, imgpath, function(err, category){

        if(err){
            return callback(Message.Db.default);
        }

        if(!category){
            return callback(Message.create_error);
        }
        CategoryInfo.newAndSave(category._id);

        return callback(null, category);
    });
}   */



exports.createACategory = function( authorid, data, callback){

    data.author_id = util.transToObjectId(authorid);
    data.parent_id = util.transToObjectId(data.parent_id);

    Category.findOneByQuery({parent_id:data.parent_id,category_searchname:data.category_searchname},function(err, category){
        if(err)
            return callback(err, null);
        if(category){
            return callback(null, null,'已经存在');
        }

        Category.newAndSave(data, function(err, category){

            if(err || !category){
                return callback(err,null);
            }

            CategoryInfo.newAndSave(category._id);

            return callback(null, category,'创建成功');
        });
    })

}

/**
 * 获取文章的所有分类
 * @param articleid
 * @param callback
 */
exports.getCategoryByArticleId = function(articleid, callback){

    if(typeof(articleid) === "string"){
        articleid = new ObjectId(articleid);
    }

    CategoryRelation.getCategoryByArticleId(articleid, function(err, docs){
        if(err){
            return callback(Message.Db.default);
        }

        if(docs.length === 0){
            return callback(null, []);
        }

       // var proxy = new EventProxy();
      //  var categories = [];
      //  proxy.after('category_ready', docs.length, function(){

     //        return callback(null, categories);
     //   })


        Category.getCategoryByIds(docs, callback);



       /* docs.forEach(function(info,i){
             Category.findOneById(info.category_id, function(err, category){
                 if(err){
                     //log error here

                 }

                 categories[i] = category;
                 proxy.emit('category_ready');
             });
        })*/
    })
}

exports.getCountofCategory = function(categoryid, callback){
    if(typeof(categoryid) === 'string'){
        categoryid = new ObjectId(categoryid);
    }
    CategoryRelation.getCountOfCategory(categoryid, callback);
}


function getChild(child,docs, parentId){
    docs.forEach(function(doc, i){
       if(doc.parent_id && (parentId.toString() === doc.parent_id.toString())){
           if(!doc.child){
           doc.child = [];
           getChild(doc.child, docs, doc._id);
           }
           child.push(doc);
       }
    })
}

/**
 *根据用户名返回目录，返回信息按等级分组
 * @param authorid
 * @param callback
 */
exports.getCategoryByAuthorid = function(authorid, callback){
    if(typeof(authorid) === "string"){
        authorid = new ObjectId(authorid);
    }
    Category.getCategoryByAuthorid(authorid,function(err, docs){
        if(err){
            return callback(err,null);
        }
        if(docs.length === 0){
            return callback(null, []);
        }

       /* var categories = {};
        docs.forEach(function(doc, i){
           if(!doc.parent_id){
               if(!categories[doc._id])
                   categories[doc._id] = {};
               categories[doc._id].content = doc;
           }else{
               if(!categories[parent_id]){
                   categories[parent_id] = {};
               }
               if(!categories[parent_id].child){
                   categories[parent_id].child = [];
               }
               categories[parent_id].child.push(doc);
           }
        })  */

        var categories = [];
        docs.forEach(function(doc, i){
            if(!doc.parent_id){
                if(!doc.child){
                    doc.child = [];
                    getChild(doc.child, docs, doc._id);
                }

                categories.push(doc);
            }
        })
       // console.log(categories);
        return callback(null,categories);
    });
}

/**
 *返回目录的详细信息，包括文章数等，无分组
 * @param authorId
 * @param callback
 */
exports.getCategoyListByAuthorId = function(authorId, callback){
    if(typeof(authorId) === "string"){
        authorId = new ObjectId(authorId);
    }
    Category.getCategoryByAuthorid(authorId,function(err, docs){
        if(err){
            return callback(err,null);
        }
        if(docs.length === 0){
            return callback(null, []);
        }

        var categories = [];
        var proxy = new EventProxy();
        proxy.after('category_ready',docs.length,function(){
            return callback(null,categories);
        }).fail(callback);


        docs.forEach(function(doc,i){
            doc.create_time = util.format_date(doc.create_at,false);
          CategoryInfo.getCategoryInfoByCategoryId(doc._id, function(err,info){
              if(err){
                  return proxy.emit('error')
              }
               doc.info = info?info:[];
              categories[i] = doc;
              proxy.emit('category_ready')
          })
        })
    });
}

/**
 *获取某一个目录
 * @param userId
 * @param catgoryId
 * @param callback
 */
exports.getOneCategoryOfUser = function(userId, catgoryId, callback){
    userId = util.transToObjectId(userId);
    catgoryId = util.transToObjectId(catgoryId);

    Category.findOneByQuery({author_id:userId,_id:catgoryId},callback);
}

exports.getAllCategory = function(callback){
	Category.getAllCategory(callback);
}


exports.removeCategoryRelationOfArticle = function(articleid, callback){

    if(typeof(articleid) === "string"){
        articleid = new ObjectId(articleid);
    }

    var proxy = new EventProxy();
    var Events = ['removeRelation','removeCount_ready'];


    CategoryRelation.getCategoryByArticleId(articleid, function(err, docs){
        if(err){
            return callback(err);
        }

        proxy.assign(Events, function(){
             return callback();
        }).fail(callback);

        CategoryRelation.removeCategoriesOfArticle(articleid, docs, function(err){
            if(err){
                return proxy.emit('error',err);
            }
            proxy.emit('removeRelation');
        })
        if(!docs || docs.length === 0){
             proxy.emit('removeCount_ready');
        }else{
            var ep = new EventProxy();
            ep.after('removeCount', docs.length, proxy.done('removeCount_ready')).fail(callback);
            //依次删除目录信息

            docs.forEach(function(doc){
                if(typeof(doc) === "string"){
                    doc = new ObjectId(doc);
                }

                CategoryInfo.deleteArticleCount(doc,function(err){
                    if(err){
                        return ep.emit('error',err);
                    }
                    ep.emit('removeCount');
                });
            })
        }
    })
}


exports.removeCategoryRelationOfMultiArticle = function(articleIds, callback){
    articleIds.forEach(function(articleid){
        exports.removeCategoryRelationOfArticle(articleid,function(err){
            if(err){
                return callback(err);
            }
        })
    })
    callback(null);
}

exports.deleteCategoryOfUser = function(userId, categoryId, callback){
    userId = util.transToObjectId(userId);

    categoryId = util.transToObjectId(categoryId);

    Category.removeCategoryOfUser(userId, categoryId,function(err){
        if(err){
            return callback(err);
        }
        var proxy = new EventProxy();
        var events = ['delinfo','delrelation'];
        proxy.assign(events,function(){
            return callback();
        }).fail(callback);
        CategoryInfo.removeCategoryInfo(categoryId,proxy.done('delinfo'));
        CategoryRelation.removeAllArticlesOfCategory(categoryId,proxy.done('delrelation'));
    });
}

/**
 *更新目录信息
 * @param userId
 * @param categoryId
 * @param data
 * @param callback
 * @constructor
 */
exports.UpdateCategory = function( userId, categoryId, data, callback){

    userId = util.transToObjectId(userId);
    categoryId = util.transToObjectId(categoryId);

    if(data.parent_id && data.parent_id.length !== 0)
        data.parent_id = util.transToObjectId(data.parent_id);
    else{
        data.parent_id = null;
    }

    Category.UpdateCategory(userId,categoryId, data, function(err, category){

        if(err || !category){
            return callback(err, null);
        }

        return callback(null, category);
    });
}



