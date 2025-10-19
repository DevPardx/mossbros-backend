import { Router } from "express";
import { body, param } from "express-validator";
import { ModelController } from "../controllers/model.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/",
    body("name").notEmpty().withMessage("Model name is required"),
    body("brand_id").isUUID().withMessage("Brand ID must be valid"),
    handleInputErrors,
    ModelController.create
);

router.get("/:brand_id", ModelController.getAll);

router.get("/:brand_id/:id",
    param("brand_id").isUUID().withMessage("Brand ID must be valid"),
    param("id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    ModelController.getById
);

router.put("/:id",
    param("id").isUUID().withMessage("Model ID must be valid"),
    body("name").notEmpty().withMessage("Model name is required"),
    body("brand_id").isUUID().withMessage("Brand ID must be valid"),
    body("is_active").isBoolean().withMessage("is_active must be a boolean"),
    handleInputErrors,
    ModelController.update
);

router.delete("/:id",
    param("id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    ModelController.delete
);

export default router;