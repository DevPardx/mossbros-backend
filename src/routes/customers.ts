import { Router } from "express";
import { body, param } from "express-validator";
import { CustomerController } from "../controllers/customer.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createCustomerRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const customerController = new CustomerController(container.customerService);

    router.use(authenticate);

    /**
     * @swagger
     * /api/v1/customers:
     *   post:
     *     tags: [Customers]
     *     summary: Create a new customer with motorcycle
     *     description: Create a new customer along with their motorcycle information
     *     security:
     *       - cookieAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - customer_name
     *               - customer_phone
     *               - motorcycle_plate
     *               - brand_id
     *               - model_id
     *             properties:
     *               customer_name:
     *                 type: string
     *                 example: Juan Pérez
     *               customer_phone:
     *                 type: string
     *                 minLength: 14
     *                 maxLength: 14
     *                 example: +503 7123-4567
     *               customer_email:
     *                 type: string
     *                 format: email
     *                 example: juan.perez@example.com
     *               motorcycle_plate:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 10
     *                 example: M123456
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               model_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440001
     *     responses:
     *       201:
     *         description: Customer created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Customer created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
router.post("/",
    body("customer_name").notEmpty().withMessage("Customer name is required")
        .isString().withMessage("Customer name not valid"),
    body("customer_phone").notEmpty().withMessage("Phone number is required")
        .isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
    body("customer_email").optional().isEmail().withMessage("Email must be valid"),
    body("motorcycle_plate").notEmpty().withMessage("Motorcycle plate is required")
        .isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
    body("brand_id").isUUID().withMessage("Brand ID must be valid"),
    body("model_id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    customerController.create
);

    /**
     * @swagger
     * /api/v1/customers/search:
     *   get:
     *     tags: [Customers]
     *     summary: Search customers
     *     description: Search customers by name or motorcycle plate
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         description: Search query (customer name or motorcycle plate)
     *         example: Juan
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 15
     *         description: Items per page
     *     responses:
     *       200:
     *         description: Search results retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginatedResponse'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/search", customerController.search);

    /**
     * @swagger
     * /api/v1/customers:
     *   get:
     *     tags: [Customers]
     *     summary: Get all customers
     *     description: Retrieve a paginated list of all customers with their motorcycles
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 15
     *         description: Items per page
     *     responses:
     *       200:
     *         description: List of customers retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PaginatedResponse'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/", customerController.getAll);

    /**
     * @swagger
     * /api/v1/customers/{id}:
     *   get:
     *     tags: [Customers]
     *     summary: Get customer by ID
     *     description: Retrieve a specific customer with their motorcycle information
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Customer ID
     *     responses:
     *       200:
     *         description: Customer retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Customer'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:id",
        param("id").isUUID().withMessage("Customer ID must be valid"),
        handleInputErrors,
        customerController.getById
    );

    /**
     * @swagger
     * /api/v1/customers/{id}:
     *   put:
     *     tags: [Customers]
     *     summary: Update customer
     *     description: Update customer and motorcycle information
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Customer ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - customer_name
     *               - customer_phone
     *               - customer_email
     *               - motorcycle_plate
     *               - brand_id
     *               - model_id
     *             properties:
     *               customer_name:
     *                 type: string
     *                 example: Juan Pérez
     *               customer_phone:
     *                 type: string
     *                 minLength: 14
     *                 maxLength: 14
     *                 example: +503 7123-4567
     *               customer_email:
     *                 type: string
     *                 format: email
     *                 example: juan.perez@example.com
     *               motorcycle_plate:
     *                 type: string
     *                 minLength: 6
     *                 maxLength: 10
     *                 example: M123456
     *               brand_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               model_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440001
     *     responses:
     *       200:
     *         description: Customer updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Customer updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.put("/:id",
        param("id").isUUID().withMessage("Customer ID must be valid"),
        body("customer_name").notEmpty().withMessage("Customer name is required")
            .isString().withMessage("Customer name not valid"),
        body("customer_phone").isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
        body("customer_email").isEmail().withMessage("Email must be valid"),
        body("motorcycle_plate").isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        body("model_id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        customerController.update
    );

    /**
     * @swagger
     * /api/v1/customers/{id}:
     *   delete:
     *     tags: [Customers]
     *     summary: Delete customer
     *     description: Delete a customer and their motorcycle
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Customer ID
     *     responses:
     *       200:
     *         description: Customer deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Customer deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.delete("/:id",
        param("id").isUUID().withMessage("Customer ID must be valid"),
        handleInputErrors,
        customerController.delete
    );

    return router;
};
