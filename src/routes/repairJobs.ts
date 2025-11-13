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
     * @openapi
     * /repair-jobs:
     *   post:
     *     tags: [Repair Jobs]
     *     summary: Create a new repair job
     *     description: Creates a new repair job for a motorcycle with one or more services
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
     *                 description: ID of the motorcycle to be repaired
     *               service_ids:
     *                 type: array
     *                 minItems: 1
     *                 items:
     *                   type: string
     *                   format: uuid
     *                 description: Array of service IDs to be performed
     *               notes:
     *                 type: string
     *                 description: Additional notes for the repair job (optional)
     *               estimated_completion:
     *                 type: string
     *                 format: date-time
     *                 description: Estimated completion date (optional)
     *           example:
     *             motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *             service_ids:
     *               - 990e8400-e29b-41d4-a716-446655440004
     *               - aa0e8400-e29b-41d4-a716-446655440005
     *             notes: Customer reported strange noise from engine
     *             estimated_completion: 2024-01-20T18:00:00Z
     *     responses:
     *       201:
     *         description: Repair job created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 motorcycle_id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 notes:
     *                   type: string
     *                 estimated_completion:
     *                   type: string
     *                   format: date-time
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: dd0e8400-e29b-41d4-a716-446655440008
     *               motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *               status: pending
     *               notes: Customer reported strange noise from engine
     *               estimated_completion: 2024-01-20T18:00:00Z
     *               created_at: 2024-01-15T10:30:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
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
     * @openapi
     * /repair-jobs:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get all repair jobs
     *     description: Retrieves a paginated list of repair jobs with optional filters
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [pending, in_progress, completed, cancelled]
     *         description: Filter by repair job status
     *       - in: query
     *         name: motorcycle_id
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter by motorcycle ID
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of items per page
     *     responses:
     *       200:
     *         description: List of repair jobs retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     total:
     *                       type: integer
     *             example:
     *               data:
     *                 - id: dd0e8400-e29b-41d4-a716-446655440008
     *                   motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *                   status: pending
     *                   created_at: 2024-01-15T10:30:00Z
     *               pagination:
     *                 page: 1
     *                 limit: 10
     *                 total: 1
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
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
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page debe ser un número entero mayor a 0"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("limit debe ser un número entero entre 1 y 100"),
        handleInputErrors,
        repairJobController.getAll
    );

    /**
     * @openapi
     * /repair-jobs/statistics:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job statistics
     *     description: Retrieves statistical data about repair jobs (counts by status, etc.)
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
     *                 total:
     *                   type: integer
     *                 by_status:
     *                   type: object
     *                   properties:
     *                     pending:
     *                       type: integer
     *                     in_progress:
     *                       type: integer
     *                     completed:
     *                       type: integer
     *                     cancelled:
     *                       type: integer
     *             example:
     *               total: 150
     *               by_status:
     *                 pending: 20
     *                 in_progress: 35
     *                 completed: 90
     *                 cancelled: 5
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/statistics",
        repairJobController.getStatistics
    );

    /**
     * @openapi
     * /repair-jobs/date-range:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get date range of repair jobs
     *     description: Retrieves the minimum and maximum dates of all repair jobs
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: Date range retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 min_date:
     *                   type: string
     *                   format: date-time
     *                 max_date:
     *                   type: string
     *                   format: date-time
     *             example:
     *               min_date: 2024-01-01T00:00:00Z
     *               max_date: 2024-12-31T23:59:59Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/date-range",
        repairJobController.getDateRange
    );

    /**
     * @openapi
     * /repair-jobs/history:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job history
     *     description: Retrieves historical repair jobs with advanced filtering and search
     *     security:
     *       - cookieAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: date_from
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter jobs created from this date
     *       - in: query
     *         name: date_to
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter jobs created until this date
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search query string
     *     responses:
     *       200:
     *         description: History retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                 pagination:
     *                   type: object
     *                   properties:
     *                     page:
     *                       type: integer
     *                     limit:
     *                       type: integer
     *                     total:
     *                       type: integer
     *             example:
     *               data:
     *                 - id: dd0e8400-e29b-41d4-a716-446655440008
     *                   motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *                   status: completed
     *                   created_at: 2024-01-15T10:30:00Z
     *               pagination:
     *                 page: 1
     *                 limit: 10
     *                 total: 1
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/history",
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("page debe ser un número entero mayor a 0"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("limit debe ser un número entero entre 1 y 100"),
        query("date_from")
            .optional()
            .isISO8601()
            .withMessage("date_from debe ser una fecha válida en formato ISO8601"),
        query("date_to")
            .optional()
            .isISO8601()
            .withMessage("date_to debe ser una fecha válida en formato ISO8601"),
        query("search")
            .optional()
            .isString()
            .withMessage("search debe ser una cadena de texto"),
        handleInputErrors,
        repairJobController.getHistory
    );

    /**
     * @openapi
     * /repair-jobs/{id}:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job by ID
     *     description: Retrieves a specific repair job with all details and services
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
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 motorcycle_id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 notes:
     *                   type: string
     *                 estimated_completion:
     *                   type: string
     *                   format: date-time
     *                 services:
     *                   type: array
     *                   items:
     *                     type: object
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: dd0e8400-e29b-41d4-a716-446655440008
     *               motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *               status: in_progress
     *               notes: Customer reported strange noise from engine
     *               estimated_completion: 2024-01-20T18:00:00Z
     *               services: []
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
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getById
    );

    /**
     * @openapi
     * /repair-jobs/{id}:
     *   put:
     *     tags: [Repair Jobs]
     *     summary: Update a repair job
     *     description: Updates notes and estimated completion date of a repair job
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
     *                 description: Additional notes for the repair job (optional)
     *               estimated_completion:
     *                 type: string
     *                 format: date-time
     *                 description: Estimated completion date (optional)
     *           example:
     *             notes: Updated notes - found additional issues
     *             estimated_completion: 2024-01-22T18:00:00Z
     *     responses:
     *       200:
     *         description: Repair job updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 motorcycle_id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 notes:
     *                   type: string
     *                 estimated_completion:
     *                   type: string
     *                   format: date-time
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: dd0e8400-e29b-41d4-a716-446655440008
     *               motorcycle_id: cc0e8400-e29b-41d4-a716-446655440007
     *               status: in_progress
     *               notes: Updated notes - found additional issues
     *               estimated_completion: 2024-01-22T18:00:00Z
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
     * @openapi
     * /repair-jobs/{id}/status:
     *   patch:
     *     tags: [Repair Jobs]
     *     summary: Update repair job status
     *     description: Updates the status of a repair job (pending, in_progress, completed, cancelled)
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
     *                 enum: [pending, in_progress, completed, cancelled]
     *                 description: New status for the repair job
     *           example:
     *             status: completed
     *     responses:
     *       200:
     *         description: Status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: dd0e8400-e29b-41d4-a716-446655440008
     *               status: completed
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
     * @openapi
     * /repair-jobs/{id}/cancel:
     *   patch:
     *     tags: [Repair Jobs]
     *     summary: Cancel a repair job
     *     description: Cancels a repair job by setting its status to cancelled
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
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 status:
     *                   type: string
     *                 updated_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: dd0e8400-e29b-41d4-a716-446655440008
     *               status: cancelled
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
    router.patch("/:id/cancel",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.cancel
    );

    /**
     * @openapi
     * /repair-jobs/{id}/workflow:
     *   get:
     *     tags: [Repair Jobs]
     *     summary: Get repair job workflow history
     *     description: Retrieves the workflow history of a repair job (status changes, updates)
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
     *         description: Workflow history retrieved successfully
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
     *                   repair_job_id:
     *                     type: string
     *                     format: uuid
     *                   status:
     *                     type: string
     *                   timestamp:
     *                     type: string
     *                     format: date-time
     *             example:
     *               - id: ee0e8400-e29b-41d4-a716-446655440009
     *                 repair_job_id: dd0e8400-e29b-41d4-a716-446655440008
     *                 status: pending
     *                 timestamp: 2024-01-15T10:30:00Z
     *               - id: ff0e8400-e29b-41d4-a716-446655440010
     *                 repair_job_id: dd0e8400-e29b-41d4-a716-446655440008
     *                 status: in_progress
     *                 timestamp: 2024-01-16T09:00:00Z
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/:id/workflow",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getWorkflow
    );

    /**
     * @openapi
     * /repair-jobs/{id}:
     *   delete:
     *     tags: [Repair Jobs]
     *     summary: Delete a repair job
     *     description: Deletes a repair job and all associated workflow history
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
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Repair job deleted successfully
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
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.delete
    );

    return router;
};
