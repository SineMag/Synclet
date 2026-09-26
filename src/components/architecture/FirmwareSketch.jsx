import React from 'react';

const CODE = `// firmware/src/main.cpp — ESP32 foundation (NOT yet connected to the app)
#include <NimBLEDevice.h>
#define SVC_SYNCLET   "7a1e0001-5c1e-4e7a-9b1a-53796e636c74"
#define CH_EMERGENCY  "7a1e0002-..."   // notify: 1 = button / voice emergency
#define CH_FINGER     "7a1e0003-..."   // notify: match result + template id
#define CH_VOICE      "7a1e0004-..."   // notify: wake-word state
#define CH_COMMAND    "7a1e0005-..."   // write: PING, STATUS, CANCEL
const bool SIMULATE_SENSORS = true;    // test values until sensors are wired

void loop() {
  uint8_t bpm  = SIMULATE_SENSORS ? 70 + random(0, 8) : readMax30102();
  uint8_t batt = SIMULATE_SENSORS ? 87 : readBatteryPercent();
  hrChar->setValue(&bpm, 1);   hrChar->notify();    // 0x180D
  battChar->setValue(&batt, 1);                     // 0x180F
  if (digitalRead(PIN_SOS) == LOW) emergencyChar->notify();
  delay(1000);
}

; platformio.ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = h2zero/NimBLE-Arduino`;

export default function FirmwareSketch() {
  return (
    <section>
      <h2 className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">ESP32 firmware foundation</h2>
      <pre className="mt-3 border border-border rounded-md bg-foreground text-background text-xs p-4 overflow-x-auto leading-relaxed font-mono">{CODE}</pre>
    </section>
  );
}