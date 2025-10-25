# 🚪 Door Device Endpoint Documentation

Endpoint untuk device pintu fisik yang memerlukan status pintu tanpa authentication JWT.

## Endpoint

### GET /api/door/device/status/:door_id

Mendapatkan status pintu untuk device pintu fisik.

#### Request

**Method:** GET

**URL:** `http://localhost:3000/api/door/device/status/{door_id}`

**Headers:** Tidak diperlukan (PUBLIC ENDPOINT)

**Parameters:**
- `door_id` (path parameter) - ID pintu yang ingin dilihat statusnya (integer)

#### Example Request

```bash
curl -X GET "http://localhost:3000/api/door/device/status/1"
```

#### Success Response

**Status Code:** 200 OK

```json
{
  "success": true,
  "data": {
    "door_id": 1,
    "status": "terkunci",
    "locked": true,
    "battery_level": 83,
    "last_update": "2025-10-23T15:16:41.434Z"
  },
  "message": "Door status retrieved successfully"
}
```

#### Response Fields

- `success` (boolean) - Status keberhasilan request
- `data` (object) - Data status pintu
  - `door_id` (integer) - ID pintu
  - `status` (string) - Status pintu dalam bahasa Indonesia:
    - `"terkunci"` - Pintu terkunci
    - `"terbuka"` - Pintu terbuka
  - `locked` (boolean) - Status terkunci (`true` = terkunci, `false` = terbuka)
  - `battery_level` (integer) - Level baterai (0-100)
  - `last_update` (string) - Waktu update terakhir (ISO 8601 format)
- `message` (string) - Pesan response

#### Error Responses

**400 Bad Request** - Invalid door ID
```json
{
  "success": false,
  "error": "Invalid door ID",
  "code": "INVALID_DOOR_ID"
}
```

**404 Not Found** - Door tidak ditemukan
```json
{
  "success": false,
  "error": "Door not found",
  "code": "DOOR_NOT_FOUND"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Failed to get door status",
  "message": "Error message details",
  "code": "DOOR_STATUS_ERROR"
}
```

## Use Cases

1. **Device Pintu Fisik** - Device pintu dapat melakukan polling ke endpoint ini untuk mengecek status pintu
2. **Microcontroller** - Controller pintu dapat menggunakan endpoint ini untuk mendapatkan status terkini
3. **Testing** - Testing status pintu tanpa perlu melakukan authentication

## Important Notes

⚠️ **PUBLIC ENDPOINT** - Endpoint ini tidak memerlukan JWT token authentication. Semua request yang valid akan mendapatkan response.

✅ Endpoint ini dirancang khusus untuk device pintu fisik yang tidak memiliki kemampuan untuk menyimpan atau mengelola JWT tokens.

## Example Usage

### JavaScript/Fetch

```javascript
async function getDoorStatus(doorId) {
  try {
    const response = await fetch(`http://localhost:3000/api/door/device/status/${doorId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`Door ${doorId} is ${data.data.status}`);
      console.log(`Battery: ${data.data.battery_level}%`);
      return data.data;
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Failed to fetch door status:', error);
  }
}

// Usage
getDoorStatus(1);
```

### Python

```python
import requests

def get_door_status(door_id):
    url = f"http://localhost:3000/api/door/device/status/{door_id}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            return data['data']
    
    return None

# Usage
status = get_door_status(1)
if status:
    print(f"Door is {status['status']}")
    print(f"Battery: {status['battery_level']}%")
```

### Arduino/ESP8266 (Example)

```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "your-ssid";
const char* password = "your-password";

void getDoorStatus(int doorId) {
  HTTPClient http;
  
  String url = "http://localhost:3000/api/door/device/status/" + String(doorId);
  http.begin(url);
  
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    String payload = http.getString();
    
    // Parse JSON response
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);
    
    if (doc["success"] == true) {
      String status = doc["data"]["status"];
      int battery = doc["data"]["battery_level"];
      
      Serial.print("Door status: ");
      Serial.println(status);
      Serial.print("Battery: ");
      Serial.println(battery);
    }
  }
  
  http.end();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("Connected!");
}

void loop() {
  getDoorStatus(1);
  delay(5000); // Check every 5 seconds
}
```
