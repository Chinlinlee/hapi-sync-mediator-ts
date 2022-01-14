import { Sequelize, DataTypes, Model } from 'sequelize';

/**
 * 
 * @param {Sequelize} sequelize 
 * @returns {Model}
 */
module.exports = (sequelize: Sequelize) => {
    const hfj_res_sync = sequelize.define('hfj_res_sync',
    {
        res_id: {
            type: DataTypes.BIGINT
        },
        res_type: {
            type: DataTypes.STRING
        },
        res_ver: {
            type: DataTypes.BIGINT
        },
        sync_id : {
            type: DataTypes.STRING
        }
    },
    {
        timestamps : false,
        freezeTableName: true
    });
    return hfj_res_sync;
}
