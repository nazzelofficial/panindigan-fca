import { Request } from '../utils/request';
import { AppState, LoginOptions } from '../types';
import { getFrom, getGUID } from '../utils/utils';
import * as cheerio from 'cheerio';
import { ERROR_MESSAGES } from '../utils/constants';
import { logger } from '../utils/Logger';

export interface ApiCtx {
  userID: string;
  jar: AppState[];
  clientID: string;
  globalOptions: any;
  loggedIn: boolean;
  access_token: string;
  clientMutationId: number;
  mqttClient?: any;
  req: Request;
  fb_dtsg?: string;
  ttstamp?: string;
  irisSeqID?: string;
}

export async function login(options: LoginOptions, globalOptions?: any): Promise<ApiCtx> {
  let appState = options.appState;

  if (!appState && process.env.FB_APPSTATE) {
    try {
      const rawState = process.env.FB_APPSTATE;
      if (rawState.trim().startsWith('[')) {
        appState = JSON.parse(rawState);
      } else {
        const buffer = Buffer.from(rawState, 'base64');
        appState = JSON.parse(buffer.toString('utf-8'));
      }
    } catch (e) {
      logger.error('Failed to parse FB_APPSTATE from environment in auth/index.ts', e as Error);
    }
  }

  const req = new Request(appState, globalOptions?.antiDetection);
  
  // Initial check
  const response = await req.get('https://www.facebook.com/');
  const body = response.data;

  // Extract critical tokens
  const fb_dtsg = getFrom(body, 'name="fb_dtsg" value="', '"') || 
                  getFrom(body, '["DTSGInitialData",[],{"token":"', '"');
  
  const userID = getFrom(body, 'c_user=', ';') || 
                 appState?.find(c => (c.key === 'c_user' || c.name === 'c_user'))?.value || '';

  const irisSeqID = getFrom(body, '"irisSeqID":"', '"');

  if (!userID) {
    throw new Error(ERROR_MESSAGES.NOT_LOGGED_IN);
  }

  // Calculate ttstamp
  let ttstamp = '2';
  for (let i = 0; i < (fb_dtsg?.length || 0); i++) {
    ttstamp += fb_dtsg!.charCodeAt(i);
  }

  return {
    userID,
    jar: req.getJar(),
    clientID: getGUID(), // Use real UUID
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
