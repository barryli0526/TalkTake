exports.feedlist = {
    "huxiu":{
        "feedurl" : "http://www.huxiu.com/rss/0.xml",
         "site": "虎嗅",
         "entrytag": "item",
         "titletag":"title",
         "datetag": "pubDate",
         "contenttag": "description",
         "urltag":"link",
         "type":"rss",
         "filterOption":{
             "wrapper":"#neirong_box table td"
         }
    },
    "36kr":{
        "feedurl":"http://www.36kr.com/feed",
        "site": "36氪",
        "entrytag": "item",
        "titletag":"title",
        "datetag": "pubDate",
        "contenttag": "description",
        "urltag":"link",
        "type":"rss",
        "filterOption":{
            "wrapper":".mainContent"
        }
    },
    "diggdigest":{
        "feedurl":"http://feed.feedsky.com/diggdigest",
        "site": "煎蛋",
        "entrytag": "item",
        "titletag":"title",
        "datetag": "pubDate",
        "contenttag": "description",
        "urltag":"link",
        "type":"rss",
        "filterOption":{
            "wrapper":"#content .post p"
        }
    }
};