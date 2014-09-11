var fs = require('fs');
var path = require('path');
var ndir = require('ndir');
var config = require('../config/base').config;
var EventProxy = require('EventProxy');



exports.uploadImage = function(req, res, next){
    if (!req.session || !req.session.user) {
        res.send({ status: 'forbidden' });
        return;
    }
    var files = req.files.files ;
    // console.log(file.files[0].path);
    if (!files) {
        res.send({ status: 'failed', message: 'no file' });
        return;
    }
    var uid = req.session.user._id.toString();
    var userDir = path.join(config.upload_dir, uid);
    ndir.mkdir(userDir, function (err) {
        if (err) {
            console.log(err);
            return next(err);
        }

        var proxy = new EventProxy();

        var urls = [];

        proxy.after('filesave_ready',files.length,function(){

            res.send({ status: 'success', url: urls });

        }).fail(next);


        files.forEach(function(file){
            var filename = Date.now() + '_' + file.name;
            var savepath = path.resolve(path.join(userDir, filename));
            if (savepath.indexOf(path.resolve(userDir)) !== 0) {
                return res.send({status: 'forbidden'});
            }
            fs.rename(file.path, savepath, function (err) {
                if (err) {
                    return next(err);
                }
                var url = '/upload/' + uid + '/' + encodeURIComponent(filename);

                urls.push(url);

                proxy.emit('filesave_ready');
            });
        })
    });

}