import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/typeorm";
import jwt from "jsonwebtoken";
import { User } from "../entities";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../handler/error.handler";
import { env } from "../config/env";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const verifyJwtCookie = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const token = req.cookies.token;

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof Error) {
            throw new BadRequestError(error.message);
        }
        throw new BadRequestError("Invalid token");
    }
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization;

    if(!bearer){
        throw new UnauthorizedError("Not Authorized");
    }

    const [ , token ] = bearer.split(" ");

    if(!token){
        throw new UnauthorizedError("Invalid token");
    }

    try{
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id?: string };

        if(typeof decoded === "object" && decoded.id){
            const user = await AppDataSource.getRepository(User).findOne({
                where: { id: decoded.id },
                select: ["id", "email", "role", "phone", "name"]
            });
            req.user = user || undefined;
            next();
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch(error){
        throw new UnauthorizedError("Not Authorized");
    };
};