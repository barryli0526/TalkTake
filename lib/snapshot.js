var system = require('system')
var page = require('webpage').create();
var fs = require('fs');

try {

    var type = system.args[1];
    var content = system.args[2];
    var path = system.args[3];


    function render(){
        var pageDimensions = page.evaluate(function() {
            var body = document.body || {};
            var documentElement = document.documentElement || {};
            return {
                width: Math.max(
                    body.offsetWidth
                    , body.scrollWidth
                    , documentElement.clientWidth
                    , documentElement.scrollWidth
                    , documentElement.offsetWidth
                )
                , height: Math.max(
                    body.offsetHeight
                    , body.scrollHeight
                    , documentElement.clientHeight
                    , documentElement.scrollHeight
                    , documentElement.offsetHeight
                )
            };
        });

        page.clipRect = {
            top: 0
            , left: 0
            , width: pageDimensions['width']
            , height: pageDimensions['height']
        };

        page.render(path);

        page.close();

        phantom.exit();
    }

    if(type === 'url'){
        page.open(content, function () {
            render();
        });
    }else if(type === 'file'){
        f = fs.open(content, "r");
        var data = f.read();
        page.setContent(data, '');
        page.reload();
        render();
    }else if(type === 'string'){
        page.setContent(content, '');
        page.reload();
        render();
    }else{
        console.log('wrong type');
        page.close();
        phantom.exit();
    }
} catch (e) {
    console.log(e);
    page.close();
    phantom.exit();
}
