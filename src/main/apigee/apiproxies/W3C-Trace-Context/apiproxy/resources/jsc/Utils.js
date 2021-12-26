function logMsg(msg) {
    var index = context.getVariable("logger.index");
    if (index == null) {
        index = 1;
    }
    context.setVariable("logger.logMsg-" + index, msg);
    index = index + 1;
    context.setVariable("logger.index", index);
}

// Call this function during Response processing
function logsToResponseHeader() {
    var index = context.getVariable("logger.index");
    if (index == null) {
        context.proxyResponse.headers['Z-Log-0'] = 'logger.index == null';
        return
    }

    context.proxyResponse.headers['Z-Log-0'] = 'logger.index == ' + index + ' type: ' + typeof (index);
    for (var i = 1; i < index; i++) {
        var msg = context.getVariable("logger.logMsg-" + i);
        if (msg == null) {
            context.proxyResponse.headers['Z-Log-' + i] = 'Null msg';
        } else {
            context.proxyResponse.headers['Z-Log-' + i] = msg;
        }
    }

}

