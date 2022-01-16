import { convertLOBToJson } from './utils/lob';
import { getResourcesByResourceType, getResourcesCountByResourceType, getResource } from './utils/res';
import { getSyncedResourceById, addSyncResource, doSync } from './utils/res_sync'
import { config } from './config/config';
import { IResource } from './models/resource';
import { IResourceVer } from './models/resource_ver';
import { log } from './utils/log';

async function isNeedSync(resource:IResource , resourceVer:IResourceVer): Promise<boolean> {
    let syncedResource = await getSyncedResourceById(resource.res_id);
    return resource.res_ver !== resourceVer.res_ver || syncedResource.length == 0;
}

async function doWorks(workerList: Array<any>) {
    let doWorkList = [];
    while(workerList.length > 0) {
        doWorkList = workerList.slice(0,config.sync.totalWorker);
        workerList.splice(0,config.sync.totalWorker);
        await Promise.allSettled(doWorkList.map(f=> f()))
    }
}

function addWork(worker: Array<any>, resourceItemList: Array<any>, limit: number, offset:number) {
    worker.push(async ()=> {
        let successCount = 0;
        for (let i = 0 ; i < resourceItemList.length ; i++) {
            let resourceItem = resourceItemList[i];
            let resource = await getResource(resourceItem.res_id, resourceItem.res_ver);
            let syncResourceType = resourceItem.res_type;
            let needSync = await isNeedSync(resourceItem, resource);
            if (needSync) {
                let res_id = resourceItem.res_id;
                let lobJson = await convertLOBToJson(resource);
                let syncResData = await doSync[config.sync.method](syncResourceType, res_id, lobJson);
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
        log.info(`convert ${offset}~${offset+limit} successfully ${successCount}/${limit}`);
    });
}

(async () => {
    let worker:Array<any> = [];
    let limit = config.sync.limit;
    let offset = 0;
    let resourceItemList = await getResourcesByResourceType(limit , offset);
    //let resourceCount = await getResourcesCountByResourceType();
    while(resourceItemList.length > 0) {
        if (worker.length == config.sync.totalWorker) await doWorks(worker);
        addWork(worker, resourceItemList, limit, offset);
        offset += limit;
        resourceItemList = await getResourcesByResourceType(limit , offset);
    }
    await doWorks(worker);
})();