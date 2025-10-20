import jwt from "jsonwebtoken";

export const generateToken = () => Math.floor(100000 + Math.random() * 900000).toString();

export const generateJWT = (id: string, rememberMe: boolean = false) => {
    const expiresIn = rememberMe ? "30d" : "7d";
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

export const verifyJWT = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        return null;
    }
};