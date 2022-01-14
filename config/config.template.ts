export const config = {
    db : {
        service : "postgres" , //only support postgres now
        username : "username",
        password : "password",
        database : "hapi" ,
        hostName : "localhost" ,
    },
    sync: {
        resources : []
    }
}