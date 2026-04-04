import { DeviceActionModel } from "../database/models";

export class DeviceActionRepository {
  async create(data: {
    roomId: string;
    cycleId: string;
    deviceType: "minisplit" | "purifier" | "extractor";
    action: string;
    reason: string;
    level?: "low" | "medium" | "high";
    requestedBy?: "rule-engine" | "manual";
  }): Promise<DeviceActionModel> {
    return DeviceActionModel.create({
      ...data,
      level: data.level ?? null,
      requestedBy: data.requestedBy ?? "rule-engine",
      executedAt: new Date()
    });
  }

  async historyByRoom(roomId: string): Promise<DeviceActionModel[]> {
    return DeviceActionModel.findAll({ where: { roomId }, order: [["executedAt", "DESC"]], limit: 500 });
  }

  async countRecentActiveWithoutImprovement(roomId: string, cycles: number): Promise<number> {
    const actions = await DeviceActionModel.findAll({ where: { roomId }, order: [["createdAt", "DESC"]], limit: cycles });
    return actions.length;
  }
}
