"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert("door_status", [
      {
        id: 7,
        name: "Pintu Kantin",
        location: "Lobi",
        locked: true,
        battery_level: 92,
        last_update: now,
        wifi_strength: "Excellent",
        camera_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 8,
        name: "Pintu Kantor",
        location: "Lantai 2",
        locked: true,
        battery_level: 85,
        last_update: now,
        wifi_strength: "Good",
        camera_active: false,
        created_at: now,
        updated_at: now
      },
      {
        id: 9,
        name: "Pintu Gudang",
        location: "Belakang",
        locked: false,
        battery_level: 74,
        last_update: now,
        wifi_strength: "Fair",
        camera_active: true,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("door_status", null, {});
  }
};