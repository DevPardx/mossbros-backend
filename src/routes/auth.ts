import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/login",
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
    body("rememberMe").isBoolean().withMessage("Invalid remember me value"),
    handleInputErrors,
    AuthController.login
);

router.post("/logout", AuthController.logout);

router.get("/verify", AuthController.verify);

router.get("/profile",
    authenticate,
    AuthController.profile
);

export default router;