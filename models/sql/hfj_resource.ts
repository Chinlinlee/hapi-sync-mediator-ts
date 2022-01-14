import { Sequelize, DataTypes, Model } from 'sequelize';

/**
 * 
 * @param {Sequelize} sequelize 
 * @returns {Model}
 */
module.exports = (sequelize: Sequelize) => {
    const hfj_resource = sequelize.define('hfj_resource',{},{
        freezeTableName: true
    });
    return hfj_resource;
}
