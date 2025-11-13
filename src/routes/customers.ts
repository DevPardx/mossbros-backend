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
     * @openapi
     * /customers:
     *   post:
     *     tags: [Customers]
     *     summary: Create a new customer
     *     description: Creates a new customer with their motorcycles
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
     *               - motorcycles
     *             properties:
     *               customer_name:
     *                 type: string
     *                 description: Customer's full name
     *               customer_phone:
     *                 type: string
     *                 minLength: 14
     *                 maxLength: 14
     *                 description: Customer's phone number (formatted)
     *               customer_email:
     *                 type: string
     *                 format: email
     *                 description: Customer's email address (optional)
     *               motorcycles:
     *                 type: array
     *                 minItems: 1
     *                 description: List of motorcycles owned by the customer
     *                 items:
     *                   type: object
     *                   required:
     *                     - motorcycle_plate
     *                     - brand_id
     *                     - model_id
     *                   properties:
     *                     motorcycle_plate:
     *                       type: string
     *                       minLength: 6
     *                       maxLength: 10
     *                       description: Motorcycle license plate
     *                     brand_id:
     *                       type: string
     *                       format: uuid
     *                       description: Brand ID
     *                     model_id:
     *                       type: string
     *                       format: uuid
     *                       description: Model ID
     *           example:
     *             customer_name: Juan Perez
     *             customer_phone: "+52 123 456 7890"
     *             customer_email: juan.perez@example.com
     *             motorcycles:
     *               - motorcycle_plate: ABC-123
     *                 brand_id: 550e8400-e29b-41d4-a716-446655440000
     *                 model_id: 770e8400-e29b-41d4-a716-446655440002
     *     responses:
     *       201:
     *         description: Customer created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 customer_name:
     *                   type: string
     *                 customer_phone:
     *                   type: string
     *                 customer_email:
     *                   type: string
     *                 motorcycles:
     *                   type: array
     *                   items:
     *                     type: object
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: bb0e8400-e29b-41d4-a716-446655440006
     *               customer_name: Juan Perez
     *               customer_phone: "+52 123 456 7890"
     *               customer_email: juan.perez@example.com
     *               motorcycles: []
     *               created_at: 2024-01-15T10:30:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
router.post("/",
    body("customer_name").notEmpty().withMessage("Customer name is required")
        .isString().withMessage("Customer name not valid"),
    body("customer_phone").notEmpty().withMessage("Phone number is required")
        .isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
    body("customer_email").optional().isEmail().withMessage("Email must be valid"),
    body("motorcycles").isArray({ min: 1 }).withMessage("At least one motorcycle is required"),
    body("motorcycles.*.motorcycle_plate").notEmpty().withMessage("Motorcycle plate is required")
        .isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
    body("motorcycles.*.brand_id").isUUID().withMessage("Brand ID must be valid"),
    body("motorcycles.*.model_id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    customerController.create
);

    /**
     * @openapi
     * /customers/search:
     *   get:
     *     tags: [Customers]
     *     summary: Search customers
     *     description: Search for customers by name, phone, email, or motorcycle plate
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         description: Search query string
     *     responses:
     *       200:
     *         description: Search results retrieved successfully
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
     *                   customer_name:
     *                     type: string
     *                   customer_phone:
     *                     type: string
     *                   customer_email:
     *                     type: string
     *                   motorcycles:
     *                     type: array
     *                     items:
     *                       type: object
     *             example:
     *               - id: bb0e8400-e29b-41d4-a716-446655440006
     *                 customer_name: Juan Perez
     *                 customer_phone: "+52 123 456 7890"
     *                 customer_email: juan.perez@example.com
     *                 motorcycles: []
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/search", customerController.search);

    /**
     * @openapi
     * /customers:
     *   get:
     *     tags: [Customers]
     *     summary: Get all customers
     *     description: Retrieves a list of all customers with their motorcycles
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: List of customers retrieved successfully
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
     *                   customer_name:
     *                     type: string
     *                   customer_phone:
     *                     type: string
     *                   customer_email:
     *                     type: string
     *                   motorcycles:
     *                     type: array
     *                     items:
     *                       type: object
     *                   created_at:
     *                     type: string
     *                     format: date-time
     *             example:
     *               - id: bb0e8400-e29b-41d4-a716-446655440006
     *                 customer_name: Juan Perez
     *                 customer_phone: "+52 123 456 7890"
     *                 customer_email: juan.perez@example.com
     *                 motorcycles: []
     *                 created_at: 2024-01-15T10:30:00Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/", customerController.getAll);

    /**
     * @openapi
     * /customers/{id}:
     *   get:
     *     tags: [Customers]
     *     summary: Get customer by ID
     *     description: Retrieves a specific customer by their ID with all motorcycles
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
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 customer_name:
     *                   type: string
     *                 customer_phone:
     *                   type: string
     *                 customer_email:
     *                   type: string
     *                 motorcycles:
     *                   type: array
     *                   items:
     *                     type: object
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: bb0e8400-e29b-41d4-a716-446655440006
     *               customer_name: Juan Perez
     *               customer_phone: "+52 123 456 7890"
     *               customer_email: juan.perez@example.com
     *               motorcycles: []
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
        param("id").isUUID().withMessage("Customer ID must be valid"),
        handleInputErrors,
        customerController.getById
    );

    /**
     * @openapi
     * /customers/{id}:
     *   put:
     *     tags: [Customers]
     *     summary: Update a customer
     *     description: Updates an existing customer and their motorcycles by ID
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
     *               - motorcycles
     *             properties:
     *               customer_name:
     *                 type: string
     *                 description: Customer's full name
     *               customer_phone:
     *                 type: string
     *                 minLength: 14
     *                 maxLength: 14
     *                 description: Customer's phone number (formatted)
     *               customer_email:
     *                 type: string
     *                 format: email
     *                 description: Customer's email address (optional)
     *               motorcycles:
     *                 type: array
     *                 minItems: 1
     *                 description: List of motorcycles owned by the customer
     *                 items:
     *                   type: object
     *                   required:
     *                     - motorcycle_plate
     *                     - brand_id
     *                     - model_id
     *                   properties:
     *                     motorcycle_plate:
     *                       type: string
     *                       minLength: 6
     *                       maxLength: 10
     *                     brand_id:
     *                       type: string
     *                       format: uuid
     *                     model_id:
     *                       type: string
     *                       format: uuid
     *           example:
     *             customer_name: Juan Perez Updated
     *             customer_phone: "+52 123 456 7891"
     *             customer_email: juan.perez.updated@example.com
     *             motorcycles:
     *               - motorcycle_plate: ABC-124
     *                 brand_id: 550e8400-e29b-41d4-a716-446655440000
     *                 model_id: 770e8400-e29b-41d4-a716-446655440002
     *     responses:
     *       200:
     *         description: Customer updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 customer_name:
     *                   type: string
     *                 customer_phone:
     *                   type: string
     *                 customer_email:
     *                   type: string
     *                 motorcycles:
     *                   type: array
     *                   items:
     *                     type: object
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: bb0e8400-e29b-41d4-a716-446655440006
     *               customer_name: Juan Perez Updated
     *               customer_phone: "+52 123 456 7891"
     *               customer_email: juan.perez.updated@example.com
     *               motorcycles: []
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
        param("id").isUUID().withMessage("Customer ID must be valid"),
        body("customer_name").notEmpty().withMessage("Customer name is required")
            .isString().withMessage("Customer name not valid"),
        body("customer_phone").isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
        body("customer_email").optional().isEmail().withMessage("Email must be valid"),
        body("motorcycles").isArray({ min: 1 }).withMessage("At least one motorcycle is required"),
        body("motorcycles.*.motorcycle_plate").notEmpty().withMessage("Motorcycle plate is required")
            .isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
        body("motorcycles.*.brand_id").isUUID().withMessage("Brand ID must be valid"),
        body("motorcycles.*.model_id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        customerController.update
    );

    /**
     * @openapi
     * /customers/{id}:
     *   delete:
     *     tags: [Customers]
     *     summary: Delete a customer
     *     description: Deletes a customer and all associated motorcycles by ID
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
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Customer deleted successfully
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
        param("id").isUUID().withMessage("Customer ID must be valid"),
        handleInputErrors,
        customerController.delete
    );

    return router;
};
