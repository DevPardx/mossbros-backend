import type { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const whitelist = [process.env.FRONTEND_URL];

    if(process.env.NODE_ENV === "development") {
      whitelist.push(undefined);
      if (origin && origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }
    }

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
