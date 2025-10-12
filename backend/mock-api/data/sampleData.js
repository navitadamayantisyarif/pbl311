const faker = require('faker');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Set locale to Indonesia for realistic Indonesian names
faker.locale = 'id_ID';

// Indonesian names arrays for more authentic data
const indonesianFirstNames = [
  'Ahmad', 'Budi', 'Sari', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hendra', 'Indira', 'Joko',
  'Kartika', 'Lestari', 'Made', 'Nurul', 'Okta', 'Putri', 'Qori', 'Rizki', 'Sinta', 'Toni',
  'Umi', 'Vera', 'Wulan', 'Yoga', 'Zahra', 'Andi', 'Bayu', 'Citra', 'Dian', 'Eka',
  'Fajar', 'Galih', 'Hani', 'Ilham', 'Jihan', 'Kiki', 'Laila', 'Maya', 'Nina', 'Oka',
  'Pandu', 'Qonita', 'Reza', 'Siska', 'Tika', 'Udin', 'Vina', 'Wira', 'Yanti', 'Zaki'
];

const indonesianLastNames = [
  'Pratama', 'Sari', 'Wijaya', 'Putri', 'Santoso', 'Wati', 'Kusuma', 'Dewi', 'Permana', 'Lestari',
  'Setiawan', 'Anggraeni', 'Nugroho', 'Maharani', 'Susanto', 'Rahayu', 'Hidayat', 'Safitri', 'Kurniawan', 'Puspita',
  'Gunawan', 'Oktavia', 'Handoko', 'Melati', 'Suryanto', 'Cahyani', 'Firmansyah', 'Nursyah', 'Budiono', 'Kartini'
];

// Generate Indonesian name
const generateIndonesianName = () => {
  const firstName = indonesianFirstNames[Math.floor(Math.random() * indonesianFirstNames.length)];
  const lastName = indonesianLastNames[Math.floor(Math.random() * indonesianLastNames.length)];
  return `${firstName} ${lastName}`;
};

// Generate sample users
const generateUsers = (count = 10) => {
  const users = [];
  const roles = ['admin', 'user', 'guest', 'family'];

  for (let i = 0; i < count; i++) {
    const name = generateIndonesianName();
    const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;

    users.push({
      id: uuidv4(),
      name,
      email,
      role: roles[Math.floor(Math.random() * roles.length)],
      face_registered: Math.random() > 0.3, // 70% have face registered
      created_at: faker.date.between('2023-01-01', new Date()).toISOString(),
      phone: `+62${Math.floor(Math.random() * 900000000) + 100000000}`,
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
    });
  }

  return users;
};

// Generate access logs
const generateAccessLogs = (users, doors, count = 50) => {
  const logs = [];
  const actions = ['unlock', 'lock', 'access_denied', 'face_scan', 'manual_unlock'];
  const methods = ['face_recognition', 'mobile_app', 'physical_key', 'emergency_code'];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const door = doors[Math.floor(Math.random() * doors.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    logs.push({
      id: uuidv4(),
      user_id: user.id,
      user_name: user.name,
      door_id: door.id,
      door_name: door.name,
      location: door.location,
      action,
      timestamp: faker.date.recent(30).toISOString(), // Last 30 days
      success: action === 'access_denied' ? false : Math.random() > 0.1, // 90% success rate
      method: methods[Math.floor(Math.random() * methods.length)],
      ip_address: faker.internet.ip(),
      device_info: faker.random.arrayElement([
        'Android App v1.2.3',
        'iOS App v1.2.3',
        'Web Dashboard v2.1.0',
        'Physical Keypad'
      ])
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Generate doors
const generateDoors = (count = 5) => {
  const doors = [];
  const locations = [
    'Main Door', 'Back Door', 'Garage Door', 'Side Entrance', 'Employee Entrance',
    'Emergency Exit', 'Warehouse Door', 'Office Entrance', 'Kitchen Door', 'Storage Room Door'
  ];

  for (let i = 0; i < count; i++) {
    doors.push({
      id: uuidv4(),
      name: `Door ${i + 1}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      created_at: faker.date.between('2023-01-01', new Date()).toISOString(),
      last_update: new Date().toISOString(),
      status: Math.random() > 0.2 ? 'active' : 'inactive'
    });
  }

  return doors;
};

// Generate door status for each door
const generateDoorStatus = (doors) => {
  const doorStatuses = [];

  doors.forEach(door => {
    doorStatuses.push({
      door_id: door.id,
      door_name: door.name,
      location: door.location,
      locked: Math.random() > 0.2, // 80% chance locked
      battery_level: Math.floor(Math.random() * 100),
      last_update: new Date().toISOString(),
      camera_active: Math.random() > 0.1, // 90% chance camera active
      wifi_strength: Math.floor(Math.random() * 100),
      temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
      humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
      firmware_version: '2.1.3',
      last_maintenance: faker.date.recent(90).toISOString()
    });
  });

  return doorStatuses;
};

// Generate user-door access relationships (pivot table)
const generateUserDoorAccess = (users, doors) => {
  const userDoorAccess = [];
  const accessLevels = ['admin', 'full', 'limited', 'time_based'];

  users.forEach(user => {
    // Each user can have access to multiple doors (many-to-many)
    const doorCount = Math.floor(Math.random() * 3) + 1; // 1-3 doors per user
    const selectedDoors = [];

    for (let i = 0; i < doorCount; i++) {
      const randomDoor = doors[Math.floor(Math.random() * doors.length)];
      if (!selectedDoors.includes(randomDoor.id)) {
        selectedDoors.push(randomDoor.id);
        
        userDoorAccess.push({
          id: uuidv4(),
          user_id: user.id,
          user_name: user.name,
          door_id: randomDoor.id,
          door_name: randomDoor.name,
          location: randomDoor.location,
          access_level: accessLevels[Math.floor(Math.random() * accessLevels.length)],
          granted_at: faker.date.between('2023-01-01', new Date()).toISOString(),
          expires_at: Math.random() > 0.7 ? faker.date.future(1, new Date()) : null, // 30% have expiry
          created_at: faker.date.between('2023-01-01', new Date()).toISOString()
        });
      }
    }
  });

  return userDoorAccess;
};

// Generate notifications
const generateNotifications = (users, doors, count = 20) => {
  const notifications = [];
  const types = ['access_granted', 'access_denied', 'low_battery', 'system_update', 'maintenance_required', 'camera_offline'];
  const messages = {
    access_granted: (user, door) => `${user} berhasil membuka pintu ${door}`,
    access_denied: (user, door) => `Akses ditolak untuk ${user} di pintu ${door}`,
    low_battery: (door) => `Baterai pintu ${door} rendah (${Math.floor(Math.random() * 20)}%)`,
    system_update: (door) => `Pembaruan sistem tersedia untuk pintu ${door}`,
    maintenance_required: (door) => `Perawatan rutin diperlukan untuk pintu ${door}`,
    camera_offline: (door) => `Kamera pintu ${door} tidak terhubung`
  };

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const door = doors[Math.floor(Math.random() * doors.length)];

    notifications.push({
      id: uuidv4(),
      type,
      message: messages[type](user.name, door.name),
      read: Math.random() > 0.3, // 70% read
      created_at: faker.date.recent(7).toISOString(), // Last 7 days
      priority: faker.random.arrayElement(['low', 'medium', 'high']),
      user_id: type.includes('access') ? user.id : null,
      door_id: type.includes('access') || type === 'low_battery' || type === 'maintenance_required' || type === 'camera_offline' ? door.id : null,
      door_name: type.includes('access') || type === 'low_battery' || type === 'maintenance_required' || type === 'camera_offline' ? door.name : null
    });
  }

  return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

// Generate camera photos/captures
const generateCameraCaptures = (users, doors, count = 30) => {
  const captures = [];

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const door = doors[Math.floor(Math.random() * doors.length)];

    captures.push({
      id: uuidv4(),
      user_id: Math.random() > 0.2 ? user.id : null, // 80% have associated user
      user_name: Math.random() > 0.2 ? user.name : 'Unknown',
      door_id: door.id,
      door_name: door.name,
      timestamp: faker.date.recent(14).toISOString(), // Last 14 days
      image_url: `https://picsum.photos/640/480?random=${i}`,
      thumbnail_url: `https://picsum.photos/160/120?random=${i}`,
      event_type: faker.random.arrayElement(['motion_detected', 'face_scan', 'manual_capture', 'access_attempt']),
      confidence_score: Math.random() > 0.5 ? (Math.random() * 0.3 + 0.7) : null, // 50% have confidence score
      location: `${door.location} Camera`
    });
  }

  return captures.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Initialize and save sample data
const initializeSampleData = () => {
  console.log('🔄 Generating sample data dengan Faker.js...');

  const users = generateUsers(15);
  const doors = generateDoors(8); // Generate 8 doors
  const accessLogs = generateAccessLogs(users, doors, 100);
  const doorStatus = generateDoorStatus(doors);
  const userDoorAccess = generateUserDoorAccess(users, doors); // Generate user-door relationships
  const notifications = generateNotifications(users, doors, 25);
  const cameraCaptures = generateCameraCaptures(users, doors, 40);

  const data = {
    users,
    doors,
    accessLogs,
    doorStatus,
    userDoorAccess, // Pivot table for many-to-many relationship
    notifications,
    cameraCaptures,
    lastUpdated: new Date().toISOString()
  };

  // Save to JSON file
  const dataPath = path.join(__dirname, 'sample-data.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  console.log('✅ Sample data generated and saved to sample-data.json');
  console.log(`📊 Generated: ${users.length} users, ${doors.length} doors, ${accessLogs.length} access logs, ${userDoorAccess.length} user-door relationships, ${notifications.length} notifications, ${cameraCaptures.length} camera captures`);

  return data;
};

// Load sample data
const loadSampleData = () => {
  const dataPath = path.join(__dirname, 'sample-data.json');

  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('📂 Sample data loaded from file');
    return data;
  } else {
    console.log('📂 No existing sample data found, generating new data...');
    return initializeSampleData();
  }
};

// Export functions
module.exports = {
  generateUsers,
  generateDoors,
  generateAccessLogs,
  generateDoorStatus,
  generateUserDoorAccess,
  generateNotifications,
  generateCameraCaptures,
  generateIndonesianName,
  initializeSampleData,
  loadSampleData
};