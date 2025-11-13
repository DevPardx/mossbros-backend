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

    /**
     * @openapi
     * /auth/login:
     *   post:
     *     tags: [Authentication]
     *     summary: Login to the system
     *     description: Authenticates a user with email and password, returns a session cookie
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - remember_me
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 8
     *                 description: User's password (minimum 8 characters)
     *               remember_me:
     *                 type: boolean
     *                 description: Whether to extend session duration
     *           example:
     *             email: user@example.com
     *             password: password123
     *             remember_me: true
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 user:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     email:
     *                       type: string
     *             example:
     *               message: Login successful
     *               user:
     *                 id: 550e8400-e29b-41d4-a716-446655440000
     *                 email: user@example.com
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       429:
     *         $ref: '#/components/responses/TooManyRequestsError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.post("/login", ...loginMiddleware);

    const forgotPasswordMiddleware = [
        body("email").isEmail().withMessage("Invalid email format"),
        handleInputErrors,
        authController.forgotPassword
    ];

    if (passwordResetLimiter) {
        forgotPasswordMiddleware.unshift(passwordResetLimiter);
    }

    /**
     * @openapi
     * /auth/forgot-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Request password reset
     *     description: Sends a password reset email to the user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: User's email address to send reset link
     *           example:
     *             email: user@example.com
     *     responses:
     *       200:
     *         description: Password reset email sent successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Password reset email sent
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       429:
     *         $ref: '#/components/responses/TooManyRequestsError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.post("/forgot-password", ...forgotPasswordMiddleware);

    /**
     * @openapi
     * /auth/reset-password/{token}:
     *   get:
     *     tags: [Authentication]
     *     summary: Verify password reset token
     *     description: Validates if a password reset token is valid and not expired
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Password reset token from email
     *     responses:
     *       200:
     *         description: Token is valid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                 valid:
     *                   type: boolean
     *             example:
     *               message: Token is valid
     *               valid: true
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
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

    /**
     * @openapi
     * /auth/reset-password/{token}:
     *   post:
     *     tags: [Authentication]
     *     summary: Reset password with token
     *     description: Sets a new password using a valid reset token
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Password reset token from email
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - new_password
     *             properties:
     *               new_password:
     *                 type: string
     *                 format: password
     *                 minLength: 8
     *                 description: New password (minimum 8 characters)
     *           example:
     *             new_password: newSecurePassword123
     *     responses:
     *       200:
     *         description: Password reset successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Password reset successful
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       404:
     *         $ref: '#/components/responses/NotFoundError'
     *       429:
     *         $ref: '#/components/responses/TooManyRequestsError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.post("/reset-password/:token", ...resetPasswordMiddleware);

    /**
     * @openapi
     * /auth/logout:
     *   post:
     *     tags: [Authentication]
     *     summary: Logout from the system
     *     description: Clears the session cookie and logs out the user
     *     responses:
     *       200:
     *         description: Logout successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *             example:
     *               message: Logout successful
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.post("/logout", authController.logout);

    /**
     * @openapi
     * /auth/verify:
     *   get:
     *     tags: [Authentication]
     *     summary: Verify authentication status
     *     description: Checks if the current session is valid
     *     responses:
     *       200:
     *         description: Session is valid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 authenticated:
     *                   type: boolean
     *             example:
     *               authenticated: true
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/verify", authController.verify);

    /**
     * @openapi
     * /auth/profile:
     *   get:
     *     tags: [Authentication]
     *     summary: Get user profile
     *     description: Returns the authenticated user's profile information
     *     security:
     *       - cookieAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 email:
     *                   type: string
     *                   format: email
     *                 created_at:
     *                   type: string
     *                   format: date-time
     *             example:
     *               id: 550e8400-e29b-41d4-a716-446655440000
     *               email: user@example.com
     *               created_at: 2024-01-15T10:30:00Z
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    router.get("/profile",
        authenticate,
        authController.profile
    );

    return router;
};