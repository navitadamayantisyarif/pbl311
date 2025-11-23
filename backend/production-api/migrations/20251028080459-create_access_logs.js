'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('access_logs', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      door_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'door_status',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      method: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(255),
        allowNull: true
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

    // Add indexes for better query performance
    await queryInterface.addIndex('access_logs', ['user_id'], {
      name: 'access_logs_user_id_idx'
    });
    await queryInterface.addIndex('access_logs', ['door_id'], {
      name: 'access_logs_door_id_idx'
    });
    await queryInterface.addIndex('access_logs', ['timestamp'], {
      name: 'access_logs_timestamp_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('access_logs');
  }
};
