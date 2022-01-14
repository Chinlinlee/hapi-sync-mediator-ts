import { configure, getLogger } from 'log4js';
configure("./config/log4js.json");
export const log = getLogger('app');