'use strict';

// TODO validate Policy properties

var RequestResponsePairName = properties.RequestResponsePairName;
var logPrefix = RequestResponsePairName + '.TraceContextResponse: ';
logMsg(logPrefix + 'enter');
var ctxPrefix = 'traceContext.' + RequestResponsePairName;

var requestParentID = context.getVariable(ctxPrefix + 'requestParentID');
var parentID = context.getVariable(ctxPrefix + 'parentID');
var traceID = context.getVariable(ctxPrefix + 'traceID');
var traceFlags = parseInt(context.getVariable(ctxPrefix + 'traceFlags'), 16);
var parentStartTime = context.getVariable(ctxPrefix + 'parentStartTime');
var tracestate = context.getVariable(ctxPrefix + 'tracestate');

logMsg(logPrefix + 'RequestParentID: ' + requestParentID);
logMsg(logPrefix + 'ParentID: ' + parentID);
logMsg(logPrefix + 'TraceID: ' + traceID);
logMsg(logPrefix + 'TraceFlags: ' + traceFlags);
logMsg(logPrefix + 'parentStartTime: ' + parentStartTime);

// Sample?
if ((traceFlags & 0x01) == 1) {

    var endTime = contextGetVariable(properties.TraceEndTimestamp, Date.now());

    // Span attribute processing
    var attributes = {
        'duration.ms': endTime - parentStartTime,
        'name': properties.RequestResponsePairName,
        'service.name': 'Apigee'
    };
    var attr = properties.AdditionalSpanAttributes;
    if (!isNil(attr)) {
        try {
            attributes = merge(attributes, JSON.parse(attr));
        } catch (err) {
            print('ERROR: ' + logPrefix + ' parsing AdditionalSpanAttributs: ' + attr);
            logMsg(logPrefix + ' ERROR parsing AdditionalSpanAttributs: ' + attr);
        }
    }
    logMsg(logPrefix + "spanAttributes: " + attributes);
    if (!isNil(requestParentID)) {
        attributes['parent.id'] = requestParentID;
    }

    var span = {
        'id': parentID,
        'trace.id': traceID,
        timestamp: parentStartTime,
        attributes: attributes
    }

    // Process Trace Common attributes
    var commonAttributes = {};
    attr = properties.CommonAttributes;
    if (!isNil(attr)) {
        try {
            commonAttributes = JSON.parse(attr);
        } catch (err) {
            print('ERROR: ' + logPrefix + ' parsing CommonAttributes: ' + attr);
            logMsg(logPrefix + ' ERROR parsing CommonAttributes: ' + attr);
        }
    }
    logMsg(logPrefix + "commonAttributes: " + commonAttributes);
    var msg = [{
        'common': {
            'attributes': commonAttributes
        },
        'spans': [span]
    }]

    var endpoint = context.getVariable('propertyset.newrelic.ENDPOINT');
    var licenseKey = context.getVariable('propertyset.newrelic.LICENSE_KEY');
    if (isNil(licenseKey)) {
        print('ERROR: ' + logPrefix + ' missing New Relic LICENSE_KEY: ' + licenseKey);
        logMsg(logPrefix + ' ERROR missing New Relic LICENSE_KEY: ' + licenseKey);
        context.proxyResponse.headers['tracestate'] = tracestate;
        logMsg(logPrefix + 'exit');
        logsToResponseHeader();
    } else {
        var headers = {
            'Content-Type': 'application/json',
            'Api-Key': licenseKey,
            'Data-Format': 'newrelic',
            'Data-Format-Version': '1'

        };

        // TODO At some point "queue" the spans to the context and then do a batch write
        var req = new Request(endpoint, 'POST', headers, JSON.stringify(msg));
        function onComplete(response, error) {
            // Check if the HTTP request was successful
            if (response) {
                logMsg(logPrefix + 'onComplete: response.status: ' + response.status);
            } else {
                logMsg(logPrefix + 'onComplete: error: ' + error);
            }
            logsToResponseHeader();
        }

        var exchange = httpClient.send(req, onComplete);
    }
}

context.proxyResponse.headers['tracestate'] = tracestate;
logMsg(logPrefix + 'exit');