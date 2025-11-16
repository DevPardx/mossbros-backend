import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { env } from "./env";

const isProduction = env.NODE_ENV === "production";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MossBros API",
            version: "1.0.0",
            description: "MossBros API REST Docs",
            contact: {
                name: "Taller MossBros",
                email: "no-reply@mossbros.com",
            },
        },
        servers: [
            {
                url: env.NODE_ENV === "production"
                    ? "https://api.mossbrossv.com/api/v1"
                    : `http://localhost:${env.PORT || 4000}/api/v1`,
                description: env.NODE_ENV === "production" ? "Production server" : "Development server",
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "_token",
                    description: "JWT token stored in HTTP-only cookie",
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            description: "Error message",
                        },
                    },
                },
                Brand: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        logo_url: { type: "string", format: "uri" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                Model: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        brand_id: { type: "string", format: "uuid" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                Service: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        price: { type: "number", format: "decimal" },
                        is_active: { type: "boolean" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                Customer: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string" },
                        motorcycle: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                plate: { type: "string" },
                                brand: { $ref: "#/components/schemas/Brand" },
                                model: { $ref: "#/components/schemas/Model" },
                            },
                        },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                RepairJob: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        motorcycle_id: { type: "string", format: "uuid" },
                        status: {
                            type: "string",
                            enum: ["PENDING", "IN_REPAIR", "WAITING_FOR_PARTS", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"],
                        },
                        notes: { type: "string" },
                        estimated_completion: { type: "string", format: "date-time" },
                        total_cost: { type: "number", format: "decimal" },
                        started_at: { type: "string", format: "date-time", nullable: true },
                        completed_at: { type: "string", format: "date-time", nullable: true },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                    },
                },
                PaginatedResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: "array",
                            items: { type: "object" },
                        },
                        total: { type: "integer" },
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        totalPages: { type: "integer" },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: "Authentication required",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                            example: { error: "No autenticado" },
                        },
                    },
                },
                NotFoundError: {
                    description: "Resource not found",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                            example: { error: "Recurso no encontrado" },
                        },
                    },
                },
                BadRequestError: {
                    description: "Invalid request data",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                            example: { error: "Datos de solicitud inválidos" },
                        },
                    },
                },
                RateLimitError: {
                    description: "Too many requests",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                            example: { error: "Demasiadas solicitudes desde esta IP, por favor intente más tarde" },
                        },
                    },
                },
                InternalServerError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Error" },
                            example: { error: "Error interno del servidor" },
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: "Authentication",
                description: "Authentication and authorization endpoints",
            },
            {
                name: "Brands",
                description: "Motorcycle brand management",
            },
            {
                name: "Models",
                description: "Motorcycle model management",
            },
            {
                name: "Services",
                description: "Repair service catalog management",
            },
            {
                name: "Customers",
                description: "Customer and motorcycle management",
            },
            {
                name: "Repair Jobs",
                description: "Repair job workflow management",
            },
        ],
    },
    apis: isProduction
        ? [
            path.join(__dirname, "../routes/auth.js"),
            path.join(__dirname, "../routes/brands.js"),
            path.join(__dirname, "../routes/customers.js"),
            path.join(__dirname, "../routes/models.js"),
            path.join(__dirname, "../routes/repairJobs.js"),
            path.join(__dirname, "../routes/services.js"),
        ]
        : [path.join(process.cwd(), "src/routes/*.ts")],
};

// Log the path being used for debugging
console.log("[Swagger] Environment:", env.NODE_ENV);
console.log("[Swagger] __dirname:", __dirname);
console.log("[Swagger] APIs to scan:", options.apis);

export const swaggerSpec = swaggerJsdoc(options);

// Log number of paths found
const paths = (swaggerSpec as Record<string, unknown>).paths || {};
console.log("[Swagger] Total paths found:", Object.keys(paths as object).length);
if (Object.keys(paths as object).length > 0) {
    console.log("[Swagger] Sample paths:", Object.keys(paths as object).slice(0, 5));
}
