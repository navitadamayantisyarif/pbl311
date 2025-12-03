#include <WiFi.h>
#include <HTTPClient.h>

// ==================== WiFi ====================
const char* WIFI_SSID = "OnePlus 7 Pro";
const char* WIFI_PASSWORD = "satuduatiga";

// ==================== Backend ====================
const char* BACKEND_HOST = "172.31.210.163";
const int BACKEND_PORT = 5002;
const bool USE_HTTPS = false;

const int DOOR_ID = 7;

// ==================== Relay ====================
const int RELAY_PIN = 27;              // GPIO27 sesuai permintaan
const int RELAY_ACTIVE_LEVEL = LOW;    // Relay ON (aktifkan solenoid)
const int RELAY_INACTIVE_LEVEL = HIGH; // Relay OFF

// ==================== Polling ====================
const unsigned long POLL_INTERVAL_MS = 2000;
unsigned long lastPollMs = 0;

// Status
bool lastLocked = true;     // Status terakhir dari backend
bool appliedLocked = true;  // Status terakhir relay diterapkan

// ==================== Helper ====================
String buildStatusUrl() {
  String scheme = USE_HTTPS ? "https" : "http";
  return scheme + "://" + BACKEND_HOST + ":" + String(BACKEND_PORT) +
         "/api/door/device/status/" + String(DOOR_ID);
}

bool parseLocked(const String& payload) {
  int pos = payload.indexOf("\"locked\"");
  if (pos < 0) return lastLocked;

  int colon = payload.indexOf(':', pos);
  if (colon < 0) return lastLocked;

  if (payload.indexOf("false", colon) >= 0) return false;
  if (payload.indexOf("true", colon) >= 0) return true;

  return lastLocked;
}

void applyRelay(bool locked) {
  // Jika locked = true, relay OFF; jika locked = false, relay ON
  digitalWrite(RELAY_PIN, locked ? RELAY_INACTIVE_LEVEL : RELAY_ACTIVE_LEVEL);
  appliedLocked = locked;

  Serial.print("Relay Updated → Locked = ");
  Serial.println(locked);
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.println("Connecting WiFi...");
  unsigned long start = millis();

  while (WiFi.status() != WL_CONNECTED && millis() - start < 30000) {
    delay(250);
    Serial.print(".");
  }

  Serial.println();
  Serial.println(WiFi.status() == WL_CONNECTED ? "WiFi connected!" : "WiFi FAILED");
}

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);

  // Setup relay pin
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, RELAY_INACTIVE_LEVEL); // Mulai dengan relay OFF

  connectWiFi();
}

// ==================== Loop ====================
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastPollMs >= POLL_INTERVAL_MS) {
    lastPollMs = now;

    HTTPClient http;
    String url = buildStatusUrl();
    http.setTimeout(3000);

    Serial.println("GET: " + url);

    if (http.begin(url)) {
      int code = http.GET();

      if (code == 200) {
        String payload = http.getString();
        Serial.println("Payload: " + payload);

        bool locked = parseLocked(payload);
        lastLocked = locked;

        if (locked != appliedLocked) {
          applyRelay(locked);
        }
      } else {
        Serial.print("HTTP Error: ");
        Serial.println(code);
      }

      http.end();
    }
  }
}
