import { z } from "zod";
import { AppError } from "../../shared/errors/app-error";
import { EmulatorRepository } from "../../infrastructure/repositories/emulator.repository";
import { DeviceStateRepository } from "../../infrastructure/repositories/device-state.repository";
import type { ActuatorStateInput } from "../../domain/types/actuator.types";

const actuatorStateSchema = z.object({
  emulatorId: z.string().min(1),
  roomId: z.string().uuid().optional(),
  deviceType: z.enum(["minisplit", "purifier", "extractor"]),
  isOn: z.boolean(),
  mode: z.string().optional(),
  targetTemperature: z.number().optional(),
  ambientTemperature: z.number().optional(),
  ambientHumidity: z.number().optional(),
  timestamp: z.string().optional()
});

export class ActuatorStateIngestionService {
  constructor(
    private readonly emulatorRepository: EmulatorRepository,
    private readonly deviceStateRepository: DeviceStateRepository
  ) {}

  async handleIncomingState(rawState: ActuatorStateInput, source: "mqtt" | "rest"): Promise<void> {
    const parsed = actuatorStateSchema.safeParse(rawState);
    if (!parsed.success) {
      throw new AppError("Invalid actuator state payload", 422, "ACTUATOR_STATE_VALIDATION_ERROR", parsed.error.format());
    }

    const state = parsed.data;
    const emulator = await this.emulatorRepository.findByExternalId(state.emulatorId);

    if (!emulator) {
      throw new AppError("Unknown emulator", 404, "EMULATOR_NOT_FOUND");
    }

    const roomId = state.roomId ?? emulator.roomId;
    const reportedAt = state.timestamp ? new Date(state.timestamp) : new Date();

    await this.deviceStateRepository.upsertLatest({
      roomId,
      emulatorId: state.emulatorId,
      deviceType: state.deviceType,
      isOn: state.isOn,
      mode: state.mode,
      targetTemperature: state.targetTemperature,
      ambientTemperature: state.ambientTemperature,
      ambientHumidity: state.ambientHumidity,
      reportedAt,
      source,
      payload: state as unknown as Record<string, unknown>
    });
  }
}
