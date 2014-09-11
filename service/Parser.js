var jsdom   = require('jsdom'),
    et = require('elementtree'),
    cheerio = require('cheerio'),
    request = require('request'),
    fs = require('fs');


exports.ParseRequest = function(option, callback){

  request(option.feedurl, function(err, res, body){

      if(option.type === 'rss'){
      rssParser(body, option,callback);
      }else{

      }
  })

}


exports.getContentByUrl = function(url, filterOption, callback){
   
    request(url, function(err, res, body){
   
      /*  jsdom.env({
            html:body,
            scripts: ["http://code.jquery.com/jquery.js"],
            done: function(err, window){
                console.timeEnd('jsdomTime');
                var $ = window.$;

                console.time('transfertime');                

                var str = filter($(filterOption.wrapper),$);
                console.timeEnd('transfertime');

                  callback(null, str);

            }
        })*/
        var $ = cheerio.load(body);
        var str = $(filterOption.wrapper).html();
        return callback(null,str);
    })
}

function filter(obj,$){
  //  obj.contents().filter(function(){
  //      if(this.nodeType == 1 && (this.nodeName !== 'A' && this.nodeName !== 'img')){
  //          filter($(this));
  //      }
  //     return (this.nodeType==3 || this.nodeName=='a' || this.nodeName == 'img');
  //  }).wrap('<p></p>');
    var obj = $(obj);
    var str = "";
    var token = 'block';
    var ignoreTags = ['A','IMG','EMMED','FONT'];
    obj.contents().each(
        function(){
       if(this.nodeType == 1 && (ignoreTags.indexOf(this.nodeName) == -1)){
             str += filter(this,$);
             token = 'block';
       }else{
            var value = "";
           if(this.nodeType == 1) {

               if(this.nodeName == 'IMG'){
                   var src = $(this).attr('src');
                   $(this).attr({'src':'/proxyImg?u='+ encodeURIComponent(src)});
               }

                value = $(this)[0].outerHTML;
           }
           else{
               value = this.nodeValue;
           }


           if(str =='' || token == 'block'){
               str += '<P>'+ value +'</P>';
           }

           else{
               var s = str.slice(0,-4);
               s += value +'</p>'
               str = s;
           }


           if(this.nodeName == 'A' || this.nodeName == '#text' )
               token = 'inline';
           else
               token = 'block';
       }

    })
    return str;
}



function rssParser(data, opt, callback){
    var doc = et.parse(data);
    var items = doc.find(opt.channel ? opt.channel : 'channel').findall(opt.entrytag);

    var arr = [];

    items.forEach(function(item,i){
       var obj = {};
        obj.title = item.find(opt.titletag).text;
        obj.date = item.find(opt.datetag).text;
        obj.content = item.find(opt.contenttag).text.replace(/<.*?>/ig,'');
        obj.url = item.find(opt.urltag).text;
        arr[i] = obj;
    })
    return callback(null ,arr);
}

exports.xmlParser = function(filepath, callback){
    fs.readFile(filepath, 'utf-8', function(err, data){
      //  console.log(data);
         if(err){
             console.log(err);
             return callback(err);
         }
        var doc = et.parse(data);
      //  console.log(doc);
        return callback(err, doc);
    })
}

