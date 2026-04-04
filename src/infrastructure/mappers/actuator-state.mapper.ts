import type { ActuatorStateInput } from "../../domain/types/actuator.types";

export function mapActuatorStatePayload(payload: Record<string, unknown>): ActuatorStateInput {
  return {
    emulatorId: String(payload.emulatorId ?? ""),
    roomId: payload.roomId ? String(payload.roomId) : undefined,
    deviceType: String(payload.deviceType ?? "") as ActuatorStateInput["deviceType"],
    isOn: Boolean(payload.isOn),
    mode: payload.mode ? String(payload.mode) : undefined,
    targetTemperature: payload.targetTemperature !== undefined ? Number(payload.targetTemperature) : undefined,
    ambientTemperature: payload.ambientTemperature !== undefined ? Number(payload.ambientTemperature) : undefined,
    ambientHumidity: payload.ambientHumidity !== undefined ? Number(payload.ambientHumidity) : undefined,
    timestamp: payload.timestamp ? String(payload.timestamp) : undefined
  };
}
