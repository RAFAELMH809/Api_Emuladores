import { Sequelize } from "sequelize";
import { env } from "../../shared/config/env";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  username: env.dbUser,
  password: env.dbPassword,
  logging: env.dbLogging
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
