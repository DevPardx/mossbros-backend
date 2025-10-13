import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

router.post("/login",
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    handleInputErrors,
    AuthController.login
);

export default router;