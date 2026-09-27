/*
 * Synclet MQTT starter firmware
 * Target: common ESP32 DevKit / ESP32-WROOM-32 Arduino board.
 * Check your exact board pinout before connecting GPIO 2 or GPIO 4.
 * MQTT carries Wi-Fi telemetry; USB is used to flash and power the board.
 */
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "secrets.h"

#ifndef WIFI_SSID
#define WIFI_SSID ""
#endif
#ifndef WIFI_PASSWORD
#define WIFI_PASSWORD ""
#endif

static const char* MQTT_HOST = "broker.hivemq.com";
static const uint16_t MQTT_PORT = 1883;
static const char* DEVICE_ID = "ESP32_Pro_Unit_01";
static const char* TOPIC_DATA = "esp32/unit01/data";
static const char* TOPIC_COMMAND = "esp32/unit01/cmd";
static const char* TOPIC_STATUS = "esp32/unit01/status";
static const uint8_t LED_PIN = 2;
static const uint8_t SOS_BUTTON_PIN = 4;
static const unsigned long TELEMETRY_INTERVAL_MS = 5000;
static const unsigned long RETRY_INTERVAL_MS = 5000;
static const unsigned long DEBOUNCE_MS = 35;
static const unsigned long SOS_COUNTDOWN_MS = 15000;

WiFiClient network;
PubSubClient mqtt(network);
unsigned long lastTelemetryAt = 0;
unsigned long lastWifiAttemptAt = 0;
unsigned long lastMqttAttemptAt = 0;
unsigned long rawChangedAt = 0;
unsigned long sosStartedAt = 0;
unsigned long lastCountdownLedAt = 0;
unsigned long lastCountdownLogAt = 0;
unsigned long lastSerialHeartbeatAt = 0;
bool ledOn = false;
bool ledOutputOn = false;
bool ledOutputInitialized = false;
bool countdownLedOn = false;
bool wifiWasConnected = false;
bool rawButton = HIGH;
bool stableButton = HIGH;
bool sosCountdownActive = false;

// The steady blue power LED is not a GPIO and cannot be controlled here.
static const bool LED_ACTIVE_HIGH = true;

void writeStatusLed(bool on) {
  if (ledOutputInitialized && ledOutputOn == on) return;
  ledOutputOn = on;
  ledOutputInitialized = true;
  const bool pinHigh = on == LED_ACTIVE_HIGH;
  digitalWrite(LED_PIN, pinHigh ? HIGH : LOW);
}

void updateCountdownLed(unsigned long now) {
  if (!sosCountdownActive) {
    writeStatusLed(ledOn);
    return;
  }
  if (now - lastCountdownLedAt < 250) return;
  lastCountdownLedAt = now;
  countdownLedOn = !countdownLedOn;
  writeStatusLed(countdownLedOn);
}

void publishTelemetry(const char* eventName) {
  if (!mqtt.connected()) return;
  JsonDocument doc;
  doc["device"] = DEVICE_ID;
  doc["firmware"] = "synclet-mqtt-1";
  doc["uptime"] = millis() / 1000;
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["led"] = ledOn ? "ON" : "OFF";
  doc["sos_countdown_active"] = sosCountdownActive;
  if (sosCountdownActive) {
    const unsigned long elapsed = millis() - sosStartedAt;
    doc["sos_seconds_remaining"] = (SOS_COUNTDOWN_MS - elapsed + 999) / 1000;
  }
  doc["event"] = eventName;
  char payload[256];
  const size_t length = serializeJson(doc, payload, sizeof(payload));
  if (length > 0) mqtt.publish(TOPIC_DATA, payload, false);
}

void onMqttMessage(char* topic, uint8_t* payload, unsigned int length) {
  if (strcmp(topic, TOPIC_COMMAND) != 0 || length == 0 || length > 32) return;
  char command[33];
  memcpy(command, payload, length);
  command[length] = '\0';
  Serial.printf("MQTT command received on %s: %s\n", topic, command);

  if (strcmp(command, "ON") == 0) {
    ledOn = true;
    if (!sosCountdownActive) writeStatusLed(true);
    publishTelemetry("led_update");
  } else if (strcmp(command, "OFF") == 0) {
    ledOn = false;
    if (!sosCountdownActive) writeStatusLed(false);
    publishTelemetry("led_update");
  } else if (strcmp(command, "PING") == 0) {
    publishTelemetry("pong");
  } else if (strcmp(command, "CANCEL_SOS") == 0 && sosCountdownActive) {
    sosCountdownActive = false;
    publishTelemetry("sos_cancelled");
  }
}

void maintainWifi(unsigned long now) {
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiWasConnected) {
      Serial.printf("Wi-Fi connected, IP %s, RSSI %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    }
    wifiWasConnected = true;
    return;
  }

  if (wifiWasConnected) Serial.println("Wi-Fi disconnected; retrying.");
  wifiWasConnected = false;
  if (strlen(WIFI_SSID) == 0 || now - lastWifiAttemptAt < RETRY_INTERVAL_MS) return;
  lastWifiAttemptAt = now;
  Serial.printf("Connecting to configured Wi-Fi (status %d).\n", static_cast<int>(WiFi.status()));
  WiFi.mode(WIFI_STA);
  WiFi.reconnect();
}

void maintainMqtt(unsigned long now) {
  if (WiFi.status() != WL_CONNECTED || mqtt.connected() || now - lastMqttAttemptAt < RETRY_INTERVAL_MS) return;
  lastMqttAttemptAt = now;
  Serial.println("Connecting to broker.hivemq.com:1883.");
  const bool connected = mqtt.connect(DEVICE_ID, "", "", TOPIC_STATUS, 1, true, "offline");
  if (!connected) {
    Serial.printf("MQTT connection failed (PubSubClient state %d).\n", mqtt.state());
    return;
  }

  mqtt.publish(TOPIC_STATUS, "online", true);
  if (!mqtt.subscribe(TOPIC_COMMAND, 0)) {
    Serial.printf("MQTT command subscription failed for %s.\n", TOPIC_COMMAND);
  } else {
    Serial.printf("MQTT online; listening for commands on %s.\n", TOPIC_COMMAND);
  }
  publishTelemetry("online");
}

void updateSosButton(unsigned long now) {
  const bool reading = digitalRead(SOS_BUTTON_PIN);
  if (reading != rawButton) {
    rawButton = reading;
    rawChangedAt = now;
  }
  if (reading != stableButton && now - rawChangedAt >= DEBOUNCE_MS) {
    stableButton = reading;
    if (stableButton == LOW) {
      if (sosCountdownActive) {
        sosCountdownActive = false;
        Serial.println("SOS countdown cancelled by button.");
        writeStatusLed(ledOn);
        publishTelemetry("sos_cancelled");
      } else {
        sosCountdownActive = true;
        sosStartedAt = now;
        lastCountdownLedAt = now - 250;
        lastCountdownLogAt = now - 1000;
        countdownLedOn = false;
        Serial.println("SOS countdown started; press again to cancel.");
        publishTelemetry("sos_countdown_started");
      }
    }
  }

  if (sosCountdownActive && now - lastCountdownLogAt >= 1000) {
    lastCountdownLogAt = now;
    const unsigned long elapsed = now - sosStartedAt;
    const unsigned long secondsRemaining = (SOS_COUNTDOWN_MS - elapsed + 999) / 1000;
    Serial.printf("SOS alert in %lu seconds. Press the button again to cancel.\n", secondsRemaining);
  }

  if (sosCountdownActive && now - sosStartedAt >= SOS_COUNTDOWN_MS) {
    sosCountdownActive = false;
    writeStatusLed(ledOn);
    Serial.println("SOS countdown committed; publishing event.");
    publishTelemetry("sos_committed");
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Synclet MQTT firmware starting. Open Serial Monitor at 115200 baud.");
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOS_BUTTON_PIN, INPUT_PULLUP);
  writeStatusLed(false);
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(onMqttMessage);
  mqtt.setBufferSize(512);
  if (strlen(WIFI_SSID) > 0) {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    lastWifiAttemptAt = millis();
  } else {
    Serial.println("Set WIFI_SSID and WIFI_PASSWORD in secrets.h before connecting.");
  }
  rawButton = digitalRead(SOS_BUTTON_PIN);
  stableButton = rawButton;
  rawChangedAt = millis();
}

void loop() {
  const unsigned long now = millis();
  maintainWifi(now);
  maintainMqtt(now);
  if (mqtt.connected()) mqtt.loop();
  updateSosButton(now);
  updateCountdownLed(now);

  if (now - lastSerialHeartbeatAt >= 10000) {
    lastSerialHeartbeatAt = now;
    Serial.printf("Synclet running | Wi-Fi: %s | MQTT: %s\n",
      WiFi.status() == WL_CONNECTED ? "connected" : "disconnected",
      mqtt.connected() ? "connected" : "disconnected");
  }

  if (mqtt.connected() && now - lastTelemetryAt >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryAt = now;
    publishTelemetry("telemetry");
  }
}
