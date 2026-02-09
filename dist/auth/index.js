"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const request_1 = require("../utils/request");
const utils_1 = require("../utils/utils");
const cheerio = __importStar(require("cheerio"));
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
        appState?.find(c => (c.key === 'c_user' || c.name === 'c_user'))?.value || '';
    const irisSeqID = (0, utils_1.getFrom)(body, '"irisSeqID":"', '"');
    if (!userID) {
        throw new Error(constants_1.ERROR_MESSAGES.NOT_LOGGED_IN);
    }
    // Calculate ttstamp
    let ttstamp = '2';
    for (let i = 0; i < (fb_dtsg?.length || 0); i++) {
        ttstamp += fb_dtsg.charCodeAt(i);
    }
    // Extract user name from title if possible
    let userName = 'Unknown';
    try {
        const $ = cheerio.load(body);
        const title = $('title').text();
        // Titles are usually "Name | Facebook" or just "Facebook"
        if (title && !title.includes('Log In') && !title.includes('Log into')) {
            userName = title.replace(' | Facebook', '').trim();
            if (userName === 'Facebook')
                userName = 'Unknown';
        }
    }
    catch (e) {
        // Ignore
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
        irisSeqID,
        userAgent: req.getUserAgent(),
        userName
    };
}
