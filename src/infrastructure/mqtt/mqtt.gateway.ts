import mqtt, { type MqttClient } from "mqtt";
import { env } from "../../shared/config/env";
import { logger } from "../../shared/config/logger";
import { decodeMqttPayload } from "./payload-codec";

type TelemetryMessage = {
  topic: string;
  emulatorId: string;
  payload: Record<string, unknown>;
};

type ActuatorStateMessage = {
  topic: string;
  emulatorId: string;
  payload: Record<string, unknown>;
};

type TelemetryHandler = (message: TelemetryMessage) => Promise<void>;
type ActuatorStateHandler = (message: ActuatorStateMessage) => Promise<void>;

class MqttGateway {
  private client: MqttClient | null = null;
  private telemetryHandler: TelemetryHandler | null = null;
  private actuatorStateHandler: ActuatorStateHandler | null = null;

  async connect(): Promise<void> {
    if (this.client) {
      return;
    }

    this.client = mqtt.connect(env.mqttUrl, {
      username: env.mqttUsername,
      password: env.mqttPassword,
      clientId: env.mqttClientId,
      reconnectPeriod: 3000
    });

    this.client.on("connect", () => {
      logger.info("MQTT connected");
      this.client?.subscribe(env.mqttTelemetryTopic, { qos: env.mqttQos as 0 | 1 | 2 }, (error) => {
        if (error) {
          logger.error("MQTT subscription error", error);
        }
      });

      this.client?.subscribe(env.mqttActuatorStateTopic, { qos: env.mqttQos as 0 | 1 | 2 }, (error) => {
        if (error) {
          logger.error("MQTT actuator state subscription error", error);
        }
      });
    });

    this.client.on("message", (topic, buffer) => {
      void this.handleIncomingMessage(topic, buffer);
    });

    this.client.on("error", (error) => {
      logger.error("MQTT client error", error);
    });
  }

  onTelemetry(handler: TelemetryHandler): void {
    // MQTT gateway only transports messages and delegates business logic externally.
    this.telemetryHandler = handler;
  }

  onActuatorState(handler: ActuatorStateHandler): void {
    this.actuatorStateHandler = handler;
  }

  publish(topic: string, payload: unknown): Promise<void> {
    if (!this.client) {
      return Promise.reject(new Error("MQTT is not connected"));
    }

    return new Promise((resolve, reject) => {
      this.client?.publish(topic, JSON.stringify(payload), { qos: env.mqttQos as 0 | 1 | 2 }, (error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  private async handleIncomingMessage(topic: string, payloadRaw: Buffer): Promise<void> {
    try {
      const payload = decodeMqttPayload(topic, payloadRaw);

      const telemetryEmulatorId = this.extractEmulatorId(topic, "telemetry");
      if (telemetryEmulatorId && this.telemetryHandler) {
        await this.telemetryHandler({ topic, emulatorId: telemetryEmulatorId, payload });
        return;
      }

      const actuatorStateEmulatorId = this.extractEmulatorId(topic, "actuator-state");
      if (actuatorStateEmulatorId && this.actuatorStateHandler) {
        await this.actuatorStateHandler({ topic, emulatorId: actuatorStateEmulatorId, payload });
      }
    } catch (error: unknown) {
      logger.error("MQTT message handling error", error);
    }
  }

  private extractEmulatorId(topic: string, suffix: string): string | null {
    const parts = topic.split("/");
    if (parts.length < 3 || parts[0] !== "safeair" || parts[2] !== suffix) {
      return null;
    }

    return parts[1] ?? null;
  }
}

export const mqttGateway = new MqttGateway();
