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
     * @swagger
     * /api/v1/brands:
     *   post:
     *     tags: [Brands]
     *     summary: Create a new brand
     *     description: Create a new motorcycle brand
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
     *                 example: Honda
     *               logo_url:
     *                 type: string
     *                 format: uri
     *                 example: https://example.com/logo.png
     *     responses:
     *       201:
     *         description: Brand created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Brand created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
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
     * @swagger
     * /api/v1/brands:
     *   get:
     *     tags: [Brands]
     *     summary: Get all brands
     *     description: Retrieve a list of all motorcycle brands
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
     *                 $ref: '#/components/schemas/Brand'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/", brandController.getAll);

    /**
     * @swagger
     * /api/v1/brands/{id}:
     *   get:
     *     tags: [Brands]
     *     summary: Get brand by ID
     *     description: Retrieve a specific brand by its ID
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
     *               $ref: '#/components/schemas/Brand'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:id",
        param("id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        brandController.getById
    );

    /**
     * @swagger
     * /api/v1/brands/{id}:
     *   put:
     *     tags: [Brands]
     *     summary: Update brand
     *     description: Update an existing motorcycle brand
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
     *                 example: Honda
     *               logo_url:
     *                 type: string
     *                 format: uri
     *                 example: https://example.com/logo.png
     *               is_active:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       200:
     *         description: Brand updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Brand updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
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
     * @swagger
     * /api/v1/brands/{id}:
     *   delete:
     *     tags: [Brands]
     *     summary: Delete brand
     *     description: Delete a motorcycle brand by ID
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
     *               type: string
     *               example: Brand deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.delete("/:id",
        param("id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        brandController.delete
    );

    return router;
};
