'use strict';

// Test if we're developing locally
var localDev = getFlag('propertyset.newrelic.LOCALDEVELOPMENT', false);
var debug = getFlag('propertyset.newrelic.DEBUG', false);

// Get a boolean flag property
function getFlag(key, defaultValue) {
    var v = contextGetVariable(key, defaultValue);
    if (v === 'false') {
        return false;
    }
    if (v === 'true') {
        return true;
    }
    return v;
}

logMsg('Util: localDev: ' + localDev + ' type: ' + typeof (localDev));
logMsg('Util: debug: ' + debug + ' type: ' + typeof (debug));

// Merge two objects. In the event of the same property obj2 always wins
function merge(obj1, obj2) {
    Object.keys(obj2).map((key) => {
        obj1[key] = obj2[key];

    });
    return obj1;
}

// Test if null, empty string, or undefined object
function isNil(obj) {
    if (obj == null) {
        return true;
    }
    if (obj == '') {
        return true;
    }
    // Apigee uses Rhino.
    // If we ask for something in the context that is not present, like a property, what Rhino returns is an object whose value is 'undefined'
    if ((obj + '') === 'undefined') {
        return true;
    }
    return false;
}

// Write a log message into the context if we're running locally
function logMsg(msg) {
    if(debug){
        print(msg);
    }

    if (localDev) {
        var index = contextGetVariable('logger.index', 1);
        // There's some issue writing a string containing commas into the context. The <array>.values.string hack doesn't work here so substitute a dash for a comma
        msg = msg.replace(/,/g, '-');
        context.setVariable('logger.logMsg-' + index, msg);
        index = index + 1;
        context.setVariable('logger.index', index);
    }
}

// Call this function during Response processing when developing locally to dump the log messages to the response header
function logsToResponseHeader() {
    if (localDev) {
        var index = context.getVariable('logger.index');
        if (index == null) {
            context.proxyResponse.headers['Z-Log-0'] = 'logger.index == null';
            return
        }

        context.proxyResponse.headers['Z-Log-0'] = 'logger.index == ' + index + ' type= ' + typeof (index);
        for (var i = 1; i < index; i++) {
            var msg = context.getVariable('logger.logMsg-' + i);
            if (msg == null) {
                context.proxyResponse.headers['Z-Log-' + i] = 'Null msg';
            } else {
                context.proxyResponse.headers['Z-Log-' + i] = 'type= ' + typeof (msg) + ' ' + msg;
            }
        }
    }
}

function getProperty(prop, defaultValue){
    if(isNil(prop)){
        return defaultValue;
    }
    return prop;
}

function contextGetVariable(key, defaultValue) {
    var v = context.getVariable(key);
    if (isNil(v)) {
        return defaultValue;
    }
    return v;
}