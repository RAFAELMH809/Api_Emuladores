import protobuf from "protobufjs";

type MqttPayloadKind = "telemetry" | "actuator-state";

const root = protobuf.Root.fromJSON({
  nested: {
    safeair: {
      nested: {
        TelemetryPayload: {
          fields: {
            emulatorId: { type: "string", id: 1 },
            roomId: { type: "string", id: 2 },
            temperature: { type: "float", id: 3 },
            humidity: { type: "float", id: 4 },
            co2: { type: "float", id: 5 },
            pm25: { type: "float", id: 6 },
            timestamp: { type: "string", id: 7 }
          }
        },
        ActuatorStatePayload: {
          fields: {
            emulatorId: { type: "string", id: 1 },
            roomId: { type: "string", id: 2 },
            deviceType: { type: "string", id: 3 },
            isOn: { type: "bool", id: 4 },
            mode: { type: "string", id: 5 },
            targetTemperature: { type: "float", id: 6 },
            ambientTemperature: { type: "float", id: 7 },
            ambientHumidity: { type: "float", id: 8 },
            timestamp: { type: "string", id: 9 }
          }
        }
      }
    }
  }
});

const telemetryType = root.lookupType("safeair.TelemetryPayload");
const actuatorStateType = root.lookupType("safeair.ActuatorStatePayload");

function resolveKind(topic: string): MqttPayloadKind | null {
  if (topic.endsWith("/telemetry")) {
    return "telemetry";
  }

  if (topic.endsWith("/actuator-state")) {
    return "actuator-state";
  }

  return null;
}

function decodeProtobuf(kind: MqttPayloadKind, buffer: Buffer): Record<string, unknown> {
  const message = kind === "telemetry" ? telemetryType.decode(buffer) : actuatorStateType.decode(buffer);
  const object = (kind === "telemetry" ? telemetryType : actuatorStateType).toObject(message, {
    defaults: false,
    enums: String,
    longs: String,
    bytes: String
  });

  return object as Record<string, unknown>;
}

export function decodeMqttPayload(topic: string, buffer: Buffer): Record<string, unknown> {
  const kind = resolveKind(topic);
  if (!kind) {
    throw new Error(`Unsupported MQTT topic for payload decode: ${topic}`);
  }

  const utf8 = buffer.toString("utf8").trim();
  const looksLikeJson = utf8.startsWith("{") || utf8.startsWith("[");

  if (looksLikeJson) {
    return JSON.parse(utf8) as Record<string, unknown>;
  }

  return decodeProtobuf(kind, buffer);
}
