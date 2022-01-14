import * as axios from "axios";
import { QueryTypes, Sequelize } from "sequelize";
import { config } from "../config/config";
import { IResource } from "../models/resource";
import { log } from '../utils/log';

export const getSyncedResourceById = async (resId: number)=> {
    const sequelize = await require('../models/sql/');
    let item = await sequelize.query(`SELECT res_id, res_ver FROM hfj_res_sync WHERE res_id=${resId};`, {
        type: QueryTypes.SELECT
    });
    return item;
}

export const addSyncResource = async (resourceType: string, syncId: string, resource: IResource) => {
    let syncResource: any = resource;
    try {
        syncResource["res_type"] = resourceType;
        syncResource["sync_id"] = syncId;
        const sequelize: Sequelize = await require('../models/sql/');
        let syncedResource = await sequelize.models["hfj_res_sync"].findOne({
            where: {
                res_id : resource.res_id
            }
        });
        if (syncedResource) {
            await sequelize.models["hfj_res_sync"].update(syncResource , {
                where: {
                    res_id : resource.res_id
                }
            });
        } else {
            await sequelize.models["hfj_res_sync"].create(syncResource);
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