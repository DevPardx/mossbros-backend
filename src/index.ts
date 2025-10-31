import colors from "colors";
import { validateEnv, env } from "./config/env";
import server from "./server";
import { client } from "./config/redis";

validateEnv();

const PORT = env.PORT || 4000;

const main = async () => {
  try {
    await client.connect();
    console.log(colors.green.bold("Redis connected successfully"));

    server.listen(PORT, () => {
      console.log(colors.cyan.bold(`\n🚀 Server is running on port ${PORT}`));
      console.log(colors.cyan(`   Environment: ${env.NODE_ENV}`));
      console.log(colors.cyan(`   Frontend URL: ${env.FRONTEND_URL}\n`));
    });
  } catch (error) {
    console.error(colors.red.bold("Failed to start server:"), error);
    process.exit(1);
  }
};

main();