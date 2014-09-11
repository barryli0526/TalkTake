var CategoryService = require('../../service/CategoryService');
var EventProxy = require('EventProxy');



exports.Index = function(req, res){
    if(!req.session.user){
        return res.render('sign/signin',{layout:null});
    }else{
            res.render('admin/index',{
                layout:'admin/layout'
            });
    }
}