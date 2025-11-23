'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('door_status', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      battery_level: {
        type: Sequelize.SMALLINT,
        allowNull: true,
        comment: '0-100'
      },
      last_update: {
        type: Sequelize.DATE,
        allowNull: true
      },
      wifi_strength: {
        type: Sequelize.ENUM('Excellent', 'Good', 'Fair', 'Weak', 'No Signal'),
        allowNull: true
      },
      camera_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('door_status');
    
    // Drop enum type (Sequelize creates it automatically with name enum_door_status_wifi_strength)
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_door_status_wifi_strength";
    `);
  }
};
