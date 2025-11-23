'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('camera_records', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
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
      filename: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      event_type: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      file_size: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('camera_records', ['door_id'], {
      name: 'camera_records_door_id_idx'
    });
    await queryInterface.addIndex('camera_records', ['timestamp'], {
      name: 'camera_records_timestamp_idx'
    });
    await queryInterface.addIndex('camera_records', ['event_type'], {
      name: 'camera_records_event_type_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('camera_records');
  }
};
