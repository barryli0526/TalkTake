//var request = require('request');

//request('http://localhost:8080', function(err, response, body){
//	console.log(body);
//}).auth('asdf', 'sdf',false);

var http = require('http');
//var client = http.createClient(7090,'localhost'); 
var username = 'username';
var password = 'password';
var auth =  new Buffer(username + ':' + password).toString('base64');

var querystring = require('querystring');

// auth is: 'Basic VGVzdDoxMjM='

//var header = {'Host': 'http://localhost:8080', 'Authorization': auth};
//var request = client.request('GET', '/', header);
//543529c20b439ae15fb5a663,123-456-789

var makeHttpPost = function(path,post_data){
    post_data = JSON.stringify(post_data);

// An object of options to indicate where to post to
    var post_options = {
//        host: '121.199.58.200',
 //       host:'210.22.174.102',
        host:'127.0.0.1',
        port: '3040',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
    };

// Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });

// post the data
    post_req.write(post_data);
    post_req.end();
}



var makeAuthGet = function(auth, path, callback){
    var post_options = {
      //  host: '210.22.174.102',
   //     host:'121.199.58.200',
        host:'127.0.0.1',
        port: '3003',
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            //    'Content-Length': post_data.length,
            'Authorization':auth,
            'date':new Date()
        }
    };

    //  console.log(post_data);
// Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //  console.log('Response: ' + chunk);
            return callback(chunk);
        });
    });

// post the data
   // post_req.write(post_data);
    post_req.end();
}


var makeAuthPost = function(auth, path, post_data,callback){
    //   post_data = querystring.stringify(post_data);
    post_data = JSON.stringify(post_data);
    //  post_data = "'" + post_data +"'";
    // console.log(post_data);
// An object of options to indicate where to post to
    var post_options = {
    //    host: '210.22.174.102',
        host:'121.199.58.200',
//        host : '127.0.0.1',
        port: '3003',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            //    'Content-Length': post_data.length,
            'Authorization':auth,
            'date':new Date()
        }
    };

    //  console.log(post_data);
// Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //  console.log('Response: ' + chunk);
            return callback(chunk);
        });
    });

// post the data
    post_req.write(post_data);
    post_req.end();
}

exports.testArray = function(){
    var data = [
        {
            a:1,
            b:2
        },
        {
            a:3,
            b:4
        }
    ]

    makeAuthPost('sdfsdf','/TalkTake/User', data, function(){})
}

exports.testInitClient = function(){
    var post_data = {
        UUID:'56F1EB84-F11C-4C87-B7AD-28E763FD3274'
    };
   // console.log(post_data);

    makeHttpPost('/TalkTake/InitClient',post_data);
}



exports.testLikePhoto = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/Photos/5469fb44e9dfad2b7645cd22/Like',post_data);
}

exports.testunLikePhoto = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTak/Photos/123/UnLike',post_data);
}


exports.testPostComments = function(){
    var post_data = querystring.stringify({
         comments:'所得税费水电费',
         replyTime:'2014/09/09'
    });

    makeHttpPost('/TalkTake/Photos/123/Comments',post_data);
}



exports.testFollow = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/User/543a58b437a2e3e86f70cb68/follow',post_data);
}

exports.testunFollow = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/User/541791aaee4075701e2d0534/unFollow',post_data);
}

exports.testSyncContacts = function(){
//    var post_data =
//        {contactlist:[
//        {
//        firstName : '',
//        lastName : '李雷',
//        photoNumber : '15601909527'
//        },
//        {
//            firstName : 'w',
//            lastName : 'e',
//            photoNumber : '86225659556566'
//        }
//    ]}
//    ;
    var post_data = {};

    makeHttpPost('/TalkTake/User/SyncContacts',post_data);
}

exports.testUpdateUser = function(){
    var UUID = '5A139B0F-F8CE-4E79-9BEC-178F45CC4852',
        SID = '54698ed4fdc0c06c74bfe3f0';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');


    var post_data =  {
    nickName:'Clark',
    firstName:'',
    lastName:'郑凯元',
    mobilePhone:18817367346,
    sex:'男',
    location:{
        country:'中国',
        city:'上海',
        county:'浦东新区'
    },
    constellation:'双子',
    selfDesc:'烟火下的孤独是每一个梦想必须经过的地方',
    qrCode:null,
    privacy:0,
    avatar:'http://talktake.qiniudn.com/test1.jpg?imageView2/2/q/1'
    };
    makeAuthPost(auth,'/TalkTake/User',post_data,function(err, doc){
        console.log(err);
    });
}

exports.getGetInfo = function(){
    //var UUID = '123-456-789',
    //    SID = '543bb2059fb2b04576c186bd';

    var UUID = '6A832D3D-134F-4EE9-B55C-7CA5C055177C',
        SID = '54408cdce2aecef304f8d078';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');


    makeAuthGet(auth,'/TalkTake/Photos/5440955fe2aecef304f8d07f',function(err, doc){
        console.log(err);
    });
}

exports.getUploadToke = function(){
    var UUID = '123-456-789',
        SID = '544dbc276d45403804082705';
      //  SID = '544dba483676e2f418a2e987';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');

    makeAuthGet(auth,'/TalkTake/UploadToken',function(doc){
        console.log(doc);
    });

}

exports.postData = function(){

    var UUID = '123-456-789',
        SID = '544b652ba83ba34d16de1f17';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');

    makeAuthPost(auth,'/TalkTake/Photo/Upload/CallBack',{},function(err, doc){
        console.log(err);
    })
}

exports.getPhotoDetail = function(){

    var photoId = '544096b8e2aecef304f8d083';

    var UUID = '56F1EB84-F11C-4C87-B7AD-28E763FD3274',
        SID = '5460b535fcfe2bc518201fb3';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');
    console.log(auth);

//    makeAuthGet(auth, '/TalkTake/Photos/544096b8e2aecef304f8d083', function(doc){
//        console.log(doc);
//    })
}


exports.postPhoto = function(photo){
    var UUID = '6A832D3D-134F-4EE9-B55C-7CA5C055177C',
        SID = '54408cdce2aecef304f8d078';

    var auth = new Buffer(SID + ':' + UUID).toString('base64');

    makeAuthPost(auth,'/TalkTake/Photo/Upload/CallBack', photo, function(err,doc){
        console.log(err) ;
    })

}
