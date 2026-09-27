export const MQTT_BROKER_URL = import.meta.env.VITE_MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt';
export const MQTT_DEVICE_ID = 'ESP32_Pro_Unit_01';
export const MQTT_TOPICS = {
  telemetry: 'esp32/unit01/data',
  command: 'esp32/unit01/cmd',
  status: 'esp32/unit01/status',
};

let client = null;
let mqttSubscribed = false;
const messageListeners = new Set();
const stateListeners = new Set();
let latestState = { brokerConnected: false, deviceOnline: false, error: '' };

const publishState = (next) => {
  latestState = { ...latestState, ...next };
  stateListeners.forEach((listener) => listener(latestState));
};

export const mqttAvailable = () => typeof window !== 'undefined' && typeof WebSocket !== 'undefined' && Boolean(window.isSecureContext);

export const subscribeMqttMessages = (listener) => {
  messageListeners.add(listener);
  return () => {
    messageListeners.delete(listener);
  };
};

export const subscribeMqttState = (listener) => {
  stateListeners.add(listener);
  listener(latestState);
  return () => {
    stateListeners.delete(listener);
  };
};

export async function connectMqtt() {
  if (!mqttAvailable()) throw new Error('Open Synclet in desktop Chrome or Edge on localhost or HTTPS to use MQTT over WebSockets.');
  if (client?.connected && mqttSubscribed) return;
  if (client) await disconnectMqtt();

  publishState({ brokerConnected: false, deviceOnline: false, error: '' });
  const { default: mqtt } = await import('mqtt');
  const uniqueId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Date.now();
  const instance = mqtt.connect(MQTT_BROKER_URL, {
    clientId: `synclet_web_${uniqueId}`,
    clean: true,
    connectTimeout: 10000,
    keepalive: 30,
    protocolVersion: 4,
    reconnectPeriod: 3000,
  });
  client = instance;
  mqttSubscribed = false;

  let settled = false;
  let timeout;
  let resolveConnection;
  let rejectConnection;
  const connectionPromise = new Promise((resolve, reject) => {
    resolveConnection = resolve;
    rejectConnection = reject;
  });
  const settle = (callback, value) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    callback(value);
  };
  timeout = setTimeout(() => {
    const message = instance.connected
      ? 'The broker connected, but subscribing to the ESP32 topics timed out.'
      : 'MQTT broker connection timed out. Check your internet connection and broker URL.';
    publishState({ brokerConnected: false, error: message });
    settle(rejectConnection, new Error(message));
  }, 15000);

  instance.on('message', (topic, bytes, packet) => {
    const message = { topic, payload: bytes.toString(), retained: Boolean(packet?.retain) };
    messageListeners.forEach((listener) => listener(message));
  });
  instance.on('connect', () => {
    mqttSubscribed = false;
    publishState({ brokerConnected: false, error: 'Connected to the broker; waiting for the ESP32 topic subscription.' });
    instance.subscribe([MQTT_TOPICS.telemetry, MQTT_TOPICS.status], { qos: 0 }, (error, granted = []) => {
      const subscriptionRejected = granted.some((subscription) => subscription.qos === 128);
      if (error || subscriptionRejected) {
        const message = 'The broker connected but refused the ESP32 topic subscription. Check broker permissions and topic settings.';
        publishState({ brokerConnected: false, error: message });
        settle(rejectConnection, new Error(message));
        return;
      }
      mqttSubscribed = true;
      publishState({ brokerConnected: true, error: '' });
      settle(resolveConnection);
    });
  });
  instance.on('reconnect', () => {
    mqttSubscribed = false;
    publishState({ brokerConnected: false, error: 'Reconnecting to the MQTT broker…' });
  });
  instance.on('offline', () => {
    mqttSubscribed = false;
    publishState({ brokerConnected: false, error: 'MQTT broker connection is offline.' });
  });
  instance.on('close', () => {
    mqttSubscribed = false;
    publishState({ brokerConnected: false });
  });
  instance.on('error', (error) => {
    publishState({ error: error?.message || 'Could not connect to the MQTT broker.' });
    if (!instance.connected) settle(rejectConnection, new Error(error?.message || 'Could not connect to the MQTT broker.'));
  });

  return connectionPromise;
}

export function disconnectMqtt() {
  if (!client) return Promise.resolve();
  const current = client;
  client = null;
  mqttSubscribed = false;
  publishState({ brokerConnected: false, deviceOnline: false, error: '' });
  return new Promise((resolve) => current.end(true, {}, resolve));
}

export function publishMqttCommand(command) {
  if (!client?.connected || !mqttSubscribed) return Promise.reject(new Error('Wait for the MQTT topic subscription before sending a command.'));
  if (!['PING', 'ON', 'OFF', 'CANCEL_SOS'].includes(command)) return Promise.reject(new Error('Unsupported ESP32 command.'));
  return new Promise((resolve, reject) => {
    client.publish(MQTT_TOPICS.command, command, { qos: 0, retain: false }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function waitForTelemetry(predicate, command, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let done = false;
    let timeout;
    const finish = (callback, value) => {
      if (done) return;
      done = true;
      clearTimeout(timeout);
      unsubscribe();
      callback(value);
    };
    const unsubscribe = subscribeMqttMessages(({ topic, payload }) => {
      if (topic !== MQTT_TOPICS.telemetry) return;
      try {
        const message = JSON.parse(payload);
        if (message.device === MQTT_DEVICE_ID && predicate(message)) finish(resolve, message);
      } catch {
        // Ignore malformed or unrelated telemetry.
      }
    });
    timeout = setTimeout(() => finish(reject, new Error('No matching response arrived from the ESP32. Confirm that the Synclet MQTT firmware is flashed, connected to Wi-Fi, and online.')), timeoutMs);
    publishMqttCommand(command).catch((error) => finish(reject, error));
  });
}

export const pingMqttDevice = () => waitForTelemetry((message) => message.event === 'pong', 'PING');
export const cancelMqttSos = () => waitForTelemetry((message) => message.event === 'sos_cancelled', 'CANCEL_SOS', 5000);
export const setMqttLed = (on) => waitForTelemetry((message) => message.led === (on ? 'ON' : 'OFF'), on ? 'ON' : 'OFF');
