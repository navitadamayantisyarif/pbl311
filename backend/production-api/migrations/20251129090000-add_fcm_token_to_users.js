'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'fcm_token', {
      type: Sequelize.STRING(512),
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'fcm_token');
  }
};

