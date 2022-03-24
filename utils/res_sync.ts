import * as axios from "axios";
import { QueryTypes, Sequelize } from "sequelize";
import { config } from "../config/config";
import { IResource } from "../models/resource";
import { log } from '../utils/log';

export const createResSyncIndex = async () => {
    try {
        const sequelize = await require('../models/sql/');
        await sequelize.query(`CREATE INDEX IF NOT EXISTS hfj_res_sync_res_idx ON hfj_res_sync (res_id);`, {
            type: QueryTypes.RAW
        });
        return true;
    } catch(e) {
        console.error(e);
        throw e;
    }
}

/**
 * 取得hfj_res_sync某Resource id已轉置的資料，如果沒資料回傳空陣列[]
 * @param resId Resource id
 */
export const getSyncedResourceById = async (resId: number)=> {
    log.info(`Do SQL Command: SELECT res_id, res_ver FROM hfj_res_sync WHERE res_id=${resId};`);
    const sequelize = await require('../models/sql/');
    let item = await sequelize.query(`SELECT res_id, res_ver FROM hfj_res_sync WHERE res_id=${resId};`, {
        type: QueryTypes.SELECT
    });
    log.info(`Do SQL Command Successful: SELECT res_id, res_ver FROM hfj_res_sync WHERE res_id=${resId};`);
    return item;
}

/**
 * 新增hfj_res_sync已轉置資料
 * @param resourceType resource type e.g. Patient
 * @param syncId The target FHIR Server response id 
 * @param resource hfj_resource content
 */
export const addSyncResource = async (resourceType: string, syncId: string, resource: IResource) => {
    let syncResource: any = resource;
    try {
        syncResource["res_type"] = resourceType;
        syncResource["sync_id"] = syncId;
        const sequelize: Sequelize = await require('../models/sql/');
        log.info(`Do Sequelize: hfj_res_sync.findOne`);
        let syncedResource = await sequelize.models["hfj_res_sync"].findOne({
            where: {
                res_id : resource.res_id
            }
        });
        log.info(`Do Sequelize Successful: hfj_res_sync.findOne`);
        if (syncedResource) {
            log.info(`Do Sequelize: hfj_res_sync.update`);
            await sequelize.models["hfj_res_sync"].update(syncResource , {
                where: {
                    res_id : resource.res_id
                }
            });
            log.info(`Do Sequelize Successful: hfj_res_sync.update`);
        } else {
            log.info(`Do Sequelize: hfj_res_sync.create`);
            await sequelize.models["hfj_res_sync"].create(syncResource);
            log.info(`Do Sequelize Successful: hfj_res_sync.create`);
        }
        return {
            status: true,
            data: syncResource
        };
    } catch(e) {
        log.error(e);
        return {
            status: false,
            data: e
        }
    }
}

export const doSync: any = {
    /** Using PUT `update` Web API to create Resource on target FHIR Server
     * @param resourceType resource type e.g. Patient
     * @param resId Resource id
     * @param resJson Resource JSON content
     */
    "put": async (resourceType:string, resId: number, resJson: any)=> {
        try {
            let requestConfig: any = {};
            if (config.sync.haveAuthToken) {
                let headers: axios.AxiosRequestHeaders = {
                    Authorization: `Bearer ${config.sync.token}`
                }
                requestConfig["headers"] = headers;
            }
            let res = await axios.default.put(`${config.sync.FHIRBaseURL}${resourceType}/${resId}`, resJson, 
            requestConfig);
            return res.data;
        } catch(e) {
            log.error(e);
            return false;
        }
    },
    /** Using POST `create` Web API to create Resource on target FHIR Server
     * @param resourceType resource type e.g. Patient
     * @param resId Resource id
     * @param resJson Resource JSON content
     */
    "post": async (resourceType:string, resId: number, resJson: any) => {
        try {
            let requestConfig: any = {};
            if (config.sync.haveAuthToken) {
                let headers: axios.AxiosRequestHeaders = {
                    Authorization: `Bearer ${config.sync.token}`
                }
                requestConfig["headers"] = headers;
            }
            let res = await axios.default.post(`${config.sync.FHIRBaseURL}${resourceType}`, resJson, 
            requestConfig);
            return res.data;
        } catch(e) {
            log.error(e);
            return false;
        }
    }
}