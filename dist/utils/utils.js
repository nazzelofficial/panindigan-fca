"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGUID = getGUID;
exports.generateOfflineThreadingID = generateOfflineThreadingID;
exports.formatCookie = formatCookie;
exports.getFrom = getFrom;
exports.parseGraphQLBatch = parseGraphQLBatch;
exports.parseGraphQLBatchMap = parseGraphQLBatchMap;
const uuid_1 = require("uuid");
function getGUID() {
    return (0, uuid_1.v4)();
}
function generateOfflineThreadingID() {
    const ret = Date.now();
    const value = Math.floor(Math.random() * 4294967295);
    const str = ("0000000000000000000000" + value.toString(2)).slice(-22);
    const msgs = ret.toString(2) + str;
    return parseInt(msgs, 2).toString();
}
function formatCookie(arr, url) {
    return arr.filter(c => url.includes(c.domain.replace(/^\./, ''))).map(c => `${c.key}=${c.value}`).join('; ');
}
function getFrom(str, startToken, endToken) {
    const start = str.indexOf(startToken) + startToken.length;
    if (start < startToken.length)
        return '';
    const last = str.indexOf(endToken, start);
    return str.substring(start, last > -1 ? last : undefined);
}
function parseGraphQLBatch(response) {
    const results = [];
    const lines = response.split('\n');
    for (const line of lines) {
        if (line.startsWith('{')) {
            try {
                const data = JSON.parse(line);
                if (data.o0 && data.o0.data)
                    results.push(data.o0.data);
                // Handle other possible keys or error states
            }
            catch (e) {
                // Ignore parse errors for keep-alive lines
            }
        }
    }
    return results;
}
function parseGraphQLBatchMap(response) {
    const results = {};
    const lines = response.split('\n');
    for (const line of lines) {
        if (line.startsWith('{')) {
            try {
                const data = JSON.parse(line);
                for (const key in data) {
                    if (data[key] && data[key].data) {
                        results[key] = data[key].data;
                    }
                }
            }
            catch (e) {
                // Ignore
            }
        }
    }
    return results;
}
