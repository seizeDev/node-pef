/**
 * Created by lizhen on 2017/9/26.
 */
var helper = {};
exports.helper = helper;

var log4js = require('log4js');

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
    categories: { default: { appenders: ['cheese'], level: 'ALL' } }
});

var logDebug = log4js.getLogger('logDebug');
var logInfo = log4js.getLogger('logInfo');
var logWarn = log4js.getLogger('logWarn');
var logErr = log4js.getLogger('logErr');

helper.writeDebug = function (msg) {
    if (msg == null)
        msg = "";
    logDebug.debug(msg);
};

helper.writeInfo = function (msg) {
    if (msg == null)
        msg = "";
    logInfo.info(msg);
};

helper.writeWarn = function (msg) {
    if (msg == null)
        msg = "";
    logWarn.warn(msg);
};

helper.writeErr = function (msg, exp) {
    if (msg == null)
        msg = "";
    if (exp != null)
        msg += "\r\n" + exp;
    logErr.error(msg);
};

// 配合express用的方法
exports.use = function (app) {
    //页面请求日志, level用auto时,默认级别是WARN
    app.use(log4js.connectLogger(logInfo, {level: 'debug', format: ':method :url'}));
}

