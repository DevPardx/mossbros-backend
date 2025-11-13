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
     * @openapi
     * /services:
     *   post:
     *     tags: [Services]
     *     summary: Create a new service
     *     description: Creates a new repair service in the system
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
     *                 description: Service name
     *               price:
     *                 type: number
     *                 format: float
     *                 minimum: 0.01
     *                 description: Service price (must be greater than 0)
     *           example:
     *             name: Oil Change
     *             price: 45.99
     *     responses:
     *       201:
     *         description: Service created successfully
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
     *                 price:
     *                   type: number
     *                   format: float
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 990e8400-e29b-41d4-a716-446655440004
     *               name: Oil Change
     *               price: 45.99
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
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        handleInputErrors,
        serviceController.create
    );

    /**
     * @openapi
     * /services:
     *   get:
     *     tags: [Services]
     *     summary: Get all services
     *     description: Retrieves a list of all repair services
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
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     *                   name:
     *                     type: string
     *                   price:
     *                     type: number
     *                     format: float
     *                   is_active:
     *                     type: boolean
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *             example:
     *               - id: 990e8400-e29b-41d4-a716-446655440004
     *                 name: Oil Change
     *                 price: 45.99
     *                 is_active: true
     *                 created_at: 2024-01-15T10:30:00Z
     *               - id: aa0e8400-e29b-41d4-a716-446655440005
     *                 name: Brake Replacement
     *                 price: 120.50
     *                 is_active: true
     *                 created_at: 2024-01-15T10:35:00Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/", serviceController.getAll);

    /**
     * @openapi
     * /services/{id}:
     *   get:
     *     tags: [Services]
     *     summary: Get service by ID
     *     description: Retrieves a specific service by its ID
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
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 price:
     *                   type: number
     *                   format: float
     *                 is_active:
     *                   type: boolean
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 990e8400-e29b-41d4-a716-446655440004
     *               name: Oil Change
     *               price: 45.99
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
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.getById
    );

    /**
     * @openapi
     * /services/{id}:
     *   put:
     *     tags: [Services]
     *     summary: Update a service
     *     description: Updates an existing repair service by its ID
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
     *                 description: Service name
     *               price:
     *                 type: number
     *                 format: float
     *                 minimum: 0.01
     *                 description: Service price (must be greater than 0)
     *               is_active:
     *                 type: boolean
     *                 description: Whether the service is active
     *           example:
     *             name: Oil Change Premium
     *             price: 59.99
     *             is_active: true
     *     responses:
     *       200:
     *         description: Service updated successfully
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
     *                 price:
     *                   type: number
     *                   format: float
     *                 is_active:
     *                   type: boolean
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 990e8400-e29b-41d4-a716-446655440004
     *               name: Oil Change Premium
     *               price: 59.99
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
        param("id").isUUID().withMessage("Service ID must be valid"),
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        serviceController.update
    );

    /**
     * @openapi
     * /services/{id}:
     *   delete:
     *     tags: [Services]
     *     summary: Delete a service
     *     description: Deletes a repair service by its ID
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
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Service deleted successfully
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
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.delete
    );

    return router;
};
