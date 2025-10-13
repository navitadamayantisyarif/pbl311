# Troubleshooting Guide

## Analytics Screen Kosong

Jika AnalyticsScreen menampilkan layar kosong, berikut adalah langkah-langkah troubleshooting:

### 1. Periksa Mock API Server
Pastikan mock API server berjalan:
```bash
cd backend/mock-api
npm start
```

Server harus berjalan di `http://localhost:3000`

### 2. Test Analytics Endpoint
Jalankan test script untuk memverifikasi endpoint:
```bash
cd backend/mock-api
node test-analytics.js
```

Atau test manual dengan curl:
```bash
curl -X GET "http://localhost:3000/api/analytics/summary?period=7d"
```

### 3. Periksa Log Android
Buka Android Studio Logcat dan cari log dari `AnalyticsRepository`:
- `AnalyticsRepository: Attempting to fetch analytics data`
- `AnalyticsRepository: Response code: XXX`
- `AnalyticsRepository: Response body: {...}`

### 4. Kemungkinan Masalah dan Solusi

#### A. Mock API Tidak Berjalan
**Gejala**: Log menunjukkan connection error
**Solusi**: 
1. Pastikan server berjalan di port 3000
2. Periksa apakah ada aplikasi lain yang menggunakan port 3000

#### B. Authentication Error
**Gejala**: Response code 401 atau 403
**Solusi**: 
- Analytics endpoint sudah di-set untuk tidak memerlukan authentication
- Jika masih error, periksa middleware di `routes/analytics.js`

#### C. Data Kosong dari API
**Gejala**: Response code 200 tapi data kosong
**Solusi**:
- Periksa file `data/sample-data.json` apakah ada data `accessLogs`
- Periksa fungsi `loadSampleData()` di `data/sampleData.js`

#### D. Parsing Error
**Gejala**: Exception saat parsing response
**Solusi**:
- Periksa struktur response dari API
- Pastikan mapping di `mapApiDataToAnalyticsData()` sesuai dengan response

### 5. Fallback UI
Jika semua gagal, aplikasi akan menampilkan:
- Empty state dengan pesan "Belum Ada Data Analitik"
- Tombol Refresh untuk mencoba lagi
- Mock data sebagai fallback terakhir

### 6. Debug Mode
Untuk debugging lebih detail, tambahkan log di:
- `AnalyticsRepository.getAnalyticsData()`
- `AnalyticsViewModel.loadAnalyticsData()`
- `AnalyticsScreen` composable

### 7. Test Data
Pastikan ada data di `sample-data.json`:
```json
{
  "accessLogs": [
    {
      "id": "...",
      "user_id": "...",
      "user_name": "...",
      "action": "unlock",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "success": true,
      "method": "face_recognition"
    }
  ]
}
```

### 8. Network Configuration
Pastikan Android app dapat mengakses `localhost:3000`:
- Untuk emulator: `http://10.0.2.2:3000`
- Untuk device fisik: gunakan IP komputer yang sebenarnya

### 9. Restart Aplikasi
Jika semua sudah benar tapi masih kosong:
1. Stop mock API server
2. Restart mock API server
3. Clean dan rebuild Android app
4. Restart Android app

### 10. Log Output yang Diharapkan
```
AnalyticsRepository: Attempting to fetch analytics data for period: 7d
AnalyticsRepository: Response code: 200
AnalyticsRepository: Response body: {success: true, data: {...}}
AnalyticsRepository: Successfully parsed data from API
```

Jika log menunjukkan fallback ke mock data, periksa masalah di atas.
