import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { env } from "./env";
import logger from "../utils/logger";

export const initializeSentry = () => {
    if (env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.SENTRY_ENVIRONMENT || env.NODE_ENV,
            integrations: [
                nodeProfilingIntegration(),
            ],
            tracesSampleRate: 1.0,
            profilesSampleRate: 1.0,
            beforeSend(event, hint) {
                if (env.NODE_ENV === "development") {
                    console.error(hint.originalException || hint.syntheticException);
                    return null;
                }
                return event;
            },
        });

        logger.info("Sentry initialized for error tracking");
    } else {
        logger.info("Sentry not initialized (development mode or SENTRY_DSN not set)");
    }
};

export default Sentry;
