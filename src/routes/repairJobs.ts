import { Router } from "express";
import { body, param, query } from "express-validator";
import { RepairJobController } from "../controllers/repairJob.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import { RepairStatus } from "../enums";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Create new repair job
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
    RepairJobController.create
);

// Get all repair jobs with optional filters
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
    RepairJobController.getAll
);

// Get repair job statistics
router.get("/statistics",
    RepairJobController.getStatistics
);

// Get specific repair job
router.get("/:id",
    param("id")
        .isUUID()
        .withMessage("ID debe ser un UUID válido"),
    handleInputErrors,
    RepairJobController.getById
);

// Update repair job details
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
    RepairJobController.update
);

// Update repair job status
router.patch("/:id/status",
    param("id")
        .isUUID()
        .withMessage("ID debe ser un UUID válido"),
    body("status")
        .isIn(Object.values(RepairStatus))
        .withMessage(`status debe ser uno de: ${Object.values(RepairStatus).join(", ")}`),
    handleInputErrors,
    RepairJobController.updateStatus
);

// Cancel repair job
router.patch("/:id/cancel",
    param("id")
        .isUUID()
        .withMessage("ID debe ser un UUID válido"),
    handleInputErrors,
    RepairJobController.cancel
);

// Get workflow information
router.get("/:id/workflow",
    param("id")
        .isUUID()
        .withMessage("ID debe ser un UUID válido"),
    handleInputErrors,
    RepairJobController.getWorkflow
);

// Delete repair job (only PENDING or CANCELLED)
router.delete("/:id",
    param("id")
        .isUUID()
        .withMessage("ID debe ser un UUID válido"),
    handleInputErrors,
    RepairJobController.delete
);

export default router;