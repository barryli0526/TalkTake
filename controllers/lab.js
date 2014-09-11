var fs = require('fs');
    path = require('path'),
    ndir = require('ndir'),
    config = require('../config/base').config,
    EventProxy = require('EventProxy'),
    jsdom   = require('jsdom'),
    et = require('elementtree'),
    labService = require('../service/LabService'),
    parser = require('../service/Parser'),
    util = require('../lib/util');


exports.getCommonInfo = function(req, res, next){
    var filepath = path.resolve('public/content/library.xml');
    parser.xmlParser(filepath, function(err,doc){
       if(err){

           return next(err);
       }else{

           res.local('library',doc);
           return next();
       }
    });
}


exports.index = function(req, res, next){
    if(req.session.user){
        var uid = req.session.user._id;
        labService.getProductsByAuthorId(uid, function(err, doc){


            if(err){
                return next(err);
            }else{
                if(doc && doc.length !=0){
                    labService.getProductBySid(doc[0].sid, function(err, content){

                            res.render('lab/runjs1',{
                                categories:doc,
                                content:content[0],
                                layout:null
                            });

                    })
                }else{
                    res.render('lab/runjs1',{
                        categories:doc,
                        layout:null
                    });
                }
            }
        })
    }else{
        res.render('lab/runjs1',{
            layout:null
        });
    }
}

exports.save =  function(req, res, next){

    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var data = req.body;


    var uname = req.session.user.loginname.toString();
    var userDir = path.join(config.lab_content_idr, uname,data.id);

    ndir.mkdir(userDir, function (err) {
        if (err) {

            return next(err);
        }


        var savepath = path.resolve(path.join(userDir, 'index.html'));
        if (savepath.indexOf(path.resolve(userDir)) !== 0) {
            return res.send({status: 'forbidden'});
        }

        fs.writeFile(savepath, data.content, function(err){
            if(err) {
                console.log(err);
            } else {

                var content = {};
                content.html = data.html;
                content.js = data.js;
                content.css = data.css;
                content.sid = data.id;

                labService.updateProduct(content.sid, content, function(err, doc){
                    if(err || !doc){
                        console.log('add new lab product failed');
                    }else{

                    }
                })

                util.createSnapShot(savepath, 'file',path.resolve(path.join(userDir, 'snapshot.png')),function(){

                })



                res.end(data.id);
            }
        })
    });
}

exports.update = function(req, res,next){

    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var data = req.body;

    var content = {};
    content.html = data.html;
    content.js = data.js;
    content.css = data.css;
    content.sid = req.params['sid'];

    labService.updateProduct(content.sid, content, function(err, doc){
        if(err || !doc){
            console.log('add new lab product failed');
            return next(err);
        }else{
            return res.send({status:'success'});
        }
    })
}

exports.uploadStaticFiles = function(req, res, next){
    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var files = req.files.files ;
    var sid = req.query.sid;

    if (!files) {
        res.send({ status: 'failed', message: 'no file' });
        return;
    }

    var uname = req.session.user.loginname.toString();
    var userDir = path.join(config.lab_content_idr, uname);
    if(sid)
        userDir = path.join(userDir,sid);

    ndir.mkdir(userDir, function (err) {
        if (err) {
            return next(err);
        }

        var proxy = new EventProxy();

        var urls = [],rs = [];

        proxy.after('filesave_ready',files.length,function(){

            if(sid){
                labService.addResourcesBySid(sid, rs,function(err, doc){
                    if(err){
                      //  console.log(err);
                    }
                });
            }


            res.send({ status: 'success', url: urls });

        }).fail(next);

        files.forEach(function(file,i){
            urls = [];
            rs = [];
            (function(i){
                var filename =  Date.now() + '_' + file.name;
                console.log(userDir);
                var savepath = path.resolve(path.join(userDir, filename));

                console.log(path.resolve('public\\user_data\\lab\\barry\\BXDC9\\1376530942440_mainLogo.png'));
                if (savepath.indexOf(path.resolve(userDir)) !== 0) {
                    return res.send({status: 'forbidden'});
                }
                fs.rename(file.path, savepath, function (err) {
                    if (err) {
                        return next(err);
                    }
                    var url = '/user_data/lab/'+uname+'/';
                    if(sid)
                        url += sid+'/';
                    url += filename;

                    rs[i] = url;
                    urls[i] = {'name':filename,'url':url};

                    proxy.emit('filesave_ready');
                });
            })(i)

        })
    });
}

exports.removeProject = function(req, res){
    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var sid = req.params['sid'];

    labService.removeProductBySid(sid, function(err){
        if(err){
           res.send({status:'failure'});
        }else
           res.send({status:'success'});
    })

    if(sid){
        var uname = req.session.user.loginname.toString();
        var userDir = path.join(config.lab_content_idr, uname);
        userDir = path.join(userDir,sid);
        util.deleteFolderRecursice(userDir);
    }

}

exports.removeResources = function(req, res, next){

    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var sid = req.params['sid'];
    var rs = req.body;
    labService.removeResourcesBySid(sid, rs.url.toString(), function(err){
        if(err){
            res.send({'status':'failure'});
            return next(err);
        }
        else
            res.send({'status':'success'});//return success when data remove from db
    })

    //remove file in server
    fs.unlink('public'+rs.url.toString(), function(err){
        if(err)
            console.log(err);
        else
            console.log('remove sucess');
    })

}

exports.showPage = function(req, res){

   if(!req.session.user){
       req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
       return res.render('sign/signin',{layout:null});
   }

   var uname = req.session.user.loginname.toString();

   var pageid = req.params.pageid;
   var realPath = 'public/user_data/lab/'+uname+'/'+pageid+'/index.html';
   // var realPath = 'public/user_data/lab/abc/1375863959212_123.html';

    fs.stat(realPath, function(err, stats){
        if(err){
            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            res.write("This request URL " + pageid + " was not found on this server.");
            res.end();
        }else{
            res.setHeader("Content-Type", 'text/html');
            res.setHeader('Content-Length', stats.size);

            var lastModified = stats.mtime.toUTCString();
            var ifModifiedSince = "If-Modified-Since".toLowerCase();
            res.setHeader("Last-Modified", lastModified);

            var expires = new Date();
            expires.setTime(expires.getTime() + config.lab_maxAge * 1000);
            res.setHeader("Expires", expires.toUTCString());
            res.setHeader("Cache-Control", "max-age=" + config.lab_maxAge);

            if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
                res.writeHead(304, "Not Modified");
                res.end();
            }else{
                res.writeHead(200);
                fs.createReadStream(realPath).pipe(res);
            }
        }

    })
}


exports.edit = function(req, res, next){

    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

  //  var uname = req.session.user.loginname.toString();

    var pageid = req.params.pageid;
   // var realPath = 'public/user_data/lab/'+uname+'/'+pageid+'/index.html';
    var proxy = new EventProxy();
    var events = ['categories','content'];
    proxy.assign(events, function(categories, content){
          res.render('lab/runjs1',{
              categories:categories,
              content:content,
              layout:null
          })
    }).fail(next);

    labService.getProductsByAuthorId(req.session.user._id, proxy.done('categories'));

    labService.getProductBySid(pageid, function(err, doc){
        if(err){
            return proxy.emit('error',err);
        }
        proxy.emit('content',doc[0]);
    })

}

exports.create = function(req, res){

    if(!req.session.user){
        req.session.refererUrl = req.header('Referer') ? req.header('Referer') : '/lab';
        return res.render('sign/signin',{layout:null});
    }

    var content = req.body;

    labService.CreateProduct(req.session.user._id, content, function(err, doc){
        if(err || !doc){
            console.log('add new lab product failed');
            res.end('fail');
        }else{
            res.end('success');
        }
    })
}