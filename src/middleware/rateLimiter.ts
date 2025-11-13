import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { RATE_LIMIT } from "../config/constants";
import logger from "../utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisClient = any;

export const createGeneralLimiter = (redisClient: RedisClient): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: RATE_LIMIT.GENERAL.WINDOW_MS,
        max: RATE_LIMIT.GENERAL.MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: "rl:general:",
        }),
        message: "Demasiadas solicitudes desde esta IP, por favor intente más tarde",
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                error: "Demasiadas solicitudes desde esta IP, por favor intente más tarde",
            });
        },
    });
};

export const createAuthLimiter = (redisClient: RedisClient): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: RATE_LIMIT.AUTH.WINDOW_MS,
        max: RATE_LIMIT.AUTH.MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: "rl:auth:",
        }),
        message: "Demasiados intentos de inicio de sesión, por favor intente más tarde",
        handler: (req, res) => {
            logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                error: "Demasiados intentos de inicio de sesión, por favor intente más tarde",
            });
        },
    });
};

export const createPasswordResetLimiter = (redisClient: RedisClient): RateLimitRequestHandler => {
    return rateLimit({
        windowMs: RATE_LIMIT.PASSWORD_RESET.WINDOW_MS,
        max: RATE_LIMIT.PASSWORD_RESET.MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix: "rl:password:",
        }),
        message: "Demasiadas solicitudes de restablecimiento de contraseña, por favor intente más tarde",
        handler: (req, res) => {
            logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({
                error: "Demasiadas solicitudes de restablecimiento de contraseña, por favor intente más tarde",
            });
        },
    });
};
