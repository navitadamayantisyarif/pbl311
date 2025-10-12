# Confirmation Modal Integration

## Overview
Fitur konfirmasi modal telah diintegrasikan ke dalam DashboardScreen untuk memberikan konfirmasi sebelum melakukan aksi buka/tutup pintu.

## Komponen yang Ditambahkan

### 1. ConfirmationModal.kt
- Komponen modal yang menampilkan konfirmasi dengan desain yang sesuai dengan UI/UX aplikasi
- Mendukung parameter:
  - `isVisible`: Boolean untuk menampilkan/menyembunyikan modal
  - `doorName`: Nama pintu yang akan dikontrol
  - `action`: Aksi yang akan dilakukan ("buka" atau "tutup")
  - `onConfirm`: Callback ketika user mengkonfirmasi aksi
  - `onDismiss`: Callback ketika user membatalkan aksi

### 2. DashboardScreen.kt Updates
- Menambahkan state management untuk modal konfirmasi
- Mengintegrasikan modal dengan aksi tombol "Kunci" dan "Buka"
- Menangani konfirmasi dan memanggil API endpoint yang sesuai

## Flow Aplikasi

1. User menekan tombol "Buka" atau "Kunci" pada DoorCard
2. Modal konfirmasi muncul dengan pesan "Apakah Anda yakin ingin [aksi] [nama pintu]?"
3. User dapat memilih:
   - "Batal": Modal ditutup, tidak ada aksi yang dilakukan
   - "Ya, [Aksi]": Modal ditutup, API endpoint dipanggil

## API Integration

### Endpoint yang Digunakan
- **POST** `/api/door/control`
- **Headers**: `Authorization: Bearer [token]`
- **Body**:
  ```json
  {
    "action": "lock" | "unlock",
    "door_id": "string" // optional, jika tidak ada akan menggunakan door pertama
  }
  ```

### Response Format
```json
{
  "success": true,
  "message": "Door [action] successful",
  "data": {
    "action": "lock" | "unlock",
    "status": { /* door status object */ },
    "timestamp": "2024-01-01T00:00:00.000Z",
    "log_id": "uuid"
  }
}
```

## Error Handling

- Jika API call gagal, error message akan ditampilkan di bagian bawah layar
- Modal akan tetap ditutup setelah konfirmasi, terlepas dari hasil API call
- Error handling dilakukan di ViewModel level

## Testing

Untuk testing, pastikan:
1. Mock API server berjalan di `http://localhost:3000`
2. User sudah login dan memiliki token authentication
3. User memiliki akses ke pintu yang akan dikontrol

## Mock API Endpoint Details

Endpoint `/api/door/control` di mock API mendukung:
- Simulasi failure rate 5% untuk testing error handling
- Access control berdasarkan user permissions
- Logging akses ke accessLogs
- Notifikasi untuk aksi unlock
- Support untuk multiple doors dengan parameter `door_id`
