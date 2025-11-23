# User Management API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All user management endpoints require authentication. Include the access token in the request headers:
```
Authorization: Bearer {access_token}
```

---

## User Management Endpoints

### 1. Get All Users
Get list of all users.

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Access Control:**
- **Admin**: Can see all user information
- **Regular Users**: Can see limited user information (for assignment purposes)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "google_id": "118181234567890123456",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "avatar": "https://...",
      "face_registered": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "google_id": null,
      "email": "user@example.com",
      "name": "Regular User",
      "role": "user",
      "avatar": "https://...",
      "face_registered": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

**Note:** Regular users see limited fields (id, name, email, role, avatar, created_at) while admins see all fields including google_id and updated_at.

**Error Responses:**
- **401 Unauthorized** - No token or invalid token
- **500 Internal Server Error** - Server error

---

### 2. Create User
Create a new user. Admin only.

**Endpoint:** `POST /api/users`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "avatar": "https://example.com/avatar.jpg",
  "google_id": "optional-google-id"
}
```

**Required Fields:**
- `name` (string) - User's full name
- `email` (string) - Valid email address (must be unique)

**Optional Fields:**
- `role` (string) - User role: `"user"` or `"admin"` (default: `"user"`)
- `avatar` (string) - Avatar image URL
- `google_id` (string) - Google ID if user has Google account

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "google_id": null,
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user",
    "avatar": "https://example.com/avatar.jpg",
    "face_registered": false,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "User created successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["name is required", "email is required"],
  "code": "VALIDATION_ERROR"
}
```

- **403 Forbidden** - Not Admin
```json
{
  "success": false,
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```

- **409 Conflict** - Duplicate Email
```json
{
  "success": false,
  "error": "User with this email already exists",
  "code": "DUPLICATE_EMAIL"
}
```

---

### 3. Update User
Update user information.

**Endpoint:** `PUT /api/users/:id`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**URL Parameters:**
- `id` - User ID to update

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "admin",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Access Control:**
- **Admin**: Can update any user, including role
- **Regular Users**: Can only update their own profile, cannot change role

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "google_id": null,
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "admin",
    "avatar": "https://example.com/new-avatar.jpg",
    "face_registered": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z"
  },
  "message": "User updated successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["At least one field must be provided for update"],
  "code": "VALIDATION_ERROR"
}
```

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied. You can only update your own profile",
  "code": "ACCESS_DENIED"
}
```

- **403 Forbidden** - Cannot Change Role
```json
{
  "success": false,
  "error": "Cannot change role. Admin access required",
  "code": "FORBIDDEN"
}
```

- **404 Not Found** - User Not Found
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

- **409 Conflict** - Duplicate Email
```json
{
  "success": false,
  "error": "Email already in use",
  "code": "DUPLICATE_EMAIL"
}
```

---

### 4. Delete User
Delete a user. Admin only.

**Endpoint:** `DELETE /api/users/:id`

**Headers:**
```
Authorization: Bearer {access_token}
```

**URL Parameters:**
- `id` - User ID to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Self Delete Not Allowed
```json
{
  "success": false,
  "error": "Cannot delete your own account",
  "code": "SELF_DELETE_NOT_ALLOWED"
}
```

- **403 Forbidden** - Not Admin
```json
{
  "success": false,
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```

- **404 Not Found** - User Not Found
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

**Note:** When a user is deleted, related records in `access_logs`, `notifications`, and `door_user` will be automatically deleted via CASCADE foreign key constraints.

---

### 5. Register Face
Register face recognition data for a user.

**Endpoint:** `POST /api/users/:id/face-register`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**URL Parameters:**
- `id` - User ID to register face for

**Request Body:**
```json
{
  "face_data": "base64_encoded_face_data_or_face_embedding_string"
}
```

**Access Control:**
- **Admin**: Can register face for any user
- **Regular Users**: Can only register face for themselves

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "user@example.com",
    "name": "User Name",
    "face_registered": true,
    "updated_at": "2024-01-01T12:10:00.000Z"
  },
  "message": "Face data registered successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "face_data is required",
  "code": "VALIDATION_ERROR"
}
```

- **403 Forbidden** - Access Denied
```json
{
  "success": false,
  "error": "Access denied. You can only register face for your own account",
  "code": "ACCESS_DENIED"
}
```

- **404 Not Found** - User Not Found
```json
{
  "success": false,
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

**Note:** `face_data` is stored as TEXT in the database. It can be:
- Base64 encoded image
- Face embedding vector (JSON string)
- Face recognition model output string
- Any other format your face recognition system uses

---

## Access Control Summary

| Endpoint | Admin | Regular User |
|----------|-------|--------------|
| GET /api/users | ✅ See all info | ✅ See limited info |
| POST /api/users | ✅ Create user | ❌ Forbidden |
| PUT /api/users/:id | ✅ Update anyone, can change role | ✅ Update self only, cannot change role |
| DELETE /api/users/:id | ✅ Delete anyone (except self) | ❌ Forbidden |
| POST /api/users/:id/face-register | ✅ Register for anyone | ✅ Register for self only |

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `FORBIDDEN` | Admin access required |
| `ACCESS_DENIED` | Insufficient permissions |
| `USER_NOT_FOUND` | User does not exist |
| `DUPLICATE_EMAIL` | Email already in use |
| `SELF_DELETE_NOT_ALLOWED` | Cannot delete own account |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid access token |
| `NO_TOKEN` | No authentication token provided |

---

## Notes

1. All user management actions are logged in the `access_logs` table
2. User deletion cascades to related records (access_logs, notifications, door_user)
3. Email must be unique across all users
4. Role can only be changed by admin users
5. Face data is stored as TEXT and can accommodate various formats (base64, embeddings, etc.)
6. Regular users cannot see sensitive information like `google_id` in user lists

