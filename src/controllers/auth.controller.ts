import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { getRequiredParam } from "../utils/request";

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (req: Request, res: Response): Promise<Response> => {
        const maxAge = 30 * 24 * 60 * 60 * 1000;
        const minAge = 24 * 60 * 60 * 1000;

        const { email, password, remember_me } = req.body;

        const response = await this.authService.login({ email, password, remember_me });

        res.cookie("_token", response, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: remember_me ?  maxAge : minAge
        });

        return res.status(200).json();
    };

    logout = async (_req: Request, res: Response): Promise<Response> => {
        res.clearCookie("_token");
        return res.status(200).json();
    };

    verify = async (req: Request, res: Response): Promise<Response> => {
        const token = req.cookies._token;

        if (!token) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const user = await this.authService.verify(token);
        return res.status(200).json(user);
    };

    profile = async (req: Request, res: Response): Promise<Response> => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "No autorizado" });
        }

        return res.status(200).json(user);
    };

    forgotPassword = async (req: Request, res: Response): Promise<Response> => {
        const { email } = req.body;

        const response = await this.authService.forgotPassword({ email });
        return res.status(200).json(response);
    };

    verifyPasswordResetToken = async (req: Request, res: Response): Promise<Response> => {
        const token = getRequiredParam(req, "token");

        await this.authService.verifyPasswordResetToken(token);
        return res.status(200).json("Token válido");
    };

    resetPassword = async (req: Request, res: Response): Promise<Response> => {
        const token = getRequiredParam(req, "token");
        const { new_password } = req.body;

        const response = await this.authService.resetPasswordWithToken({ token, new_password });
        return res.status(200).json(response);
    };
}