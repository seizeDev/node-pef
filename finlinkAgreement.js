var http = require("http");
var fs = require("fs");
var md5 = require("md5");
var express = require('express');
var app = express();

//获取node传入参数
///Users/lizhen/Desktop/resurce/
var dirPath = "/data/resources/system/export/export_policy";

var htmlMaps = {
    '居间服务协议':'intermediary_agreement',
    '借款协议':'new_loan_agreement',
};
var orderList = [];
var exportHtml = null

app.get('/getPdf', function(req, res){
    total = 0;
    console.log('/getPdf')
    console.log(req.query.order_nos)
    orderList = req.query.order_nos.split(',');
    exportHtml = req.query.html_name;
    post('lizhenceshi', 'lizhen', 'backstage_user').then(function (result) {
        console.log(result);
        res.send(result);
    })
});

function post(username, pwd, type) {
    return new Promise(function (resolve, reject) {
        var params = {
            username: username,
            password: pwd,
            type: type
        };
        const chunli = {
            hostname: '10.8.0.6',
            port: 8180,
            path: '/backstage/v1/sso/login'
        }
        const ceshi = {
            hostname: '54.223.101.36',
            port: 3000,
            path: '/asset/backstage/v1/sso/login'
        }
        const options = {
            hostname: ceshi.hostname,
            port: ceshi.port,
            path: ceshi.path,
            method: 'POST',
            headers: {
                "Content-Type": 'application/json;charset=utf-8'
            }
        };

        var req = http.request(options, function (res) {
            var body = "";
            res.setEncoding('utf-8');
            res.on('data', function (chunk) {
                body += chunk;
            }).on("end", function () {
                var thisTime = reserverTime();
                var data = parseResult(body);
                var config = {};
                var timestamp = (new Date()).valueOf();
                config.__sid = data.data.__sid;
                config.timestamp = timestamp;
                config.signature = md5(data.data.key + timestamp.toString());
                var thisName = exportHtml?htmlMaps[exportHtml]:'intermediary_agreement';
                if (!fs.existsSync(dirPath+'/'+thisName+thisTime)) {
                    fs.mkdirSync(dirPath+'/'+thisName+thisTime);
                }
                orderList.forEach((order) => {
                    loginCallback(config, order, thisName,thisTime).then(function (total) {
                        console.log(total)
                        if(total == orderList.length){
                            var fileName = thisName+thisTime;
                            // creating archives
                            var fs = require('fs');
                            var archiver = require('archiver');

// create a file to stream archive data to.
                            var output = fs.createWriteStream(dirPath + '/'+fileName+'.zip');
                            var archive = archiver('zip', {
                                zlib: { level: 9 } // Sets the compression level.
                            });

// listen for all archive data to be written
                            output.on('close', function() {
                                console.log(archive.pointer() + ' total bytes');
                                resolve(thisName+thisTime)
                            });

// good practice to catch warnings (ie stat failures and other non-blocking errors)
                            archive.on('warning', function(err) {
                                if (err.code === 'ENOENT') {
                                    // log warning
                                } else {
                                    // throw error
                                    throw err;
                                }
                            });

// good practice to catch this error explicitly
                            archive.on('error', function(err) {
                                throw err;
                            });

                            archive.pipe(output);
                            var fsDir = dirPath + '/'+fileName;
                            fs.readdirSync(fsDir).forEach(function (file) {
                                console.log(file)
                                var pathname = dirPath+'/'+fileName+'/' + file;
                                console.log(pathname)
                                archive.append(fs.createReadStream(pathname), { name: file});
                            });
                            archive.finalize();
                        }
                    });
                })
            });
        });
        req.write(JSON.stringify(params));
        req.end();
    })
}
var total = 0;
var exec = require('child_process').exec;
function loginCallback(data, order, pageHtml,thisTime) {
    return new Promise(function (resolve, reject) {
        var url = `phantomjs savePdf.js "http://54.223.101.36:3000/web/asset/app-h5/${pageHtml}.html?sid=${data.__sid}&timestamp=${data.timestamp}&signature=${data.signature}&orderNo=${order}" ${order} ${pageHtml} ${thisTime}`;
        console.log(url)
        exec(url, {
                encoding: 'utf-8',
                timeout: 100000,
                maxBuffer: 200 * 1024,
                killSignal: 'SIGTERM',
                cwd: null,
                env: null
            },
            function (err, out) {
                total += 1;
                if (err) throw err;
                else
                    resolve(total)
            });
    })
}

function parseResult(body) {
    var json = {};
    try {
        json = JSON.parse(body);
    } catch (e) {
        /*
         Error(e);
         console.log(Constant.ERROR, "解析返回数据出错！返回数据为：", body);
         Res.end('{"code":500}');
         return;*/
    }
    var rs = json;
    return rs;
};

function reserverTime() {
    var thisDate = new Date();
    var nameDate = thisDate.getFullYear().toString()+(thisDate.getMonth()+1).toString()+thisDate.getDate().toString()+thisDate.getHours().toString()+thisDate.getMinutes().toString();
    return nameDate
}


app.listen(8089,function () {
    console.log('监听8089')
});