# Smart Door Lock Mock API Documentation

## Overview
Mock API untuk testing aplikasi Smart Door Lock dengan data sample Indonesia yang realistis.

## Technology Stack
- **Node.js + Express** - Server framework
- **Faker.js** - Generate sample data realistis
- **Socket.IO** - Real-time simulation
- **UUID** - Unique ID generation
- **JWT** - Authentication tokens
- **CORS** - Android testing support
- **JSON File Storage** - No database needed

## Server Info
- **Port**: 3000
- **Base URL**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/api/health`
- **Socket.IO**: Real-time updates enabled

## Features
- ✅ Realistic Indonesian names and data
- ✅ JWT Authentication
- ✅ Real-time Socket.IO updates
- ✅ Realistic delays (100-500ms)
- ✅ Error simulation (5% random errors)
- ✅ JSON file storage
- ✅ CORS enabled for Android
- ✅ Complete logging

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Door Control
- `GET /api/door/status` - Get current door status
- `POST /api/door/control` - Control door lock/unlock
- `GET /api/door/logs` - Get recent door access logs
- `POST /api/door/emergency-unlock` - Emergency unlock

### User Management
- `GET /api/users` - Get all users (admin/family only)
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)
- `POST /api/users/:id/register-face` - Register face for user

### Camera
- `GET /api/camera/stream` - Get camera stream URL
- `POST /api/camera/capture` - Capture photo from camera
- `GET /api/camera/captures` - Get captured photos
- `GET /api/camera/captures/:id` - Get specific capture
- `DELETE /api/camera/captures/:id` - Delete capture (admin only)
- `GET /api/camera/status` - Get camera system status

### History
- `GET /api/history/access` - Get access history logs
- `GET /api/history/photos` - Get photo capture history
- `GET /api/history/summary` - Get summary statistics
- `GET /api/history/timeline` - Get timeline view of events

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/:id` - Get specific notification
- `POST /api/notifications/mark-read` - Mark notifications as read
- `POST /api/notifications/mark-unread` - Mark notifications as unread
- `DELETE /api/notifications/:id` - Delete notification (admin only)
- `POST /api/notifications` - Create notification (admin only)
- `GET /api/notifications/unread/count` - Get unread count
- `DELETE /api/notifications/clear-all` - Clear all notifications (admin only)

## Sample Data Structure

### User
```json
{
  "id": "uuid",
  "name": "Zahra Kurniawan",
  "email": "zahra.kurniawan@example.com",
  "role": "admin|user|guest|family",
  "face_registered": true,
  "created_at": "2023-07-22T23:39:03.910Z",
  "phone": "+62404754121",
  "avatar": "https://randomuser.me/api/portraits/women/17.jpg"
}
```

### Access Log
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "user_name": "Ahmad Pratama",
  "action": "unlock|lock|access_denied|face_scan|manual_unlock",
  "timestamp": "2025-09-27T14:30:00.000Z",
  "success": true,
  "method": "face_recognition|mobile_app|physical_key|emergency_code",
  "location": "Main Door",
  "ip_address": "192.168.1.100",
  "device_info": "Android App v1.2.3"
}
```

### Door Status
```json
{
  "locked": false,
  "battery_level": 85,
  "last_update": "2025-09-27T14:30:00.000Z",
  "camera_active": true,
  "wifi_strength": 78,
  "temperature": 28,
  "humidity": 65,
  "firmware_version": "2.1.3",
  "last_maintenance": "2025-09-15T16:36:13.315Z"
}
```

### Notification
```json
{
  "id": "uuid",
  "type": "access_granted|access_denied|low_battery|system_update",
  "message": "Ahmad Pratama berhasil membuka pintu",
  "read": false,
  "created_at": "2025-09-27T14:30:00.000Z",
  "priority": "low|medium|high",
  "user_id": "uuid"
}
```

## Authentication

Semua endpoint (kecuali auth dan health) memerlukan JWT token:

```bash
# Login dulu
curl -X POST http://localhost:3000/api/auth/google \\
  -H "Content-Type: application/json" \\
  -d '{"id_token": "test_token", "email": "admin@test.com", "name": "Admin User"}'

# Gunakan token untuk request
curl -X GET http://localhost:3000/api/door/status \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Real-time Updates (Socket.IO)

Server mengirim update real-time untuk:
- Door status changes setiap 30 detik
- Access logs saat pintu dibuka/ditutup
- Notifications untuk events penting

```javascript
const socket = io('http://localhost:3000');
socket.on('door-status', (data) => {
  console.log('Door status updated:', data);
});
```

## Error Handling

API secara random generate error (5%) untuk testing:
- 500: Database connection timeout
- 503: Service temporarily unavailable
- 429: Rate limit exceeded

## Indonesian Data

Sample data menggunakan nama dan data Indonesia yang realistis:
- Nama: Ahmad, Sari, Dewi, Budi, Kartika, dll
- Nomor telepon: format +62
- Pesan notifikasi dalam Bahasa Indonesia

## Getting Started

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with nodemon (development)
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## File Structure
```
mock-api/
├── server.js              # Main server file
├── middleware/
│   └── common.js          # Authentication & middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── door.js           # Door control routes
│   ├── users.js          # User management routes
│   ├── camera.js         # Camera routes
│   ├── history.js        # History routes
│   └── notifications.js  # Notification routes
├── data/
│   ├── sampleData.js     # Data generators with Faker.js
│   └── sample-data.json  # Generated sample data
└── package.json          # Dependencies
```

## Development Notes
- Server automatically generates Indonesian sample data on first run
- Data disimpan dalam `data/sample-data.json`
- Realistic delays ditambahkan ke semua request (100-500ms)
- Error simulation untuk testing edge cases
- Full request/response logging
- CORS enabled untuk Android testing