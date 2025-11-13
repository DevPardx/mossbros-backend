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
     * @openapi
     * /models:
     *   post:
     *     tags: [Models]
     *     summary: Create a new model
     *     description: Creates a new motorcycle model associated with a brand
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
     *                 description: Model name
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 description: ID of the brand this model belongs to
     *           example:
     *             name: CBR 600RR
     *             brand_id: 550e8400-e29b-41d4-a716-446655440000
     *     responses:
     *       201:
     *         description: Model created successfully
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
     *                 brand_id:
     *                   type: string
     *                   format: uuid
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 770e8400-e29b-41d4-a716-446655440002
     *               name: CBR 600RR
     *               brand_id: 550e8400-e29b-41d4-a716-446655440000
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
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        modelController.create
    );

    /**
     * @openapi
     * /models/{brand_id}:
     *   get:
     *     tags: [Models]
     *     summary: Get all models for a brand
     *     description: Retrieves all motorcycle models for a specific brand
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
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     *                   name:
     *                     type: string
     *                   brand_id:
     *                     type: string
     *                     format: uuid
     *                   is_active:
     *                     type: boolean
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *             example:
     *               - id: 770e8400-e29b-41d4-a716-446655440002
     *                 name: CBR 600RR
     *                 brand_id: 550e8400-e29b-41d4-a716-446655440000
     *                 is_active: true
     *                 created_at: 2024-01-15T10:30:00Z
     *               - id: 880e8400-e29b-41d4-a716-446655440003
     *                 name: CBR 1000RR
     *                 brand_id: 550e8400-e29b-41d4-a716-446655440000
     *                 is_active: true
     *                 created_at: 2024-01-15T10:35:00Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/:brand_id", modelController.getAll);

    /**
     * @openapi
     * /models/{brand_id}/{id}:
     *   get:
     *     tags: [Models]
     *     summary: Get model by ID
     *     description: Retrieves a specific model by its ID and brand ID
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
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 brand_id:
     *                   type: string
     *                   format: uuid
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 770e8400-e29b-41d4-a716-446655440002
     *               name: CBR 600RR
     *               brand_id: 550e8400-e29b-41d4-a716-446655440000
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
    router.get("/:brand_id/:id",
        param("brand_id").isUUID().withMessage("Brand ID must be valid"),
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.getById
    );

    /**
     * @openapi
     * /models/{id}:
     *   put:
     *     tags: [Models]
     *     summary: Update a model
     *     description: Updates an existing motorcycle model by its ID
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
     *                 description: Model name
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 description: ID of the brand this model belongs to
     *               is_active:
     *                 type: boolean
     *                 description: Whether the model is active
     *           example:
     *             name: CBR 600RR Sport
     *             brand_id: 550e8400-e29b-41d4-a716-446655440000
     *             is_active: true
     *     responses:
     *       200:
     *         description: Model updated successfully
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
     *                 brand_id:
     *                   type: string
     *                   format: uuid
     *                 is_active:
     *                   type: boolean
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 770e8400-e29b-41d4-a716-446655440002
     *               name: CBR 600RR Sport
     *               brand_id: 550e8400-e29b-41d4-a716-446655440000
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
        param("id").isUUID().withMessage("Model ID must be valid"),
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        modelController.update
    );

    /**
     * @openapi
     * /models/{id}:
     *   delete:
     *     tags: [Models]
     *     summary: Delete a model
     *     description: Deletes a motorcycle model by its ID
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
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Model deleted successfully
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
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.delete
    );

    return router;
};
