import { Router } from "express";
import { body, param, query } from "express-validator";
import { RepairJobController } from "../controllers/repairJob.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { RepairStatus } from "../enums";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createRepairJobRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const repairJobController = new RepairJobController(container.repairJobService);

    router.use(authenticate);

    /**
     * @swagger
     * /api/v1/repair-jobs:
     *   post:
     *     tags: [Repair Jobs]
     *     summary: Create a new repair job
     *     description: Create a new repair job for a motorcycle with selected services
     *     security:
     *       - cookieAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - motorcycle_id
     *               - service_ids
     *             properties:
     *               motorcycle_id:
     *                 type: string
     *                 format: uuid
     *                 example: 550e8400-e29b-41d4-a716-446655440000
     *               service_ids:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: string
     *                   format: uuid
     *                 example: ["550e8400-e29b-41d4-a716-446655440001", "550e8400-e29b-41d4-a716-446655440002"]
     *               notes:
     *                 type: string
     *                 example: Cliente reporta ruido en el motor
     *               estimated_completion:
     *                 type: string
     *                 format: date-time
     *                 example: 2024-12-31T23:59:59Z
     *     responses:
     *       201:
     *         description: Repair job created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Repair job created successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
router.post("/",
    body("motorcycle_id")
        .isUUID()
        .withMessage("motorcycle_id debe ser un UUID válido"),
    body("service_ids")
        .isArray({ min: 1 })
        .withMessage("service_ids debe ser un array con al menos un elemento"),
    body("service_ids.*")
        .isUUID()
        .withMessage("Cada service_id debe ser un UUID válido"),
    body("notes")
        .optional()
        .isString()
        .withMessage("notes debe ser una cadena de texto"),
    body("estimated_completion")
        .optional()
        .isISO8601()
        .withMessage("estimated_completion debe ser una fecha válida en formato ISO8601"),
        handleInputErrors,
        repairJobController.create
    );

    /**
     * @swagger
     * /api/v1/repair-jobs:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get all repair jobs
     *     description: Retrieve all repair jobs with optional filtering by status or motorcycle
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [PENDING, IN_REPAIR, WAITING_FOR_PARTS, READY_FOR_PICKUP, COMPLETED, CANCELLED]
     *         description: Filter by repair job status
     *       - in: query
     *         name: motorcycle_id
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter by motorcycle ID
     *     responses:
     *       200:
     *         description: List of repair jobs retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/RepairJob'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/",
        query("status")
            .optional()
            .isIn(Object.values(RepairStatus))
            .withMessage(`status debe ser uno de: ${Object.values(RepairStatus).join(", ")}`),
        query("motorcycle_id")
            .optional()
            .isUUID()
            .withMessage("motorcycle_id debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getAll
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/statistics:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get dashboard statistics
     *     description: Retrieve business statistics including revenue, completed jobs, and customer metrics
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 totalRevenue:
     *                   type: number
     *                   example: 15000.50
     *                 revenueChange:
     *                   type: number
     *                   example: 12.5
     *                 completedJobs:
     *                   type: integer
     *                   example: 45
     *                 completedJobsChange:
     *                   type: number
     *                   example: 8.3
     *                 newClients:
     *                   type: integer
     *                   example: 12
     *                 newClientsChange:
     *                   type: number
     *                   example: 20.0
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/statistics",
        repairJobController.getStatistics
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job by ID
     *     description: Retrieve a specific repair job with all details including services and motorcycle
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     responses:
     *       200:
     *         description: Repair job retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/RepairJob'
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:id",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getById
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}:
     *   put:
     *     tags: [Repair Jobs]
     *     summary: Update repair job
     *     description: Update repair job notes and estimated completion date
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               notes:
     *                 type: string
     *                 example: Se encontró problema adicional en la transmisión
     *               estimated_completion:
     *                 type: string
     *                 format: date-time
     *                 example: 2024-12-31T23:59:59Z
     *     responses:
     *       200:
     *         description: Repair job updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Repair job updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.put("/:id",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        body("notes")
            .optional()
            .isString()
            .withMessage("notes debe ser una cadena de texto"),
        body("estimated_completion")
            .optional()
            .isISO8601()
            .withMessage("estimated_completion debe ser una fecha válida en formato ISO8601"),
        handleInputErrors,
        repairJobController.update
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}/status:
     *   patch:
     *     tags: [Repair Jobs]
     *     summary: Update repair job status
     *     description: Change the status of a repair job following workflow rules
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [PENDING, IN_REPAIR, WAITING_FOR_PARTS, READY_FOR_PICKUP, COMPLETED, CANCELLED]
     *                 example: IN_REPAIR
     *     responses:
     *       200:
     *         description: Status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Status updated successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.patch("/:id/status",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        body("status")
            .isIn(Object.values(RepairStatus))
            .withMessage(`status debe ser uno de: ${Object.values(RepairStatus).join(", ")}`),
        handleInputErrors,
        repairJobController.updateStatus
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}/cancel:
     *   patch:
     *     tags: [Repair Jobs]
     *     summary: Cancel repair job
     *     description: Cancel a repair job (only allowed in certain states)
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     responses:
     *       200:
     *         description: Repair job cancelled successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Repair job cancelled successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.patch("/:id/cancel",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.cancel
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}/workflow:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job workflow information
     *     description: Retrieve workflow information for a repair job including allowed transitions
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     responses:
     *       200:
     *         description: Workflow information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 current_status:
     *                   type: string
     *                   example: PENDING
     *                 allowed_transitions:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["IN_REPAIR", "CANCELLED"]
     *                 can_cancel:
     *                   type: boolean
     *                   example: true
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.get("/:id/workflow",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getWorkflow
    );

    /**
     * @swagger
     * /api/v1/repair-jobs/{id}:
     *   delete:
     *     tags: [Repair Jobs]
     *     summary: Delete repair job
     *     description: Delete a repair job (only allowed in PENDING or CANCELLED states)
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Repair job ID
     *     responses:
     *       200:
     *         description: Repair job deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: string
     *               example: Repair job deleted successfully
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     */
    router.delete("/:id",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.delete
    );

    return router;
};
