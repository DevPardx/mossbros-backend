import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { getRequiredParam } from "../utils/request";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const maxAge = 30 * 24 * 60 * 60 * 1000;
        const minAge = 24 * 60 * 60 * 1000;

        const { email, password, remember_me } = req.body;

        const response = await AuthService.login({ email, password, remember_me });

        res.cookie("_token", response, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: remember_me ?  maxAge : minAge
        });

        return res.status(200).json();
    };

    static logout = async (_req: Request, res: Response) => {
        res.clearCookie("_token");
        return res.status(200).json();
    };

    static verify = async (req: Request, res: Response) => {
        const token = req.cookies._token;

        if (!token) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const user = await AuthService.verify(token);
        return res.status(200).json(user);
    };

    static profile = async (req: Request, res: Response) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "No autorizado" });
        }

        return res.status(200).json(user);
    };

    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;

        const response = await AuthService.forgotPassword({ email });
        return res.status(200).json(response);
    };

    static verifyPasswordResetToken = async (req: Request, res: Response) => {
        const token = getRequiredParam(req, "token");

        await AuthService.verifyPasswordResetToken(token);
        return res.status(200).json("Token válido");
    };

    static resetPassword = async (req: Request, res: Response) => {
        const token = getRequiredParam(req, "token");
        const { new_password } = req.body;

        const response = await AuthService.resetPasswordWithToken({ token, new_password });
        return res.status(200).json(response);
    };
}