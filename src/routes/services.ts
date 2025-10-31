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

    router.post("/",
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        handleInputErrors,
        serviceController.create
    );

    router.get("/", serviceController.getAll);

    router.get("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.getById
    );

    router.put("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        body("name").notEmpty().withMessage("Service name is required"),
        body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
        body("is_active").isBoolean().withMessage("is_active must be a boolean"),
        handleInputErrors,
        serviceController.update
    );

    router.delete("/:id",
        param("id").isUUID().withMessage("Service ID must be valid"),
        handleInputErrors,
        serviceController.delete
    );

    return router;
};