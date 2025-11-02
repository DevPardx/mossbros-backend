import { validateEnv, env } from "./config/env";
import server, { initializeRateLimiters } from "./server";
import { client } from "./config/redis";
import logger from "./utils/logger";

validateEnv();

const PORT = env.PORT || 4000;

const main = async () => {
  try {
    await client.connect();

    // Initialize rate limiters after Redis connects
    initializeRateLimiters(client);

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Frontend URL: ${env.FRONTEND_URL}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

main();