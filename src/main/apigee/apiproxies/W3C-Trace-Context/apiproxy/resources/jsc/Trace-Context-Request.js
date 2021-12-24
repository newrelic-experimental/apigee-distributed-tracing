"use strict"
function randomHexString(len) {
    var r = '';
    var maxlen = 8,
        min = Math.pow(16, Math.min(len, maxlen) - 1),
        max = Math.pow(16, Math.min(len, maxlen)) - 1,
        n = Math.floor(Math.random() * (max - min + 1)) + min,
        r = n.toString(16);
    while (r.length < len) {
        r = r + randHex(len - maxlen);
    }
    return r;
}

function generateValidID(len) {
    var id = randomHexString(len);
// IDs must not be all zeros
    while (! /[1-9a-f]/.test(id)) {
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

var traceparent = context.getVariable("request.header.traceparent");
var tracestate = context.getVariable("request.header.tracestate");
//
// Note:
//   In W3C speak "Parent ID" is only the "Parent's ID" as received in an incoming traceparent header. Once we create a "Span" we become the "Parent ID"- what
//   most would term "the Span ID". `requestParentID` is therefore the incoming Span's ID. This code sticks with W3C terminology for consistency.
var versionFormat, requrestVersionFormat, traceID, parentID, traceFlags, requestParentID

function newTraceparent() {
    versionFormat = '00';
    traceID = generateValidID(16);
    parentID = generateValidID(8);   // aka SpanID
    traceFlags = generateSampled();
    requestParentID = "";            // New Relic's Trace API expects a null parent.id attribute if this is the root span
    tracestate = '';
}

// 4.2 No traceparent Received
// If no traceparent header is received:
if (traceparent == null) {
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
    if (!/^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(traceparent)) {
        print('Error: invalid traceparent: ' + traceparent);
        newTraceparent();
    } else {
        // If the vendor supports the version number, it validates trace-id and parent-id. If either trace-id, parent-id or trace-flags are invalid, the vendor creates a new traceparent header and deletes tracestate.
        var values = traceparent.split('-');
        requestVersionFormat = values[0];
        traceId = values[1];
        parentID = values[2];
        traceFlags = values[2];
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
                    print('Error: invalid traceFlags: ' + traceFlags);
                    newTraceparent();
                }
            } else {
                print('Error: invalid parentID: ' + parentID);
                newTraceparent();
            }
        } else {
            print('Error: invalid traceID: ' + traceID);
            newTraceparent();
        }

        // The vendor MAY validate the tracestate header. If the tracestate header cannot be parsed the vendor MAY discard the entire header. Invalid tracestate entries MAY also be discarded.
        var states = tracestate.split(',');
        if (states.length > 32) {
            print("Warning: tracestate has too many values: " + states.length);
        }
    }
}

// TODO Does NR have any standard fields for tracestate?
// TODO 
// The vendor MAY modify the tracestate header:
// Update a key value: The value of any key can be updated. Modified keys MUST be moved to the beginning (left) of the list.
// Add a new key/value pair: The new key-value pair MUST be added to the beginning (left) of the list.
// Delete a key/value pair: Any key/value pair MAY be deleted. Vendors SHOULD NOT delete keys that weren't generated by themselves. Deletion of any key/value pair MAY break correlation in other systems.

// The vendor sets the traceparent and tracestate header for the outgoing request.
traceparent = versionFormat + '-' + traceID + '-' + parentID + '-' + traceFlags;

context.targetRequest.headers['traceparent'] = traceparent;
context.targetRequest.headers['tracestate'] = tracestate;

// Values needed by the Reponse to write to New Relic
context.setVariable("traceContext.requestParentID", requestParentID);
context.setVariable("traceContext.parentID", parentID);
context.setVariable("traceContext.traceID", traceID);
context.setVariable("traceContext.traceFlags", traceFlags);
context.setVariable("traceContext.parentStartTime", context.getVariable("client.received.start.timestamp"));