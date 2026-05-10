import logger from "./logger";
import config from "../config/db";

const requiredEnv = [
  { key: "DATABASE_URL", present: !!config.database_url },
  { key: "CLIENT_URL", present: !!config.client_url },
  { key: "ACCESS_SECRET", present: !!config.ACCESS_SECRET },
  { key: "REFRESH_TOKEN_SECRET", present: !!config.REFRESH_TOKEN_SECRET },
];

export function logEnvStatus() {
  requiredEnv.forEach((item) => {
    if (!item.present) {
      logger.warn(`Environment variable ${item.key} is missing or empty.`);
    } else {
      logger.info(`Environment variable ${item.key} is present.`);
    }
  });
}

export function hasCriticalEnvMissing() {
  return requiredEnv.some((item) => !item.present && item.key === "DATABASE_URL");
}

export default { logEnvStatus, hasCriticalEnvMissing };
