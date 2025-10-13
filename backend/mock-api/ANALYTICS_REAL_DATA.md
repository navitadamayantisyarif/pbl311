# Analytics API - Real Data Processing

## Penjelasan Perhitungan Data Analytics

### 📊 **Data yang Dihitung dari sample-data.json:**

#### 1. **Total Akses**
```javascript
const totalAccess = accessLogs.length;
```
- **Penjelasan**: Menghitung total jumlah log akses dalam periode tertentu
- **Sumber**: Semua entri di `accessLogs` array

#### 2. **Akses Ditolak**
```javascript
const accessDenied = accessLogs.filter(log => !log.success).length;
```
- **Penjelasan**: Menghitung jumlah akses yang gagal (`success: false`)
- **Sumber**: Log dengan `success: false` di `accessLogs`

#### 3. **Akses Diterima**
```javascript
const accessAccepted = accessLogs.filter(log => log.success).length;
```
- **Penjelasan**: Menghitung jumlah akses yang berhasil (`success: true`)
- **Sumber**: Log dengan `success: true` di `accessLogs`

#### 4. **Data Pintu per Pintu**
```javascript
function calculateDoorMetrics(accessLogs) {
  // Group logs by door_id
  // Hitung untuk setiap pintu:
  // - totalAccess: total akses ke pintu tersebut
  // - accessAccepted: akses berhasil ke pintu tersebut
  // - accessDenied: akses gagal ke pintu tersebut
  // - doorOpened: pintu dibuka (action: unlock, manual_unlock, face_scan)
  // - doorClosed: pintu ditutup (action: lock)
}
```

### 🚪 **Struktur Data Pintu:**

Berdasarkan `sample-data.json`, setiap log memiliki:
```json
{
  "door_id": "c38fbb39-594a-43a2-a4da-5d6645c9c4dc",
  "door_name": "Door 3",
  "location": "Side Entrance",
  "action": "manual_unlock", // unlock, lock, face_scan, access_denied
  "success": true
}
```

### 📈 **Perhitungan Persentase Perubahan:**

```javascript
function calculateChanges(allLogs, currentLogs, period) {
  // Bandingkan periode saat ini dengan periode sebelumnya
  // Hitung persentase perubahan untuk:
  // - totalAccessChange
  // - accessDeniedChange  
  // - accessAcceptedChange
}
```

### 🕐 **Aktivitas per Jam:**

```javascript
function generateActiveHours(accessLogs) {
  // Hitung jam dengan aktivitas tertinggi
  // Berdasarkan timestamp di accessLogs
  // Return top 3 jam dengan akses terbanyak
}
```

### 📊 **Chart Data:**

#### Daily Activity (24h)
- Menghitung akses per jam dari data real
- Menggunakan timestamp dari `accessLogs`

#### Weekly Activity (7d)
- Menghitung akses per hari dalam seminggu
- Berdasarkan `timestamp` dan `getDay()`

#### Monthly Activity (30d/90d)
- Menghitung akses per minggu
- Berdasarkan `timestamp` dan perhitungan minggu

## Contoh Output API:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAccess": 45,
      "accessDenied": 3,
      "accessAccepted": 42,
      "totalAccessChange": "+15%",
      "accessDeniedChange": "-10%",
      "accessAcceptedChange": "+18%"
    },
    "doorMetrics": [
      {
        "doorId": "c38fbb39-594a-43a2-a4da-5d6645c9c4dc",
        "doorName": "Door 3",
        "location": "Side Entrance",
        "totalAccess": 15,
        "accessAccepted": 14,
        "accessDenied": 1,
        "doorOpened": 12,
        "doorClosed": 3
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
    "activeHours": [
      { "timeRange": "16:00 - 18:00", "count": 15 },
      { "timeRange": "12:00 - 14:00", "count": 12 },
      { "timeRange": "08:00 - 10:00", "count": 8 }
    ]
  }
}
```

## Perubahan di Android App:

### AnalyticsSummary Model:
```kotlin
data class AnalyticsSummary(
    val totalAccess: Int,        // Total akses
    val accessDenied: Int,       // Akses ditolak
    val accessAccepted: Int,     // Akses diterima (baru)
    val totalAccessChange: String,
    val accessDeniedChange: String,
    val accessAcceptedChange: String  // Perubahan akses diterima (baru)
)
```

### UI Changes:
- **Card 1**: Total Akses
- **Card 2**: Akses Ditolak  
- **Card 3**: Akses Diterima (menggantikan "Pengguna Aktif")
- **Card 4**: Total Pintu (menggantikan "Rata-rata Durasi")

## Testing:

```bash
# Test dengan data real
curl -X GET "http://localhost:3000/api/analytics/summary?period=7d"

# Expected: Data berdasarkan accessLogs di sample-data.json
```

Sekarang semua data analytics dihitung dari data real di `sample-data.json`! 🎉
