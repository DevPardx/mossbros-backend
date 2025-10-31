import bcrypt from "bcrypt";
import { PASSWORD_CONFIG } from "../config/constants";

export const hashPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_ROUNDS);
    return hashedPassword;
};

export const comparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};