import { Router } from "express";
import { body, param } from "express-validator";
import { CustomerController } from "../controllers/customer.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/",
    body("customer_name").notEmpty().withMessage("Customer name is required")
        .isString().withMessage("Customer name not valid"),
    body("customer_phone").notEmpty().withMessage("Phone number is required")
        .isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
    body("customer_email").optional().isEmail().withMessage("Email must be valid"),
    body("motorcycle_plate").notEmpty().withMessage("Motorcycle plate is required")
        .isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
    body("brand_id").isUUID().withMessage("Brand ID must be valid"),
    body("model_id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    CustomerController.create
);

router.get("/search", CustomerController.search);

router.get("/", CustomerController.getAll);

router.get("/:id",
    param("id").isUUID().withMessage("Customer ID must be valid"),
    handleInputErrors,
    CustomerController.getById
);

router.put("/:id",
    param("id").isUUID().withMessage("Customer ID must be valid"),
    body("customer_name").notEmpty().withMessage("Customer name is required")
        .isString().withMessage("Customer name not valid"),
    body("customer_phone").isLength({ min: 14, max: 14 }).withMessage("Invalid phone number"),
    body("customer_email").isEmail().withMessage("Email must be valid"),
    body("motorcycle_plate").isLength({ min: 6, max: 10 }).withMessage("Plate must be between 6 and 10 characters"),
    body("brand_id").isUUID().withMessage("Brand ID must be valid"),
    body("model_id").isUUID().withMessage("Model ID must be valid"),
    handleInputErrors,
    CustomerController.update
);

router.delete("/:id",
    param("id").isUUID().withMessage("Customer ID must be valid"),
    handleInputErrors,
    CustomerController.delete
);

export default router;