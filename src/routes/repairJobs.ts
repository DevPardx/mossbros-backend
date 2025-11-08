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

    router.get("/statistics",
        repairJobController.getStatistics
    );

    router.get("/:id",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getById
    );

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

    router.patch("/:id/cancel",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.cancel
    );

    router.get("/:id/workflow",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.getWorkflow
    );

    router.delete("/:id",
        param("id")
            .isUUID()
            .withMessage("ID debe ser un UUID válido"),
        handleInputErrors,
        repairJobController.delete
    );

    return router;
};
