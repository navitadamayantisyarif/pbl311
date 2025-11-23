# API Documentation - Authentication Endpoints

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### 1. Google Sign-In
Authenticate user using Google OAuth.

**Catatan:** 
- OAuth verification dilakukan di aplikasi (Android/Web), bukan di backend
- Backend hanya menerima data yang sudah di-authenticate dan menyimpannya ke database
- Backend akan generate `google_id` dari `id_token` dan menyimpan user data
- Jika user sudah ada (berdasarkan email atau google_id), data akan di-update
- Jika user baru, akan dibuat user baru dengan role default 'user'

**Endpoint:** `POST /api/auth/google`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "id_token": "string (required) - Google ID token dari aplikasi",
  "email": "string (required) - Email user dari Google account",
  "name": "string (optional) - Nama user",
  "picture": "string (optional) - URL foto profil user"
}
```

**Success Response (200/201):**
- **200 OK**: User sudah ada, data di-update
- **201 Created**: User baru dibuat

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "google_id": "118181234567890123456",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "avatar": "https://...",
    "face_data": false,
    "face_registered": false,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "expires_in": 900
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["id_token is required", "email is required"],
  "code": "VALIDATION_ERROR"
}
```

- **429 Too Many Requests** - Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Too many authentication attempts, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 450
}
```

---

### 2. Refresh Token
Refresh access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refresh_token": "string (required)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 900
    }
  },
  "message": "Token refreshed successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Validation Error
```json
{
  "success": false,
  "error": "refresh_token is required",
  "code": "VALIDATION_ERROR"
}
```

- **401 Unauthorized** - Invalid/Expired Token
```json
{
  "success": false,
  "error": "Refresh token expired",
  "code": "TOKEN_EXPIRED"
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

---

### 3. Logout
Logout user (client should delete tokens).

**Endpoint:** `POST /api/auth/logout`

**Request Headers:**
```
Authorization: Bearer {access_token} (optional)
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note:** This endpoint logs the logout action. The client application should delete the stored tokens locally.

---

## Using the Access Token

After authentication, include the access token in subsequent requests:

```
Authorization: Bearer {access_token}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/protected-endpoint \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests in time window |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INVALID_TOKEN` | JWT token is invalid |
| `INVALID_GOOGLE_TOKEN` | Google ID token is invalid |
| `USER_NOT_FOUND` | User does not exist |
| `AUTH_ERROR` | Authentication error |
| `NO_TOKEN` | No authentication token provided |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Endpoint not found |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Internal server error |

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General endpoints**: 100 requests per 15 minutes per IP

Rate limit headers:
- `Retry-After`: Number of seconds to wait before retrying

---

## Token Expiration

- **Access Token**: 15 minutes (configurable via `JWT_ACCESS_EXPIRES_IN`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

When access token expires, use the refresh token endpoint to get a new token pair.

---

## Security Notes

1. Always use HTTPS in production
2. Store refresh tokens securely (httpOnly cookies recommended)
3. Implement token rotation for refresh tokens
4. Monitor access logs for suspicious activity
5. Keep JWT secrets secure and rotate them regularly

