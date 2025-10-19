import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate } from '../middleware/auth';
import { handleInputErrors } from "../middleware/validation";
import { ServiceController } from "../controllers/service.controller";

const router = Router();

router.use(authenticate);

router.post("/",
    body("name").notEmpty().withMessage("Service name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
    handleInputErrors,
    ServiceController.create
);

router.get("/", ServiceController.getAll);

router.get("/:id",
    param("id").isUUID().withMessage("Service ID must be valid"),
    handleInputErrors,
    ServiceController.getById
);

router.put("/:id",
    param("id").isUUID().withMessage("Service ID must be valid"),
    body("name").notEmpty().withMessage("Service name is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Service price must be a number greater than 0"),
    body("is_active").isBoolean().withMessage("is_active must be a boolean"),
    handleInputErrors,
    ServiceController.update
);

router.delete("/:id",
    param("id").isUUID().withMessage("Service ID must be valid"),
    handleInputErrors,
    ServiceController.delete
);

export default router;