'use strict'

var RequestResponsePairName = properties.RequestResponsePairName;
var logPrefix = RequestResponsePairName + '.TraceContextResponse: ';
logMsg(logPrefix + 'enter');
var ctxPrefix = 'traceContext.' + RequestResponsePairName;

var requestParentID = context.getVariable(ctxPrefix + 'requestParentID');
var parentID = context.getVariable(ctxPrefix + 'parentID');
var traceID = context.getVariable(ctxPrefix + 'traceID');
var traceFlags = context.getVariable(ctxPrefix+ 'traceFlags');
var parentStartTime = context.getVariable(ctxPrefix+ 'parentStartTime');

logMsg(logPrefix + 'RequestParentID: ' + requestParentID);
logMsg(logPrefix + 'ParentID: ' + parentID);
logMsg(logPrefix + 'TraceID: ' + traceID);
logMsg(logPrefix + 'TraceFlags: ' + traceFlags);
logMsg(logPrefix + 'parentStartTime: ' + parentStartTime);

var endTime = Date.now();
var configuredEndTime = context.getVariable(properties.TraceEndTimestamp);
if (configuredEndTime != null) {
    endTime = configuredEndTime;
} else {
    logMsg(logPrefix + 'WARN: null value for TraceEndTimestamp: ' + properties.TraceEndTimestamp)
}

var    attributes= {
        'duration.ms': endTime - parentStartTime,
        'name': properties.RequestResponsePairName,
        'service.name': 'Apigee'
    };

if (requestParentID != null && requestParentID != ''){
    attributes['parent.id'] = requestParentID;
}

var span = {
    'id': parentID,
    'trace.id': traceID,
    timestamp: parentStartTime,
    attributes: attributes
}
// TODO  Is there a way to 'queue' the spans so they can be written as a batch?   Maybe push them into the context?

var msg = [{
    'common': {
        'attributes': {

        }
    },
    'spans': [span]
}]

// TODO parameterize API Key & endpoint
var headers = {
    'Content-Type': 'application/json',
    'Api-Key': '',
    'Data-Format': 'newrelic',
    'Data-Format-Version': '1'

};

var req = new Request('https://trace-api.newrelic.com/trace/v1', 'POST', headers, JSON.stringify(msg));
function onComplete(response,error) {
    // Check if the HTTP request was successful
       if (response) {
         logMsg(logPrefix + 'onComplete: response.status: ' +  response.status);
        } else {
         logMsg(logPrefix + 'onComplete: error: ' +  error);
        }
    logsToResponseHeader();
   }

var exchange = httpClient.send(req, onComplete);

logMsg(logPrefix + 'exit');