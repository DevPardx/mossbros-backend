import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";
import type { ServiceContainer } from "../services/ServiceContainer";
import type { RateLimitRequestHandler } from "express-rate-limit";

export const createAuthRoutes = (
    container: ServiceContainer,
    authLimiter?: RateLimitRequestHandler,
    passwordResetLimiter?: RateLimitRequestHandler
): Router => {
    const router = Router();
    const authController = new AuthController(container.authService);

    const loginMiddleware = [
        body("email").isEmail().withMessage("Invalid email format"),
        body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
        body("remember_me").isBoolean().withMessage("Invalid remember me value"),
        handleInputErrors,
        authController.login
    ];

    if (authLimiter) {
        loginMiddleware.unshift(authLimiter);
    }

    router.post("/login", ...loginMiddleware);

    const forgotPasswordMiddleware = [
        body("email").isEmail().withMessage("Invalid email format"),
        handleInputErrors,
        authController.forgotPassword
    ];

    if (passwordResetLimiter) {
        forgotPasswordMiddleware.unshift(passwordResetLimiter);
    }

    router.post("/forgot-password", ...forgotPasswordMiddleware);

    router.get("/reset-password/:token",
        param("token").isString().withMessage("Invalid token"),
        handleInputErrors,
        authController.verifyPasswordResetToken
    );

    const resetPasswordMiddleware = [
        param("token").isString().withMessage("Invalid token"),
        body("new_password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
        handleInputErrors,
        authController.resetPassword
    ];

    if (passwordResetLimiter) {
        resetPasswordMiddleware.unshift(passwordResetLimiter);
    }

    router.post("/reset-password/:token", ...resetPasswordMiddleware);

    router.post("/logout", authController.logout);

    router.get("/verify", authController.verify);

    router.get("/profile",
        authenticate,
        authController.profile
    );

    return router;
};