'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
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
      type: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      read: {
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

    // Add indexes for better query performance
    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'notifications_user_id_idx'
    });
    await queryInterface.addIndex('notifications', ['read'], {
      name: 'notifications_read_idx'
    });
    await queryInterface.addIndex('notifications', ['created_at'], {
      name: 'notifications_created_at_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  }
};
