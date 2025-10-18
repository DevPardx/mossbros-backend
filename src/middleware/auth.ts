import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/typeorm';
import jwt from 'jsonwebtoken';
import { User } from '../entities';
import { BadRequestError } from '../handler/error.handler';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export const verifyJwtCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const token = req.cookies.token;
        
        if (!token) {
            throw new BadRequestError('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

        const user = await userRepository.findOneBy({ id: decoded.id });
        if (!user) {
            throw new BadRequestError('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof Error) {
            throw new BadRequestError(error.message);
        }
        throw new BadRequestError('Invalid token');
    }
};