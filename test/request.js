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

var makeHttpPost = function(path,post_data){


// An object of options to indicate where to post to
    var post_options = {
        host: '127.0.0.1',
        port: '3000',
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

exports.testInitClient = function(){
    var post_data = querystring.stringify({
        UUID:'12312313'
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

    makeHttpPost('/TalkTake/User/234/follow',post_data);
}

exports.testunFollow = function(){
    var post_data = querystring.stringify({

    });

    makeHttpPost('/TalkTake/User/234/unFollow',post_data);
}
