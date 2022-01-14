import { configure, getLogger } from 'log4js';
configure("./config/log4js.json");
let myLog = getLogger('hapi-to-burni');
export const log = myLog;
