import { CycleRepository } from "../../infrastructure/repositories/cycle.repository";

export class MetricsQueryService {
  constructor(private readonly cycleRepository: CycleRepository) {}

  async current(roomId: string): Promise<unknown> {
    return this.cycleRepository.getLatestMeasurement(roomId);
  }

  async history(roomId: string, from?: string, to?: string): Promise<unknown[]> {
    return this.cycleRepository.getHistory(roomId, from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }
}
