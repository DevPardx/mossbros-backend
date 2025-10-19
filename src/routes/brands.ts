import { Router } from "express";
import { body, param } from "express-validator";
import { BrandController } from "../controllers/brand.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/",
    body("name").notEmpty().withMessage("Brand name is required")
        .isAlpha("es-ES", { ignore: " " }).withMessage("Brand name must contain only letters and spaces"),
    body("logo_url").notEmpty().withMessage("Logo URL is required").isURL({
        protocols: ["http", "https"],
        require_protocol: true,
        allow_underscores: true
    }).withMessage("Logo URL must be a valid HTTP or HTTPS URL"),
    handleInputErrors,
    BrandController.create
);

router.get("/",BrandController.getAll);

router.get("/:id",
    param("id").isUUID().withMessage("Brand ID must be valid"),
    handleInputErrors,
    BrandController.getById
);

router.put("/:id",
    param("id").isUUID().withMessage("Brand ID must be valid"),
    body("name").notEmpty().withMessage("Brand name is required")
        .isAlpha("es-ES", { ignore: " " }).withMessage("Brand name must contain only letters and spaces"),
    body("logo_url").notEmpty().withMessage("Logo URL is required").isURL({
        protocols: ["http", "https"],
        require_protocol: true,
        allow_underscores: true
    }).withMessage("Logo URL must be a valid HTTP or HTTPS URL"),
    body("is_active").isBoolean().withMessage("is_active must be a boolean"),
    handleInputErrors,
    BrandController.update
);

router.delete("/:id",
    param("id").isUUID().withMessage("Brand ID must be valid"),
    handleInputErrors,
    BrandController.delete
);

export default router;