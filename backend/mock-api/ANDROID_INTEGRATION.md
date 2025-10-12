# Android Integration dengan Mock API

## Overview
Aplikasi Android sudah diintegrasikan dengan mock API untuk testing autentikasi Google Sign-In.

## Setup yang Sudah Dilakukan

### 1. Network Configuration
- **Base URL**: `http://10.0.2.2:3000/api/` (Android emulator)
- **Endpoint**: Mock API server berjalan di port 3000
- **CORS**: Enabled untuk Android testing

### 2. API Endpoints yang Digunakan
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### 3. DTO Classes
- `GoogleAuthRequest` - Request untuk Google auth
- `GoogleAuthResponse` - Response dari Google auth
- `UserDto` - User data dari API
- `RefreshTokenRequest/Response` - Token refresh

### 4. Repository Implementation
- `AuthRepositoryImpl` sudah diupdate untuk menggunakan mock API
- Fallback ke local database jika API gagal
- Token management (access token + refresh token)

## Cara Testing

### 1. Start Mock API Server
```bash
cd backend/mock-api
npm install
npm start
```

Server akan berjalan di `http://localhost:3000`

### 2. Test di Android Emulator
1. Pastikan Android emulator berjalan
2. Jalankan aplikasi Android
3. Klik tombol "Continue with Google"
4. Pilih akun Google untuk testing
5. Aplikasi akan:
   - Mengirim data Google ke mock API
   - Menerima response dengan user data dan tokens
   - Menyimpan data ke local database
   - Navigate ke home screen

### 3. Verifikasi
- Check log di mock API server untuk melihat request
- Check local database Android untuk user data
- Check SharedPreferences untuk tokens

## Mock API Response Format

### Google Auth Response
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "google_xxxxx",
      "name": "Test User",
      "email": "test@gmail.com",
      "role": "user",
      "face_registered": false,
      "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
      "created_at": "2025-10-09T04:24:19.000Z"
    },
    "tokens": {
      "access_token": "jwt_token_here",
      "refresh_token": "refresh_token_here",
      "token_type": "Bearer",
      "expires_in": 86400
    }
  }
}
```

### User Profile Response
```json
{
  "success": true,
  "data": {
    "id": "google_xxxxx",
    "name": "Test User",
    "email": "test@gmail.com",
    "role": "user",
    "face_registered": false,
    "avatar": "https://randomuser.me/api/portraits/men/1.jpg",
    "phone": "+62404754121",
    "created_at": "2025-10-09T04:24:19.000Z"
  }
}
```

## Troubleshooting

### 1. Connection Error
- Pastikan mock API server berjalan
- Check network configuration di `NetworkModule.kt`
- Pastikan emulator bisa akses `10.0.2.2:3000`

### 2. Authentication Error
- Check Google Sign-In configuration
- Verify client ID di `google-services.json`
- Check log di mock API server

### 3. Data Mapping Error
- Check DTO classes sesuai dengan API response
- Verify UserMapper implementation
- Check database schema

## Development Notes

- Mock API menggunakan data Indonesia yang realistis
- Random delays (100-500ms) untuk simulasi network
- 5% random errors untuk testing error handling
- Real-time updates via Socket.IO (belum diimplementasi di Android)
- JWT tokens dengan expiry 24 jam

## Next Steps

1. Implement refresh token logic
2. Add error handling untuk network issues
3. Implement real-time updates via Socket.IO
4. Add more API endpoints (door control, camera, etc.)
5. Add unit tests untuk repository layer
