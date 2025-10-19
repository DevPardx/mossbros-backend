import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        try {
            const maxAge = 30 * 24 * 60 * 60 * 1000;
            const minAge = 24 * 60 * 60 * 1000;

            const { email, password, rememberMe } = req.body;

            const response = await AuthService.login({ email, password, rememberMe });
            
            res.cookie("_token", response, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: rememberMe ?  maxAge : minAge
            });

            return res.status(200).json();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Authentication error" });
        }
    };

    static logout = async (req: Request, res: Response) => {
        try {
            res.clearCookie("_token");
            return res.status(200).json();
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Logout error" });
        }
    };

    static verify = async (req: Request, res: Response) => {
        try {
            const token = req.cookies._token;

            if (!token) {
                return res.status(401).json({ error: "No token provided" });
            }

            const user = await AuthService.verify(token);
            return res.status(200).json(user);
        } catch (error) {
            console.log(error);
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    };

    static profile = async (req: Request, res: Response) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: "Not authorized" });
            }
            return res.status(200).json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error fetching profile" });
        }
    };
}