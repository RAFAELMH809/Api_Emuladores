import assert from "node:assert/strict";
import { mapActuatorStatePayload, mapExternalDeviceTypeToInternal } from "./actuator-state.mapper";
import { AppError } from "../../shared/errors/app-error";

function run(): void {
  assert.equal(mapExternalDeviceTypeToInternal("MiniSplit"), "minisplit");
  assert.equal(mapExternalDeviceTypeToInternal("AirExtractor"), "extractor");
  assert.equal(mapExternalDeviceTypeToInternal("HumidifierPurifier"), "purifier");
  assert.equal(mapExternalDeviceTypeToInternal("minisplit"), "minisplit");

  const mapped = mapActuatorStatePayload({
    emulatorId: "EMU-0001",
    deviceType: "AirExtractor",
    isOn: true,
    ambientTemperature: 24.2,
    ambientHumidity: 48.1
  });

  assert.equal(mapped.emulatorId, "EMU-0001");
  assert.equal(mapped.deviceType, "extractor");
  assert.equal(mapped.isOn, true);

  let thrown: unknown;
  try {
    mapExternalDeviceTypeToInternal("UnknownDevice");
  } catch (error) {
    thrown = error;
  }

  assert.ok(thrown instanceof AppError);
  const appError = thrown as AppError;
  assert.equal(appError.code, "ACTUATOR_DEVICE_TYPE_UNSUPPORTED");

  // eslint-disable-next-line no-console
  console.log("actuator-state mapper tests passed");
}

run();
