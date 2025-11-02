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

    /**
     * @swagger
     * /api/v1/auth/login:
     *   post:
     *     tags: [Authentication]
     *     summary: User login
     *     description: Authenticate user with email and password. Returns HTTP-only cookie with JWT token.
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
     *                 example: admin@mossbros.com
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 8
     *                 example: password123
     *               remember_me:
     *                 type: boolean
     *                 example: false
     *     responses:
     *       200:
     *         description: Login successful, JWT token set in cookie
     *         headers:
     *           Set-Cookie:
     *             schema:
     *               type: string
     *               example: _token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Login successful
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       429:
     *         $ref: '#/components/responses/RateLimitError'
     */
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

    /**
     * @swagger
     * /api/v1/auth/forgot-password:
     *   post:
     *     tags: [Authentication]
     *     summary: Request password reset
     *     description: Send password reset email to user
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
     *                 example: admin@mossbros.com
     *     responses:
     *       200:
     *         description: Password reset email sent
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Password reset email sent
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       429:
     *         $ref: '#/components/responses/RateLimitError'
     */
    const forgotPasswordMiddleware = [
        body("email").isEmail().withMessage("Invalid email format"),
        handleInputErrors,
        authController.forgotPassword
    ];

    if (passwordResetLimiter) {
        forgotPasswordMiddleware.unshift(passwordResetLimiter);
    }

    router.post("/forgot-password", ...forgotPasswordMiddleware);

    /**
     * @swagger
     * /api/v1/auth/reset-password/{token}:
     *   get:
     *     tags: [Authentication]
     *     summary: Verify password reset token
     *     description: Check if password reset token is valid
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Password reset token
     *     responses:
     *       200:
     *         description: Token is valid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 valid:
     *                   type: boolean
     *                   example: true
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     */
    router.get("/reset-password/:token",
        param("token").isString().withMessage("Invalid token"),
        handleInputErrors,
        authController.verifyPasswordResetToken
    );

    /**
     * @swagger
     * /api/v1/auth/reset-password/{token}:
     *   post:
     *     tags: [Authentication]
     *     summary: Reset password
     *     description: Reset user password with valid token
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Password reset token
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
     *                 example: newpassword123
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
     *                   example: Password reset successful
     *       400:
     *         $ref: '#/components/responses/BadRequestError'
     *       429:
     *         $ref: '#/components/responses/RateLimitError'
     */
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

    /**
     * @swagger
     * /api/v1/auth/logout:
     *   post:
     *     tags: [Authentication]
     *     summary: User logout
     *     description: Clear authentication cookie
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
     *                   example: Logout successful
     */
    router.post("/logout", authController.logout);

    /**
     * @swagger
     * /api/v1/auth/verify:
     *   get:
     *     tags: [Authentication]
     *     summary: Verify token
     *     description: Verify if the current JWT token in cookie is valid
     *     responses:
     *       200:
     *         description: Token is valid
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 valid:
     *                   type: boolean
     *                   example: true
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/verify", authController.verify);

    /**
     * @swagger
     * /api/v1/auth/profile:
     *   get:
     *     tags: [Authentication]
     *     summary: Get user profile
     *     description: Get authenticated user's profile information
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
     *                 name:
     *                   type: string
     *                 email:
     *                   type: string
     *                   format: email
     *       401:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    router.get("/profile",
        authenticate,
        authController.profile
    );

    return router;
};