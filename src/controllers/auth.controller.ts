import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { client } from "../config/redis";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const maxAge = 30 * 24 * 60 * 60 * 1000;
        const minAge = 24 * 60 * 60 * 1000;

        const { email, password, remember_me } = req.body;

        const response = await AuthService.login({ email, password, remember_me });
        
        res.cookie("_token", response, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: remember_me ?  maxAge : minAge
        });

        return res.status(200).json();
    };

    static logout = async (req: Request, res: Response) => {
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
        const response = await client.get("user_profile");

        if(response) {
            const data = typeof response === "string" ? response : response.toString();
            return res.status(200).json(JSON.parse(data));
        }

        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: "No autorizado" });
        }

        await client.set("user_profile", JSON.stringify(user));
        return res.status(200).json(user);
    };
}