# hapi-sync-mediator

sync hapi FHIR data from database (`hfj_res_ver`) to another FHIR server.

Note: **Only support postgres database.**

## Configuration
- **create `config.ts` in `config` folder**
- you can config refer to `config/config.template.ts`
```typescript=
export const config = {
    db : {
        service : "postgres" , //only support postgres now
        username : "username",
        password : "password",
        database : "hapi" ,
        hostName : "localhost" ,
    },
    sync: {
        limit: 100, //pagination limit
        FHIRBaseURL: "http://localhost:8088/fhir/" , //the FHIR base URL
        haveAuthToken : true, //if FHIR server need to auth to use, please change to true
        token : "token", // the authorization token
        method: "put" //using `create` or `update` to sync data
    }
}
```

## RUN
```bash
ts-node index.ts
```