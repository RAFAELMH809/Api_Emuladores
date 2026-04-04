import { Sequelize } from "sequelize";
import { env } from "../../shared/config/env";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  username: env.dbUser,
  password: env.dbPassword,
  logging: env.dbLogging,
  dialectOptions: env.dbSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: env.dbSslRejectUnauthorized
        }
      }
    : undefined
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
