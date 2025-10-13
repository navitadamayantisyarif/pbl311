# Smart Door Lock Mock API - Complete Endpoints

## 🔐 Authentication Endpoints

### POST /api/auth/google
**Google Authentication**
```json
// Request
{
  "token": "google_oauth_token",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://profile-picture-url.com"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "google_123456789",
      "email": "user@example.com",
      "name": "User Name",
      "picture": "https://profile-picture-url.com",
      "provider": "google"
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  },
  "message": "Authentication successful"
}
```

### POST /api/auth/logout
**Logout User**
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/auth/me
**Get Current User Profile**
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "face_registered": true,
    "created_at": "2025-01-09T10:00:00.000Z",
    "phone": "+6281234567890",
    "avatar": "https://via.placeholder.com/150"
  }
}
```

## 🚪 Door Control Endpoints

### GET /api/door/status
**Get Door Status**
```json
// Request Headers
Authorization: Bearer jwt_token_here

// Response
{
  "success": true,
  "data": [
    {
      "door_id": "door_123",
      "door_name": "Door 1",
      "location": "Main Door",
      "locked": true,
      "battery_level": 85,
      "last_update": "2025-01-09T10:00:00.000Z",
      "camera_active": true,
      "wifi_strength": 75,
      "temperature": 28,
      "humidity": 65,
      "firmware_version": "2.1.3",
      "last_maintenance": "2025-01-01T10:00:00.000Z"
    }
  ],
  "message": "Door status retrieved successfully"
}
```

### POST /api/door/control
**Control Door (Lock/Unlock)**
```json
// Request
{
  "door_id": "door_123",
  "action": "unlock" // or "lock"
}

// Response
{
  "success": true,
  "data": {
    "door_id": "door_123",
    "action": "unlock",
    "success": true,
    "timestamp": "2025-01-09T10:00:00.000Z",
    "message": "Door unlocked successfully"
  },
  "message": "Door unlocked successfully"
}
```

### GET /api/door/user-access
**Get Doors Accessible by User**
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "access_123",
      "user_id": "user_123",
      "user_name": "User Name",
      "door_id": "door_123",
      "door_name": "Door 1",
      "location": "Main Door",
      "access_level": "full",
      "granted_at": "2025-01-01T10:00:00.000Z",
      "expires_at": null,
      "created_at": "2025-01-01T10:00:00.000Z"
    }
  ],
  "message": "User door access retrieved successfully"
}
```

### GET /api/door/logs
**Get Door Access Logs**
```json
// Query Parameters
?limit=50&offset=0&door_id=door_123&user_id=user_123

// Response
{
  "success": true,
  "data": [
    {
      "id": "log_123",
      "user_id": "user_123",
      "user_name": "User Name",
      "door_id": "door_123",
      "door_name": "Door 1",
      "location": "Main Door",
      "action": "unlock",
      "timestamp": "2025-01-09T10:00:00.000Z",
      "success": true,
      "method": "face_recognition",
      "ip_address": "192.168.1.100",
      "device_info": "Android App v1.2.3"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "has_more": true
  },
  "message": "Door logs retrieved successfully"
}
```

### POST /api/door/emergency-unlock
**Emergency Unlock**
```json
// Request
{
  "door_id": "door_123"
}

// Response
{
  "success": true,
  "data": {
    "door_id": "door_123",
    "action": "emergency_unlock",
    "success": true,
    "timestamp": "2025-01-09T10:00:00.000Z",
    "message": "Emergency unlock activated successfully"
  },
  "message": "Emergency unlock activated successfully"
}
```

## 👥 User Management Endpoints

### GET /api/users
**Get All Users**
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "face_registered": true,
      "created_at": "2025-01-01T10:00:00.000Z",
      "phone": "+6281234567890",
      "avatar": "https://randomuser.me/api/portraits/men/1.jpg"
    }
  ],
  "message": "Users retrieved successfully"
}
```

### POST /api/users
**Create New User**
```json
// Request
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "phone": "+6281234567890"
}

// Response
{
  "success": true,
  "data": {
    "id": "user_456",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user",
    "face_registered": false,
    "created_at": "2025-01-09T10:00:00.000Z",
    "phone": "+6281234567890",
    "avatar": "https://randomuser.me/api/portraits/women/1.jpg"
  },
  "message": "User created successfully"
}
```

### GET /api/users/:id
**Get User by ID**
```json
// Response
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "face_registered": true,
    "created_at": "2025-01-01T10:00:00.000Z",
    "phone": "+6281234567890",
    "avatar": "https://randomuser.me/api/portraits/men/1.jpg"
  },
  "message": "User retrieved successfully"
}
```

### PUT /api/users/:id
**Update User**
```json
// Request
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "phone": "+6281234567890"
}

// Response
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "face_registered": true,
    "created_at": "2025-01-01T10:00:00.000Z",
    "phone": "+6281234567890",
    "avatar": "https://via.placeholder.com/150"
  },
  "message": "User updated successfully"
}
```

### DELETE /api/users/:id
**Delete User**
```json
// Response
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 📷 Camera Endpoints

### GET /api/camera/stream
**Get Camera Stream URL**
```json
// Query Parameters
?door_id=door_123

// Response
{
  "success": true,
  "data": {
    "door_id": "door_123",
    "stream_url": "rtsp://mock-camera-server.com/stream/door_123",
    "status": "active",
    "resolution": "1920x1080",
    "fps": 30,
    "timestamp": "2025-01-09T10:00:00.000Z"
  },
  "message": "Camera stream retrieved successfully"
}
```

### POST /api/camera/capture
**Capture Photo**
```json
// Request
{
  "door_id": "door_123",
  "trigger_type": "manual" // or "motion", "face_scan"
}

// Response
{
  "success": true,
  "data": {
    "id": "capture_123456789",
    "door_id": "door_123",
    "trigger_type": "manual",
    "image_url": "https://picsum.photos/640/480?random=123456789",
    "thumbnail_url": "https://picsum.photos/160/120?random=123456789",
    "timestamp": "2025-01-09T10:00:00.000Z",
    "confidence_score": 0.95,
    "location": "Door door_123 Camera"
  },
  "message": "Photo captured successfully"
}
```

### GET /api/camera/photos
**Get Camera Photos**
```json
// Query Parameters
?door_id=door_123&limit=20&offset=0

// Response
{
  "success": true,
  "data": [
    {
      "id": "capture_123",
      "user_id": "user_123",
      "user_name": "User Name",
      "door_id": "door_123",
      "door_name": "Door 1",
      "timestamp": "2025-01-09T10:00:00.000Z",
      "image_url": "https://picsum.photos/640/480?random=123",
      "thumbnail_url": "https://picsum.photos/160/120?random=123",
      "event_type": "face_scan",
      "confidence_score": 0.95,
      "location": "Main Door Camera"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "message": "Camera photos retrieved successfully"
}
```

### GET /api/camera/status
**Get Camera Status**
```json
// Query Parameters
?door_id=door_123

// Response
{
  "success": true,
  "data": [
    {
      "door_id": "door_123",
      "door_name": "Door 1",
      "location": "Main Door",
      "camera_active": true,
      "last_update": "2025-01-09T10:00:00.000Z"
    }
  ],
  "message": "Camera status retrieved successfully"
}
```

## 📊 History Endpoints

### GET /api/history/access
**Get Access History**
```json
// Query Parameters
?limit=50&offset=0&door_id=door_123&user_id=user_123&start_date=2025-01-01&end_date=2025-01-09&success=true

// Response
{
  "success": true,
  "data": [
    {
      "id": "log_123",
      "user_id": "user_123",
      "user_name": "User Name",
      "door_id": "door_123",
      "door_name": "Door 1",
      "location": "Main Door",
      "action": "unlock",
      "timestamp": "2025-01-09T10:00:00.000Z",
      "success": true,
      "method": "face_recognition",
      "ip_address": "192.168.1.100",
      "device_info": "Android App v1.2.3"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "has_more": true
  },
  "message": "Access history retrieved successfully"
}
```

### GET /api/history/photos
**Get Photo History**
```json
// Query Parameters
?limit=20&offset=0&door_id=door_123&user_id=user_123&event_type=face_scan

// Response
{
  "success": true,
  "data": [
    {
      "id": "capture_123",
      "user_id": "user_123",
      "user_name": "User Name",
      "door_id": "door_123",
      "door_name": "Door 1",
      "timestamp": "2025-01-09T10:00:00.000Z",
      "image_url": "https://picsum.photos/640/480?random=123",
      "thumbnail_url": "https://picsum.photos/160/120?random=123",
      "event_type": "face_scan",
      "confidence_score": 0.95,
      "location": "Main Door Camera"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "message": "Photo history retrieved successfully"
}
```

### GET /api/history/summary
**Get History Summary (for Analytics)**
```json
// Query Parameters
?period=7d // 24h, 7d, 30d, 90d

// Response
{
  "success": true,
  "data": {
    "total_access": 100,
    "successful_access": 95,
    "failed_access": 5,
    "total_photos": 50,
    "unique_users": 10,
    "unique_doors": 5,
    "period": "7d",
    "date_range": {
      "from": "2025-01-02T10:00:00.000Z",
      "to": "2025-01-09T10:00:00.000Z"
    }
  },
  "message": "History summary retrieved successfully"
}
```

## 🔔 Notifications Endpoints

### GET /api/notifications
**Get Notifications**
```json
// Query Parameters
?limit=20&offset=0&read=false&priority=high&type=access_denied&user_id=user_123

// Response
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "type": "access_denied",
      "message": "Akses ditolak untuk User Name di pintu Door 1",
      "read": false,
      "created_at": "2025-01-09T10:00:00.000Z",
      "priority": "high",
      "user_id": "user_123",
      "door_id": "door_123",
      "door_name": "Door 1"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "message": "Notifications retrieved successfully"
}
```

### POST /api/notifications/mark-read
**Mark Notifications as Read**
```json
// Request
{
  "notification_ids": ["notif_123", "notif_456"]
}

// Response
{
  "success": true,
  "data": {
    "marked_count": 2,
    "notification_ids": ["notif_123", "notif_456"],
    "timestamp": "2025-01-09T10:00:00.000Z"
  },
  "message": "Notifications marked as read successfully"
}
```

### POST /api/notifications/mark-all-read
**Mark All Notifications as Read**
```json
// Request
{
  "user_id": "user_123"
}

// Response
{
  "success": true,
  "data": {
    "marked_count": 5,
    "user_id": "user_123",
    "timestamp": "2025-01-09T10:00:00.000Z"
  },
  "message": "All notifications marked as read successfully"
}
```

### GET /api/notifications/unread-count
**Get Unread Notifications Count**
```json
// Query Parameters
?user_id=user_123

// Response
{
  "success": true,
  "data": {
    "unread_count": 3,
    "user_id": "user_123"
  },
  "message": "Unread count retrieved successfully"
}
```

### POST /api/notifications
**Create New Notification**
```json
// Request
{
  "type": "system_update",
  "message": "Pembaruan sistem tersedia",
  "priority": "medium",
  "user_id": "user_123",
  "door_id": "door_123"
}

// Response
{
  "success": true,
  "data": {
    "id": "notif_789",
    "type": "system_update",
    "message": "Pembaruan sistem tersedia",
    "priority": "medium",
    "user_id": "user_123",
    "door_id": "door_123",
    "door_name": "Door 1",
    "read": false,
    "created_at": "2025-01-09T10:00:00.000Z"
  },
  "message": "Notification created successfully"
}
```

## 📈 Analytics Endpoints

### GET /api/analytics/summary
**Get Analytics Summary**
```json
// Query Parameters
?period=7d // 24h, 7d, 30d, 90d

// Response
{
  "success": true,
  "data": {
    "summary": {
      "totalAccess": 100,
      "accessDenied": 5,
      "accessAccepted": 95,
      "doorsOpened": 80,
      "doorsClosed": 15,
      "totalAccessChange": "+12%",
      "accessDeniedChange": "-5%",
      "accessAcceptedChange": "+15%",
      "doorsOpenedChange": "+10%",
      "doorsClosedChange": "+5%"
    },
    "doorMetrics": [
      {
        "doorId": "door_123",
        "doorName": "Door 1",
        "location": "Main Door",
        "totalAccess": 25,
        "accessAccepted": 24,
        "accessDenied": 1,
        "doorOpened": 20,
        "doorClosed": 4
      }
    ],
    "dailyActivity": [
      { "timeLabel": "12AM", "value": 2 },
      { "timeLabel": "4AM", "value": 1 },
      { "timeLabel": "8AM", "value": 8 },
      { "timeLabel": "12PM", "value": 12 },
      { "timeLabel": "4PM", "value": 15 },
      { "timeLabel": "8PM", "value": 7 }
    ],
    "weeklyActivity": [
      { "timeLabel": "Sen", "value": 15 },
      { "timeLabel": "Sel", "value": 12 },
      { "timeLabel": "Rab", "value": 18 },
      { "timeLabel": "Kam", "value": 14 },
      { "timeLabel": "Jum", "value": 16 },
      { "timeLabel": "Sab", "value": 8 },
      { "timeLabel": "Min", "value": 6 }
    ],
    "monthlyActivity": [
      { "timeLabel": "Minggu 1", "value": 25 },
      { "timeLabel": "Minggu 2", "value": 30 },
      { "timeLabel": "Minggu 3", "value": 28 },
      { "timeLabel": "Minggu 4", "value": 32 }
    ],
    "activeHours": [
      { "timeRange": "16:00 - 18:00", "count": 15 },
      { "timeRange": "12:00 - 14:00", "count": 12 },
      { "timeRange": "08:00 - 10:00", "count": 8 }
    ]
  },
  "period": "7d",
  "date_range": {
    "from": "2025-01-02T10:00:00.000Z",
    "to": "2025-01-09T10:00:00.000Z"
  }
}
```

## 🔧 Health Check

### GET /api/health
**Health Check**
```json
// Response
{
  "status": "OK",
  "timestamp": "2025-01-09T10:00:00.000Z",
  "service": "Smart Door Lock Mock API",
  "version": "1.0.0"
}
```

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   cd backend/mock-api
   npm install
   ```

2. **Start Server:**
   ```bash
   npm start
   ```

3. **Test Endpoints:**
   ```bash
   # Health check
   curl http://localhost:3000/api/health
   
   # Get door status
   curl -H "Authorization: Bearer mock-token" http://localhost:3000/api/door/status
   
   # Get analytics
   curl http://localhost:3000/api/analytics/summary?period=7d
   ```

## 📝 Notes

- All endpoints require authentication except `/api/health` and `/api/analytics/summary`
- Use `Bearer mock-token` for testing authentication
- All data is generated from `sample-data.json` using Faker.js
- Real-time updates available via Socket.IO
- Random error simulation enabled for testing error handling
