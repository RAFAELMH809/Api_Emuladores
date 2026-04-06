import type { ActuatorStateInput } from "../../domain/types/actuator.types";
import { AppError } from "../../shared/errors/app-error";
import { logger } from "../../shared/config/logger";

const EXTERNAL_TO_INTERNAL_DEVICE_TYPE: Record<string, ActuatorStateInput["deviceType"]> = {
  minisplit: "minisplit",
  MiniSplit: "minisplit",
  extractor: "extractor",
  AirExtractor: "extractor",
  purifier: "purifier",
  HumidifierPurifier: "purifier"
};

export function mapExternalDeviceTypeToInternal(rawDeviceType: unknown): ActuatorStateInput["deviceType"] {
  const raw = String(rawDeviceType ?? "").trim();
  const mapped = EXTERNAL_TO_INTERNAL_DEVICE_TYPE[raw];

  if (mapped) {
    return mapped;
  }

  logger.error("Unsupported actuator deviceType received", {
    receivedDeviceType: raw,
    supportedExternalTypes: ["MiniSplit", "AirExtractor", "HumidifierPurifier"],
    supportedInternalTypes: ["minisplit", "extractor", "purifier"]
  });

  throw new AppError("Unsupported actuator deviceType", 422, "ACTUATOR_DEVICE_TYPE_UNSUPPORTED", {
    receivedDeviceType: raw,
    supportedExternalTypes: ["MiniSplit", "AirExtractor", "HumidifierPurifier"],
    supportedInternalTypes: ["minisplit", "extractor", "purifier"]
  });
}

export function mapActuatorStatePayload(payload: Record<string, unknown>): ActuatorStateInput {
  return {
    emulatorId: String(payload.emulatorId ?? ""),
    roomId: payload.roomId ? String(payload.roomId) : undefined,
    deviceType: mapExternalDeviceTypeToInternal(payload.deviceType),
    isOn: Boolean(payload.isOn),
    mode: payload.mode ? String(payload.mode) : undefined,
    targetTemperature: payload.targetTemperature !== undefined ? Number(payload.targetTemperature) : undefined,
    ambientTemperature: payload.ambientTemperature !== undefined ? Number(payload.ambientTemperature) : undefined,
    ambientHumidity: payload.ambientHumidity !== undefined ? Number(payload.ambientHumidity) : undefined,
    timestamp: payload.timestamp ? String(payload.timestamp) : undefined
  };
}
