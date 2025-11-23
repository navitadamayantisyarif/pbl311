# Door Control API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All door endpoints require authentication. Include the access token in the request headers:
```
Authorization: Bearer {access_token}
```

---

## Door Control Endpoints

### 1. Get Door Status
Get all doors accessible by the authenticated user.

**Endpoint:** `GET /api/door/status`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Pintu Ruang Server",
      "location": "Gedung Informatika Lantai 3 Ruang 305",
      "locked": true,
      "battery_level": 83,
      "last_update": "2024-01-01T12:00:00.000Z",
      "wifi_strength": "Excellent",
      "camera_active": false,
      "access_granted_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "message": "User accessible doors retrieved successfully"
}
```

**Empty Response (200):**
```json
{
  "success": true,
  "data": [],
  "message": "No doors accessible for this user"
}
```

**Error Responses:**
- **401 Unauthorized** - No token or invalid token
- **500 Internal Server Error** - Server error

---

### 2. Control Door
Lock or unlock a door.

**Endpoint:** `POST /api/door/control`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "door_id": 1,
  "action": "buka"
}
```

**Valid Actions:**
- `"buka"` - Unlock/open door
- `"kunci"` - Lock door
- `"unlock"` - Unlock/open door (English)
- `"lock"` - Lock door (English)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "door_id": 1,
    "action": "buka",
    "success": true,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "message": "Door opened successfully",
    "door_status": {
      "locked": false,
      "last_update": "2024-01-01T12:00:00.000Z"
    }
  },
  "message": "Door opened successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["door_id is required", "action is required"],
  "code": "VALIDATION_ERROR"
}
```

- **400 Bad Request** - Invalid Action
```json
{
  "success": false,
  "error": "Invalid action. Must be buka, kunci, lock, or unlock",
  "code": "INVALID_ACTION"
}
```

- **400 Bad Request** - Door Offline
```json
{
  "success": false,
  "error": "Door is offline (battery depleted)",
  "code": "DOOR_OFFLINE"
}
```

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied to this door",
  "code": "ACCESS_DENIED"
}
```

- **404 Not Found** - Door Not Found
```json
{
  "success": false,
  "error": "Door not found",
  "code": "DOOR_NOT_FOUND"
}
```

---

### 3. Update Door Settings
Update door configuration/settings. Requires admin role or door access.

**Endpoint:** `PUT /api/door/settings`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "door_id": 1,
  "name": "Pintu Ruang Server Updated",
  "location": "Gedung Informatika Lantai 3 Ruang 306",
  "camera_active": true,
  "wifi_strength": "Good"
}
```

**Request Fields:**
- `door_id` (required) - ID of the door to update
- `name` (optional) - Door name
- `location` (optional) - Door location
- `camera_active` (optional) - Camera active status (boolean)
- `wifi_strength` (optional) - WiFi strength: `"Excellent"`, `"Good"`, `"Fair"`, `"Weak"`, `"No Signal"`

**Note:** At least one field (name, location, camera_active, wifi_strength) must be provided.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pintu Ruang Server Updated",
    "location": "Gedung Informatika Lantai 3 Ruang 306",
    "locked": true,
    "battery_level": 83,
    "last_update": "2024-01-01T12:00:00.000Z",
    "wifi_strength": "Good",
    "camera_active": true,
    "updated_at": "2024-01-01T12:05:00.000Z"
  },
  "message": "Door settings updated successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "door_id is required",
    "At least one field to update must be provided (name, location, camera_active, wifi_strength)"
  ],
  "code": "VALIDATION_ERROR"
}
```

- **400 Bad Request** - Invalid WiFi Strength
```json
{
  "success": false,
  "error": "Invalid wifi_strength. Must be one of: Excellent, Good, Fair, Weak, No Signal",
  "code": "INVALID_WIFI_STRENGTH"
}
```

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied. Admin role or door access required",
  "code": "ACCESS_DENIED"
}
```

- **404 Not Found** - Door Not Found
```json
{
  "success": false,
  "error": "Door not found",
  "code": "DOOR_NOT_FOUND"
}
```

---

## Access Control

### Door Access
- Users can only access doors that are associated with them in the `door_user` junction table
- Admin users have access to all doors
- Door access is checked before allowing door control and settings updates

### Permissions
- **Regular Users**: Can view and control doors they have access to
- **Admin Users**: Can view and control all doors, and update all door settings

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `INVALID_ACTION` | Invalid door action |
| `INVALID_WIFI_STRENGTH` | Invalid WiFi strength value |
| `DOOR_NOT_FOUND` | Door does not exist |
| `DOOR_OFFLINE` | Door is offline (battery depleted) |
| `ACCESS_DENIED` | User does not have access to this door |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid access token |
| `NO_TOKEN` | No authentication token provided |

---

## Notes

1. All door control actions are logged in the `access_logs` table
2. Door status includes `last_update` timestamp which is updated when door is controlled
3. Door settings can only be updated by admin users or users with door access
4. Battery level 0 means door is offline and cannot be controlled
5. WiFi strength must be one of the enum values: `Excellent`, `Good`, `Fair`, `Weak`, `No Signal`

