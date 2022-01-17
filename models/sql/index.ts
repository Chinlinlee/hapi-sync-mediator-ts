import { Sequelize, Op, Dialect } from 'sequelize';
import { config } from '../../config/config';

const sequelize = new Sequelize(config.db.database  , config.db.username , config.db.password , {
    host: config.db.hostName,
    dialect:  config.db.service as Dialect, //mssql
    // logging : false
});

require('./hfj_res_sync')(sequelize);
//exec this function when you init

/**
 * @type {Sequelize}
 */
module.exports = (async function () {
    try {
        await sequelize.authenticate();
        await sequelize.models['hfj_res_ver'].sync();
        await sequelize.models['hfj_res_sync'].sync();
        await sequelize.models['hfj_resource'].sync();
        console.log('Connection has been established successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();