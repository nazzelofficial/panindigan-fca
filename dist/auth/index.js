"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const request_1 = require("../utils/request");
const utils_1 = require("../utils/utils");
const constants_1 = require("../utils/constants");
const Logger_1 = require("../utils/Logger");
async function login(options, globalOptions) {
    let appState = options.appState;
    if (!appState && process.env.FB_APPSTATE) {
        try {
            const rawState = process.env.FB_APPSTATE;
            if (rawState.trim().startsWith('[')) {
                appState = JSON.parse(rawState);
            }
            else {
                const buffer = Buffer.from(rawState, 'base64');
                appState = JSON.parse(buffer.toString('utf-8'));
            }
        }
        catch (e) {
            Logger_1.logger.error('Failed to parse FB_APPSTATE from environment in auth/index.ts', e);
        }
    }
    const req = new request_1.Request(appState, globalOptions?.antiDetection);
    // Initial check
    const response = await req.get('https://www.facebook.com/');
    const body = response.data;
    // Extract critical tokens
    const fb_dtsg = (0, utils_1.getFrom)(body, 'name="fb_dtsg" value="', '"') ||
        (0, utils_1.getFrom)(body, '["DTSGInitialData",[],{"token":"', '"');
    const userID = (0, utils_1.getFrom)(body, 'c_user=', ';') ||
        appState?.find(c => c.key === 'c_user')?.value || '';
    const irisSeqID = (0, utils_1.getFrom)(body, '"irisSeqID":"', '"');
    if (!userID) {
        throw new Error(constants_1.ERROR_MESSAGES.NOT_LOGGED_IN);
    }
    // Calculate ttstamp
    let ttstamp = '2';
    for (let i = 0; i < (fb_dtsg?.length || 0); i++) {
        ttstamp += fb_dtsg.charCodeAt(i);
    }
    return {
        userID,
        jar: req.getJar(),
        clientID: (0, utils_1.getGUID)(), // Use real UUID
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
