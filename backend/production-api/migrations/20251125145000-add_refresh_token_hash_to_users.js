'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'refresh_token_hash', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addIndex('users', ['refresh_token_hash'], {
      name: 'users_refresh_token_hash_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('users', 'users_refresh_token_hash_idx');
    await queryInterface.removeColumn('users', 'refresh_token_hash');
  }
};