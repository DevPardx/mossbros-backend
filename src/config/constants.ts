import { RepairStatus } from "../enums";

export const REPAIR_ESTIMATION = {
    BASE_DAYS_PER_SERVICE: 1,

    COMPLEXITY_MULTIPLIERS: {
        ENGINE_REPAIR: 2,
        BASIC: 1,
    },

    COMPLEX_REPAIR_KEYWORDS: ["motor", "engine", "transmisión", "transmission", "caja"],
} as const;

export const JWT_CONFIG = {
    EXPIRATION: {
        DEFAULT: "7d",
        REMEMBER_ME: "30d",
        REFRESH: "90d",
    },

    COOKIE: {
        NAME: "_token",
        HTTP_ONLY: true,
        SECURE: process.env.NODE_ENV === "production",
        SAME_SITE: "strict" as const,
    },
} as const;

export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 15,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
} as const;

export const PASSWORD_CONFIG = {
    BCRYPT_ROUNDS: 12,
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
} as const;

export const DATABASE_CONFIG = {
    CONNECTION_POOL: {
        MAX: 20,
        MIN: 5,
        IDLE_TIMEOUT_MS: 30000,
        CONNECTION_TIMEOUT_MS: 2000,
    },
} as const;

export const RATE_LIMIT = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
    },

    AUTH: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5,
    },

    PASSWORD_RESET: {
        WINDOW_MS: 60 * 60 * 1000,
        MAX_REQUESTS: 3,
    },
} as const;

export const FILE_UPLOAD = {
    MAX_SIZE_MB: 5,
    ALLOWED_MIME_TYPES: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    ],
    UPLOAD_PATH: "./uploads",
} as const;

export const EMAIL_CONFIG = {
    FROM: {
        NAME: "MossBros Taller",
        EMAIL: "no-reply@mossbros.com",
    },
    TEMPLATES: {
        PASSWORD_RESET: "password-reset",
        REPAIR_COMPLETED: "repair-completed",
        REPAIR_READY: "repair-ready",
    },
} as const;

export const BUSINESS_RULES = {
    DELETABLE_STATUSES: [RepairStatus.PENDING, RepairStatus.CANCELLED] as const,

    NON_CANCELLABLE_STATUSES: [RepairStatus.COMPLETED, RepairStatus.READY_FOR_PICKUP] as const,

    NOTIFY_CUSTOMER_ON: [
        RepairStatus.READY_FOR_PICKUP,
        RepairStatus.COMPLETED,
        RepairStatus.WAITING_FOR_PARTS
    ] as const,
};

export const API_CONFIG = {
    VERSION: "v1",
    PREFIX: "/api",
    FULL_PREFIX: "/api/v1",
} as const;
