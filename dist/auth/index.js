"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const request_1 = require("../utils/request");
const utils_1 = require("../utils/utils");
async function login(options, globalOptions) {
    const req = new request_1.Request(options.appState, globalOptions?.antiDetection);
    // Initial check
    const response = await req.get('https://www.facebook.com/');
    const body = response.data;
    // Extract critical tokens
    const fb_dtsg = (0, utils_1.getFrom)(body, 'name="fb_dtsg" value="', '"') ||
        (0, utils_1.getFrom)(body, '["DTSGInitialData",[],{"token":"', '"');
    const userID = (0, utils_1.getFrom)(body, 'c_user=', ';') ||
        options.appState?.find(c => c.key === 'c_user')?.value || '';
    const irisSeqID = (0, utils_1.getFrom)(body, '"irisSeqID":"', '"');
    if (!userID) {
        throw new Error('Not logged in. Check your appState.');
    }
    // Calculate ttstamp
    let ttstamp = '2';
    for (let i = 0; i < (fb_dtsg?.length || 0); i++) {
        ttstamp += fb_dtsg.charCodeAt(i);
    }
    return {
        userID,
        jar: req.getJar(),
        clientID: (Math.random() * 2147483648 | 0).toString(16),
        globalOptions: options,
        loggedIn: true,
        access_token: '', // Usually not needed for web-based, but good to have if we can find it
        clientMutationId: 0,
        req,
        fb_dtsg,
        ttstamp,
        irisSeqID
    };
}
