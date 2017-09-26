var system = require('system');
var args = system.args;
var url = args['1'];
var name = args['2'];
var filename = args['3'];
var filetime = args['4'];
var dirPath = "/data/resources/system/export/export_policy";
// var dirPath = "/Users/lizhen/Desktop/resurce/export_policy";
openPage(url);

function openPage(url) {
    var page = require('webpage').create();
    page.open(url, function (status) {
        setTimeout(function () {
            console.log(status)
            if (status === "success") {
                page.paperSize = {
                    format: 'A4',
                    orientation: 'portrait',
                    border: '1cm'
                };
                page.render(dirPath+'/'+filename+filetime+'/'+name + ".pdf");
            } else {
                console.log("Page failed to load.");
            }
            phantom.exit(0);
        }, 3000);
    });
}
