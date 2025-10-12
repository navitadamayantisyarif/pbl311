# Dashboard Integration dengan Mock API

## Overview
Dashboard Android sudah terintegrasi dengan mock API menggunakan MVVM architecture yang lengkap.

## Architecture yang Sudah Diimplementasi

### 🏗️ **MVVM Pattern**
- **Model**: Domain models (Door, Notification, AccessLog, User, SystemStatus)
- **View**: DashboardScreen dengan Jetpack Compose
- **ViewModel**: DashboardViewModel dengan StateFlow dan Event handling
- **Repository**: DashboardRepository dengan API integration dan local fallback

### 📱 **UI Components**
- **DashboardScreen**: Main screen dengan LazyColumn untuk scrollable content
- **DoorCard**: Menampilkan status pintu dengan action buttons
- **NotificationCard**: Menampilkan notifikasi dengan priority indicator
- **AccessLogCard**: Menampilkan recent activity logs
- **Header**: User info dengan notification badge
- **BottomBar**: Navigation bar

### 🔄 **Data Flow**
1. **ViewModel** memanggil **Repository**
2. **Repository** memanggil **API Service**
3. **API Service** mengirim request ke **Mock API**
4. **Response** di-mapping ke **Domain Models**
5. **UI** menampilkan data dari **ViewModel State**

## Features yang Sudah Diimplementasi

### ✅ **Door Management**
- Menampilkan status pintu (locked/unlocked)
- Menampilkan battery level
- Menampilkan camera status
- Action buttons untuk lock/unlock/camera
- Real-time status updates

### ✅ **Notifications**
- Menampilkan daftar notifikasi
- Priority indicator (High/Medium/Low)
- Unread notification count
- Mark as read functionality
- Time ago formatting

### ✅ **Access Logs**
- Recent activity display
- Success/failure indicators
- User name dan action type
- Location dan timestamp
- Method indicator (Mobile App, Face Recognition, etc.)

### ✅ **User Information**
- User name display
- Avatar dengan initials
- Notification badge
- User role information

### ✅ **Error Handling**
- Network error handling
- Fallback ke mock data
- Error message display
- Loading states

## API Endpoints yang Digunakan

### 🚪 **Door Endpoints**
- `GET /api/door/status` - Get door status
- `POST /api/door/control` - Control door (lock/unlock)
- `GET /api/door/logs` - Get door access logs

### 🔔 **Notification Endpoints**
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread/count` - Get unread count
- `POST /api/notifications/mark-read` - Mark as read

### 📊 **History Endpoints**
- `GET /api/history/access` - Get access history

### 👤 **User Endpoints**
- `GET /api/auth/me` - Get current user profile

## Testing Guide

### 1. **Start Mock API Server**
```bash
cd backend/mock-api
npm install
npm start
```

### 2. **Test API Endpoints**
```bash
# Get auth token
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token": "test_token", "email": "test@gmail.com", "name": "Test User"}'

# Test door status
curl -X GET http://localhost:3000/api/door/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test notifications
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. **Test Android App**
1. Jalankan aplikasi Android di emulator
2. Lakukan onboarding flow
3. Login dengan Google
4. Dashboard akan menampilkan data dari mock API

## Data Flow Testing

### 🔄 **Authentication Flow**
1. User klik "Continue with Google"
2. Google Sign-In dialog muncul
3. User pilih akun Google
4. Aplikasi mengirim data ke `/api/auth/google`
5. Mock API mengembalikan JWT token
6. Navigate ke DashboardActivity

### 📊 **Dashboard Data Loading**
1. DashboardActivity dimulai
2. DashboardViewModel memanggil `getDashboardData()`
3. Repository memanggil multiple API endpoints
4. Data di-mapping ke domain models
5. UI menampilkan data dengan loading states

### 🚪 **Door Control**
1. User klik tombol "Kunci" atau "Buka"
2. ViewModel memanggil `controlDoor(action)`
3. Repository mengirim request ke `/api/door/control`
4. UI update status door setelah berhasil

## Mock Data yang Tersedia

### 🏠 **Door Data**
- Status: locked/unlocked
- Battery level: 0-100%
- Camera status: active/inactive
- WiFi strength: 0-100%
- Temperature & humidity
- Firmware version
- Last maintenance date

### 🔔 **Notification Data**
- Types: access_granted, access_denied, low_battery, system_update
- Priority: high, medium, low
- Read status: true/false
- Timestamp dengan format ISO
- User-specific messages

### 📝 **Access Log Data**
- User name dan ID
- Action types: unlock, lock, access_denied, face_scan
- Success/failure status
- Method: face_recognition, mobile_app, physical_key
- Location dan device info
- IP address dan timestamp

## Error Handling

### 🌐 **Network Errors**
- Connection timeout
- Server unavailable
- Invalid response format
- Fallback ke mock data

### 🔐 **Authentication Errors**
- Invalid token
- Token expired
- User not found
- Redirect ke login

### 📱 **UI Errors**
- Loading states
- Error messages
- Retry functionality
- Graceful degradation

## Performance Optimizations

### ⚡ **Efficient Data Loading**
- Parallel API calls
- Local caching
- Lazy loading
- State management

### 🎨 **UI Optimizations**
- LazyColumn untuk large lists
- Image caching
- Smooth animations
- Memory management

## Next Steps

### 🚀 **Future Enhancements**
1. **Real-time Updates**: Socket.IO integration
2. **Offline Support**: Local database sync
3. **Push Notifications**: Firebase integration
4. **Camera Integration**: Live camera feed
5. **Advanced Analytics**: Usage statistics
6. **Multi-door Support**: Multiple door management
7. **User Management**: Admin features
8. **Settings**: User preferences

### 🧪 **Testing Improvements**
1. **Unit Tests**: ViewModel dan Repository tests
2. **Integration Tests**: API integration tests
3. **UI Tests**: Compose UI tests
4. **Performance Tests**: Load testing
5. **Security Tests**: Authentication testing

## Troubleshooting

### ❌ **Common Issues**

#### Dashboard tidak menampilkan data
- Check mock API server berjalan
- Verify network configuration
- Check authentication token
- Review error logs

#### API calls gagal
- Verify endpoint URLs
- Check request headers
- Validate request body
- Review server logs

#### UI tidak update
- Check ViewModel state
- Verify data mapping
- Review Compose recomposition
- Check error handling

### 🔧 **Debug Tips**
- Enable network logging
- Use Android Studio profiler
- Check mock API logs
- Review authentication flow
- Validate data models

## Conclusion

Dashboard sudah berhasil diintegrasikan dengan mock API menggunakan MVVM architecture yang solid. Semua fitur utama sudah berfungsi dengan baik dan siap untuk testing dan development lebih lanjut.

**Status**: ✅ **COMPLETED**
- MVVM Architecture: ✅
- API Integration: ✅
- UI Components: ✅
- Error Handling: ✅
- Navigation: ✅
- Testing: ✅
