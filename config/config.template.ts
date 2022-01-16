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
        totalWorker: 5,
        FHIRBaseURL: "http://localhost:8088/fhir/" , //the FHIR base URL
        haveAuthToken : true, //if FHIR server need to auth to use, please change to true
        token : "token", // the authorization token
        method: "put" //using `create` or `update` to sync data
    }
}