'use strict';

// TODO validate Policy properties

var startTime = contextGetVariable(properties.TraceStartTimestamp, Date.now());
var RequestResponsePairName = properties.RequestResponsePairName;
var logPrefix = RequestResponsePairName + '.TraceContextRequest: ';
logMsg(logPrefix + 'enter');
var ctxPrefix = 'traceContext.' + RequestResponsePairName;

function mergeTracestate(traceState, additionalStates) {
    logMsg(logPrefix + 'mergeTracestate.enter: traceState: ' + traceState + ' additionalStates: ' + additionalStates);

    if (isNil(additionalStates)){
        logMsg(logPrefix + 'mergeTracestate: additionalStates is null or empty, returning: ' + traceState);
        return traceState;
    }

    if (isNil(traceState)){
        logMsg(logPrefix + 'mergeTracestate: traceState is null or empty, returning: ' + additionalStates);
        return additionalStates;
    }

    traceState = String(traceState).trim();
    additionalStates = String(additionalStates).trim();
    logMsg(logPrefix + 'mergeTracestate: traceState and additionalStates both active');
    traceState.split(',').map((pair) => {
        var kv = pair.split('=');
        logMsg(logPrefix + 'mergeTracestate: kv: ' + kv + ' type: ' + typeof (kv));
        var key = String(kv[0]).trim();
        var value = String(kv[1]).trim();
        if (additionalStates.indexOf(key) == -1) {
            additionalStates = additionalStates + ',' + key + '=' + value;
        }
    });

    logMsg(logPrefix + 'mergeTracestate.exit: ' + additionalStates);
    return additionalStates;
}

function randomHexString(len) {
    var maxlen = 8,
        min = Math.pow(16, Math.min(len, maxlen) - 1),
        max = Math.pow(16, Math.min(len, maxlen)) - 1,
        n = Math.floor(Math.random() * (max - min + 1)) + min,
        r = n.toString(16);
    while (r.length < len) {
        r = r + randomHexString(len - maxlen);
    }
    return r;
}

function generateValidID(len) {
    var id = randomHexString(len);
    // IDs must not be all zeros
    while (!(/[1-9a-f]/).test(id)) {
        id = randomHexString(len);
    }
    return id;
}

function generateSampled() {
    // Give us a number 0 - 99 inclusive
    var n = Math.floor(Math.random() * 100);
    n = n + 1;
    if (n <= properties.SampleOddsPercentage) {
        return '01';
    }
    return '00';
}

var traceparent = context.getVariable('request.header.traceparent');
var tracestate = context.getVariable('request.header.tracestate.values.string');
var additionalStates = properties.AdditionalTracestateValues;
logMsg(logPrefix + 'traceparent: ' + traceparent + ' type: ' + typeof (traceparent));
logMsg(logPrefix + 'tracestate: ' + tracestate + ' type: ' + typeof (tracestate));
logMsg(logPrefix + 'additionalStates: ' + additionalStates + ' type: ' + typeof (additionalStates));

//
// Note:
//   In W3C speak 'Parent ID' is only the 'Parent's ID' as received in an incoming traceparent header. Once we create a 'Span' we become the 'Parent ID'- what
//   most would term 'the Span ID'. `requestParentID` is therefore the incoming Span's ID. This code sticks with W3C terminology for consistency.
var versionFormat, traceID, parentID, traceFlags, requestParentID;

function newTraceparent() {
    versionFormat = '00';
    traceID = generateValidID(32);
    parentID = generateValidID(16);   // aka SpanID
    traceFlags = generateSampled();
    requestParentID = '';            // New Relic's Trace API expects a null parent.id attribute if this is the root span
    tracestate = '';
}

// 4.2 No traceparent Received
// If no traceparent header is received:
if (isNil(traceparent)){
    // Create an initial traceparent and tracestate 
    // The vendor checks an incoming request for a traceparent and a tracestate header.
    // Because the traceparent header is not received, the vendor creates a new trace-id and parent-id that represents the current request.
    // If a tracestate header is received without an accompanying traceparent header, it is invalid and MUST be discarded.
    // The vendor SHOULD create a new tracestate header and add a new key/value pair.
    // The vendor sets the traceparent and tracestate header for the outgoing request.
    newTraceparent();
}
// 4.3 A traceparent is Received
// If a traceparent header is received:
else {
    // The vendor checks an incoming request for a traceparent and a tracestate header.
    // Because the traceparent header is present, the vendor tries to parse the version of the traceparent header.
    // If the version cannot be parsed, the vendor creates a new traceparent header and deletes tracestate.
    // If the version number is higher than supported by the tracer, the vendor uses the format defined in this specification (00) to parse trace-id and parent-id.
    //     The vendor will only parse the trace-flags values supported by this version of this specification and ignore all other values.
    //     If parsing fails, the vendor creates a new traceparent header and deletes the tracestate. Vendors will set all unparsed / unknown trace-flags to 0 on outgoing requests.
    if (!(/^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/).test(traceparent)) {
        logMsg(logPrefix + 'Error: invalid traceparent: ' + traceparent);
        newTraceparent();
    } else {
        // If the vendor supports the version number, it validates trace-id and parent-id. If either trace-id, parent-id or trace-flags are invalid, the vendor creates a new traceparent header and deletes tracestate.
        var values = traceparent.split('-');
        versionFormat = values[0];
        traceID = values[1];
        parentID = values[2];
        traceFlags = values[3];
        if (/[1-9a-f]/.test(traceID)) {
            if (/[1-9a-f]/.test(parentID)) {
                if (/[0-9a-f]/.test(traceFlags)) {
                    // All good, generate our ParentID
                    // The vendor MUST modify the traceparent header:
                    // Update parent-id: The value of property parent-id MUST be set to a value representing the ID of the current operation.
                    // Update sampled: The value of sampled reflects the caller's recording behavior. The value of the sampled flag of trace-flags MAY be set to 1 if the trace data is likely to be recorded or to 0 otherwise. Setting the flag is no guarantee that the trace will be recorded but increases the likeliness of end-to-end recorded traces.
                    requestParentID = parentID;
                    parentID = generateValidID(8);
                    traceFlags = generateSampled();
                } else {
                    logMsg(logPrefix + 'Error: invalid traceFlags: ' + traceFlags);
                    newTraceparent();
                }
            } else {
                logMsg(logPrefix + 'Error: invalid parentID: ' + parentID);
                newTraceparent();
            }
        } else {
            logMsg(logPrefix + 'Error: invalid traceID: ' + traceID);
            newTraceparent();
        }

        // The vendor MAY validate the tracestate header. If the tracestate header cannot be parsed the vendor MAY discard the entire header. Invalid tracestate entries MAY also be discarded.
        var states = tracestate.split(',');
        if (states.length > 32) {
            logMsg(RlogPrefix + 'Warning: tracestate has too many values: ' + states.length);
        }
    }
}

// New Relic
// New Relic tracestate standards require a trusted account key which only comes from an agent logging into New Relic.
// https://source.datanerd.us/agents/agent-specs/blob/6d2e3e1d9fdbd0316729bb6289af481335d59f69/distributed_tracing/Trace-Context-Payload.md#tracestate
// Therefore we're not adding anything to tracestate

// W3C
// The vendor MAY modify the tracestate header:
// Update a key value: The value of any key can be updated. Modified keys MUST be moved to the beginning (left) of the list.
// Add a new key/value pair: The new key-value pair MUST be added to the beginning (left) of the list.
// Delete a key/value pair: Any key/value pair MAY be deleted. Vendors SHOULD NOT delete keys that weren't generated by themselves. Deletion of any key/value pair MAY break correlation in other systems.
// The vendor sets the traceparent and tracestate header for the outgoing request.

traceparent = versionFormat + '-' + traceID + '-' + parentID + '-' + traceFlags;
context.setVariable('request.header.traceparent', traceparent);
logMsg(logPrefix + 'outbound traceparent: ' + traceparent);

tracestate = mergeTracestate(tracestate, additionalStates);
context.setVariable('request.header.tracestate', tracestate);
// context.proxyRequest.headers['tracestate'] = tracestate;
logMsg(logPrefix + 'outbound tracestate: ' + tracestate);

// Values needed by the Reponse to write to New Relic
context.setVariable(ctxPrefix + 'requestParentID', requestParentID);
context.setVariable(ctxPrefix + 'parentID', parentID);
context.setVariable(ctxPrefix + 'traceID', traceID);
context.setVariable(ctxPrefix + 'traceFlags', traceFlags);
context.setVariable(ctxPrefix + 'parentStartTime', startTime);
context.setVariable(ctxPrefix + 'tracestate', tracestate);

logMsg(logPrefix + 'exit');