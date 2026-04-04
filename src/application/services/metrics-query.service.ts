import { CycleRepository } from "../../infrastructure/repositories/cycle.repository";
import { DeviceActionRepository } from "../../infrastructure/repositories/device-action.repository";

export class MetricsQueryService {
  constructor(
    private readonly cycleRepository: CycleRepository,
    private readonly deviceActionRepository: DeviceActionRepository
  ) {}

  async current(roomId: string): Promise<unknown> {
    return this.cycleRepository.getLatestMeasurement(roomId);
  }

  async history(roomId: string, from?: string, to?: string): Promise<unknown[]> {
    return this.cycleRepository.getHistory(roomId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  async actuatorState(roomId: string): Promise<unknown> {
    const latestMeasurement = await this.cycleRepository.getLatestMeasurement(roomId);
    const latestActions = await this.deviceActionRepository.latestByRoomAndType(roomId);

    const mapState = (actionName?: string): boolean | null => {
      if (!actionName) {
        return null;
      }

      if (actionName.endsWith("_on")) {
        return true;
      }

      if (actionName.endsWith("_off")) {
        return false;
      }

      return null;
    };

    return {
      roomId,
      measuredAt: latestMeasurement?.measuredAt ?? null,
      receivedAt: latestMeasurement?.receivedAt ?? null,
      metrics: latestMeasurement
        ? {
            temperature: latestMeasurement.temperature,
            humidity: latestMeasurement.humidity,
            co2: latestMeasurement.co2,
            pm25: latestMeasurement.pm25
          }
        : null,
      actuators: {
        minisplit: {
          isOn: mapState(latestActions.minisplit?.action),
          lastAction: latestActions.minisplit?.action ?? null,
          level: latestActions.minisplit?.level ?? null,
          updatedAt: latestActions.minisplit?.executedAt ?? null
        },
        purifier: {
          isOn: mapState(latestActions.purifier?.action),
          lastAction: latestActions.purifier?.action ?? null,
          level: latestActions.purifier?.level ?? null,
          updatedAt: latestActions.purifier?.executedAt ?? null
        },
        extractor: {
          isOn: mapState(latestActions.extractor?.action),
          lastAction: latestActions.extractor?.action ?? null,
          level: latestActions.extractor?.level ?? null,
          updatedAt: latestActions.extractor?.executedAt ?? null
        }
      }
    };
  }
}
