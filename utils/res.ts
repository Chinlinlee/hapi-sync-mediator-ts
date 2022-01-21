import { QueryTypes } from "sequelize";
import { IResource } from "../models/resource";

/**
 * 用於取得hfj_resource資料的id, resource type, 最新res_ver
 * @param limit SQL query data limit count
 * @param offset SQL query data offset
 */
export const getResources = async (limit: number, offset: number): Promise<Array<IResource>> => {
    const sequelize = await require('../models/sql/');
    let item = await sequelize.query(`SELECT res_type, res_id, res_ver FROM hfj_resource LIMIT ${limit} OFFSET ${offset};`, {
        type: QueryTypes.SELECT
    });
    return item;
}

/**
 * 取得hfj_res_ver單個Resource資料
 * @param resId Resource id
 * @param resVer Resource Version
 */
export const getResource = async (resId: number, resVer: number) => {
    const sequelize = await require('../models/sql/');
    let item = await sequelize.query(`SELECT lo_get(res_text), res_id, res_ver FROM hfj_res_ver WHERE res_id=${resId} and res_ver=${resVer};`, {
        type: QueryTypes.SELECT
    });
    return item.pop();
}

export const getResourcesCountByResourceType= async (): Promise<number> => {
    const sequelize = await require('../models/sql/');
    let count = await sequelize.query(`SELECT COUNT(*) FROM hfj_resource`, {
        type: QueryTypes.SELECT
    });
    return Number(count.pop().count);
}