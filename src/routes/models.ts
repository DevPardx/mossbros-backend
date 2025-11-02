import { Router } from "express";
import { body, param } from "express-validator";
import { ModelController } from "../controllers/model.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createModelRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const modelController = new ModelController(container.modelService);

    router.use(authenticate);

    /**
     * @swagger
     * /api/v1/models:
     *   post:
     *     tags: [Models]
     *     summary: Create a new model
     *     description: Create a new motorcycle model
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
     *               - brand_id
     *             properties:
     *               name:
     *                 type: string
     *                 example: CBR 600RR
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       201:
     *         description: Model created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Model created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.post("/",
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        modelController.create
    );

    /**
     * @swagger
     * /api/v1/models/{brand_id}:
     *   get:
     *     tags: [Models]
     *     summary: Get all models for a brand
     *     description: Retrieve all motorcycle models for a specific brand
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: brand_id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Brand ID
     *     responses:
     *       200:
     *         description: List of models retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Model'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/:brand_id", modelController.getAll);

    /**
     * @swagger
     * /api/v1/models/{brand_id}/{id}:
     *   get:
     *     tags: [Models]
     *     summary: Get model by ID
     *     description: Retrieve a specific model by its ID and brand ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: brand_id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Brand ID
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Model ID
     *     responses:
     *       200:
     *         description: Model retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Model'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:brand_id/:id",
        param("brand_id").isUUID().withMessage("Brand ID must be valid"),
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.getById
    );

    /**
     * @swagger
     * /api/v1/models/{id}:
     *   put:
     *     tags: [Models]
     *     summary: Update model
     *     description: Update an existing motorcycle model
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Model ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - brand_id
     *               - is_active
     *             properties:
     *               name:
     *                 type: string
     *                 example: CBR 600RR
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               is_active:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       200:
     *         description: Model updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Model updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.put("/:id",
        param("id").isUUID().withMessage("Model ID must be valid"),
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        modelController.update
    );

    /**
     * @swagger
     * /api/v1/models/{id}:
     *   delete:
     *     tags: [Models]
     *     summary: Delete model
     *     description: Delete a motorcycle model by ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Model ID
     *     responses:
     *       200:
     *         description: Model deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Model deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.delete("/:id",
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.delete
    );

    return router;
};
