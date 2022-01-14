import { Sequelize, DataTypes, Model } from 'sequelize';

/**
 * 
 * @param {Sequelize} sequelize 
 * @returns {Model}
 */
module.exports = (sequelize: Sequelize) => {
    const hfj_res_ver = sequelize.define('hfj_res_ver',{},{
        freezeTableName: true
    });
    return hfj_res_ver;
}
