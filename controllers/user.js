var UserService = require('../service').UserService;
var utils = require('../lib/util');
var config = require('../config/base').config;

function gen_session(user, res){
    var auth_token = utils.encrypt(user._id+'\t'+user.loginname+'\t'+user.pass+'\t'+user.email, config.session_secret);
    res.cookie(config.auth_cookie_name, auth_token,{path:'/', maxAge:1000*60*60*24*30});
}


exports.showSignIn = function(req, res){
    if(req.session.user){
      return res.redirect('/admin');
    }else{
      res.render('sign/signin.html',{
         layout:null
     })
    }
}

exports.signOut = function(req, res){
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name,{path:'/'});
    res.redirect('/');
}

exports.signIn = function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
   // console.log(req.header);
   // var referUrl = req.header('Referer');
    console.log(req.session.refererUrl);
    var referUrl = req.session.refererUrl;
    if(!referUrl)
      referUrl = '/admin';

    if(!username || !password){
        return res.render('sign/signin.html',{error:'信息不完整'});
    }
    UserService.SignIn(username, password, function(err, user){
        if(err){
             return next(err);
        }
        if(!user){

            return res.render('sign/signin.html',
                {error:'账户名或密码错误',
                 layout:null});
        }
        else{
            if(!user.active){
                //do something
                return res.render('sign/signin.html',{error:'未激活',layout:null});
            }
            // store session cookie
            gen_session(user, res);
            res.redirect(referUrl);
        }
    })
}

exports.signUp = function(req, res, next){
	var data = req.body;
        var referUrl = req.header('Referer');
        if(!referUrl)
          referUrl = '/';

	UserService.SignUp(data, function(err, user){

		if(err || !user){
			return next(err || "出错")
		}

		gen_session(user, res);
		return res.redirect(referUrl);
	});
}

exports.auth_user = function(req, res, next){
    if(req.session.user){
        res.local('current_user', req.session.user);
        return next();
    }else{
        var cookie = req.cookies[config.auth_cookie_name];
        if(!cookie){
            return next();
        }

        var auth_token = utils.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
       // var id = auth[0];
        var loginname = auth[1];
        var password = auth[2];
        UserService.getUserProfile(loginname, function(err, user){
            if(err){
                return next(err);
            }

            if(!user || (user.pass != password)){
                return next();
              //  return res.redirect('/login');
            }

            req.session.user = user;
            res.local('current_user', req.session.user);
            return next();
        })
    }
}
