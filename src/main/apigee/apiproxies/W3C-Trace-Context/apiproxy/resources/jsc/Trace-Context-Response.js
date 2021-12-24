"use strict"
var traceId;
try {
    //const buf = crypto.randomBytes(16);
    //var _timeNow = Number(context.getVariable('system.timestamp'));
    //traceId = crypto.dateFormat('YYYY-MM-DD HH:mm:ss.SSS','CST', _timeNow);

    traceId = crypto.randomBytes(16);
} catch (err) {
    traceId = 'TraceID';
    context.proxyResponse.headers['W3C-Trace-Context-Response-Err'] = err;
    context.proxyResponse.headers['W3C-Trace-Context-Response-Debug'] = Object.getOwnPropertyNames(crypto).filter(item => typeof crypto[item] === 'function');
}
context.proxyResponse.headers['W3C-Trace-Context-Response'] = traceId;