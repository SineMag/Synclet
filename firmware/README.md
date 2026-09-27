# Synclet ESP32 MQTT setup

## Connection model

USB connects the ESP32 to your Windows PC so you can flash firmware. Once flashed, the ESP32 connects to Wi-Fi and HiveMQ over MQTT TCP (`broker.hivemq.com:1883`). The web app connects to the same broker over secure WebSockets (`wss://broker.hivemq.com:8884/mqtt`). The USB cable does not carry the app's MQTT messages.

## Before flashing

1. Confirm the board is a common ESP32 DevKit / ESP32-WROOM-32 or adjust the pins for your actual model.
2. In Arduino IDE, install ESP32 board support and the `PubSubClient` and `ArduinoJson` libraries.
3. Copy `SyncletMqtt/secrets.example.h` to `SyncletMqtt/secrets.h` and enter a 2.4 GHz Wi-Fi SSID/password. `secrets.h` is git-ignored.
4. Open `SyncletMqtt/SyncletMqtt.ino`, choose the matching ESP32 board and COM port, then Upload. Open Serial Monitor at 115200 baud to verify Wi-Fi, MQTT, and SOS countdown status. If using an ESP32-S2/S3/C3 with native USB, enable `USB CDC On Boot` in Tools before uploading. A 10-second serial heartbeat confirms the selected port and baud rate.

## Starter pin assignment

- Controllable status LED: GPIO 2. It blinks during the 15-second countdown, but only if the board exposes a GPIO 2 LED or you attach a suitable LED circuit.
- The steady blue LED that lights as soon as USB is connected is usually the board's power indicator; it is not controlled by firmware and will remain on.
- Momentary SOS button: connect one side to GPIO 4 and the other to GND; firmware configures `INPUT_PULLUP`. A press starts the ESP32 countdown; while connected, the mobile app immediately records the incident and asks whether the user is okay. The user can answer before the countdown ends. The CRM shares updates only within this browser/origin.
- Confirm both assignments against the exact board pinout before wiring. Do not connect 5 V to a GPIO.

## MQTT contract

- Device: `ESP32_Pro_Unit_01`
- Telemetry/status payload topic: `esp32/unit01/data`
- Commands topic: `esp32/unit01/cmd`
- Availability topic and Last Will: `esp32/unit01/status`
- Commands: `PING`, `ON`, `OFF`, `CANCEL_SOS`
- Telemetry is JSON-compatible with `device`, `firmware`, `uptime`, `wifi_rssi`, `led`, `sos_countdown_active`, `sos_seconds_remaining` (while counting down), and `event`.
- A button press starts a device-side 15-second countdown; another press cancels it. The GPIO 2 output blinks without blocking Wi-Fi/MQTT handling. `sos_committed` is published only when the timer expires.

The app creates an incident from this event only while the app is open and connected. It saves the incident and check-in to this browser's local storage. “Yes, I’m okay” records a safe check-in and closes an alert that is not already being actively handled. “No, I need help” marks the incident escalated and creates SMS drafts for saved contacts; the user must review and send each draft in their messaging app. This does not send SMS automatically, contact emergency services, or guarantee delivery.

## Public broker warning

HiveMQ's public broker is shared and unauthenticated. Anyone can subscribe or publish on these generic topic names, and test traffic may conflict with others. Use it only with non-sensitive test messages. Create a private authenticated MQTT broker and use unique topics before handling any personal or emergency information.
