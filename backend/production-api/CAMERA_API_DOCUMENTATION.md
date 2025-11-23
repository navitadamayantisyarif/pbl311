# Camera API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All camera endpoints require authentication. Include the access token in the request headers:
```
Authorization: Bearer {access_token}
```

---

## Camera Endpoints

### 1. Get Camera Stream
Get camera stream URL for a specific door.

**Endpoint:** `GET /api/camera/stream`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `door_id` (required) - ID of the door

**Example:**
```
GET /api/camera/stream?door_id=1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "door_id": 1,
    "stream_url": "rtsp://camera-server.example.com/stream/1",
    "status": "active",
    "resolution": "1920x1080",
    "fps": 30,
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "message": "Camera stream retrieved successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing Door ID
```json
{
  "success": false,
  "error": "Door ID is required",
  "code": "MISSING_DOOR_ID"
}
```

- **400 Bad Request** - Camera Inactive
```json
{
  "success": false,
  "error": "Camera is not active for this door",
  "code": "CAMERA_INACTIVE"
}
```

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied to this door camera",
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

### 2. Capture Photo
Capture a photo from door camera and save to database.

**Endpoint:** `POST /api/camera/capture`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "door_id": 1,
  "trigger_type": "manual"
}
```

**Request Fields:**
- `door_id` (required) - ID of the door
- `trigger_type` (optional) - Type of trigger: `"manual"`, `"automatic"`, `"face_scan"`, `"motion_detection"`, etc. (default: `"manual"`)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "door_id": 1,
    "trigger_type": "manual",
    "image_url": "https://camera-storage.example.com/images/capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
    "thumbnail_url": "https://camera-storage.example.com/thumbnails/capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "confidence_score": 0.85,
    "location": "Gedung Informatika Lantai 3 Ruang 305",
    "filename": "capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
    "file_size": 250000
  },
  "message": "Photo captured successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error or Camera Inactive
- **403 Forbidden** - Access Denied
- **404 Not Found** - Door Not Found

---

### 3. Get Camera Recordings
Get list of camera recordings/captures.

**Endpoint:** `GET /api/camera/recordings`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `door_id` (optional) - Filter by door ID
- `event_type` (optional) - Filter by event type (manual, automatic, face_scan, etc.)
- `start_date` (optional) - Filter from date (ISO 8601 format)
- `end_date` (optional) - Filter until date (ISO 8601 format)
- `limit` (optional) - Number of records per page (default: 20)
- `offset` (optional) - Offset for pagination (default: 0)

**Examples:**
```
GET /api/camera/recordings
GET /api/camera/recordings?door_id=1
GET /api/camera/recordings?door_id=1&event_type=face_scan&limit=10
GET /api/camera/recordings?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "door_id": 1,
      "filename": "capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "event_type": "manual",
      "file_size": 250000,
      "image_url": "https://camera-storage.example.com/images/capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
      "thumbnail_url": "https://camera-storage.example.com/thumbnails/capture_door_1_2024-01-01T12-00-00-000Z_1234567890.jpg",
      "door": {
        "id": 1,
        "name": "Pintu Ruang Server",
        "location": "Gedung Informatika Lantai 3 Ruang 305"
      }
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  },
  "message": "Camera recordings retrieved successfully"
}
```

**Access Control:**
- **Admin**: Can see all recordings
- **Regular Users**: Can only see recordings from doors they have access to
- If `door_id` is not specified, user will see recordings from all accessible doors

**Error Responses:**

- **403 Forbidden** - Access Denied (if trying to access recordings from door without access)

---

### 4. Delete Camera Recording
Delete a camera recording.

**Endpoint:** `DELETE /api/camera/recordings/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**URL Parameters:**
- `id` - Recording ID to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "Camera recording deleted successfully"
}
```

**Error Responses:**

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied to delete this recording",
  "code": "ACCESS_DENIED"
}
```

- **404 Not Found** - Recording Not Found
```json
{
  "success": false,
  "error": "Camera recording not found",
  "code": "RECORDING_NOT_FOUND"
}
```

**Access Control:**
- **Admin**: Can delete any recording
- **Regular Users**: Can only delete recordings from doors they have access to

**Note:** In production, this should also delete the actual image file from storage (S3, local storage, etc.)

---

## Access Control Summary

| Endpoint | Admin | Regular User |
|----------|-------|--------------|
| GET /api/camera/stream | ✅ All doors | ✅ Accessible doors only |
| POST /api/camera/capture | ✅ All doors | ✅ Accessible doors only |
| GET /api/camera/recordings | ✅ All recordings | ✅ From accessible doors only |
| DELETE /api/camera/recordings/:id | ✅ Any recording | ✅ From accessible doors only |

---

## Environment Variables

For production deployment, configure these environment variables:

```env
# Camera stream base URL (RTSP server)
CAMERA_STREAM_BASE_URL=rtsp://camera-server.example.com

# Image storage base URL (for serving captured images)
IMAGE_BASE_URL=https://camera-storage.example.com
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_DOOR_ID` | Door ID is required |
| `INVALID_DOOR_ID` | Invalid door ID format |
| `VALIDATION_ERROR` | Request validation failed |
| `DOOR_NOT_FOUND` | Door does not exist |
| `CAMERA_INACTIVE` | Camera is not active for this door |
| `ACCESS_DENIED` | User does not have access to this door |
| `RECORDING_NOT_FOUND` | Camera recording does not exist |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid access token |

---

## Notes

1. All camera operations are logged in the `access_logs` table
2. Camera stream URLs use RTSP protocol (can be configured via environment variables)
3. Captured images are stored with timestamps in filename for easy organization
4. File deletion should also remove actual image files from storage
5. Camera must be active (`camera_active = true`) for stream and capture operations
6. Recordings are ordered by timestamp (newest first)
7. Pagination is supported for recordings list
8. Image URLs are generated based on `IMAGE_BASE_URL` environment variable

