import { createApp } from "./app";
import { env } from "./shared/config/env";
import { logger } from "./shared/config/logger";
import { connectDatabase } from "./infrastructure/database/sequelize";
import { initModelAssociations } from "./infrastructure/database/models";
import { syncModels } from "./infrastructure/database/sync";
import { mqttGateway } from "./infrastructure/mqtt/mqtt.gateway";
import { container } from "./application/container";
import { mapTelemetryPayload } from "./infrastructure/mappers/telemetry.mapper";
import { mapActuatorStatePayload } from "./infrastructure/mappers/actuator-state.mapper";

export async function startServer(): Promise<void> {
  try {
    await connectDatabase();
    initModelAssociations();
    await syncModels();

    mqttGateway.onTelemetry(async (message) => {
      try {
        const payload = mapTelemetryPayload({ ...message.payload, emulatorId: message.emulatorId });
        await container.telemetryIngestionService.handleIncomingTelemetry(payload, "mqtt");
      } catch (error: unknown) {
        logger.error("Telemetry ingestion from MQTT failed", error);
      }
    });

    mqttGateway.onActuatorState(async (message) => {
      try {
        const payload = mapActuatorStatePayload({ ...message.payload, emulatorId: message.emulatorId });
        await container.actuatorStateIngestionService.handleIncomingState(payload, "mqtt");
      } catch (error: unknown) {
        logger.error("Actuator state ingestion from MQTT failed", error);
      }
    });

    await mqttGateway.connect();

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`SafeAir API listening on port ${env.port}`);
    });
  } catch (error: unknown) {
    logger.error("Fatal startup error", error);
    process.exit(1);
  }
}
