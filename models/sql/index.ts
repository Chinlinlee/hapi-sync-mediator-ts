import { Sequelize, Op, Dialect } from 'sequelize';
import { config } from '../../config/config';

let dbOptions = {
    host: config.db.hostName,
    dialect:  config.db.service as Dialect, //mssql
    logging: false
};
if (process.env.NODE_ENV == "dev" || process.env.NODE_ENV === "development") {
    dbOptions.logging = true;
}
const sequelize = new Sequelize(config.db.database  , config.db.username , config.db.password , {
    host: config.db.hostName,
    dialect:  config.db.service as Dialect, //mssql
});

require('./hfj_res_sync')(sequelize);
//exec this function when you init

/**
 * @type {Sequelize}
 */
module.exports = (async function () {
    try {
        await sequelize.authenticate();
        await sequelize.models['hfj_res_sync'].sync();
        console.log('Connection has been established successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();