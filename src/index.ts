import colors from "colors";
import server from "./server";
import { client } from "./config/redis";

const PORT = process.env.PORT || 4000;

const main = async () => {
  await client.connect();
  server.listen(PORT, () => {
    console.log(colors.cyan.bold(`Server is running on port ${PORT}`));
  });
};

main();