
var ChatService = require('../service/ChatService');
var EventProxy = require('EventProxy');


exports.enterroom = function(client){
    return function(req, res){

    if(!req.session.user){
      return res.render('sign/signin',{layout:null});
    }

    if(!client){
	return res.end('cant start redis!');
    }

    var room_id = 'room';

    var user =req.session.user;
    var proxy = new EventProxy();
    var events = ['sid','users'];

        proxy.assign(events, function(id, users){
            res.render('chatroom/index',{
                sid:id,
                userlist:users,
                layout:false
            })
        })




    ChatService.getUsersInRoom(room_id,client,function(err, users){

      var userlist = [];
      var proxy = new EventProxy();
      proxy.after('userinfo_ready',users.length, function(){
          res.render('chatroom/index',{
              userlist:userlist,
              layout:false
          })
      })

      users.forEach(function(user,i){
          ChatService.getUserSocketId(user, room_id,client, function(err, id){
              user.sid = id;

              userlist[i] = user;
              proxy.emit('userinfo_ready');
          })
      })




    })

    };

}
