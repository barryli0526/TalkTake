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


// An object of options to indicate where to post to
    var post_options = {
        host: '121.199.58.200',
        port: '3003',
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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


var makeAuthPost = function(auth, path, post_data,callback){
    //   post_data = querystring.stringify(post_data);
    post_data = JSON.stringify(post_data);
    //  post_data = "'" + post_data +"'";
    // console.log(post_data);
// An object of options to indicate where to post to
    var post_options = {
        host: '121.199.58.200',
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

exports.testInitClient = function(){
    var post_data = querystring.stringify({
        UUID:'123-456-789'
    });

    makeHttpPost('/TalkTake/InitClient',post_data);
}



exports.testLikePhoto = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/Photos/123/Like',post_data);
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

    makeHttpPost('/TalkTake/User/541930ce3466dde424ce606f/follow',post_data);
}

exports.testunFollow = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/User/541791aaee4075701e2d0534/unFollow',post_data);
}

exports.testSyncContacts = function(){
    var post_data = querystring.stringify(
        {array:[
        {
        firstName : '的',
        lastName : '额',
        photoNumber : '865659556566'
        },
        {
            firstName : 'w',
            lastName : 'e',
            photoNumber : '86225659556566'
        }
    ] }
    );
    console.log(post_data);

    makeHttpPost('/TalkTake/SyncContacts',post_data);
}

exports.testUpdateUser = function(){
    var UUID = '123-456-789',
        SID = '543529c20b439ae15fb5a663';

    var auth =  new Buffer(SID + ':' + UUID).toString('base64');


    var post_data =  {
    nickName:'巴瑞力',
    firstName:'李雷',
    lastName:'',
    mobilePhone:15601909527,
    sex:'男',
    location:{
        country:'中国',
        city:'上海',
        county:'浦东新区'
    },
    constellation:'双子',
    selfDesc:'烟火下的孤独是每一个梦想必须经过的地方',
    qrCode:null,
    privacy:0
    };
    makeAuthPost(auth,'/TalkTake/User',post_data,function(err, doc){
        console.log(err);
    });
}

