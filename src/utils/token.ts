import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/constants";
import { env } from "../config/env";

export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

export const generateJWT = (id: string, rememberMe: boolean = false) => {
    const expiresIn = rememberMe
        ? JWT_CONFIG.EXPIRATION.REMEMBER_ME
        : JWT_CONFIG.EXPIRATION.DEFAULT;
    return jwt.sign({ id }, env.JWT_SECRET, { expiresIn });
};

export const verifyJWT = (token: string) => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as { id: string };
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return null;
    }
};