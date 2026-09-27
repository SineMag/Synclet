export const SETTINGS_GROUPS = [
  { key: 'safety', title: 'Safety', items: [
    ['useRealLocation', 'Use phone location', "Attach this phone's GPS to alerts. If off, the fallback test location is clearly marked."],
    ['requireFingerprintToCancel', 'Fingerprint to cancel', 'Require a wearable fingerprint scan before cancelling an alert.'],
  ] },
  { key: 'device', title: 'Device', items: [['hapticOnAlert', 'Vibrate on alert', 'Vibrate the phone when an alert is sent (where supported).']] },
  { key: 'voice', title: 'Voice', items: [['wakeWordEnabled', 'Wake word "Synclet"', 'Respond to spoken commands that start with the wake word while this page is open.']] },
  { key: 'biometric', title: 'Biometric', items: [['fingerprintEnabled', 'Wearable fingerprint sensor', 'Allow identity checks with a compatible wearable sensor.']] },
  { key: 'notifications', title: 'Notifications', items: [['statusUpdates', 'Control room updates', 'Notify me when an officer updates my alert.']] },
  { key: 'privacy', title: 'Privacy', items: [
    ['shareHeartRate', 'Share heart rate', 'Include a reported heart-rate reading in alerts sent to the control room.'],
    ['shareLocation', 'Share location', 'Include location in alerts sent to the control room.'],
    ['coarseLocation', 'Approximate location (±1 km)', 'Round shared GPS down to about 1 km for extra privacy.'],
  ] },
];
