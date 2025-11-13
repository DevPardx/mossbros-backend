import { Router } from "express";
import { body, param } from "express-validator";
import { BrandController } from "../controllers/brand.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createBrandRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const brandController = new BrandController(container.brandService);

    router.use(authenticate);

    /**
     * @openapi
     * /brands:
     *   post:
     *     tags: [Brands]
     *     summary: Create a new brand
     *     description: Creates a new motorcycle brand in the system
     *     security:
     *       - cookieAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - logo_url
     *             properties:
     *               name:
     *                 type: string
     *                 description: Brand name (letters and spaces only)
     *               logo_url:
     *                 type: string
     *                 format: uri
     *                 description: URL to the brand logo (HTTP or HTTPS)
     *           example:
     *             name: Honda
     *             logo_url: https://example.com/logos/honda.png
     *     responses:
     *       201:
     *         description: Brand created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 logo_url:
     *                   type: string
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 550e8400-e29b-41d4-a716-446655440000
     *               name: Honda
     *               logo_url: https://example.com/logos/honda.png
     *               is_active: true
     *               created_at: 2024-01-15T10:30:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.post("/",
        body("name").notEmpty().withMessage("Brand name is required")
            .isAlpha("es-ES", { ignore: " " }).withMessage("Brand name must contain only letters and spaces"),
        body("logo_url").notEmpty().withMessage("Logo URL is required").isURL({
            protocols: ["http", "https"],
            require_protocol: true,
            allow_underscores: true
        }).withMessage("Logo URL must be a valid HTTP or HTTPS URL"),
        handleInputErrors,
        brandController.create
    );

    /**
     * @openapi
     * /brands:
     *   get:
     *     tags: [Brands]
     *     summary: Get all brands
     *     description: Retrieves a list of all motorcycle brands
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of brands retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     *                   name:
     *                     type: string
     *                   logo_url:
     *                     type: string
     *                   is_active:
     *                     type: boolean
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *             example:
     *               - id: 550e8400-e29b-41d4-a716-446655440000
     *                 name: Honda
     *                 logo_url: https://example.com/logos/honda.png
     *                 is_active: true
     *                 created_at: 2024-01-15T10:30:00Z
     *               - id: 660e8400-e29b-41d4-a716-446655440001
     *                 name: Yamaha
     *                 logo_url: https://example.com/logos/yamaha.png
     *                 is_active: true
     *                 created_at: 2024-01-15T10:35:00Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/", brandController.getAll);

    /**
     * @openapi
     * /brands/{id}:
     *   get:
     *     tags: [Brands]
     *     summary: Get brand by ID
     *     description: Retrieves a specific brand by its ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Brand ID
     *     responses:
     *       200:
     *         description: Brand retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 logo_url:
     *                   type: string
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 550e8400-e29b-41d4-a716-446655440000
     *               name: Honda
     *               logo_url: https://example.com/logos/honda.png
     *               is_active: true
     *               created_at: 2024-01-15T10:30:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/:id",
        param("id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        brandController.getById
    );

    /**
     * @openapi
     * /brands/{id}:
     *   put:
     *     tags: [Brands]
     *     summary: Update a brand
     *     description: Updates an existing brand by its ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Brand ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - logo_url
     *               - is_active
     *             properties:
     *               name:
     *                 type: string
     *                 description: Brand name (letters and spaces only)
     *               logo_url:
     *                 type: string
     *                 format: uri
     *                 description: URL to the brand logo (HTTP or HTTPS)
     *               is_active:
     *                 type: boolean
     *                 description: Whether the brand is active
     *           example:
     *             name: Honda
     *             logo_url: https://example.com/logos/honda-updated.png
     *             is_active: true
     *     responses:
     *       200:
     *         description: Brand updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 logo_url:
     *                   type: string
     *                 is_active:
     *                   type: boolean
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 550e8400-e29b-41d4-a716-446655440000
     *               name: Honda
     *               logo_url: https://example.com/logos/honda-updated.png
     *               is_active: true
     *               updated_at: 2024-01-16T14:20:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.put("/:id",
        param("id").isUUID().withMessage("Brand ID must be valid"),
        body("name").notEmpty().withMessage("Brand name is required")
            .isAlpha("es-ES", { ignore: " " }).withMessage("Brand name must contain only letters and spaces"),
        body("logo_url").notEmpty().withMessage("Logo URL is required").isURL({
            protocols: ["http", "https"],
            require_protocol: true,
            allow_underscores: true
        }).withMessage("Logo URL must be a valid HTTP or HTTPS URL"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        brandController.update
    );

    /**
     * @openapi
     * /brands/{id}:
     *   delete:
     *     tags: [Brands]
     *     summary: Delete a brand
     *     description: Deletes a brand by its ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Brand ID
     *     responses:
     *       200:
     *         description: Brand deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Brand deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.delete("/:id",
        param("id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        brandController.delete
    );

    return router;
};
