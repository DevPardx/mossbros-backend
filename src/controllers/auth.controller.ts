import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        const { email, password, rememberMe } = req.body;

        const response = await AuthService.login({ email, password, rememberMe });

        return res.status(200).json(response);
    }
}