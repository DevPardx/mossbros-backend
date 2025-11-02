import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate } from "../middleware/auth";
import { handleInputErrors } from "../middleware/validation";
import { ServiceController } from "../controllers/service.controller";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createServiceRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const serviceController = new ServiceController(container.serviceService);

    router.use(authenticate);

    /**
     * @swagger
     * /api/v1/services:
     *   post:
     *     tags: [Services]
     *     summary: Create a new service
     *     description: Create a new repair service
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
     *               - price
     *             properties:
     *               name:
     *                 type: string
     *                 example: Cambio de aceite
     *               price:
     *                 type: number
     *                 format: decimal
     *                 minimum: 0.01
     *                 example: 25.50
     *     responses:
     *       201:
     *         description: Service created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Service created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.post("/",
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        handleInputErrors,
        serviceController.create
    );

    /**
     * @swagger
     * /api/v1/services:
     *   get:
     *     tags: [Services]
     *     summary: Get all services
     *     description: Retrieve a list of all repair services
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of services retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Service'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/", serviceController.getAll);

    /**
     * @swagger
     * /api/v1/services/{id}:
     *   get:
     *     tags: [Services]
     *     summary: Get service by ID
     *     description: Retrieve a specific service by its ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Service ID
     *     responses:
     *       200:
     *         description: Service retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Service'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.getById
    );

    /**
     * @swagger
     * /api/v1/services/{id}:
     *   put:
     *     tags: [Services]
     *     summary: Update service
     *     description: Update an existing repair service
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Service ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - price
     *               - is_active
     *             properties:
     *               name:
     *                 type: string
     *                 example: Cambio de aceite
     *               price:
     *                 type: number
     *                 format: decimal
     *                 minimum: 0.01
     *                 example: 25.50
     *               is_active:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       200:
     *         description: Service updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Service updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.put("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        serviceController.update
    );

    /**
     * @swagger
     * /api/v1/services/{id}:
     *   delete:
     *     tags: [Services]
     *     summary: Delete service
     *     description: Delete a repair service by ID
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Service ID
     *     responses:
     *       200:
     *         description: Service deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Service deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.delete("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.delete
    );

    return router;
};
