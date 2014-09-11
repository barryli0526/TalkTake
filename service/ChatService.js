
/*
 * Initialize the application
 */

/*
 * Module dependencies
 */

var fs = require('fs');
var crypto = require('crypto');
var EventProxy = require('EventProxy');



/*
 * Initialize the 
 *
 * @param {Object} Redis client instance
 * API @public
 */

exports.InitClient = function(client){

    /*
     * Clean all forgoten sockets in Redis.io
     */

    // Delete all users sockets from their lists
    client.keys('sockets:for:*', function(err, keys) {
        if(keys.length) client.del(keys);
        console.log('Deletion of sockets reference for each user >> ', err || "Done!");
    });

    // No one is online when starting up
    client.keys('rooms:*:online', function(err, keys) {
        var roomNames = [];

        if(keys.length) {
            roomNames = roomNames.concat(keys);
            client.del(keys);
        }

        roomNames.forEach(function(roomName, index) {
            var key = roomName.replace(':online', ':info');
            client.hset(key, 'online', 0);
        });

        console.log('Deletion of online users from rooms >> ', err || "Done!");
    });

    // Delete all socket.io's sockets data from Redis
    client.smembers('socketio:sockets', function(err, sockets) {
        if(sockets.length) client.del(sockets);
        console.log('Deletion of socket.io stored sockets data >> ', err || "Done!");
    });

    /*
     * Create 'chats' dir
     */
    fs.mkdir('./chats');

};



/*
 * Generates a URI Like key for a room
 */

exports.genRoomKey = function() {
    var shasum = crypto.createHash('sha1');
    shasum.update(Date.now().toString());
    return shasum.digest('hex').substr(0,6);
};

/*
 * Room name is valid
 */

/*exports.validRoomName = function(req, res, fn) {
    req.body.room_name = req.body.room_name.trim();
    var nameLen = req.body.room_name.length;

    if(nameLen < 255 && nameLen >0) {
        fn();
    } else {
        res.redirect('back');
    }
}; */

/*
 * Checks if room exists
 */
exports.roomExists = function(room_name, client, cb) {
    client.hget('balloons:rooms:keys', encodeURIComponent(room_name), function(err, roomKey) {
        if(err || roomKey){
            return cb(err, roomKey);
        }
        return cb(null, null);
    });
};

/*
 * Creates a room
 */
exports.createRoom = function(room_name, room_pass, user, client, cb) {
    var roomKey = exports.genRoomKey()
        , room = {
            key: roomKey,
            name: room_name,
            admin: user.provider + ":" + user.username,
            pass: room_pass,
            locked: 0,
            online: 0
        };

    client.hmset('rooms:' + roomKey + ':info', room, function(err, ok) {

        if(err){
           return cb(err, null);
        }

        if(ok) {
            client.hset('balloons:rooms:keys', encodeURIComponent(room_name), roomKey);
            client.sadd('balloons:public:rooms', roomKey);
            return cb(null,roomKey);
        } else {
            return cb(null, null);
        }
    });
};

/*
 * Get Room Info
 */

exports.getRoomInfo = function(room_key, client, cb) {
    client.hgetall('rooms:' + room_key + ':info', function(err, room) {
        if(!err && room && Object.keys(room).length) return cb(null,room);
        else return cb();
    });
};

exports.getPublicRoomsInfo = function(client, cb) {
    client.smembers('balloons:public:rooms', function(err, publicRooms) {

        if(err)
            return cb(err);

        var rooms = []
            , len = publicRooms.length;
        if(!len) cb(null,[]);

        publicRooms.sort(exports.caseInsensitiveSort);

        publicRooms.forEach(function(roomKey, index) {
            client.hgetall('rooms:' + roomKey + ':info', function(err, room) {
                // prevent for a room info deleted before this check
                if(!err && room && Object.keys(room).length) {
                    // add room info
                    rooms.push({
                        key: room.key || room.name, // temp
                        name: room.name,
                        online: room.online || 0
                    });

                    // check if last room
                    if(rooms.length == len) cb(null,rooms);
                } else {
                    // reduce check length
                    len -= 1;
                }
            });
        });
    });
};
/*
 * Get connected users at room
 */

exports.getUsersInRoom = function(room_key, client, cb) {
    client.smembers('rooms:' + room_key + ':online', function(err, online_users) {
        if(err)
            return cb(err);
        var users = [];

        var proxy = new EventProxy();
        proxy.after('user_ready',online_users.length, function(){
            return cb(null, users);
        })


        online_users.forEach(function(userKey, index) {
            client.get('users:' + userKey + ':status', function(err, status) {

                if(err)
                    return cb(err);


                var msnData = userKey.split(':')
                    , username = msnData.length > 1 ? msnData[1] : msnData[0]
                    , provider = msnData.length > 1 ? msnData[0] : "twitter";

                users.push({
                    username: username,
                    provider: provider,
                    status: status || 'available'
                });
                proxy.emit('user_ready');
            });
        });

      //  return cb(null,users);

    });
};

/*
 * Get public rooms
 */

exports.getPublicRooms = function(client, cb){
    client.smembers("balloons:public:rooms", function(err, rooms) {
        if (!err && rooms) cb(null,rooms);
        else cb(err,[]);
    });
};
/*
 * Get User status
 */

exports.getUserStatus = function(user, client, cb){
    client.get('users:' + user.provider + ":" + user.username + ':status', function(err, status) {
        if (!err && status) cb(null,status);
        else cb(err,'available');
    });
};

/*
 * Get Current User Socket Id
 */

exports.getUserSocketId = function(user,room_id, client, cb){

    var userKey = 'test' + ":" + user.username;

    client.smembers('sockets:for:' + userKey + ':at:' + room_id, function(err, id){

        if (!err && id) cb(null,id);
        else cb(err,null);
    })
}

/*
 * Enter to a room
 */

/*exports.enterRoom = function(req, res, room, users, rooms, status){
    res.locals({
        room: room,
        rooms: rooms,
        user: {
            nickname: req.user.username,
            provider: req.user.provider,
            status: status
        },
        users_list: users
    });
    res.render('room');
};*/

/*
 * Sort Case Insensitive
 */

exports.caseInsensitiveSort = function (a, b) {
    var ret = 0;

    a = a.toLowerCase();
    b = b.toLowerCase();

    if(a > b) ret = 1;
    if(a < b) ret = -1;

    return ret;
};
