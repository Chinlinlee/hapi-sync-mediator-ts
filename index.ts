import { convertLOBToJson } from './utils/lob';
import { getResources, getResource } from './utils/res';
import { getSyncedResourceById, addSyncResource, doSync, createResSyncIndex } from './utils/res_sync'
import { config } from './config/config';
import { IResource } from './models/resource';
import { log } from './utils/log';

/**
 * Check source FHIR Server content is need to sync to target FHIR Server.
 * @param resource 
 * @param resourceVer 
 */
async function isNeedSync(resource:IResource): Promise<boolean> {
    log.info(`Check Resource Is Need to Sync`);
    let syncedResource = await getSyncedResourceById(resource.res_id);
    if (syncedResource.length !== 0 ) {
        log.info(`Finished! Check Resource Is Need to Sync, The synced resource ver: ${syncedResource[0].res_ver}, resource ver: ${resource.res_ver}`);
        return syncedResource[0].res_ver !== resource.res_ver;
    }
    log.info(`Finished! Check Resource Is Need to Sync`);
    return true;
}

/**
 * 執行被丟入陣列的promise function
 * @param workerList 
 */
async function doWorks(workerList: Array<any>) {
    let doWorkList = [];
    while(workerList.length > 0) {
        doWorkList = workerList.slice(0,config.sync.totalWorker);
        workerList.splice(0,config.sync.totalWorker);
        await Promise.allSettled(doWorkList.map(f=> f()))
    }
}

/**
 * 新增執行同步資料的function到陣列裡
 * @param worker 當前待執行promise function陣列
 * @param resourceItemList 當前hfj_resource資料
 * @param limit SQL query data limit
 * @param offset SQL query data offset
 */
function addWork(worker: Array<any>, resourceItemList: Array<any>, limit: number, offset:number) {
    worker.push(async ()=> {
        let successCount = 0;
        for (let i = 0 ; i < resourceItemList.length ; i++) {
            let resourceItem = resourceItemList[i];
            let resource = await getResource(resourceItem.res_id, resourceItem.res_ver);
            let syncResourceType = resourceItem.res_type;
            let needSync = await isNeedSync(resourceItem);
            if (needSync) {
                let res_id = resourceItem.res_id;
                let lobJson = await convertLOBToJson(resource);
                log.info(`doSync Start`);
                let syncResData = await doSync[config.sync.method](syncResourceType, res_id, lobJson);
                log.info(`doSync Finished`);
                if (syncResData) {
                    let addResult = await addSyncResource(syncResourceType, syncResData.id, resource);
                    if (addResult.status) {
                        successCount++;
                    }
                }
            } else {
                successCount++;
            }
        }
        log.info(`convert ${offset}~${offset+limit} successfully ${successCount}/${resourceItemList.length}`);
    });
}

/**
 * 程式主體main
 */
(async () => {
    await createResSyncIndex();
    let worker:Array<any> = [];
    let limit = config.sync.limit;
    let offset = 0;
    //取得第一批hfj_resource資料
    let resourceItemList = await getResources(limit , offset);
    //let resourceCount = await getResourcesCountByResourceType();

    //執行直到pagination hfj_resource資料長度為0
    while(resourceItemList.length > 0) {
        //當待執行promise function陣列長度與設定檔最大併行數量相同時，併行執行所有promise function
        if (worker.length == config.sync.totalWorker) await doWorks(worker);
        addWork(worker, resourceItemList, limit, offset);
        //When offset is 0, limit is 100 that 0~100, after first processing this will be next page, offset is 100, limit is 100 = 100~200
        offset += limit;
        //get next page `hfj_resource` data
        resourceItemList = await getResources(limit , offset);
    }
    //do remain works
    await doWorks(worker);
})();