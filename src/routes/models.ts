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

    router.post("/",
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        handleInputErrors,
        modelController.create
    );

    router.get("/:brand_id", modelController.getAll);

    router.get("/:brand_id/:id",
        param("brand_id").isUUID().withMessage("Brand ID must be valid"),
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.getById
    );

    router.put("/:id",
        param("id").isUUID().withMessage("Model ID must be valid"),
        body("name").notEmpty().withMessage("Model name is required"),
        body("brand_id").isUUID().withMessage("Brand ID must be valid"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        modelController.update
    );

    router.delete("/:id",
        param("id").isUUID().withMessage("Model ID must be valid"),
        handleInputErrors,
        modelController.delete
    );

    return router;
};
