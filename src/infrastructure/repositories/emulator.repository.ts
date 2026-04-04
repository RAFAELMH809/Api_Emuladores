import { EmulatorModel } from "../database/models";

export class EmulatorRepository {
  async findByExternalId(externalId: string): Promise<EmulatorModel | null> {
    return EmulatorModel.findOne({ where: { emulatorExternalId: externalId } });
  }
}
