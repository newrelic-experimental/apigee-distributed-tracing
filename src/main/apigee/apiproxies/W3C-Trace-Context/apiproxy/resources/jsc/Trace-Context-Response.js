try {
    //const buf = crypto.randomBytes(16);
    //var _timeNow = Number(context.getVariable('system.timestamp'));
    //traceId = crypto.dateFormat('YYYY-MM-DD HH:mm:ss.SSS','CST', _timeNow);
    traceId = createUuid();
} catch (err) {
    traceId = 'TraceID'
    context.proxyResponse.headers['DT-Response-Err'] = err;
}
context.proxyResponse.headers['DT-Response'] = traceId;