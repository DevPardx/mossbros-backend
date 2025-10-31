import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import type { ServiceContainer } from "../services/ServiceContainer";

export const createAuthRoutes = (container: ServiceContainer): Router => {
    const router = Router();
    const authController = new AuthController(container.authService);

    router.post("/login",
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
        body("remember_me").isBoolean().withMessage("Invalid remember me value"),
        handleInputErrors,
        authController.login
    );

    router.post("/forgot-password",
        body("email").isEmail().withMessage("Invalid email format"),
        handleInputErrors,
        authController.forgotPassword
    );

    router.get("/reset-password/:token",
        param("token").isString().withMessage("Invalid token"),
        handleInputErrors,
        authController.verifyPasswordResetToken
    );

    router.post("/reset-password/:token",
        param("token").isString().withMessage("Invalid token"),
        body("new_password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
        handleInputErrors,
        authController.resetPassword
    );

    router.post("/logout", authController.logout);

    router.get("/verify", authController.verify);

    router.get("/profile",
        authenticate,
        authController.profile
    );

    return router;
};